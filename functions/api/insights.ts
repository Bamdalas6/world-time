interface Env {
  AI?: {
    run: (model: string, input: any) => Promise<any>;
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json;charset=UTF-8',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let country = url.searchParams.get('country');
  if (request.method === 'POST') {
    try {
      const body = await request.json() as { country?: string };
      if (body?.country) country = body.country;
    } catch (_) {}
  }

  if (!country) {
    return new Response(JSON.stringify({ error: 'Missing country parameter' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    if (!env.AI) {
      return new Response(JSON.stringify(getStaticFallback(country, 'Workers AI binding not present')), {
        headers: corsHeaders,
      });
    }

    const systemPrompt = `You are a concise, factual world geopolitics and travel expert.
When given a country name, respond strictly with valid JSON without markdown formatting or backticks:
{
  "country": string,
  "leader": { "name": string, "title": string },
  "the_good": [string, string, string],
  "the_bad": [string, string, string]
}`;

    const userPrompt = `Provide current Head of State/President and the 3 Goods and 3 Bads for the country: "${country}".`;

    const aiRes = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    let raw = typeof aiRes === 'string' ? aiRes : (aiRes.response || JSON.stringify(aiRes));
    raw = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    const parsed = JSON.parse(raw);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify(getStaticFallback(country, err?.message || 'Error occurred')), {
      headers: corsHeaders,
    });
  }
};

function getStaticFallback(country: string, note?: string) {
  return {
    country,
    leader: { name: 'Head of State', title: 'President / Prime Minister' },
    the_good: [
      'Rich cultural traditions, heritage, and renowned culinary highlights.',
      'Diverse geographic landscapes and welcoming local communities.',
      'Active regional innovation and cultural contributions.'
    ],
    the_bad: [
      'Navigating regional bureaucracy and administrative processes can be complex.',
      'Economic sensitivities influenced by global inflation and commodity cycles.',
      'Seasonal climatic extremes requiring advance travel preparation.'
    ],
    fallback: true,
    note
  };
}
