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

echo [1/4] Levantando App Conductor (Puerto 5173)...
start "App Conductor" cmd /k "cd frontend\1_app-conductor && npm install && npm run dev"

echo [2/4] Levantando App Guardia (Puerto 5174)...
start "App Guardia" cmd /k "cd frontend\2_app-guardia && npm install && npm run dev -- --port 5174"

echo [3/4] Levantando Panel Jefatura (Puerto 5175)...
start "Panel Jefatura" cmd /k "cd frontend\3_panel-jefatura && npm install && npm run dev -- --port 5175"

echo [4/4] Levantando Vista Superadmin (Puerto 5176)...
start "Vista Superadmin" cmd /k "cd frontend\4_vista-superadmin && npm install && npm run dev -- --port 5176"

echo.
echo ==========================================================
echo ¡Proceso enviado con exito!
echo Se han abierto 4 ventanas negras. No las cierres mientras
echo quieras seguir usando o probando el sistema.
echo Cada app te mostrara su URL local respectiva.
echo ==========================================================
echo.
pause
