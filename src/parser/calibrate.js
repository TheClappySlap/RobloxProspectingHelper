const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

let cv;

// Edit these values to align the boxes correctly over the text
const REGION_OFFSETS = {
    Neck:   { dx: 50,  dy: 100, w: 200, h: 40 },
    Charm:  { dx: 50,  dy: 150, w: 200, h: 40 },
    Rings:  { dx: 50,  dy: 200, w: 200, h: 40 },
    Pan:    { dx: 50,  dy: 250, w: 200, h: 40 },
    Potion: { dx: 50,  dy: 300, w: 200, h: 40 },
};

const SCREENSHOTS_DIR = path.join(__dirname, '../../tests/fixtures/screenshots');
const TEMPLATES_DIR = path.join(__dirname, '../../tests/fixtures/templates');
const DEBUG_DIR = path.join(__dirname, '../../tests/fixtures/debug');

async function initOpenCV() {
    cv = await require('opencv-wasm');
}

async function jimpToCvMat(jimpImage) {
    const mat = new cv.Mat(jimpImage.bitmap.height, jimpImage.bitmap.width, cv.CV_8UC4);
    mat.data.set(jimpImage.bitmap.data);
    const resultMat = new cv.Mat();
    cv.cvtColor(mat, resultMat, cv.COLOR_RGBA2BGR);
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

async function runCalibration() {
    await initOpenCV();
    
    if (!fs.existsSync(DEBUG_DIR)) {
        fs.mkdirSync(DEBUG_DIR, { recursive: true });
    }

    const anchorPath = path.join(TEMPLATES_DIR, 'equipment_panel_title.png');
    if (!fs.existsSync(anchorPath)) {
        console.error(`[ERROR] Anchor template not found: ${anchorPath}`);
        return;
    }

    const files = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    if (files.length === 0) {
        console.error(`[ERROR] No screenshots found in ${SCREENSHOTS_DIR}`);
        return;
    }

    const imagePath = path.join(SCREENSHOTS_DIR, files[0]);
    console.log(`Calibrating against: ${imagePath}`);

    const jimpSrc = await Jimp.read(imagePath);
    const jimpTempl = await Jimp.read(anchorPath);

    // Convert src to grayscale for matching
    const srcBgr = await jimpToCvMat(jimpSrc);
    const srcGray = new cv.Mat();
    cv.cvtColor(srcBgr, srcGray, cv.COLOR_BGR2GRAY);

    const templBgr = await jimpToCvMat(jimpTempl);
    const templGray = new cv.Mat();
    cv.cvtColor(templBgr, templGray, cv.COLOR_BGR2GRAY);

    let bestMatch = null;
    const scales = [0.75, 1.0, 1.25];
    
    for (const scale of scales) {
        const scaledTempl = new cv.Mat();
        cv.resize(templGray, scaledTempl, new cv.Size(0,0), scale, scale, cv.INTER_LINEAR);
        
        if (scaledTempl.rows > srcGray.rows || scaledTempl.cols > srcGray.cols) {
            scaledTempl.delete();
            continue;
        }

        const dst = new cv.Mat();
        const mask = new cv.Mat();
        
        cv.matchTemplate(srcGray, scaledTempl, dst, cv.TM_CCOEFF_NORMED, mask);
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

    templBgr.delete();
    templGray.delete();

    if (!bestMatch || bestMatch.maxVal < 0.7) {
        console.log("Could not find anchor in image with high confidence.");
        srcBgr.delete();
        srcGray.delete();
        return;
    }

    console.log(`Anchor found at (${bestMatch.point.x}, ${bestMatch.point.y}) with confidence ${bestMatch.maxVal.toFixed(2)} (scale: ${bestMatch.scale})`);

    // Draw the anchor bounding box (green)
    const anchorColor = new cv.Scalar(0, 255, 0, 255);
    const anchorRect = new cv.Rect(bestMatch.point.x, bestMatch.point.y, bestMatch.width, bestMatch.height);
    cv.rectangle(srcBgr, new cv.Point(anchorRect.x, anchorRect.y), new cv.Point(anchorRect.x + anchorRect.width, anchorRect.y + anchorRect.height), anchorColor, 2, cv.LINE_8, 0);

    const regionColor = new cv.Scalar(0, 0, 255, 255);

    for (const [key, offset] of Object.entries(REGION_OFFSETS)) {
        const scale = bestMatch.scale;
        
        const rx = Math.round(bestMatch.point.x + (offset.dx * scale));
        const ry = Math.round(bestMatch.point.y + (offset.dy * scale));
        const rw = Math.round(offset.w * scale);
        const rh = Math.round(offset.h * scale);

        if (rx < 0 || ry < 0 || rx + rw > srcBgr.cols || ry + rh > srcBgr.rows) continue;

        // Draw Region Box (Red)
        cv.rectangle(srcBgr, new cv.Point(rx, ry), new cv.Point(rx + rw, ry + rh), regionColor, 2, cv.LINE_8, 0);

        // Extract ROI and process it so user can see threshold output
        const rect = new cv.Rect(rx, ry, rw, rh);
        const roi = srcGray.roi(rect);
        
        const processedRoi = new cv.Mat();
        cv.threshold(roi, processedRoi, 150, 255, cv.THRESH_BINARY_INV);

        const roiJimp = await cvMatToJimp(processedRoi);
        await roiJimp.writeAsync(path.join(DEBUG_DIR, `roi_${key}.png`));
        
        roi.delete();
        processedRoi.delete();
    }

    const outJimp = await cvMatToJimp(srcBgr);
    const outPath = path.join(DEBUG_DIR, 'calibration_output.png');
    await outJimp.writeAsync(outPath);
    console.log(`Calibration output saved to ${outPath}.`);
    console.log(`Check this image to see if the red boxes align perfectly over the text you want to OCR!`);

    srcBgr.delete();
    srcGray.delete();
}

if (require.main === module) {
    runCalibration();
}
