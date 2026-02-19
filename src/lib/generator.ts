import { prisma } from './prisma';
import { getAllTrendingTopics } from './trends';
import { generateArticle } from './ai';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens
    .trim();
}

function categorizeArticle(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.match(/politic|president|congress|election|government/i)) {
    return 'politics';
  } else if (topicLower.match(/business|economy|market|stock|finance/i)) {
    return 'business';
  } else if (topicLower.match(/tech|technology|ai|software|startup/i)) {
    return 'technology';
  } else if (topicLower.match(/sport|football|baseball|basketball|soccer/i)) {
    return 'sports';
  } else if (topicLower.match(/health|medical|covid|vaccine|doctor/i)) {
    return 'health';
  } else if (topicLower.match(/entertainment|movie|music|celebrity|actor/i)) {
    return 'entertainment';
  } else if (topicLower.match(/science|research|study|discovery/i)) {
    return 'science';
  } else {
    return 'general';
  }
}

export async function generateNewsArticle(): Promise<{
  success: boolean;
  article?: any;
  error?: string;
}> {
  try {
    console.log('Starting article generation...');

    // Step 1: Fetch trending topics
    const trendingTopics = await getAllTrendingTopics();
    
    if (trendingTopics.length === 0) {
      return { success: false, error: 'No trending topics found' };
    }

    console.log(`Found ${trendingTopics.length} trending topics`);

    // Step 2: Save trending topics to database
    for (const topic of trendingTopics) {
      await prisma.trendingTopic.upsert({
        where: {
          id: `${topic.topic}-${topic.country}`,
        },
        create: {
          id: `${topic.topic}-${topic.country}`,
          topic: topic.topic,
          country: topic.country,
          searchVolume: topic.searchVolume,
        },
        update: {
          searchVolume: topic.searchVolume,
        },
      });
    }

    // Step 3: Find uncovered topics
    const uncoveredTopics = await prisma.trendingTopic.findMany({
      where: {
        coveredAt: null,
      },
      orderBy: {
        searchVolume: 'desc',
      },
      take: 10,
    });

    if (uncoveredTopics.length === 0) {
      // Reset all topics if none available
      await prisma.trendingTopic.updateMany({
        data: { coveredAt: null },
      });
      
      return { success: false, error: 'All topics covered, reset initiated' };
    }

    // Step 4: Pick the top uncovered topic
    const selectedTopic = uncoveredTopics[0];
    console.log(`Selected topic: ${selectedTopic.topic} (${selectedTopic.country})`);

    // Step 5: Determine language based on country
    const language = selectedTopic.country === 'DO' ? 'es' : 'en';

    // Step 6: Generate article using AI
    const articleData = await generateArticle(selectedTopic.topic, language);

    // Step 7: Generate slug
    const slug = generateSlug(articleData.title);

    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      // Mark topic as covered and try again
      await prisma.trendingTopic.update({
        where: { id: selectedTopic.id },
        data: { coveredAt: new Date() },
      });
      
      return { success: false, error: 'Duplicate article slug, marked as covered' };
    }

    // Step 8: Determine category
    const category = categorizeArticle(selectedTopic.topic);

    // Step 9: Generate placeholder image URL
    const imageUrl = `https://via.placeholder.com/1200x630/0ea5e9/ffffff?text=${encodeURIComponent(articleData.title.substring(0, 50))}`;

    // Step 10: Save article to database
    const article = await prisma.article.create({
      data: {
        title: articleData.title,
        slug,
        content: articleData.content,
        summary: articleData.summary,
        imageUrl,
        category,
        country: selectedTopic.country,
        language,
        sourceQuery: selectedTopic.topic,
        metaTitle: articleData.metaTitle,
        metaDescription: articleData.metaDescription,
        keywords: articleData.keywords,
        publishedAt: new Date(),
      },
    });

    // Step 11: Mark topic as covered
    await prisma.trendingTopic.update({
      where: { id: selectedTopic.id },
      data: { coveredAt: new Date() },
    });

    console.log(`Article created successfully: ${article.slug}`);

    return {
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        country: article.country,
        language: article.language,
      },
    };
  } catch (error) {
    console.error('Error generating article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
