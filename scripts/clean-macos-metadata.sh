#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-.}"
find "$ROOT" -name '.DS_Store' -delete
find "$ROOT" -name '._*' -delete
find "$ROOT" -type d -name '__MACOSX' -prune -exec rm -rf {} +
echo "Removed macOS metadata from: $ROOT"
