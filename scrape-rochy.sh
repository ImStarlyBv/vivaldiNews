#!/bin/bash
OUTPUT="/data/workspace/rochy-rd-lyrics.md"
SONGS="/data/workspace/rochy-rd-songs.txt"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

echo "# Rochy RD - Letras / Lyrics" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "Scraped from letras.com — $(date -u +%Y-%m-%d) UTC" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

count=0
total=$(wc -l < "$SONGS")

while IFS= read -r path; do
  count=$((count + 1))
  url="https://www.letras.com${path}"
  name=$(echo "$path" | sed 's|/rochy-rd/||;s|/$||;s/-/ /g' | sed 's/\bpart\b/ft./g')
  echo "[$count/$total] Fetching: $name" >&2
  html=$(curl -s -L -H "User-Agent: $UA" "$url")
  lyrics=$(echo "$html" | python3 -c "
import sys, re, html as h
content = sys.stdin.read()
for pattern in [
    r'<div class=\"lyric-original\">(.*?)</div>',
    r'<div[^>]*class=\"[^\"]*lyric[^\"]*\"[^>]*>(.*?)</div>',
]:
    m = re.findall(pattern, content, re.DOTALL)
    if m:
        text = ' '.join(m)
        text = re.sub(r'<br\s*/?>', '\n', text)
        text = re.sub(r'<p[^>]*>', '\n\n', text)
        text = re.sub(r'</p>', '', text)
        text = re.sub(r'<[^>]+>', '', text)
        text = h.unescape(text)
        text = re.sub(r'\n{3,}', '\n\n', text.strip())
        print(text)
        sys.exit(0)
print('(lyrics not found)')
" 2>/dev/null)
  [ -z "$lyrics" ] && lyrics="(lyrics not found)"
  echo "## ${name^}" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  echo "$lyrics" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  echo "---" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  sleep 0.5
done < "$SONGS"
echo "Done! $count songs scraped." >&2
