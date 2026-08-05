#!/usr/bin/env bash
# Compress a screen recording to fit the repo's 1MB pre-commit limit for
# public/videos/how-to.mp4. Re-encodes at a bitrate sized to the clip's
# actual duration, so a longer recording gets a lower bitrate rather than
# a fixed setting that overshoots the size cap.
#
# Usage: npm run compress-video -- <input-file> [output-file]
#   output-file defaults to public/videos/how-to.mp4

set -euo pipefail

INPUT="${1:-}"
OUTPUT="${2:-public/videos/how-to.mp4}"
TARGET_BYTES=$((950 * 1024)) # leave headroom under the 1MB hook limit

if [ -z "$INPUT" ]; then
  echo "Usage: npm run compress-video -- <input-file> [output-file]" >&2
  exit 1
fi
if [ ! -f "$INPUT" ]; then
  echo "Input file not found: $INPUT" >&2
  exit 1
fi

FFMPEG="ffmpeg"
if ! command -v ffmpeg >/dev/null 2>&1; then
  WINGET_FFMPEG=$(find /c/Users/*/AppData/Local/Microsoft/WinGet/Packages \
    -iname "ffmpeg.exe" 2>/dev/null | head -1)
  if [ -n "$WINGET_FFMPEG" ]; then
    FFMPEG="$WINGET_FFMPEG"
  else
    echo "ffmpeg not found on PATH or in the WinGet packages folder." >&2
    echo "Install it with: winget install --id Gyan.FFmpeg -e" >&2
    exit 1
  fi
fi

DURATION=$("$FFMPEG" -i "$INPUT" 2>&1 | grep -oE "Duration: [0-9:.]+" | grep -oE "[0-9:.]+$" || true)
if [ -z "$DURATION" ]; then
  echo "Could not read duration from: $INPUT (is it a valid video file?)" >&2
  exit 1
fi
H=$(echo "$DURATION" | cut -d: -f1)
M=$(echo "$DURATION" | cut -d: -f2)
S=$(echo "$DURATION" | cut -d: -f3 | cut -d. -f1)
DUR_SECONDS=$((10#$H * 3600 + 10#$M * 60 + 10#$S))
[ "$DUR_SECONDS" -lt 1 ] && DUR_SECONDS=1

if [ "$DUR_SECONDS" -gt 150 ]; then
  echo "Warning: source is ${DUR_SECONDS}s long. The how-to video script calls for" >&2
  echo "30-90s; a longer clip will need heavier compression and softer text." >&2
fi

# Reserve ~28kb/s for audio; split the rest of the byte budget across video.
TARGET_KBIT=$(( TARGET_BYTES * 8 / 1000 / DUR_SECONDS ))
AUDIO_KBIT=28
VIDEO_KBIT=$(( TARGET_KBIT - AUDIO_KBIT ))
[ "$VIDEO_KBIT" -lt 25 ] && VIDEO_KBIT=25 # floor so very long clips stay watchable

# Scale down for longer/lower-bitrate clips so quality holds up better
# than shrinking bitrate alone would allow.
if [ "$VIDEO_KBIT" -ge 70 ]; then
  SCALE="960:540"
elif [ "$VIDEO_KBIT" -ge 45 ]; then
  SCALE="854:480"
else
  SCALE="720:404"
fi

echo "Duration: ${DUR_SECONDS}s -> target ~${VIDEO_KBIT}kb/s video @ ${SCALE}"

mkdir -p "$(dirname "$OUTPUT")"
"$FFMPEG" -y -i "$INPUT" \
  -vf "scale=$SCALE" \
  -c:v libx264 -preset slow -b:v "${VIDEO_KBIT}k" \
  -maxrate "$((VIDEO_KBIT + 15))k" -bufsize "$((VIDEO_KBIT * 2))k" \
  -c:a aac -b:a "${AUDIO_KBIT}k" \
  -movflags +faststart \
  "$OUTPUT"

SIZE=$(du -b "$OUTPUT" | cut -f1)
echo "Wrote $OUTPUT ($((SIZE / 1024))KB)"
if [ "$SIZE" -gt $((1024 * 1024)) ]; then
  echo "Still over 1MB — re-run with a shorter source recording." >&2
  exit 1
fi
