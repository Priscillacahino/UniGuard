# Prepara o ambiente Android para a POC Flutter + Kotlin do UniGuard.
# Não altera arquivos do projeto, não instala APKs e não executa operações Git.
[CmdletBinding()]
param(
    [string]$SdkPath,
    [switch]$InstallFlutterCiVersion,
    [switch]$InstallEmulator
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

if ($env:OS -ne 'Windows_NT') {
    throw 'Este script deve ser executado no Windows.'
}

function Refresh-ProcessPath {
    $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = @($machinePath, $userPath) -join ';'
}

function Add-UserPathEntry {
    param([Parameter(Mandatory = $true)][string]$Entry)

    $current = [Environment]::GetEnvironmentVariable('Path', 'User')
    $parts = @()
    if ($current) { $parts = $current -split ';' | Where-Object { $_ } }
    if (-not ($parts | Where-Object { $_.TrimEnd('\') -ieq $Entry.TrimEnd('\') })) {
        $parts += $Entry
        [Environment]::SetEnvironmentVariable('Path', ($parts -join ';'), 'User')
    }
}

function Get-Java21Home {
    $candidates = New-Object System.Collections.Generic.List[string]

    if ($env:JAVA_HOME) { [void]$candidates.Add($env:JAVA_HOME) }

    $fixed = @(
        (Join-Path $env:ProgramFiles 'Android\Android Studio\jbr'),
        (Join-Path $env:ProgramFiles 'Eclipse Adoptium'),
        (Join-Path $env:ProgramFiles 'Microsoft'),
        (Join-Path $env:ProgramFiles 'Java'),
        (Join-Path $env:LOCALAPPDATA 'Programs\Eclipse Adoptium'),
        (Join-Path $env:LOCALAPPDATA 'Programs\Microsoft')
    )

    foreach ($root in $fixed) {
        if (-not (Test-Path $root)) { continue }
        if (Test-Path (Join-Path $root 'bin\java.exe')) {
            [void]$candidates.Add($root)
        }
        Get-ChildItem -LiteralPath $root -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match '(^|[-_])jdk[-_]?21|jdk-21|21.*hotspot' } |
            ForEach-Object { [void]$candidates.Add($_.FullName) }
    }

    foreach ($home in ($candidates | Select-Object -Unique)) {
        $java = Join-Path $home 'bin\java.exe'
        if (-not (Test-Path $java)) { continue }
        $versionText = (& $java -version 2>&1 | Out-String)
        if ($versionText -match 'version\s+"21(?:\.|")|openjdk\s+21') {
            return $home
        }
    }

    return $null
}

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)][string]$Executable,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$Label
    )

    Write-Host ''
    Write-Host (">>> " + $Label) -ForegroundColor Cyan
    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Label falhou (código $LASTEXITCODE)."
    }
}

Write-Host '=== UniGuard | Preparação Android + Flutter ===' -ForegroundColor Cyan
Write-Host 'As instalações serão feitas no perfil do usuário. A main e o código do app não serão alterados.'

# Android SDK: reutiliza um SDK existente; se não houver, usa o caminho padrão.
if (-not $SdkPath) {
    $sdkCandidates = @($env:ANDROID_HOME, $env:ANDROID_SDK_ROOT, (Join-Path $env:LOCALAPPDATA 'Android\Sdk'))
    $SdkPath = $sdkCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
}
if (-not $SdkPath) {
    $SdkPath = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
}
$SdkPath = [System.IO.Path]::GetFullPath($SdkPath)
New-Item -ItemType Directory -Force -Path $SdkPath | Out-Null
$env:ANDROID_HOME = $SdkPath
$env:ANDROID_SDK_ROOT = $SdkPath
[Environment]::SetEnvironmentVariable('ANDROID_HOME', $SdkPath, 'User')
[Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', $SdkPath, 'User')
Write-Host "Android SDK: $SdkPath"

# Java 21 é necessário para repetir o job Flutter do CI e compatível com o Gradle atualizado.
$Java21Home = Get-Java21Home
if (-not $Java21Home) {
    throw 'JDK 21 não foi localizado. Verifique a instalação anterior do JDK 21 ou instale um JDK 21 (Temurin/Microsoft). O Java 25 atualmente no PATH não será usado neste build.'
}
$env:JAVA_HOME = $Java21Home
[Environment]::SetEnvironmentVariable('JAVA_HOME', $Java21Home, 'User')
Add-UserPathEntry (Join-Path $Java21Home 'bin')
Write-Host "JDK 21: $Java21Home"

# Android CLI oficial: tenta winget; se indisponível, usa o instalador local oficial do Google.
$androidCommand = Get-Command android -ErrorAction SilentlyContinue
if (-not $androidCommand) {
    $winget = Get-Command winget.exe -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Host ''
        Write-Host 'Instalando Android CLI oficial pelo winget...'
        & $winget.Source install --id Google.AndroidCLI --exact --accept-source-agreements --accept-package-agreements
        Refresh-ProcessPath
        $androidCommand = Get-Command android -ErrorAction SilentlyContinue
    }
}
if (-not $androidCommand) {
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if (-not $curl) { throw 'curl.exe não foi encontrado para baixar o instalador oficial do Android CLI.' }

    $installer = Join-Path $env:TEMP 'android-cli-install.cmd'
    Invoke-Checked -Executable $curl.Source -Arguments @(
        '-fsSL',
        'https://dl.google.com/android/cli/latest/windows_x86_64/install.cmd',
        '-o',
        $installer
    ) -Label 'Download do instalador Android CLI'

    $cmdArgs = '/d /c "' + $installer + '"'
    $installerProcess = Start-Process -FilePath $env:ComSpec -ArgumentList $cmdArgs -Wait -PassThru -NoNewWindow
    if ($installerProcess.ExitCode -ne 0) {
        throw "Instalador oficial Android CLI falhou (código $($installerProcess.ExitCode))."
    }
    Refresh-ProcessPath
    $androidCommand = Get-Command android -ErrorAction SilentlyContinue
}
if (-not $androidCommand) {
    throw 'Android CLI foi instalado, mas o executável android não apareceu no PATH. Feche e reabra o PowerShell e execute novamente.'
}
Write-Host "Android CLI: $($androidCommand.Source)"
Invoke-Checked -Executable $androidCommand.Source -Arguments @('update') -Label 'Atualização do Android CLI'

# O SDK manager oficial atual usa android sdk install (não sdkmanager --install).
$packages = @(
    'platform-tools',
    'platforms/android-35',
    'platforms/android-36',
    'build-tools/35.0.0',
    'cmdline-tools/latest'
)
if ($InstallEmulator) {
    $packages += @('emulator', 'system-images/android-36/google_apis/x86_64')
}
Invoke-Checked -Executable $androidCommand.Source -Arguments (@("--sdk=$SdkPath", 'sdk', 'install') + $packages) -Label 'Instalação das plataformas e ferramentas Android'

# Confirma os arquivos críticos em disco; não confia apenas no código de saída do instalador.
$requiredPaths = @(
    (Join-Path $SdkPath 'platforms\android-35\android.jar'),
    (Join-Path $SdkPath 'platforms\android-36\android.jar'),
    (Join-Path $SdkPath 'build-tools\35.0.0\aapt.exe'),
    (Join-Path $SdkPath 'platform-tools\adb.exe'),
    (Join-Path $SdkPath 'cmdline-tools\latest\bin\sdkmanager.bat')
)
$missing = @($requiredPaths | Where-Object { -not (Test-Path $_) })
if ($missing.Count -gt 0) {
    throw ("Instalação Android incompleta. Arquivos ausentes: " + [Environment]::NewLine + ($missing -join [Environment]::NewLine))
}

Add-UserPathEntry (Join-Path $SdkPath 'platform-tools')
Add-UserPathEntry (Join-Path $SdkPath 'cmdline-tools\latest\bin')
Refresh-ProcessPath

# Opcional: instala Flutter 3.47.7 em paralelo, sem substituir C:\src\flutter 3.41.2.
$FlutterHome = $null
if ($InstallFlutterCiVersion) {
    $FlutterHome = 'C:\src\flutter-3.47.7'
    $flutterExe = Join-Path $FlutterHome 'bin\flutter.bat'
    if (-not (Test-Path $flutterExe)) {
        $driveRoot = [System.IO.Path]::GetPathRoot($FlutterHome)
        $drive = [System.IO.DriveInfo]::new($driveRoot)
        if ($drive.AvailableFreeSpace -lt 8GB) {
            throw 'São necessários pelo menos 8 GB livres em C: para baixar e extrair Flutter 3.47.7.'
        }

        $archive = Join-Path $env:TEMP 'flutter_windows_3.47.7-stable.zip'
        $archiveUrl = 'https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.47.7-stable.zip'
        $expectedSha256 = 'c2c875da25a1a1448d18ee4e8f398b2f6fce888b4775d8f9130538e16d826cb4'

        if (-not (Test-Path $archive)) {
            $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
            Invoke-Checked -Executable $curl.Source -Arguments @('--fail', '--location', '--retry', '3', '--output', $archive, $archiveUrl) -Label 'Download Flutter 3.47.7'
        }
        $actualSha256 = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actualSha256 -ne $expectedSha256) {
            Remove-Item -LiteralPath $archive -Force
            throw 'Checksum SHA-256 do Flutter 3.47.7 não confere. O arquivo foi descartado.'
        }

        $staging = Join-Path $env:TEMP 'uniguard-flutter-3477-extract'
        if (Test-Path $staging) { Remove-Item -LiteralPath $staging -Recurse -Force }
        New-Item -ItemType Directory -Force -Path $staging | Out-Null
        Expand-Archive -LiteralPath $archive -DestinationPath $staging -Force
        $extracted = Join-Path $staging 'flutter'
        if (-not (Test-Path (Join-Path $extracted 'bin\flutter.bat'))) {
            throw 'O pacote Flutter foi extraído, mas a estrutura esperada não foi encontrada.'
        }
        if (Test-Path $FlutterHome) { Remove-Item -LiteralPath $FlutterHome -Recurse -Force }
        New-Item -ItemType Directory -Force -Path (Split-Path $FlutterHome -Parent) | Out-Null
        Move-Item -LiteralPath $extracted -Destination $FlutterHome
        Remove-Item -LiteralPath $staging -Recurse -Force
        Remove-Item -LiteralPath $archive -Force
    }

    $env:UNIGUARD_FLUTTER_HOME = $FlutterHome
    [Environment]::SetEnvironmentVariable('UNIGUARD_FLUTTER_HOME', $FlutterHome, 'User')
}
elseif ($env:UNIGUARD_FLUTTER_HOME -and (Test-Path (Join-Path $env:UNIGUARD_FLUTTER_HOME 'bin\flutter.bat'))) {
    $FlutterHome = $env:UNIGUARD_FLUTTER_HOME
}
else {
    # Procura primeiro instalações paralelas comuns antes de baixar novamente o SDK de 1,8 GB.
    $knownFlutterHomes = @(
        'C:\src\flutter-3.47.7',
        'C:\src\flutter-ci-3.47.7',
        (Join-Path $env:USERPROFILE 'develop\flutter-3.47.7'),
        (Join-Path $env:USERPROFILE 'Downloads\flutter-3.47.7')
    )
    foreach ($candidateHome in $knownFlutterHomes) {
        $candidateFlutter = Join-Path $candidateHome 'bin\flutter.bat'
        if (-not (Test-Path $candidateFlutter)) { continue }
        $candidateVersion = (& $candidateFlutter --version 2>&1 | Out-String)
        if ($candidateVersion -match 'Flutter 3\.47\.7\b') {
            $FlutterHome = $candidateHome
            break
        }
    }

    if ($FlutterHome) {
        $env:UNIGUARD_FLUTTER_HOME = $FlutterHome
        [Environment]::SetEnvironmentVariable('UNIGUARD_FLUTTER_HOME', $FlutterHome, 'User')
    }
    else {
        $flutterCommand = Get-Command flutter -ErrorAction SilentlyContinue
        if ($flutterCommand) {
            $currentFlutterHome = Split-Path (Split-Path $flutterCommand.Source -Parent) -Parent
            $flutterVersion = (& $flutterCommand.Source --version 2>&1 | Out-String)
            if ($flutterVersion -match 'Flutter 3\.47\.7\b') {
                $FlutterHome = $currentFlutterHome
                $env:UNIGUARD_FLUTTER_HOME = $FlutterHome
                [Environment]::SetEnvironmentVariable('UNIGUARD_FLUTTER_HOME', $FlutterHome, 'User')
            }
            else {
                $FlutterHome = $currentFlutterHome
                Write-Warning 'Flutter 3.47.7 não foi localizado. O SDK Android será preparado, mas para reproduzir o CI execute este script novamente com -InstallFlutterCiVersion.'
            }
        }
    }
}

if ($FlutterHome -and (Test-Path (Join-Path $FlutterHome 'bin\flutter.bat'))) {
    $Flutter = Join-Path $FlutterHome 'bin\flutter.bat'
}
else {
    $flutterCommand = Get-Command flutter -ErrorAction SilentlyContinue
    if (-not $flutterCommand) { throw 'Flutter não foi encontrado. Instale Flutter ou execute com -InstallFlutterCiVersion.' }
    $Flutter = $flutterCommand.Source
}

Invoke-Checked -Executable $Flutter -Arguments @('config', '--android-sdk', $SdkPath) -Label 'Configuração do Flutter para o Android SDK'

Write-Host ''
Write-Host 'Aceite as licenças Android solicitadas pelo Flutter. Responda y quando concordar.' -ForegroundColor Yellow
& $Flutter doctor --android-licenses
if ($LASTEXITCODE -ne 0) {
    throw 'As licenças Android não foram concluídas. Execute flutter doctor --android-licenses e aceite as licenças necessárias.'
}

Write-Host ''
Write-Host '>>> Diagnóstico final Flutter' -ForegroundColor Cyan
$doctorLines = @(& $Flutter doctor -v 2>&1)
$doctorLines | Out-Host
$doctorText = [string]::Join([Environment]::NewLine, [string[]]$doctorLines)
$androidToolchainLine = $doctorLines | Where-Object { "$_" -match 'Android toolchain - develop for Android devices' } | Select-Object -First 1
if (-not $androidToolchainLine -or "$androidToolchainLine" -match '\[✗\]|\[!\]') {
    throw 'O Flutter ainda não reconhece o Android SDK como ferramenta pronta. Consulte o bloco Android toolchain acima antes de compilar.'
}

Write-Host ''
Write-Host '>>> Dispositivos disponíveis' -ForegroundColor Cyan
& $Flutter devices

Write-Host ''
Write-Host 'Preparação concluída.' -ForegroundColor Green
Write-Host "ANDROID_HOME=$SdkPath"
Write-Host "JAVA_HOME=$Java21Home"
if ($FlutterHome) { Write-Host "UNIGUARD_FLUTTER_HOME=$FlutterHome" }
Write-Host 'Próxima etapa: na raiz do repositório, execute .\scripts\build_flutter_poc.ps1 -Compare.'
Write-Host 'Nenhum APK foi instalado; nenhuma operação Git ou publicação foi executada.'
