#!/bin/bash
# === Device Setup Script for Luke ===
# Run after fresh macOS install

set -e

echo "=== 1. Installing Homebrew ==="
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"

echo "=== 2. Installing packages ==="
brew install gnupg python@3.13

echo "=== 3. Installing NVM + Node.js ==="
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install --lts

echo "=== 4. Installing Claude Code ==="
npm install -g @anthropic-ai/claude-code

echo "=== 5. Restoring config files ==="
BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)"

cp "$BACKUP_DIR/zshrc" ~/.zshrc
cp "$BACKUP_DIR/gitconfig" ~/.gitconfig
mkdir -p ~/.claude
cp "$BACKUP_DIR/claude-settings.json" ~/.claude/settings.json

echo "=== 6. SSH key setup ==="
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cp "$BACKUP_DIR/ssh-config" ~/.ssh/config
chmod 600 ~/.ssh/config

if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "⚠️  SSH klíče je potřeba obnovit ručně!"
    echo "   Buď zkopíruj staré klíče, nebo vygeneruj nové:"
    echo "   ssh-keygen -t ed25519 -C 'lukas.mazanek@gmail.com'"
    echo "   Pak přidej na GitHub: https://github.com/settings/keys"
fi

echo "=== 7. Cloning repositories ==="
mkdir -p ~/claude && cd ~/claude
REPOS=(
    application-support
    bratislavska
    nibe
    personal-assistant
    presentation-room
    public
    semantic-platform
    story-room
    tutor
)

for repo in "${REPOS[@]}"; do
    if [ ! -d "$repo" ]; then
        git clone "git@github.com:lukasmazanek/$repo.git" || echo "Failed to clone $repo (SSH key needed?)"
    fi
done

echo ""
echo "=== HOTOVO ==="
echo "Zbývá:"
echo "  1. Obnovit/vygenerovat SSH klíče (pokud ještě nejsou)"
echo "  2. source ~/.zshrc"
echo "  3. Přihlásit se do Claude: claude login"
