export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json;charset=UTF-8',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const lat = url.searchParams.get('lat') || '0';
  const lon = url.searchParams.get('lon') || '0';
  const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;

  try {
    const res = await fetch(openMeteoUrl, {
      headers: { 'User-Agent': 'ModernWorldTime/1.0 (Cloudflare Pages Edge)' },
    });

    if (!res.ok) {
      throw new Error(`OpenMeteo returned status ${res.status}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Failed to fetch weather', message: err.message }), {
      status: 502,
      headers: corsHeaders,
    });
  }
};
