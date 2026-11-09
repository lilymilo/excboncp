@echo off
rem ExcbonCP Day 1 helper wrapper for Windows.
rem Usage: scripts\windows\day1.cmd <action> [-Port 8000]

setlocal

where pwsh >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    pwsh -NoLogo -NoProfile -File "%~dp0day1.ps1" %*
) else (
    powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0day1.ps1" %*
)

exit /b %ERRORLEVEL%
