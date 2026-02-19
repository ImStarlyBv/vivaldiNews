# Vivaldi News

**Trending Now, Written Fresh**

A modern, SEO-optimized news website that automatically generates and publishes trending articles every hour using AI. Built with Next.js 14, PostgreSQL, and Docker.

## Features

- 🚀 **Auto-publishing**: Generates fresh articles hourly based on trending topics
- 🌍 **Multi-region**: Supports US (English) and Dominican Republic (Spanish)
- 🎯 **SEO-optimized**: Server-side rendering, meta tags, structured data
- 📱 **Responsive**: Mobile-first design with Tailwind CSS
- 🐳 **Docker-ready**: Complete containerized setup
- 📊 **Category-based**: Politics, Business, Technology, Sports, Health, Entertainment, Science

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Containerization**: Docker & Docker Compose
- **AI**: OpenAI-compatible API for article generation
- **Trending**: Brave Search API for topic discovery

## Project Structure

```
vivaldiNews/
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                  # Multi-stage build
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── news/[slug]/       # English articles
│   │   ├── noticias/[slug]/   # Spanish articles
│   │   ├── category/[slug]/   # Category pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   └── lib/                   # Utilities and logic
│       ├── prisma.ts          # Database client
│       ├── generator.ts       # Article generation
│       ├── trends.ts          # Trending topics
│       └── ai.ts              # AI integration
└── public/                    # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- API keys for:
  - OpenAI or compatible AI service
  - Brave Search API

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:ImStarlyBv/vivaldiNews.git
   cd vivaldiNews
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   DATABASE_URL=postgresql://vivaldi:vivaldi@localhost:5432/vivaldinews
   AI_API_URL=https://api.openai.com/v1/chat/completions
   AI_API_KEY=sk-your-openai-api-key
   BRAVE_API_KEY=your-brave-api-key
   CRON_SECRET=your-secret-key-for-cron
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Run in development**
   ```bash
   npm run dev
   ```

   Visit http://localhost:3000

### Production Deployment (Docker)

1. **Build and start containers**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

3. **Access the site**
   Visit http://localhost:3000

## Article Generation

### Manual Generation

Trigger article generation via API:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "x-cron-secret: your-secret-key"
```

### Automated Generation (Cron)

Set up a cron job to generate articles hourly:

```cron
0 * * * * curl -X POST https://your-domain.com/api/generate -H "x-cron-secret: your-secret-key"
```

Or use external services like:
- Vercel Cron
- GitHub Actions
- EasyCron
- cron-job.org

## API Endpoints

### Public Endpoints

- `GET /api/articles` - List articles (paginated)
  - Query params: `page`, `limit`, `country`, `category`, `language`
- `GET /api/articles/[slug]` - Get single article
- `GET /sitemap.xml` - Dynamic sitemap
- `GET /feed.xml` - RSS feed
- `GET /robots.txt` - Robots.txt

### Protected Endpoints

- `POST /api/generate` - Generate new article
  - Header: `x-cron-secret: your-secret-key`

## Database Schema

### Articles
- Unique slug-based URLs
- Multi-language support
- SEO metadata (title, description, keywords)
- Category classification
- Country targeting

### Categories
- Pre-defined categories with slugs
- Extensible for new categories

### TrendingTopics
- Tracks covered topics
- Search volume metrics
- Country-specific trends

## SEO Features

✅ Server-side rendering (SSR)
✅ Open Graph meta tags
✅ Twitter Cards
✅ Schema.org NewsArticle structured data
✅ Clean, semantic URLs
✅ Auto-generated sitemap.xml
✅ RSS feed
✅ Optimized robots.txt
✅ Fast loading times

## Development

### Run tests
```bash
npm test
```

### Prisma Studio (Database GUI)
```bash
npx prisma studio
```

### View logs
```bash
docker-compose logs -f app
```

## Customization

### Adding New Categories

1. Update the categories in `src/components/Header.tsx`
2. Add to `generateStaticParams` in category page
3. Update categorization logic in `src/lib/generator.ts`

### Adding New Regions

1. Add country code to `getAllTrendingTopics` in `src/lib/trends.ts`
2. Update language mapping in `generator.ts`
3. Add country filter UI components

### Customizing AI Prompts

Edit the prompts in `src/lib/ai.ts` to adjust:
- Tone and style
- Article length
- Content structure
- SEO optimization

## Troubleshooting

### Database connection issues
```bash
docker-compose down
docker-compose up -d db
docker-compose exec db psql -U vivaldi -d vivaldinews
```

### Prisma client errors
```bash
npx prisma generate
npx prisma migrate reset
```

### Build failures
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## License

MIT

## Author

ImStarlyBv (luisxdlol01@gmail.com)

---

**Vivaldi News** - Trending Now, Written Fresh 🚀
