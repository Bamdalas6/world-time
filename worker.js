/**
 * Cloudflare Worker for Modern World Time
 * Utilizes Cloudflare Workers AI with @cf/meta/llama-3-8b-instruct
 * Provides endpoints for dynamic Country Insights and Weather Proxy.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json;charset=UTF-8',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
        headers: CORS_HEADERS,
      });
    }

    // 1. Weather Proxy Endpoint (Avoid CORS & rate limit encapsulation)
    if (url.pathname === '/api/weather') {
      const lat = url.searchParams.get('lat') || '0';
      const lon = url.searchParams.get('lon') || '0';
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;

      try {
        const weatherRes = await fetch(openMeteoUrl, {
          headers: { 'User-Agent': 'ModernWorldTime/1.0 (Cloudflare Edge)' },
        });

        if (!weatherRes.ok) {
          throw new Error(`OpenMeteo returned status ${weatherRes.status}`);
        }

        const data = await weatherRes.json();
        return new Response(JSON.stringify(data), {
          headers: {
            ...CORS_HEADERS,
            'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200',
          },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch weather data', message: err.message }),
          { status: 502, headers: CORS_HEADERS }
        );
      }
    }

    // 2. Country Insights Endpoint (Cloudflare Workers AI: @cf/meta/llama-3-8b-instruct)
    if (url.pathname === '/api/insights') {
      let country = url.searchParams.get('country');

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          if (body.country) country = body.country;
        } catch (_) {}
      }

      if (!country) {
        return new Response(
          JSON.stringify({ error: 'Missing country parameter' }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      try {
        // Verify Cloudflare Workers AI binding
        if (!env.AI) {
          return new Response(
            JSON.stringify(getFallbackInsights(country, 'Workers AI binding not detected in this environment')),
            { headers: CORS_HEADERS }
          );
        }

        const systemPrompt = `You are a concise, factual world geopolitics and travel expert.
When given a country name, you MUST respond ONLY with a strictly valid JSON object without markdown formatting, code blocks, or preamble.
The JSON format must be exactly:
{
  "country": string,
  "leader": {
    "name": string,
    "title": string
  },
  "the_good": [
    string (1 concise sentence highlighting a major strength, culture, or perk),
    string (1 concise sentence highlighting another positive aspect),
    string (1 concise sentence highlighting a 3rd positive aspect)
  ],
  "the_bad": [
    string (1 concise sentence highlighting a realistic socio-economic, environmental, or travel challenge),
    string (1 concise sentence highlighting a 2nd realistic challenge),
    string (1 concise sentence highlighting a 3rd realistic challenge)
  ]
}`;

        const userPrompt = `Provide the current Head of State/President and the 3 Goods and 3 Bads for the country: "${country}".`;

        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 500,
        });

        let rawText = typeof aiResponse === 'string' ? aiResponse : (aiResponse.response || JSON.stringify(aiResponse));
        
        // Strip markdown backticks if returned
        rawText = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch (parseError) {
          // Attempt regex extraction of json block
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Failed to parse AI model output into JSON');
          }
        }

        return new Response(JSON.stringify(parsed), {
          headers: {
            ...CORS_HEADERS,
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          },
        });
      } catch (aiErr) {
        console.error('Cloudflare Workers AI execution error:', aiErr);
        // Return structured fallback for resilient UX
        return new Response(
          JSON.stringify(getFallbackInsights(country, aiErr.message)),
          { headers: CORS_HEADERS }
        );
      }
    }

    // Pass through or 404 for API routes
    return new Response(
      JSON.stringify({ error: 'Endpoint not found', available: ['/api/insights', '/api/weather', '/api/health'] }),
      { status: 404, headers: CORS_HEADERS }
    );
  },
};

/**
 * Robust fallback data for graceful degradation
 */
function getFallbackInsights(countryName, reason = '') {
  const norm = countryName.toLowerCase();
  
  const known = {
    'japan': {
      leader: { name: 'Shigeru Ishiba', title: 'Prime Minister' },
      the_good: [
        'World-class public transit, exceptional public safety, and rich culinary culture.',
        'Remarkable harmony between centuries-old traditions and cutting-edge technology.',
        'Universal healthcare system and one of the highest life expectancies globally.'
      ],
      the_bad: [
        'Severe demographic aging and declining workforce population.',
        'Rigid corporate work culture and persistent overtime expectations.',
        'Frequent vulnerability to natural disasters such as earthquakes and typhoons.'
      ]
    },
    'united states': {
      leader: { name: 'Joe Biden', title: 'President' },
      the_good: [
        'Vast economic innovation hub home to world-leading tech and research institutions.',
        'Incredible geographic diversity spanning breathtaking national parks and dynamic cities.',
        'Vibrant cultural influence across global music, cinema, arts, and entrepreneurship.'
      ],
      the_bad: [
        'Extremely expensive healthcare costs and complex private insurance systems.',
        'Significant wealth inequality and high cost of living in major metropolitan hubs.',
        'Deep political polarization and persistent public transit deficiencies.'
      ]
    },
    'united kingdom': {
      leader: { name: 'Keir Starmer', title: 'Prime Minister' },
      the_good: [
        'Rich historical heritage, iconic cultural landmarks, and world-renowned museums.',
        'Global financial and creative powerhouse with renowned higher education.',
        'Scenic countryside, walkable historic cities, and free NHS emergency medical care.'
      ],
      the_bad: [
        'Notoriously gray, rainy, and unpredictable weather throughout the year.',
        'Elevated cost of living and acute housing affordability crisis in London and the Southeast.',
        'Post-Brexit trade frictions and strained public infrastructure capacity.'
      ]
    },
    'france': {
      leader: { name: 'Emmanuel Macron', title: 'President' },
      the_good: [
        'Unrivaled gastronomic excellence, viticulture, and world-class culinary traditions.',
        'High quality of life supported by generous paid leave and strong labor protections.',
        'Incomparable architecture, art, and an extensive high-speed TGV rail network.'
      ],
      the_bad: [
        'Complex bureaucracy and heavy administrative paperwork for residents and businesses.',
        'Relatively high income and social taxation rates compared to OECD averages.',
        'Frequent transport strikes and civil demonstrations disrupting transit.'
      ]
    },
    'algeria': {
      leader: { name: 'Abdelmadjid Tebboune', title: 'President' },
      the_good: [
        'Stunning Sahara desert vistas, ancient Roman ruins (Timgad, Djemila), and Mediterranean coastlines.',
        'Warm, hospitable community with rich Berber and Arabic cultural heritage.',
        'Affordable cost of living and abundant natural energy resources.'
      ],
      the_bad: [
        'Heavy economic dependency on hydrocarbon and oil exports.',
        'Bureaucratic visa requirements and underdeveloped international tourism infrastructure.',
        'High youth unemployment and occasional bureaucratic hurdles.'
      ]
    },
    'australia': {
      leader: { name: 'Anthony Albanese', title: 'Prime Minister' },
      the_good: [
        'Idyllic coastal lifestyle, sunny climate, and pristine beaches.',
        'High minimum wage, robust healthcare, and strong civic safety record.',
        'Unique biodiversity and spectacular natural wonders like the Great Barrier Reef.'
      ],
      the_bad: [
        'Intense UV radiation and ozone depletion requiring strict sun protection.',
        'Geographic isolation resulting in long, costly international travel.',
        'Severe real estate affordability strain across Sydney and Melbourne.'
      ]
    }
  };

  const match = Object.keys(known).find(k => norm.includes(k));
  if (match) {
    return {
      country: countryName,
      leader: known[match].leader,
      the_good: known[match].the_good,
      the_bad: known[match].the_bad,
      fallback: true,
      note: reason
    };
  }

  return {
    country: countryName,
    leader: { name: 'Head of State', title: 'President / Prime Minister' },
    the_good: [
      `Distinctive cultural traditions, architecture, and renowned regional gastronomy.`,
      `Diverse natural landscapes, historic sites, and welcoming local communities.`,
      `Strategic regional significance with unique artisan craftsmanship and trade.`
    ],
    the_bad: [
      `Navigating local administrative and bureaucratic processes can be complex.`,
      `Economic sensitivity to global inflation and energy fluctuations.`,
      `Seasonal weather variations requiring mindful travel planning.`
    ],
    fallback: true,
    note: reason
  };
}
