#!/bin/bash

echo "🚀 Iniciando deploy do FreelancePro..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Fazer build local para verificar se está tudo OK
echo "🔨 Fazendo build local..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou! Corrija os erros antes de fazer deploy."
    exit 1
fi

echo "✅ Build local bem-sucedido!"

# Fazer deploy
echo "🚀 Fazendo deploy para Vercel..."
vercel --prod

echo "✅ Deploy concluído!"
echo "🌐 Seu site estará disponível em alguns minutos."
echo "📊 Acesse https://vercel.com/dashboard para monitorar o deploy." 