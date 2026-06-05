@echo off
title Sistema Inteligente Estacionamiento - Launcher
color 0B

echo ==========================================================
echo    INICIANDO ECOSISTEMA DE ESTACIONAMIENTO DUOC UC
echo ==========================================================
echo.
echo Este script instalara las dependencias (si faltan) y
echo levantara los 3 frontends en ventanas separadas.
echo.

echo [1/3] Levantando App Conductor...
start "App Conductor" cmd /k "cd frontend\1_app-conductor && npm install && npm run dev"

echo [2/3] Levantando App Guardia...
start "App Guardia" cmd /k "cd frontend\2_app-guardia && npm install && npm run dev"

echo [3/3] Levantando Panel Jefatura...
start "Panel Jefatura" cmd /k "cd frontend\3_panel-jefatura && npm install && npm run dev"

echo.
echo ==========================================================
echo ¡Proceso enviado con exito!
echo Se han abierto 3 ventanas negras. No las cierres mientras
echo quieras seguir usando o probando el sistema.
echo Cada app te mostrara su URL local (ej. http://localhost:5173/)
echo ==========================================================
echo.
pause
