#!/usr/bin/env bash
# reality_check.sh — Run this before any "delivered" claim.
# Output must be pasted into every antigravity delivery report.
# A claim is only valid if origin/main contains the files.
set -euo pipefail

echo "=== LOCAL HEAD ==="
git rev-parse HEAD

echo "=== ORIGIN/MAIN HEAD ==="
git fetch origin main --quiet
git rev-parse origin/main

echo "=== LOG (last 5) ==="
git log --oneline -5

echo "=== DIFF vs origin/main (name-status) ==="
git diff --name-status origin/main...HEAD

echo "=== LOCAL STATUS (should be empty if clean) ==="
git status --porcelain

echo "=== CONCLUSION ==="
AHEAD=$(git rev-list origin/main..HEAD --count)
if [ "$AHEAD" -eq 0 ]; then
  echo "STATUS: IN SYNC WITH ORIGIN — claims may say DELIVERED"
else
  echo "STATUS: $AHEAD commit(s) LOCAL-ONLY — claims must say PROPOSED, NOT DELIVERED"
fi
