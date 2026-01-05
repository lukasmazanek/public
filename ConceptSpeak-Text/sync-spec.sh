#!/bin/bash
# Sync ConceptSpeak Text Specification from source repository

SOURCE="/Users/luke/semantic-platform/conceptspeak/ConceptSpeak/ConceptSpeak-Text-Specification.md"
DEST_DIR="$(dirname "$0")"

if [[ ! -f "$SOURCE" ]]; then
    echo "Error: Source file not found: $SOURCE"
    exit 1
fi

cp "$SOURCE" "$DEST_DIR/"
echo "Synced: ConceptSpeak-Text-Specification.md"
