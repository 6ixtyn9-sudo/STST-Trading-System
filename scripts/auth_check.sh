#!/usr/bin/env bash
set -euo pipefail

echo "=== ORIGIN URL ==="
origin_url="$(git remote get-url origin 2>/dev/null || true)"
echo "${origin_url:-UNKNOWN}"

echo "=== CREDENTIAL HELPER ==="
cred_helper="$(git config --get credential.helper || true)"
echo "${cred_helper:-NONE}"

if [[ "${origin_url}" == https://*github.com/* ]]; then
  echo "=== HTTPS IDENTITY (SAFE) ==="
  # Safe: print ONLY username, never password
  printf "protocol=https\nhost=github.com\n" | git credential fill | grep '^username=' || true
  echo "NOTE: username proof is from 'git credential fill' (password intentionally suppressed)."
elif [[ "${origin_url}" == git@*:* ]]; then
  echo "=== SSH IDENTITY ==="
  host="${origin_url#git@}"
  host="${host%%:*}"
  # ssh -T often returns nonzero even on success; don’t fail the script for that.
  set +e
  ssh -T "git@${host}" 2>&1 | head -n 1
  set -e
else
  echo "=== IDENTITY ==="
  echo "UNSUPPORTED ORIGIN URL FORMAT"
fi
