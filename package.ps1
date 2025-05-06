# Script para empaquetar el proyecto limpio en un archivo ZIP

Write-Host "Empaquetando proyecto Montana AI..." -ForegroundColor Cyan

# Primero ejecutar la limpieza
if (Test-Path -Path "cleanup.ps1") {
    Write-Host "Ejecutando limpieza primero..." -ForegroundColor Yellow
    & .\cleanup.ps1
}

# Crear directorio temporal para la versión limpia
$tempDir = "montana-ai-clean"
if (Test-Path -Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}

# Crear el directorio temporal
New-Item -Path $tempDir -ItemType Directory | Out-Null

# Copiar archivos esenciales (sin node_modules, .next, etc)
Write-Host "Copiando archivos esenciales..." -ForegroundColor Yellow
Copy-Item -Path "src" -Destination "$tempDir\src" -Recurse
Copy-Item -Path "public" -Destination "$tempDir\public" -Recurse
Copy-Item -Path "package.json" -Destination "$tempDir\package.json"
Copy-Item -Path "package-lock.json" -Destination "$tempDir\package-lock.json"
Copy-Item -Path "tailwind.config.js" -Destination "$tempDir\tailwind.config.js"
Copy-Item -Path "postcss.config.mjs" -Destination "$tempDir\postcss.config.mjs"
Copy-Item -Path "next.config.ts" -Destination "$tempDir\next.config.ts"
Copy-Item -Path "tsconfig.json" -Destination "$tempDir\tsconfig.json"
Copy-Item -Path ".gitignore" -Destination "$tempDir\.gitignore"
Copy-Item -Path "README.md" -Destination "$tempDir\README.md"

# Crear archivo ZIP
$date = Get-Date -Format "yyyyMMdd"
$zipFile = "montana-ai-clean-$date.zip"
Write-Host "Creando archivo ZIP: $zipFile..." -ForegroundColor Green

# Comprimir usando .NET
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipFile)

# Eliminar directorio temporal
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Empaquetado completado! Archivo: $zipFile" -ForegroundColor Cyan
Write-Host "Tamaño del archivo: $([Math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB" -ForegroundColor Cyan 