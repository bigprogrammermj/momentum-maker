@echo off
echo === Momentum Maker Initialisierung ===
echo.

REM Projektname abfragen
set /p project_name=Bitte geben Sie einen Projektnamen ein (z.B. momentum-test): 

REM Neuen Projektordner erstellen
echo.
echo Erstelle Projektordner "%project_name%"...
mkdir "%project_name%"
cd "%project_name%"

REM Git-Repository klonen
echo.
echo Klone Projekt von GitHub...
git clone https://github.com/bigprogrammermj/momentum-maker .

REM Cursor-Workspace initialisieren
echo.
echo Erstelle Cursor-Workspace...
mkdir .vscode
echo { > .vscode\settings.json
echo   "cursor.showWelcomeOnStartup": false, >> .vscode\settings.json
echo   "cursor.useScm": true >> .vscode\settings.json
echo } >> .vscode\settings.json

echo.
echo === Initialisierung abgeschlossen ===
echo.
echo Nächste Schritte:
echo 1. Öffnen Sie den Ordner "%project_name%" in Cursor
echo 2. Führen Sie setup.bat aus
echo.
echo Drücken Sie eine beliebige Taste zum Beenden...
pause > nul 