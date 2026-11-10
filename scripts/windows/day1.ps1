<#
.SYNOPSIS
    ExcbonCP Day 1 helper for Windows.

.DESCRIPTION
    Sets up the local Python environment, runs lint/tests, loads the
    simulation-only seed, starts the server, or checks its health.
    The script finds the repository root automatically, so it can be run
    from any directory.

.PARAMETER Action
    setup   Create .venv, install dependencies, create .env, and prepare data/.
    test    Run Ruff lint, Ruff format check, and pytest.
    seed    Load server/seed.json into the local SQLite database.
    serve   Start the FastAPI server with uvicorn on the selected port.
    health  Call /api/health on a running server.
    docker  Start the Docker Compose stack.
    status  Show the current Git branch, status, and recent commits.
    all     Run setup, test, and seed.
    help    Show this help text.

.PARAMETER Port
    Local server port for serve/health. Default: 8000.

.EXAMPLE
    .\scripts\windows\day1.ps1 setup

.EXAMPLE
    .\scripts\windows\day1.ps1 test

.EXAMPLE
    .\scripts\windows\day1.ps1 seed

.EXAMPLE
    .\scripts\windows\day1.ps1 serve -Port 8000

.NOTES
    If PowerShell blocks local scripts, use the included wrapper:
        .\scripts\windows\day1.cmd setup
    or run:
        powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\day1.ps1 setup
#>

[CmdletBinding()]
param(
    [ValidateSet("setup", "test", "seed", "serve", "health", "docker", "status", "all", "help")]
    [string]$Action = "help",

    [ValidateRange(1, 65535)]
    [int]$Port = 8000
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ProjectRoot

$script:VenvPython = Join-Path $ProjectRoot ".venv\Scripts\python.exe"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK]   $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-ErrorAndExit {
    param([string]$Message)
    Write-Host "[ERR]  $Message" -ForegroundColor Red
    exit 1
}

$script:PythonLauncher = $null

function Get-PythonLauncher {
    if ($null -ne $script:PythonLauncher) {
        return $script:PythonLauncher
    }
    if (Get-Command py -ErrorAction SilentlyContinue) {
        $script:PythonLauncher = @{ Exe = "py"; Prefix = @("-3") }
        return $script:PythonLauncher
    }
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $script:PythonLauncher = @{ Exe = "python"; Prefix = @() }
        return $script:PythonLauncher
    }
    Write-ErrorAndExit "Python 3.12+ not found. Install it with: winget install --id Python.Python.3.12 -e"
}

function Invoke-Python {
    param([string[]]$Arguments)

    $launcher = Get-PythonLauncher
    $allArgs = @($launcher.Prefix) + $Arguments
    & $launcher.Exe @allArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Python command failed: $($Arguments -join ' ')"
    }
}

function Assert-Venv {
    if (-not (Test-Path $script:VenvPython)) {
        Write-ErrorAndExit "Virtual environment not found. Run: .\scripts\windows\day1.ps1 setup"
    }
}

function Invoke-VenvPython {
    param([string[]]$Arguments)

    Assert-Venv
    & $script:VenvPython @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed: .venv\Scripts\python.exe $($Arguments -join ' ')"
    }
}

function Import-DotEnv {
    $envFile = Join-Path $ProjectRoot ".env"
    if (-not (Test-Path $envFile)) {
        return
    }

    foreach ($line in Get-Content -Path $envFile) {
        $trimmed = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith("#")) {
            continue
        }

        $separator = $trimmed.IndexOf("=")
        if ($separator -lt 1) {
            continue
        }

        $name = $trimmed.Substring(0, $separator).Trim()
        $value = $trimmed.Substring($separator + 1).Trim()
        if ([string]::IsNullOrWhiteSpace($name)) {
            continue
        }
        if ($value.Length -ge 2) {
            $doubleQuoted = $value.StartsWith('"') -and $value.EndsWith('"')
            $singleQuoted = $value.StartsWith("'") -and $value.EndsWith("'")
            if ($doubleQuoted -or $singleQuoted) {
                $value = $value.Substring(1, $value.Length - 2)
            }
        }

        if ([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($name, "Process"))) {
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

function Invoke-Setup {
    Write-Info "Checking prerequisites..."

    if (Get-Command git -ErrorAction SilentlyContinue) {
        Write-Success "git found"
    } else {
        Write-Warn "git not found; Git is needed to clone/update the repository."
    }

    $launcher = Get-PythonLauncher
    $pythonVersion = (& $launcher.Exe @($launcher.Prefix + @("--version")) | Out-String).Trim()
    Write-Success $pythonVersion

    if (-not (Test-Path $script:VenvPython)) {
        Write-Info "Creating .venv..."
        Invoke-Python @("-m", "venv", ".venv")
        Write-Success ".venv created"
    } else {
        Write-Info ".venv already exists"
    }

    Write-Info "Installing Python dependencies..."
    Invoke-VenvPython @("-m", "pip", "install", "--upgrade", "pip")
    Invoke-VenvPython @("-m", "pip", "install", "-r", "requirements-dev.txt")
    Write-Success "Python dependencies installed"

    $dataDir = Join-Path $ProjectRoot "data"
    New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
    Write-Success "data/ directory ready"

    $envFile = Join-Path $ProjectRoot ".env"
    if (-not (Test-Path $envFile)) {
        Copy-Item -Path (Join-Path $ProjectRoot ".env.example") -Destination $envFile

        $jwtSecret = (& $script:VenvPython -c "import secrets; print(secrets.token_urlsafe(64))" | Out-String).Trim()
        $fernetKey = (& $script:VenvPython -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())" | Out-String).Trim()

        $content = Get-Content -Path $envFile -Raw
        $content = $content -replace "(?m)^JWT_SECRET=\s*$", "JWT_SECRET=$jwtSecret"
        $content = $content -replace "(?m)^CREDENTIAL_ENCRYPTION_KEY=\s*$", "CREDENTIAL_ENCRYPTION_KEY=$fernetKey"
        Set-Content -Path $envFile -Value $content

        Write-Success ".env created with generated JWT_SECRET and CREDENTIAL_ENCRYPTION_KEY"
    } else {
        Write-Info ".env already exists; not overwritten"
        $content = Get-Content -Path $envFile -Raw
        if (($content -match "(?m)^JWT_SECRET=\s*$") -or ($content -match "(?m)^CREDENTIAL_ENCRYPTION_KEY=\s*$")) {
            Write-Warn ".env exists but required secrets are empty. Edit .env or delete it and rerun setup."
        }
    }

    Write-Success "Setup complete. Next: .\scripts\windows\day1.ps1 test"
}

function Invoke-Tests {
    Assert-Venv
    Write-Info "Running Ruff lint..."
    Invoke-VenvPython @("-m", "ruff", "check", ".")

    Write-Info "Running Ruff format check..."
    Invoke-VenvPython @("-m", "ruff", "format", "--check", ".")

    Write-Info "Running pytest..."
    Invoke-VenvPython @("-m", "pytest", "-q", "--tb=short")

    Write-Success "All checks passed"
}

function Invoke-Seed {
    Assert-Venv

    $hadSeedPassword = Test-Path Env:SEED_DEMO_PASSWORD
    $previousSeedPassword = $env:SEED_DEMO_PASSWORD
    Import-DotEnv

    $password = $env:SEED_DEMO_PASSWORD
    if ([string]::IsNullOrWhiteSpace($password)) {
        $securePassword = Read-Host "Demo password (min 8 chars, blank = auto-generate)" -AsSecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        try {
            $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        } finally {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
        if (-not [string]::IsNullOrWhiteSpace($password)) {
            $env:SEED_DEMO_PASSWORD = $password
        }
    }

    try {
        Invoke-VenvPython @("-m", "server.seed")
    } finally {
        if ($hadSeedPassword) {
            $env:SEED_DEMO_PASSWORD = $previousSeedPassword
        } else {
            Remove-Item Env:SEED_DEMO_PASSWORD -ErrorAction SilentlyContinue
        }
    }

    Write-Success "Simulation seed loaded"
}

function Invoke-Serve {
    Assert-Venv
    if (-not (Test-Path (Join-Path $ProjectRoot ".env"))) {
        Write-Warn ".env not found. Run setup first; the server will use ephemeral secrets."
    } else {
        Import-DotEnv
    }
    Write-Info "Starting server on http://localhost:$Port ..."
    Write-Info "Press Ctrl+C to stop."
    & $script:VenvPython -m uvicorn server.main:app --host 127.0.0.1 --port $Port --reload --reload-dir server
    if ($LASTEXITCODE -ne 0) {
        throw "Server exited with code $LASTEXITCODE"
    }
}

function Invoke-Health {
    $url = "http://localhost:$Port/api/health"
    Write-Info "Checking $url ..."
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 5
        $response | ConvertTo-Json -Depth 4
    } catch {
        Write-ErrorAndExit "Health check failed at $url. Is the server running? $($_.Exception.Message)"
    }
}

function Invoke-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-ErrorAndExit "Docker not found. Install Docker Desktop, then retry."
    }
    if (-not (Test-Path (Join-Path $ProjectRoot ".env"))) {
        Write-ErrorAndExit ".env not found. Run setup first: .\scripts\windows\day1.ps1 setup"
    }

    Write-Info "Starting Docker Compose stack..."
    & docker compose version *> $null
    if ($LASTEXITCODE -eq 0) {
        & docker compose up -d --build
    } elseif (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        & docker-compose up -d --build
    } else {
        Write-ErrorAndExit "Neither 'docker compose' nor 'docker-compose' is available."
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed"
    }
    Write-Success "Containers started. Check http://localhost:8000/api/health"
    Write-Info "Stop with: docker compose down"
}

function Invoke-Status {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-ErrorAndExit "git not found."
    }
    Write-Info "Git branch and status:"
    & git status --short --branch
    if ($LASTEXITCODE -ne 0) {
        throw "git status failed"
    }
    Write-Info "Recent commits:"
    & git log --oneline --decorate -5
    if ($LASTEXITCODE -ne 0) {
        throw "git log failed"
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "ExcbonCP Day 1 helper for Windows" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\scripts\windows\day1.ps1 <action> [-Port 8000]"
    Write-Host ""
    Write-Host "Actions:"
    Write-Host "  setup   Create .venv, install dependencies, create .env, prepare data/"
    Write-Host "  test    Run Ruff lint, Ruff format check, and pytest"
    Write-Host "  seed    Load the simulation-only demo data"
    Write-Host "  serve   Start the FastAPI server with uvicorn"
    Write-Host "  health  Check /api/health on a running server"
    Write-Host "  docker  Start the Docker Compose stack"
    Write-Host "  status  Show Git branch, status, and recent commits"
    Write-Host "  all     Run setup, test, and seed"
    Write-Host "  help    Show this help"
    Write-Host ""
    Write-Host "If script execution is blocked, use the wrapper:"
    Write-Host "  .\scripts\windows\day1.cmd setup"
    Write-Host ""
}

switch ($Action) {
    "setup" { Invoke-Setup }
    "test" { Invoke-Tests }
    "seed" { Invoke-Seed }
    "serve" { Invoke-Serve }
    "health" { Invoke-Health }
    "docker" { Invoke-Docker }
    "status" { Invoke-Status }
    "all" {
        Invoke-Setup
        Invoke-Tests
        Invoke-Seed
    }
    default { Show-Help }
}
