/**
 * Validates all article frontmatter fields.
 * Run via GitHub Actions on content push.
 */
const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = ['title', 'slug', 'lang', 'date', 'category', 'excerpt', 'author', 'source_name'];
const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

let errors = 0;

function getMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) results.push(...getMdFiles(full));
    else if (item.endsWith('.md') || item.endsWith('.mdx')) results.push(full);
  }
  return results;
}

for (const file of getMdFiles(ARTICLES_DIR)) {
  const raw = fs.readFileSync(file, 'utf-8');
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    console.error('❌ Missing frontmatter:', file);
    errors++;
    continue;
  }

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) frontmatter[key.trim()] = rest.join(':').trim();
  }

  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      console.error(`❌ Missing field "${field}" in ${file}`);
      errors++;
    }
  }

  // Validate lang
  if (!['en', 'es'].includes(frontmatter.lang?.replace(/['"]/g, ''))) {
    console.error(`❌ Invalid lang "${frontmatter.lang}" in ${file}`);
    errors++;
  }

  // Validate side if conflict present
  const conflict = frontmatter.conflict?.replace(/['"]/g, '');
  const side = frontmatter.side?.replace(/['"]/g, '');
  if (conflict && conflict !== 'null' && !['A', 'B'].includes(side)) {
    console.error(`❌ Conflict article must have side: A or B in ${file}`);
    errors++;
  }
}

if (errors === 0) {
  console.log('✅ All content files valid.');
} else {
  console.error(`\n❌ Found ${errors} validation error(s).`);
  process.exit(1);
}
