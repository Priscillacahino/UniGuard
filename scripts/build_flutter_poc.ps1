# Build and validate the UniGuard Flutter POC on Windows without Python.
[CmdletBinding()]
param(
    [switch]$CheckOnly,
    [switch]$Compare
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Source = Join-Path $Root 'flutter_history'
$Generated = Join-Path $Root '.poc_build\uniguard_history'
$Output = Join-Path $Root '.poc_build\results'

$Flutter = $null
if ($env:UNIGUARD_FLUTTER_HOME) {
    $ConfiguredFlutter = Join-Path $env:UNIGUARD_FLUTTER_HOME 'bin\flutter.bat'
    if (Test-Path $ConfiguredFlutter) { $Flutter = $ConfiguredFlutter }
}
if (-not $Flutter) {
    $FlutterCommand = Get-Command flutter -ErrorAction SilentlyContinue
    if (-not $FlutterCommand) {
        throw 'Flutter não encontrado. Execute scripts\prepare_flutter_android_windows.ps1 -InstallFlutterCiVersion.'
    }
    $Flutter = $FlutterCommand.Source
    if (-not $Flutter) { $Flutter = $FlutterCommand.Path }
}

$FlutterVersionText = (& $Flutter --version 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0 -or $FlutterVersionText -notmatch 'Flutter 3\.47\.7\b') {
    throw 'Esta POC foi validada no CI com Flutter 3.47.7. Execute scripts\prepare_flutter_android_windows.ps1 -InstallFlutterCiVersion para instalar essa versão em paralelo à sua instalação atual.'
}
Write-Host $FlutterVersionText

New-Item -ItemType Directory -Force -Path $Output | Out-Null
$Steps = New-Object System.Collections.Generic.List[object]

function Invoke-LoggedStep {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][string]$Executable,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory
    )

    Write-Host "`n>>> $Label"
    $Log = Join-Path $Output ($Label + '.log')
    Push-Location $WorkingDirectory
    $Started = Get-Date
    try {
        & $Executable @Arguments *> $Log
        $ExitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }

    Get-Content $Log
    $Elapsed = [math]::Round(((Get-Date) - $Started).TotalSeconds, 2)
    [void]$Steps.Add([pscustomobject]@{
        step = $Label
        exit_code = $ExitCode
        seconds = $Elapsed
    })
    $Steps | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $Output 'steps.json') -Encoding UTF8

    if ($ExitCode -ne 0) {
        throw "Etapa '$Label' falhou. Consulte $Log. Nenhuma publicação ou instalação foi realizada."
    }
}

Invoke-LoggedStep -Label 'flutter-version' -Executable $Flutter -Arguments @('--version') -WorkingDirectory $Root

New-Item -ItemType Directory -Force -Path (Split-Path $Generated -Parent) | Out-Null
if (-not (Test-Path (Join-Path $Generated '.metadata'))) {
    Invoke-LoggedStep -Label 'create-module' -Executable $Flutter -Arguments @(
        'create', '--no-pub', '--template=module', '--org',
        'com.priscillacahino.uniguardpoc', '--project-name', 'uniguard_history', $Generated
    ) -WorkingDirectory $Root
}

foreach ($Folder in @('lib', 'test')) {
    $Destination = Join-Path $Generated $Folder
    if (Test-Path $Destination) {
        Remove-Item -LiteralPath $Destination -Recurse -Force
    }
    Copy-Item -LiteralPath (Join-Path $Source $Folder) -Destination $Destination -Recurse
}
Copy-Item -LiteralPath (Join-Path $Source 'pubspec.yaml') -Destination (Join-Path $Generated 'pubspec.yaml') -Force
$SourceLock = Join-Path $Source 'pubspec.lock'
if (Test-Path $SourceLock) {
    Copy-Item -LiteralPath $SourceLock -Destination (Join-Path $Generated 'pubspec.lock') -Force
}
$AnalysisOptions = Join-Path $Generated 'analysis_options.yaml'
if (Test-Path $AnalysisOptions) {
    Remove-Item -LiteralPath $AnalysisOptions -Force
}

Invoke-LoggedStep -Label 'pub-get' -Executable $Flutter -Arguments @('pub', 'get') -WorkingDirectory $Generated
Invoke-LoggedStep -Label 'analyze' -Executable $Flutter -Arguments @('analyze') -WorkingDirectory $Generated
Invoke-LoggedStep -Label 'test' -Executable $Flutter -Arguments @('test', '--reporter=expanded') -WorkingDirectory $Generated

if ($CheckOnly) {
    Write-Host 'Análise e testes Flutter concluídos. Android não compilado neste modo.'
    exit 0
}

# A compilação Android local exige o mesmo JDK e as plataformas usadas pelo CI.
$JavaExe = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin\java.exe' } else { $null }
if (-not $JavaExe -or -not (Test-Path $JavaExe)) {
    throw 'JAVA_HOME não aponta para um JDK válido. Execute scripts\prepare_flutter_android_windows.ps1.'
}
$JavaVersionText = (& $JavaExe -version 2>&1 | Out-String)
if ($JavaVersionText -notmatch 'version\s+"21(?:\.|")|openjdk\s+21') {
    throw 'A compilação Flutter do UniGuard requer JDK 21. Execute scripts\prepare_flutter_android_windows.ps1.'
}

$AndroidSdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { $env:ANDROID_SDK_ROOT }
if (-not $AndroidSdk -or -not (Test-Path $AndroidSdk)) {
    throw 'Android SDK não localizado. Execute scripts\prepare_flutter_android_windows.ps1.'
}
$RequiredAndroidFiles = @(
    (Join-Path $AndroidSdk 'platforms\android-35\android.jar'),
    (Join-Path $AndroidSdk 'platforms\android-36\android.jar'),
    (Join-Path $AndroidSdk 'build-tools\35.0.0\aapt.exe'),
    (Join-Path $AndroidSdk 'platform-tools\adb.exe')
)
$MissingAndroidFiles = @($RequiredAndroidFiles | Where-Object { -not (Test-Path $_) })
if ($MissingAndroidFiles.Count -gt 0) {
    throw ('Android SDK incompleto. Execute scripts\prepare_flutter_android_windows.ps1. Ausentes: ' + ($MissingAndroidFiles -join '; '))
}

Invoke-LoggedStep -Label 'doctor' -Executable $Flutter -Arguments @('doctor', '-v') -WorkingDirectory $Root
Invoke-LoggedStep -Label 'build-aar' -Executable $Flutter -Arguments @('build', 'aar', '--no-profile') -WorkingDirectory $Generated

$Repository = Join-Path $Source 'build\host\outputs\repo'
if (Test-Path $Repository) {
    Remove-Item -LiteralPath $Repository -Recurse -Force
}
$GeneratedRepository = Join-Path $Generated 'build\host\outputs\repo'
if (-not (Test-Path $GeneratedRepository)) {
    throw "Repositório AAR não encontrado: $GeneratedRepository"
}
Copy-Item -LiteralPath $GeneratedRepository -Destination $Repository -Recurse
$ExpectedAar = Join-Path $Repository 'com\priscillacahino\uniguardpoc\uniguard_history\flutter_debug\1.0'
if (-not (Test-Path $ExpectedAar)) {
    throw "Coordenadas AAR inesperadas. Consulte $Output\build-aar.log."
}

$Gradle = Join-Path $Root 'gradlew.bat'
if (-not (Test-Path $Gradle)) {
    throw "Gradle Wrapper não encontrado: $Gradle"
}
$PocGradleArguments = @(
    '-PUNIGUARD_FLUTTER_POC=true',
    '-Pandroid.enableJetifier=false',
    '-Dorg.gradle.jvmargs=-Xmx4g -Dfile.encoding=UTF-8'
)

if ($Compare) {
    Invoke-LoggedStep -Label 'android-native' -Executable $Gradle -Arguments @(
        '-PUNIGUARD_FLUTTER_POC=false', ':app:assembleDebug'
    ) -WorkingDirectory $Root
    $NativeApk = Join-Path $Root 'app\build\outputs\apk\debug\app-debug.apk'
    Copy-Item -LiteralPath $NativeApk -Destination (Join-Path $Output 'uniguard-native-debug.apk') -Force
}

Invoke-LoggedStep -Label 'android-poc' -Executable $Gradle -Arguments ($PocGradleArguments + @(':app:assembleDebug')) -WorkingDirectory $Root
$PocApk = Join-Path $Root 'app\build\outputs\apk\debug\app-debug.apk'
Copy-Item -LiteralPath $PocApk -Destination (Join-Path $Output 'uniguard-flutter-poc-debug.apk') -Force

if ($Compare) {
    Invoke-LoggedStep -Label 'android-poc-release' -Executable $Gradle -Arguments ($PocGradleArguments + @(':app:assembleRelease')) -WorkingDirectory $Root
    $Sizes = @{}
    Get-ChildItem -LiteralPath $Output -Filter '*.apk' | ForEach-Object { $Sizes[$_.Name] = $_.Length }
    $Sizes | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $Output 'apk-sizes.json') -Encoding UTF8
}

Write-Host 'APK de teste: .poc_build\results\uniguard-flutter-poc-debug.apk'
Write-Host 'Nenhuma instalação ou publicação foi realizada. Validação no dispositivo continua necessária.'
