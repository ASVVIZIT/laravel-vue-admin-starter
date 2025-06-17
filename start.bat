@echo off
setlocal

REM Автоматическое определение среды
if "%1"=="local" (
    set APP_HOST=fenixlaravel.loc
    set APP_PORT=80
    set VITE_APP_ENV=development
) else (
    set APP_HOST=94.41.87.10
    set APP_PORT=80
)

REM Экспорт переменных
setx APP_HOST "%APP_HOST%"
setx APP_PORT "%APP_PORT%"
setx VITE_APP_ENV "%VITE_APP_ENV%"


REM Запуск config cache
start cmd /k "php artisan config:custom-cache production"

REM Запуск Reverb
start cmd /k "php artisan reverb:start --host=0.0.0.0 --port=8080 --debug"

REM Запуск OpenServer
start "" "W:\OpenServer\OpenServer.exe"

endlocal