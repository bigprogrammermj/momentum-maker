#!/usr/bin/env python3
import os
import sys
import subprocess
import platform

def check_python_env():
    """Überprüft die Python-Umgebung"""
    print("Überprüfe Python-Umgebung...")
    
    # Prüfe ob wir in einem venv sind
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    if not in_venv:
        print("❌ Nicht in einem virtual environment!")
        print("   Bitte aktivieren Sie das venv mit:")
        print("   Windows: .\\venv\\Scripts\\activate")
        print("   Unix: source venv/bin/activate")
        return False
    print("✅ Virtual environment aktiv")
    return True

def check_tools():
    """Überprüft ob alle Tools verfügbar sind"""
    print("\nÜberprüfe Entwicklungstools...")
    required_tools = ['llm_api.py', 'screenshot_utils.py', 'search_engine.py', 'web_scraper.py']
    
    tools_dir = os.path.join(os.getcwd(), 'tools')
    if not os.path.exists(tools_dir):
        print("❌ Tools-Verzeichnis nicht gefunden!")
        return False
    
    all_good = True
    for tool in required_tools:
        if not os.path.exists(os.path.join(tools_dir, tool)):
            print(f"❌ {tool} nicht gefunden!")
            all_good = False
        else:
            print(f"✅ {tool} gefunden")
    return all_good

def check_project_structure():
    """Überprüft die Projektstruktur"""
    print("\nÜberprüfe Projektstruktur...")
    required_dirs = [
        'momentum-maker',
        'momentum-maker/momentum-maker-mobile',
        'momentum-maker/momentum-maker-backend',
        'tools',
        'venv'
    ]
    
    all_good = True
    for dir_path in required_dirs:
        if not os.path.exists(dir_path):
            print(f"❌ {dir_path} nicht gefunden!")
            all_good = False
        else:
            print(f"✅ {dir_path} gefunden")
    return all_good

def check_npm_dependencies():
    """Überprüft ob npm Abhängigkeiten installiert sind"""
    print("\nÜberprüfe npm Abhängigkeiten...")
    
    # Backend
    backend_path = 'momentum-maker/momentum-maker-backend'
    if os.path.exists(os.path.join(backend_path, 'node_modules')):
        print("✅ Backend node_modules gefunden")
    else:
        print("❌ Backend Abhängigkeiten fehlen!")
        print("   Führen Sie aus:")
        print(f"   cd {backend_path} && npm install")
        return False
    
    # Mobile
    mobile_path = 'momentum-maker/momentum-maker-mobile'
    if os.path.exists(os.path.join(mobile_path, 'node_modules')):
        print("✅ Mobile node_modules gefunden")
    else:
        print("❌ Mobile Abhängigkeiten fehlen!")
        print("   Führen Sie aus:")
        print(f"   cd {mobile_path} && npm install")
        return False
    
    return True

def main():
    print("=== Momentum Maker Setup Verification ===\n")
    
    checks = [
        check_python_env(),
        check_tools(),
        check_project_structure(),
        check_npm_dependencies()
    ]
    
    print("\n=== Zusammenfassung ===")
    if all(checks):
        print("✅ Alle Checks erfolgreich!")
        print("Sie können das Projekt jetzt starten:")
        print("\nTerminal 1 (Backend):")
        print("cd momentum-maker/momentum-maker-backend && npm start")
        print("\nTerminal 2 (Mobile):")
        print("cd momentum-maker/momentum-maker-mobile && npm start")
    else:
        print("❌ Es gibt Probleme mit dem Setup!")
        print("Bitte beheben Sie die oben angezeigten Probleme.")

if __name__ == "__main__":
    main() 