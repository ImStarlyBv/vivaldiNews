#!/bin/bash
# Scrape El Alfa lyrics from letras.com
OUTPUT="/data/workspace/el-alfa-lyrics.md"
SONGS="/data/workspace/el-alfa-songs.txt"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

echo "# El Alfa - Letras / Lyrics" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "Scraped from letras.com" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

count=0
total=$(wc -l < "$SONGS")

while IFS= read -r path; do
  count=$((count + 1))
  url="https://www.letras.com${path}"
  
  # Extract song name from path
  name=$(echo "$path" | sed 's|/el-alfa/||;s|/$||;s|-/ *$||;s/-/ /g' | sed 's/\bpart\b/ft./g')
  
  echo "[$count/$total] Fetching: $name" >&2
  
  html=$(curl -s -L -H "User-Agent: $UA" "$url")
  
  # Extract lyrics - letras.com puts lyrics in <div class="lyric-original"> or similar
  lyrics=$(echo "$html" | python3 -c "
import sys, re, html as h
content = sys.stdin.read()
# Find lyrics in the page - letras.com uses specific div patterns
m = re.findall(r'<div class=\"lyric-original\">(.*?)</div>', content, re.DOTALL)
if not m:
    m = re.findall(r'<div[^>]*class=\"[^\"]*lyric[^\"]*\"[^>]*>(.*?)</div>', content, re.DOTALL)
if not m:
    # Try finding <p> blocks inside lyrics sections
    m = re.findall(r'<div[^>]*cnt-letra[^>]*>(.*?)</div>', content, re.DOTALL)
if m:
    text = m[0]
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'<p[^>]*>', '\n', text)
    text = re.sub(r'</p>', '\n', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = h.unescape(text)
    # Clean up excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text.strip())
    print(text)
else:
    print('(lyrics not found)')
" 2>/dev/null)
  
  if [ -z "$lyrics" ]; then
    lyrics="(lyrics not found)"
  fi
  
  echo "## ${name^}" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  echo "$lyrics" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  echo "---" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  
  # Be nice - small delay
  sleep 0.5
done < "$SONGS"

echo "Done! $count songs scraped." >&2
