@echo off
echo === Momentum Maker Setup ===
echo.

REM Python venv erstellen und aktivieren
echo Erstelle Python Virtual Environment...
python -m venv venv
call venv\Scripts\activate

REM Python-Abhängigkeiten installieren
echo Installiere Python-Abhängigkeiten...
pip install -r requirements.txt

REM Backend-Abhängigkeiten
echo Installiere Backend-Abhängigkeiten...
cd momentum-maker-backend
call npm install
cd ..

REM Mobile-Abhängigkeiten
echo Installiere Mobile App Abhängigkeiten...
cd momentum-maker-mobile
call npm install

REM Umgebungsvariablen kopieren
echo Kopiere Umgebungsvariablen...
copy .env.example .env
cd ..

REM Setup überprüfen
echo.
echo Überprüfe Setup...
python verify_setup.py

echo.
echo Setup abgeschlossen! Sie können jetzt starten:
echo Terminal 1: cd momentum-maker-backend ^&^& npm start
echo Terminal 2: cd momentum-maker-mobile ^&^& npm start
pause 