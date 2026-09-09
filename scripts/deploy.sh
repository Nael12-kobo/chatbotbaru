#!/bin/bash

# ============================================
# Chatbot Deploy Script untuk VPS
# ============================================

set -e

# Configuration
DEPLOY_PATH="/var/www/chatbotbaru"
REPO_URL="https://github.com/Nael12-kobo/chatbotbaru.git"
BRANCH="master"

echo "🚀 Memulai deploy..."

# 1. Install dependencies jika belum ada
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# 2. Clone atau pull repo
if [ -d "$DEPLOY_PATH" ]; then
    echo "📥 Updating repository..."
    cd $DEPLOY_PATH
    git pull origin $BRANCH
else
    echo "📥 Cloning repository..."
    sudo mkdir -p $DEPLOY_PATH
    sudo chown $USER:$USER $DEPLOY_PATH
    git clone -b $BRANCH $REPO_URL $DEPLOY_PATH
    cd $DEPLOY_PATH
fi

# 3. Setup .env
if [ ! -f .env ]; then
    echo "⚠️  File .env belum ada!"
    echo "Silakan buat file .env dengan isi:"
    echo "---"
    echo "GEMINI_API_KEY=your_key"
    echo "GEMINI_MODEL=gemini-2.5-flash"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
    echo "NEXT_PUBLIC_SITE_URL=your_domain"
    echo "---"
    exit 1
fi

# 4. Install dependencies
echo "📦 Installing dependencies..."
npm ci

# 5. Build
echo "🔨 Building project..."
npm run build

# 6. Setup PM2
echo "🔄 Starting/Restarting PM2..."
pm2 delete chatbotbaru 2>/dev/null || true
pm2 start npm --name "chatbotbaru" -- start
pm2 save

# 7. Setup PM2 startup
pm2 startup | grep "sudo" | bash || true

echo "✅ Deploy selesai!"
echo "🌐 Akses di: http://$(hostname -I | awk '{print $1}'):3000"
