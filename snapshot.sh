#!/bin/bash

OUTPUT_FILE="snapshot.txt"

> "$OUTPUT_FILE"

find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -name "$OUTPUT_FILE" \
  -not -name "package-lock.json" \
  -not -name "pnpm-lock.yaml" \
  -not -name "yarn.lock" \
  -not -name "*.log" \
  -not -path "*/.gemini/*" \
  -not -name ".env*" \
  -not -name "*.svg" \
  -not -name "*.png" \
  -not -name "*.jpg" \
  -not -name "*.ico" \
  | sort | while read -r file; do
    echo "================================================================================" >> "$OUTPUT_FILE"
    echo "File: $file" >> "$OUTPUT_FILE"
    echo "================================================================================" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

echo "Snapshot generated at $OUTPUT_FILE"
