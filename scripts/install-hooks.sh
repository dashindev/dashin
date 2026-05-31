#!/bin/sh
# Install bunadmin git hooks. Run from repo root: sh scripts/install-hooks.sh
hookdir="$(git rev-parse --git-path hooks)"
ln -sf ../../scripts/pre-commit.sh "$hookdir/pre-commit"
chmod +x scripts/pre-commit.sh
echo "✓ pre-commit secret-scan hook installed"
