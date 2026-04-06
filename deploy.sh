#!/bin/bash
# deploy.sh - Script de despliegue automático para Nemaris Dashboard
# Uso: ./deploy.sh "mensaje del commit opcional"

set -e # Detenerse si ocurre un error

# Mensaje de commit por defecto o el de argumento
COMMIT_MSG=${1:-"update: sincronización y despliegue automático"}

echo "🚀 Iniciando proceso de despliegue completo..."

# 1. Sincronía con Git
echo "📡 Paso 1: Guardando cambios en Git..."
git add .
# Revisar si hay algo que commitear para evitar error
if ! git diff-index --quiet HEAD --; then
  git commit -m "$COMMIT_MSG"
  git push origin main
else
  echo "⚠️ No hay cambios locales para Git, saltando commit."
fi

# 2. Convex Backend
echo "💾 Paso 2: Desplegando backend a Convex (Producción)..."
CONVEX_DEPLOYMENT=next-swan-708 npx convex deploy -y

# 3. Build y Cloudflare Frontend
echo "🏗️ Paso 3: Construyendo y desplegando a Cloudflare Pages..."
npm run build
npx wrangler pages deploy dist --project-name=nemaris-dashboard --branch=main --commit-dirty=true

echo "✅ ¡Todo listo! La aplicación se ha actualizado en Cloudflare y Convex."
echo "🔗 URL: https://nemaris-dashboard.pages.dev"
