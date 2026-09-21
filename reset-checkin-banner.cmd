@echo off
chcp 65001 >nul
setlocal
title Trae 签到弹窗频控重置
echo ============================================================
echo   Trae CN 签到弹窗频控重置（删除前会自动备份数据库）
echo ============================================================
echo.
echo  [重要] 请确认已经完全退出 Trae CN（含托盘图标），否则会中止。
echo.
pause

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未找到 Node.js。请先安装 Node.js ^>= 22.5：https://nodejs.org/
  echo.
  pause
  exit /b 1
)

node "%~dp0reset_checkin_banner.js"

echo.
pause
endlocal
