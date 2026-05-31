#!/bin/sh
# Pre-commit secret scan — dependency-free (no gitleaks binary required).
# Install once:  ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
# (or run `sh scripts/install-hooks.sh`). Blocks commits containing obvious
# secrets. For deeper scanning, also run gitleaks in CI if available.

staged=$(git diff --cached --name-only --diff-filter=ACM)
[ -z "$staged" ] && exit 0

# Patterns: provider keys + .env value leaks. Extend as needed.
pattern='(gsk_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{30,})'

hits=0
for f in $staged; do
  # skip binary + lockfiles
  case "$f" in
    *.lock|*.png|*.jpg|*.jpeg|*.gif|*.ico|*.pdf) continue ;;
  esac
  if git show ":$f" 2>/dev/null | grep -nEq "$pattern"; then
    echo "✗ potential secret in: $f"
    git show ":$f" | grep -nE "$pattern" | sed 's/\(.\{80\}\).*/\1.../' | head -3
    hits=1
  fi
  # block committing a real .env (allow .env.example / .env.sample)
  case "$f" in
    *.env|.env) echo "✗ refusing to commit env file: $f (use .env.example)"; hits=1 ;;
  esac
done

if [ "$hits" -ne 0 ]; then
  echo ""
  echo "Commit blocked: remove the secret(s) above. Override (NOT recommended): git commit --no-verify"
  exit 1
fi
exit 0
