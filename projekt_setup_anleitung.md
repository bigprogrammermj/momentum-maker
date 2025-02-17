# Projekt-Setup Anleitung

## Voraussetzungen
- Node.js und npm installiert
- Git installiert
- Cursor IDE installiert
- GitHub Account eingerichtet

## A. Neues Projekt von GitHub klonen

### 1. Cursor-Ruleset einrichten
```bash
# 1. Neues Projekt in Cursor öffnen

# 2. Cursor-Ruleset klonen (ersetzt [ruleset-url] mit der tatsächlichen URL)
git clone https://github.com/[username]/cursor-rules-template .

# 3. Python Virtual Environment aktivieren
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Mac/Linux

# 4. Überprüfen ob alle Tools verfügbar sind
python tools/llm_api.py --help
```

### 2. Momentum-Maker Projekt einrichten
```bash
# 1. Projekt in Unterordner klonen
git clone https://github.com/bigprogrammermj/momentum-maker

# 2. Backend-Abhängigkeiten installieren
cd momentum-maker/momentum-maker-backend
npm install
cd ..

# 3. Mobile App Abhängigkeiten installieren
cd momentum-maker-mobile
npm install

# 4. Umgebungsvariablen einrichten
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
cd ..
```

### 3. Projekt starten
```bash
# Terminal 1 - Backend
cd momentum-maker/momentum-maker-backend
npm start

# Terminal 2 - Mobile App
cd momentum-maker/momentum-maker-mobile
npm start
```

## B. Eigenes Projekt auf GitHub speichern

### 1. Repository vorbereiten
```bash
# 1. Git initialisieren
git init

# 2. Git-Benutzer konfigurieren
git config --global user.email "ihre-email@example.com"
git config --global user.name "Ihr Name"

# 3. Dateien zum Repository hinzufügen
git add .

# 4. Ersten Commit erstellen
git commit -m "[Cursor] Initial commit - Project setup"
```

### 2. Auf GitHub hochladen
1. Gehen Sie zu https://github.com/new
2. Repository-Namen eingeben (z.B. "momentum-maker")
3. Als "Public" markieren
4. NICHT initialisieren mit README, .gitignore oder Lizenz
5. Folgende Befehle ausführen:
```bash
git remote add origin https://github.com/[username]/[repo-name].git
git branch -M main
git push -u origin main
```

## Projektstruktur
```
projekt-ordner/
├── .cursorrules          # Cursor-Konfiguration
├── venv/                 # Python Virtual Environment
├── tools/                # Entwicklungstools
├── momentum-maker/       # Eigentliches Projekt
│   ├── momentum-maker-mobile/
│   └── momentum-maker-backend/
└── .gitignore
```

## Wichtige Hinweise
1. Trennen Sie Entwicklungsumgebung (Cursor-Ruleset) und Projektcode
2. Halten Sie sensitive Daten in .env Dateien
3. Commiten Sie regelmäßig Ihre Änderungen
4. Nutzen Sie das Scratchpad in .cursorrules für Projektmanagement

## Troubleshooting
1. Falls Ports belegt sind:
   - Backend Port ändern in server.ts
   - Expo Port wird automatisch angepasst

2. Bei Git-Problemen:
   - Überprüfen Sie mit `git status`
   - Stellen Sie sicher, dass .gitignore korrekt ist

3. Bei npm Problemen:
   - Löschen Sie node_modules/
   - Führen Sie `npm install` erneut aus 