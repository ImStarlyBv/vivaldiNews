// Removed — content is now file-based via OpenClaw + GitHub push workflow.
export {};

      };
    }>;
  };
  news?: {
    results?: Array<{
      title: string;
      description: string;
    }>;
  };
}

interface TrendingTopic {
  topic: string;
  country: string;
  searchVolume: number;
}

export async function fetchTrendingTopics(country: string): Promise<TrendingTopic[]> {
  const apiKey = process.env.BRAVE_API_KEY;
  
  if (!apiKey) {
    console.error('BRAVE_API_KEY not configured');
    return [];
  }

  try {
    // Search for trending topics based on country
    const queries = country === 'DO' 
      ? ['noticias República Dominicana', 'tendencias RD', 'actualidad dominicana']
      : ['trending news USA', 'breaking news', 'latest headlines'];

    const allTopics: TrendingTopic[] = [];

    for (const query of queries) {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&country=${country}&freshness=pd&count=10`,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Token': apiKey,
          },
        }
      );

      if (!response.ok) {
        console.error(`Brave API error: ${response.status}`);
        continue;
      }

      const data: BraveSearchResult = await response.json();
      
      // Extract topics from news results
      const newsResults = data.news?.results || [];
      
      for (const result of newsResults.slice(0, 5)) {
        allTopics.push({
          topic: result.title,
          country,
          searchVolume: Math.floor(Math.random() * 10000) + 1000, // Simulated volume
        });
      }
    }

    return allTopics;
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }
}

export async function getAllTrendingTopics(): Promise<TrendingTopic[]> {
  const countries = ['US', 'DO'];
  const allTopics: TrendingTopic[] = [];

  for (const country of countries) {
    const topics = await fetchTrendingTopics(country);
    allTopics.push(...topics);
  }

  return allTopics;
}
