#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="${1:-.}"
OUTPUT_ZIP="${2:-My-Recipe-Box-clean.zip}"
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"
PARENT_DIR="$(dirname "$PROJECT_DIR")"
PROJECT_NAME="$(basename "$PROJECT_DIR")"
"$PROJECT_DIR/scripts/clean-macos-metadata.sh" "$PROJECT_DIR"
cd "$PARENT_DIR"
rm -f "$OUTPUT_ZIP"
zip -r "$OUTPUT_ZIP" "$PROJECT_NAME" \
  -x "*/node_modules/*" \
     "*/dist/*" \
     "*/.git/*" \
     "*/.DS_Store" \
     "*/._*" \
     "*/__MACOSX/*" \
     "*.log"
echo "Created: $PARENT_DIR/$OUTPUT_ZIP"
