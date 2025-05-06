# Script para limpiar el proyecto y reducir su tamaño

Write-Host "Limpiando proyecto Montana AI..." -ForegroundColor Cyan

# Detener procesos que puedan bloquear archivos
Write-Host "Deteniendo procesos que puedan bloquear archivos..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
} catch {
    Write-Host "No se pudieron detener todos los procesos, pero continuaremos..." -ForegroundColor Red
}

# Función para limpiar directorios con manejo de errores
function Remove-DirectorySafely {
    param(
        [string]$Path
    )
    
    try {
        if (Test-Path -Path $Path) {
            Write-Host "Eliminando $Path..." -ForegroundColor Yellow
            Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
            
            # Verificar si se eliminó
            if (Test-Path -Path $Path) {
                # Intentar con cmd
                Write-Host "Intentando eliminar con comando alternativo..." -ForegroundColor Yellow
                Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "rmdir", "/s", "/q", $Path -Wait -NoNewWindow
            }
        }
    } catch {
        Write-Host "Error al eliminar $Path, pero continuaremos..." -ForegroundColor Red
    }
}

# Eliminar archivos de construcción de Next.js
Remove-DirectorySafely -Path ".next"

# Eliminar caché de npm
Remove-DirectorySafely -Path ".npm"

# Crear un paquete mínimo
Write-Host "Creando paquete optimizado..." -ForegroundColor Green

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
$minimalPackage | ConvertTo-Json | Set-Content -Path "package.min.json"

# Instalar solo las dependencias necesarias
Write-Host "Instalando dependencias mínimas..." -ForegroundColor Green
npm install --omit=dev

Write-Host "Limpieza completada!" -ForegroundColor Cyan
Write-Host "Para desarrollo, ejecuta 'npm install' para reinstalar todas las dependencias." -ForegroundColor Cyan
Write-Host "Para reducir más el tamaño, puedes eliminar manualmente node_modules después de cerrar todos los procesos." -ForegroundColor Cyan 