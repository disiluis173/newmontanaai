# Script para crear una versión mínima del proyecto sin dependencias innecesarias

Write-Host "Creando versión mínima de Montana AI..." -ForegroundColor Cyan

# Crear directorio temporal para la versión limpia
$tempDir = "montana-ai-minimal"
if (Test-Path -Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}

# Crear el directorio temporal
New-Item -Path $tempDir -ItemType Directory | Out-Null

# Copiar solo los archivos esenciales
Write-Host "Copiando archivos esenciales..." -ForegroundColor Yellow
Copy-Item -Path "src" -Destination "$tempDir\src" -Recurse
Copy-Item -Path "public" -Destination "$tempDir\public" -Recurse
Copy-Item -Path "tailwind.config.js" -Destination "$tempDir\tailwind.config.js"
Copy-Item -Path "postcss.config.mjs" -Destination "$tempDir\postcss.config.mjs"
Copy-Item -Path "next.config.ts" -Destination "$tempDir\next.config.ts"
Copy-Item -Path "tsconfig.json" -Destination "$tempDir\tsconfig.json"
Copy-Item -Path ".gitignore" -Destination "$tempDir\.gitignore"
Copy-Item -Path "README.md" -Destination "$tempDir\README.md"

# Optimizar package.json
Write-Host "Creando archivo package.json optimizado..." -ForegroundColor Yellow
$packageData = Get-Content -Path "package.json" -Raw | ConvertFrom-Json

# Guardar solo las dependencias principales
$minimalPackage = @{
    name = $packageData.name
    version = $packageData.version
    private = $true
    scripts = @{
        dev = "next dev"
        build = "next build"
        start = "next start"
    }
    dependencies = @{}
}

# Añadir solo las dependencias mínimas que necesitamos
$minDependencies = @("next", "react", "react-dom", "react-icons", "framer-motion", "react-markdown", "openai", "axios", "tailwindcss", "autoprefixer", "postcss")

foreach ($dep in $minDependencies) {
    if ($packageData.dependencies.$dep) {
        $minimalPackage.dependencies[$dep] = $packageData.dependencies.$dep
    }
}

# Guardar el package.json mínimo
$minimalPackage | ConvertTo-Json | Set-Content -Path "$tempDir\package.json"

# Crear archivo README.md con instrucciones
$readme = @"
# Montana AI (Versión Mínima)

Esta es una versión mínima del proyecto Montana AI que reduce significativamente el tamaño.

## Instalación

1. Asegúrate de tener Node.js instalado (versión 16 o superior)
2. Ejecuta el siguiente comando para instalar las dependencias:

\`\`\`
npm install
\`\`\`

## Ejecución

Para iniciar el servidor de desarrollo:

\`\`\`
npm run dev
\`\`\`

## API Keys

Necesitarás configurar tus API Keys para:
- DeepSeek AI (comienza con sk-...)
- X.AI / Grok (comienza con xai-...)

Estas se configuran directamente en la aplicación la primera vez que la ejecutes.
"@

$readme | Set-Content -Path "$tempDir\README.md"

# Crear archivo ZIP
$date = Get-Date -Format "yyyyMMdd"
$zipFile = "montana-ai-minimal-$date.zip"
Write-Host "Creando archivo ZIP: $zipFile..." -ForegroundColor Green

# Comprimir usando .NET
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipFile)

# Eliminar directorio temporal
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "¡Versión mínima creada con éxito!" -ForegroundColor Cyan
Write-Host "Archivo: $zipFile" -ForegroundColor Cyan
Write-Host "Tamaño del archivo: $([Math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "Para usar esta versión, descomprime el archivo y ejecuta 'npm install' para instalar las dependencias." -ForegroundColor Cyan 