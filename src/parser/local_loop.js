const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const tesseract = require('tesseract.js');
const Jimp = require('jimp');

let cv;

// Mock offsets relative to anchor. These need calibration.
const REGION_OFFSETS = {
    Neck:   { dx: 50,  dy: 100, w: 200, h: 40 },
    Charm:  { dx: 50,  dy: 150, w: 200, h: 40 },
    Rings:  { dx: 50,  dy: 200, w: 200, h: 40 },
    Pan:    { dx: 50,  dy: 250, w: 200, h: 40 },
    Potion: { dx: 50,  dy: 300, w: 200, h: 40 },
};

const SCREENSHOTS_DIR = path.join(__dirname, '../../tests/fixtures/screenshots');
const TEMPLATES_DIR = path.join(__dirname, '../../tests/fixtures/templates');
const OUTPUT_FILE = path.join(__dirname, '../data/gameState.json');

// Initialize OpenCV-wasm
async function initOpenCV() {
    cv = await require('opencv-wasm');
    console.log("OpenCV initialized.");
}

async function jimpToCvMat(jimpImage) {
    const mat = new cv.Mat(jimpImage.bitmap.height, jimpImage.bitmap.width, cv.CV_8UC4);
    mat.data.set(jimpImage.bitmap.data);
    const resultMat = new cv.Mat();
    // Convert to BGR (OpenCV format) or Grayscale
    cv.cvtColor(mat, resultMat, cv.COLOR_RGBA2GRAY);
    mat.delete();
    return resultMat;
}

async function cvMatToJimp(mat) {
    const outMat = new cv.Mat();
    if (mat.type() === cv.CV_8UC1) {
        cv.cvtColor(mat, outMat, cv.COLOR_GRAY2RGBA);
    } else {
        cv.cvtColor(mat, outMat, cv.COLOR_BGR2RGBA);
    }
    const img = new Jimp(outMat.cols, outMat.rows);
    img.bitmap.data = Buffer.from(outMat.data);
    outMat.delete();
    return img;
}

async function processScreenshot(imagePath) {
    console.log(`Processing new screenshot: ${imagePath}`);
    
    // We expect the anchor template to be uploaded here.
    const anchorPath = path.join(TEMPLATES_DIR, 'equipment_panel_title.png');
    
    if (!fs.existsSync(anchorPath)) {
        console.warn(`[WARNING] Template not found at ${anchorPath}. Please upload it.`);
        return;
    }

    try {
        const jimpSrc = await Jimp.read(imagePath);
        const jimpTempl = await Jimp.read(anchorPath);

        const src = await jimpToCvMat(jimpSrc);
        const templ = await jimpToCvMat(jimpTempl);
        
        let bestMatch = null;
        const scales = [0.75, 1.0, 1.25];
        
        for (const scale of scales) {
            const scaledTempl = new cv.Mat();
            cv.resize(templ, scaledTempl, new cv.Size(0,0), scale, scale, cv.INTER_LINEAR);
            
            if (scaledTempl.rows > src.rows || scaledTempl.cols > src.cols) {
                scaledTempl.delete();
                continue;
            }

            const dst = new cv.Mat();
            const mask = new cv.Mat();
            
            cv.matchTemplate(src, scaledTempl, dst, cv.TM_CCOEFF_NORMED, mask);
            const result = cv.minMaxLoc(dst, mask);
            
            if (!bestMatch || result.maxVal > bestMatch.maxVal) {
                bestMatch = {
                    scale: scale,
                    maxVal: result.maxVal,
                    point: result.maxPoint,
                    width: scaledTempl.cols,
                    height: scaledTempl.rows
                };
            }
            
            scaledTempl.delete();
            dst.delete();
            mask.delete();
        }

        templ.delete();

        if (!bestMatch || bestMatch.maxVal < 0.7) {
            console.log("Could not find anchor in image with high confidence.");
            src.delete();
            return;
        }

        console.log(`Anchor found at (${bestMatch.point.x}, ${bestMatch.point.y}) with confidence ${bestMatch.maxVal.toFixed(2)} (scale: ${bestMatch.scale})`);

        // Initialize Tesseract Worker
        const worker = await tesseract.createWorker('eng', 1);
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789+%_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        });

        const parsedData = {};

        // Process each sub-region
        for (const [key, offset] of Object.entries(REGION_OFFSETS)) {
            // Apply scale factor to offsets if the anchor was scaled up/down.
            const scale = bestMatch.scale;
            
            const rx = bestMatch.point.x + (offset.dx * scale);
            const ry = bestMatch.point.y + (offset.dy * scale);
            const rw = offset.w * scale;
            const rh = offset.h * scale;

            // Ensure bounding box doesn't exceed image bounds
            if (rx < 0 || ry < 0 || rx + rw > src.cols || ry + rh > src.rows) {
                console.log(`Skipping ${key} - region out of bounds`);
                continue;
            }

            const rect = new cv.Rect(rx, ry, rw, rh);
            const roi = src.roi(rect);

            // Thresholding to isolate bright white text on dark background
            const processedRoi = new cv.Mat();
            // Try an inverse threshold assuming bright text on dark panel
            cv.threshold(roi, processedRoi, 150, 255, cv.THRESH_BINARY_INV);

            // Convert back to Jimp/Buffer to pass to Tesseract
            const roiJimp = await cvMatToJimp(processedRoi);
            const buffer = await roiJimp.getBufferAsync(Jimp.MIME_PNG);

            const { data: { text } } = await worker.recognize(buffer);
            const cleanText = text.replace(/\n/g, '').trim();
            console.log(`${key} parsed: "${cleanText}"`);
            
            parsedData[key] = cleanText;

            roi.delete();
            processedRoi.delete();
        }

        src.delete();
        await worker.terminate();

        // Update JSON
        let state = {};
        if (fs.existsSync(OUTPUT_FILE)) {
            try {
                state = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
            } catch (e) {
                // Ignore empty or malformed JSON
            }
        }
        
        state.lastUpdated = new Date().toISOString();
        state.equipment = {
            ...state.equipment,
            ...parsedData
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(state, null, 2));
        console.log(`Updated state saved to ${OUTPUT_FILE}`);

    } catch (err) {
        console.error("Error processing screenshot:", err);
    }
}

async function start() {
    await initOpenCV();
    
    // Ensure directories exist
    [SCREENSHOTS_DIR, TEMPLATES_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    console.log(`Watching for new screenshots in ${SCREENSHOTS_DIR}...`);
    const watcher = chokidar.watch(SCREENSHOTS_DIR, {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100
        }
    });

    watcher.on('add', async (filePath) => {
        if (filePath.match(/\.(png|jpg|jpeg)$/i)) {
            await processScreenshot(filePath);
        }
    });
}

if (require.main === module) {
    start();
}

module.exports = { start, processScreenshot };
