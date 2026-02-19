interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function generateArticle(topic: string, language: string): Promise<{
  title: string;
  content: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}> {
  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('AI API credentials not configured');
  }

  const languageInstructions = language === 'es' 
    ? 'Escribe el artículo completamente en español dominicano. Usa un tono periodístico profesional.'
    : 'Write the article completely in English. Use a professional journalistic tone.';

  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are a professional news writer for Vivaldi News. ${languageInstructions} Write well-researched, engaging news articles with proper HTML formatting.`,
    },
    {
      role: 'user',
      content: `Write a comprehensive news article about: "${topic}"

Requirements:
- Title: Catchy and SEO-optimized (50-60 characters)
- Content: 800-1200 words, well-structured with <h2> subheadings, <p> paragraphs
- Summary: 150-200 characters for previews
- Meta Title: SEO-optimized (55-60 characters)
- Meta Description: Compelling SEO description (150-160 characters)
- Keywords: 5-8 relevant keywords

Format your response EXACTLY as JSON:
{
  "title": "Article title here",
  "content": "<h2>Introduction</h2><p>Article content...</p>",
  "summary": "Brief summary",
  "metaTitle": "SEO title",
  "metaDescription": "SEO description",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`,
    },
  ];

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data: AIResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI API');
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      title: parsed.title,
      content: parsed.content,
      summary: parsed.summary,
      metaTitle: parsed.metaTitle,
      metaDescription: parsed.metaDescription,
      keywords: parsed.keywords || [],
    };
  } catch (error) {
    console.error('Error generating article:', error);
    throw error;
  }
}

export async function generateImagePrompt(title: string): Promise<string> {
  // Simple image prompt generation based on title
  return `Professional news photo related to: ${title}`;
}
