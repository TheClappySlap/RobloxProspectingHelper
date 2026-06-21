@echo off
REM Prospecting Build Planner — double-click to run.
REM serve.py picks a free port and opens the browser once it's ready (no race).
REM Optional first arg overrides the starting port.
cd /d "%~dp0"
py serve.py %~1
