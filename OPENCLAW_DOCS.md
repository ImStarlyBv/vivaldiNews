# Vivaldi News — OpenClaw Integration Documentation

> **For OpenClaw MCP Server** — Everything you need to push articles correctly to Vivaldi News.

---

## Overview

Vivaldi News is a file-based news platform. **There is no CMS, no database, no API to call.**
To publish an article, you simply commit a `.md` file to the GitHub repository at the correct path.
Coolify detects the push and automatically rebuilds the site.

**Your job as OpenClaw:**
1. Scrape the news source
2. Generate the `.md` file with correct frontmatter
3. Commit and push to the `main` branch of the GitHub repo
4. Done — article is live after rebuild (~60 seconds)

---

## File Path Convention

Every article goes in:
```
content/articles/{conflict-slug}/{lang}/{date}-{article-slug}-side-{a|b}.md
```

### For conflict articles (two perspectives):
```
content/articles/ukraine-russia/en/2024-02-24-kyiv-offensive-side-a.md
content/articles/ukraine-russia/en/2024-02-24-kyiv-offensive-side-b.md
content/articles/ukraine-russia/es/2024-02-24-ofensiva-kyiv-side-a.md
content/articles/ukraine-russia/es/2024-02-24-ofensiva-kyiv-side-b.md
```

### For standard (non-conflict) articles:
```
content/articles/standard/en/2024-02-24-tech-report.md
content/articles/standard/es/2024-02-24-informe-tecnologico.md
```

### Date format: `YYYY-MM-DD`
### Article slug: lowercase, hyphens only, no special chars, max 60 chars

---

## Frontmatter Schema — Conflict Article

```yaml
---
title: "Ukraine Launches New Offensive Near Kharkiv"
slug: "kyiv-offensive-feb-2024"
conflict: "ukraine-russia"
side: "A"
lang: "en"
date: "2024-02-24"
category: "world"
excerpt: "Ukrainian forces advanced on eastern positions near Kharkiv, according to military officials in Kyiv."
author: "Vivaldi News Desk"
source_url: "https://reuters.com/article/..."
source_name: "Reuters"
image: null
image_alt: null
tags: ["ukraine", "russia", "war", "kharkiv", "military"]
featured: false
---
```

**CRITICAL RULES for conflict articles:**
- `slug` MUST be **identical** in both side-a and side-b files (they are paired by slug)
- `side` MUST be exactly `"A"` or `"B"` (capital letter, string)
- `conflict` MUST match an existing conflict slug (see: Supported Conflicts below)
- Both side-a AND side-b must be pushed together in the same commit (or at least exist before the site builds)

---

## Frontmatter Schema — Standard Article

```yaml
---
title: "Global Tech Giants Report Record AI Investment"
slug: "tech-ai-investment-q1-2024"
conflict: null
side: null
lang: "en"
date: "2024-02-25"
category: "technology"
excerpt: "Major tech companies announced over $300 billion in AI infrastructure spending for 2024."
author: "Vivaldi News Desk"
source_url: "https://bloomberg.com/article/..."
source_name: "Bloomberg"
image: null
image_alt: null
tags: ["technology", "ai", "investment", "apple", "google"]
featured: false
---
```

---

## Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Article headline. Max 120 chars. |
| `slug` | string | ✅ | URL-safe identifier. Lowercase, hyphens only. Conflict pairs share same slug. |
| `conflict` | string \| null | ✅ | Conflict slug (e.g. `"ukraine-russia"`) or `null` for standard articles. |
| `side` | `"A"` \| `"B"` \| null | ✅ | Perspective side for conflict articles. `null` for standard articles. |
| `lang` | `"en"` \| `"es"` | ✅ | Language of the article. Only `en` and `es` are supported. |
| `date` | string | ✅ | Publication date in `YYYY-MM-DD` format. |
| `category` | string | ✅ | Category slug (see: Supported Categories below). |
| `excerpt` | string | ✅ | 1-2 sentence summary. Used for meta description and card preview. Max 200 chars. |
| `author` | string | ✅ | Author name. Use `"Vivaldi News Desk"` as default. |
| `source_url` | string | ✅ | Full URL of the original scraped source. |
| `source_name` | string | ✅ | Name of the source publication (e.g. `"Reuters"`, `"Al Jazeera"`). |
| `image` | string \| null | — | Full URL to article image. Use `null` if no image. |
| `image_alt` | string \| null | — | Alt text for the image. Required if `image` is set. |
| `tags` | string[] | — | Array of lowercase tags. Max 8. No spaces (use hyphens). |
| `featured` | boolean | — | Set `true` to feature on homepage. Use sparingly. Default: `false`. |

---

## Supported Languages

| Code | Language |
|------|----------|
| `en` | English |
| `es` | Spanish |

---

## Supported Categories

| Slug | English Label | Spanish Label |
|------|--------------|---------------|
| `world` | World | Mundo |
| `politics` | Politics | Política |
| `technology` | Technology | Tecnología |
| `business` | Business | Negocios |
| `sports` | Sports | Deportes |
| `entertainment` | Entertainment | Entretenimiento |

**To add a new category:** commit a new file to `content/categories/{slug}.json` (see format below).

---

## Supported Conflicts

### ukraine-russia
- **Side A:** Ukraine 🇺🇦
- **Side B:** Russia 🇷🇺
- **Conflict slug:** `ukraine-russia`
- **Typical sources A:** Reuters, AP, Kyiv Independent, BBC, Ukrinform
- **Typical sources B:** TASS, RT, RIA Novosti, Sputnik

### israel-palestine
- **Side A:** Israel 🇮🇱
- **Side B:** Palestine 🇵🇸
- **Conflict slug:** `israel-palestine`
- **Typical sources A:** Jerusalem Post, Times of Israel, Haaretz
- **Typical sources B:** Al Jazeera, Middle East Eye, WAFA

**To add a new conflict:** commit a `conflict.json` to `content/articles/{new-slug}/conflict.json` (see format below).

---

## conflict.json Format (to add a new conflict)

```json
{
  "slug": "usa-china",
  "title": "USA - China Trade War",
  "sideA": {
    "name": "USA",
    "label": "American Perspective",
    "flag": "🇺🇸",
    "color": "#002868",
    "accentColor": "#BF0A30"
  },
  "sideB": {
    "name": "China",
    "label": "Chinese Perspective",
    "flag": "🇨🇳",
    "color": "#DE2910",
    "accentColor": "#FFDE00"
  },
  "description": "Ongoing trade and geopolitical tensions between the USA and China",
  "active": true
}
```

Save to: `content/articles/usa-china/conflict.json`

---

## category.json Format (to add a new category)

```json
{
  "slug": "health",
  "label": { "en": "Health", "es": "Salud" },
  "description": {
    "en": "Health, medicine and wellness news",
    "es": "Noticias de salud, medicina y bienestar"
  },
  "seoTitle": {
    "en": "Health News | Vivaldi News",
    "es": "Noticias de Salud | Vivaldi News"
  },
  "metaDescription": {
    "en": "Latest health and medicine news",
    "es": "Últimas noticias de salud y medicina"
  }
}
```

Save to: `content/categories/health.json`

---

## Article Body Format

Write the body in **plain Markdown**. Do not include HTML, ads, navigation, or footers from the source.

**Supported elements:**
- `## Heading 2` — section headers
- `### Heading 3` — sub-section headers
- `**bold**` — emphasis
- `*italic*`
- `> blockquote` — for notable quotes
- `- list item` — unordered lists
- `[link text](url)` — hyperlinks
- `---` — horizontal rule

**Do NOT include:**
- The article title (it's rendered from frontmatter)
- The excerpt/lead paragraph (it's rendered separately from frontmatter)
- Author byline (rendered from frontmatter)
- Source attribution footer (rendered from frontmatter)

**For conflict articles**, end the body with:
```
Toggle the switch above to read the [Other Side Name] perspective.
```

**Recommended body length:** 300–800 words.

---

## Complete Example Push

### Scenario: New ukraine-russia article in English (both sides)

**File 1:** `content/articles/ukraine-russia/en/2025-02-25-kyiv-drone-attack-side-a.md`

```markdown
---
title: "Ukraine Intercepts Massive Russian Drone Barrage Over Kyiv"
slug: "kyiv-drone-attack-feb-2025"
conflict: "ukraine-russia"
side: "A"
lang: "en"
date: "2025-02-25"
category: "world"
excerpt: "Ukrainian air defenses intercepted the majority of a large-scale Russian drone attack on Kyiv, Ukrainian officials confirmed Tuesday."
author: "Vivaldi News Desk"
source_url: "https://kyivindependent.com/..."
source_name: "Kyiv Independent"
image: null
image_alt: null
tags: ["ukraine", "russia", "kyiv", "drone", "air-defense"]
featured: false
---

Ukraine's air force reported intercepting over 80% of Russian drones launched in a large-scale overnight barrage targeting Kyiv and surrounding regions.

## Air Defense Response

The Ukrainian Air Force said its units, together with civilian air defense systems, engaged drones across multiple oblasts simultaneously throughout the night.

"All critical infrastructure remained operational," said a spokesperson for the Ukrainian Energy Ministry.

## Impact on Civilians

Local authorities reported minimal structural damage in Kyiv, though several districts experienced power outages lasting a few hours before restoration.

Toggle the switch above to read the Russian perspective.
```

**File 2:** `content/articles/ukraine-russia/en/2025-02-25-kyiv-drone-attack-side-b.md`

```markdown
---
title: "Russian Armed Forces Launch Precision Strike on Military Infrastructure in Ukraine"
slug: "kyiv-drone-attack-feb-2025"
conflict: "ukraine-russia"
side: "B"
lang: "en"
date: "2025-02-25"
category: "world"
excerpt: "Russia's Ministry of Defence confirmed an overnight strike operation targeting military infrastructure and energy facilities supporting Ukrainian armed forces."
author: "Vivaldi News Desk"
source_url: "https://tass.com/..."
source_name: "TASS"
image: null
image_alt: null
tags: ["ukraine", "russia", "kyiv", "drone", "military"]
featured: false
---

Russia's Ministry of Defence stated that overnight strike operations targeted military infrastructure and fuel storage facilities being used to support Ukrainian armed forces.

## Official Statement

The ministry said the strikes were conducted with high-precision weapons and achieved their designated targets, describing the operation as part of the ongoing special military operation.

## Western Reaction

Western governments condemned the strikes, with NATO allies calling for continued support for Ukrainian air defense capabilities.

Toggle the switch above to read the Ukrainian perspective.
```

**Git commands to push:**
```bash
git add content/articles/ukraine-russia/en/2025-02-25-kyiv-drone-attack-side-a.md
git add content/articles/ukraine-russia/en/2025-02-25-kyiv-drone-attack-side-b.md
git commit -m "news: ukraine-russia kyiv drone attack 2025-02-25 [en]"
git push origin main
```

**Result URL:** `https://vivaldinews.com/en/conflict/ukraine-russia/kyiv-drone-attack-feb-2025`

---

## Validation

A GitHub Actions workflow runs on every push to `content/` and validates:
- All required frontmatter fields are present
- `lang` is `en` or `es`
- `side` is `A` or `B` for conflict articles
- Frontmatter is valid YAML

If validation fails, the workflow blocks the push from triggering a deploy.

---

## SEO Notes

The platform automatically generates for every article:
- `<title>` from `title` field
- `<meta description>` from `excerpt` field
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card tags
- JSON-LD NewsArticle structured data
- hreflang tags for EN/ES cross-references
- Canonical URL
- XML sitemap entry
- RSS feed entry

**To maximize SEO performance:**
- Write titles as complete, descriptive sentences (not fragments)
- Write excerpts as complete sentences, 1-2 max
- Include 3-6 highly relevant tags
- Use dates accurately
- Always include `source_url` and `source_name`

---

## Questions?

Contact the Vivaldi News dev team. Repository: see Coolify project settings.
