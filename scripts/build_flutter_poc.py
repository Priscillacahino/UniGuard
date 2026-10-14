#!/usr/bin/env python3
"""Valida a cópia local. Sem Git, publicação ou instalação automática de APK."""
from pathlib import Path
import argparse
import json
import os
import shutil
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'flutter_history'
GENERATED = ROOT / '.poc_build' / 'uniguard_history'
OUTPUT = ROOT / '.poc_build' / 'results'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check-only', action='store_true', help='Analisa e testa Flutter, sem Android SDK.')
parser.add_argument('--compare', action='store_true', help='Também compila Kotlin padrão e release da POC.')
args = parser.parse_args()
flutter = shutil.which('flutter')
if not flutter:
    sys.exit('Flutter não encontrado. Instale o SDK estável e adicione flutter ao PATH.')
OUTPUT.mkdir(parents=True, exist_ok=True)
steps = []

def run(command, cwd, label):
    print('\n>>> ' + label, flush=True)
    start = time.monotonic()
    log = OUTPUT / (label + '.log')
    with log.open('w', encoding='utf-8') as stream:
        process = subprocess.Popen(command, cwd=cwd, stdout=subprocess.PIPE,
                                   stderr=subprocess.STDOUT, text=True, encoding='utf-8', errors='replace')
        for line in process.stdout:
            print(line, end='', flush=True)
            stream.write(line)
        code = process.wait()
    steps.append({'step': label, 'exit_code': code, 'seconds': round(time.monotonic()-start, 2)})
    (OUTPUT / 'steps.json').write_text(json.dumps(steps, indent=2), encoding='utf-8')
    if code:
        sys.exit(f'Etapa {label} falhou. Consulte {log}. Nenhuma publicação foi realizada.')

run([flutter, '--version'], ROOT, 'flutter-version')
GENERATED.parent.mkdir(exist_ok=True)
if not (GENERATED / '.metadata').exists():
    run([flutter, 'create', '--no-pub', '--template=module', '--org',
         'com.priscillacahino.uniguardpoc', '--project-name', 'uniguard_history',
         str(GENERATED)], ROOT, 'create-module')
for folder in ('lib', 'test'):
    destination = GENERATED / folder
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(SOURCE / folder, destination)
shutil.copy2(SOURCE / 'pubspec.yaml', GENERATED / 'pubspec.yaml')
if (SOURCE / 'pubspec.lock').exists():
    shutil.copy2(SOURCE / 'pubspec.lock', GENERATED / 'pubspec.lock')
(GENERATED / 'analysis_options.yaml').unlink(missing_ok=True)
run([flutter, 'pub', 'get'], GENERATED, 'pub-get')
run([flutter, 'analyze'], GENERATED, 'analyze')
run([flutter, 'test', '--reporter=expanded'], GENERATED, 'test')
if args.check_only:
    print('Análise e testes Flutter concluídos. Android não compilado neste modo.')
    sys.exit(0)
run([flutter, 'doctor', '-v'], ROOT, 'doctor')
run([flutter, 'build', 'aar', '--no-profile'], GENERATED, 'build-aar')
repo = SOURCE / 'build' / 'host' / 'outputs' / 'repo'
if repo.exists():
    shutil.rmtree(repo)
shutil.copytree(GENERATED / 'build' / 'host' / 'outputs' / 'repo', repo)
expected = repo / 'com/priscillacahino/uniguardpoc/uniguard_history/flutter_debug/1.0'
if not expected.exists():
    sys.exit('Coordenadas AAR inesperadas. Consulte a saída de build-aar.')
gradle = [str(ROOT / 'gradlew.bat')] if os.name == 'nt' else ['bash', str(ROOT / 'gradlew')]
if args.compare:
    run(gradle + ['-PUNIGUARD_FLUTTER_POC=false', ':app:assembleDebug'], ROOT, 'android-native')
    shutil.copy2(ROOT / 'app/build/outputs/apk/debug/app-debug.apk', OUTPUT / 'uniguard-native-debug.apk')
run(gradle + ['-PUNIGUARD_FLUTTER_POC=true', ':app:assembleDebug'], ROOT, 'android-poc')
shutil.copy2(ROOT / 'app/build/outputs/apk/debug/app-debug.apk', OUTPUT / 'uniguard-flutter-poc-debug.apk')
if args.compare:
    run(gradle + ['-PUNIGUARD_FLUTTER_POC=true', ':app:assembleRelease'], ROOT, 'android-poc-release')
    sizes = {p.name: p.stat().st_size for p in OUTPUT.glob('*.apk')}
    (OUTPUT / 'apk-sizes.json').write_text(json.dumps(sizes, indent=2), encoding='utf-8')
print('APK de teste: .poc_build/results/uniguard-flutter-poc-debug.apk')
print('Nenhuma instalação ou publicação foi realizada. Validação no dispositivo continua necessária.')
