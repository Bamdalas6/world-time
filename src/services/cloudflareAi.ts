import { CountryInsights } from '../types';

const insightsCache = new Map<string, CountryInsights>();

export async function fetchCountryInsights(country: string): Promise<CountryInsights> {
  const normalizedKey = country.trim().toLowerCase();
  if (insightsCache.has(normalizedKey)) {
    return insightsCache.get(normalizedKey)!;
  }

  try {
    // 1. Try Cloudflare Worker endpoint
    const response = await fetch(`/api/insights?country=${encodeURIComponent(country)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data: CountryInsights = await response.json();
      if (data && data.the_good && data.the_bad) {
        insightsCache.set(normalizedKey, data);
        return data;
      }
    }
  } catch (err) {
    console.info('Worker endpoint unavailable, using intelligent edge client fallback:', err);
  }

  // 2. Client-side fallback knowledge base
  const fallback = generateClientInsights(country);
  insightsCache.set(normalizedKey, fallback);
  return fallback;
}

function generateClientInsights(country: string): CountryInsights {
  const c = country.toLowerCase();

  const curated: Record<string, { leader: { name: string; title: string }; the_good: string[]; the_bad: string[] }> = {
    japan: {
      leader: { name: 'Shigeru Ishiba', title: 'Prime Minister' },
      the_good: [
        'Impeccable public cleanliness, safety, and exceptionally reliable Shinkansen bullet trains.',
        'World-celebrated culinary culture, ranging from street ramen to Michelin-starred dining.',
        'Rich juxtaposition of ancient shrines with futuristic neon metropolis vibes.'
      ],
      the_bad: [
        'High linguistic barrier for non-Japanese speakers outside metropolitan tourist areas.',
        'Demographic challenges with a rapidly aging society and declining birthrate.',
        'Persistent seismic activity and vulnerability to earthquakes and typhoons.'
      ]
    },
    'united states': {
      leader: { name: 'Joe Biden', title: 'President' },
      the_good: [
        'Global powerhouse of technological innovation, entrepreneurship, and research.',
        'Breathtaking natural diversity encompassing 63 world-class national parks.',
        'Enormous cultural vitality in cinema, music, contemporary arts, and gastronomy.'
      ],
      the_bad: [
        'Excessively high private healthcare expenses without universal safety net.',
        'Severe car dependency and underdeveloped intercity passenger rail outside the Northeast.',
        'Significant regional disparity in cost of living and housing affordability.'
      ]
    },
    'united kingdom': {
      leader: { name: 'Keir Starmer', title: 'Prime Minister' },
      the_good: [
        'Extraordinary historical legacy, literary heritage, and free admission to world-class national museums.',
        'Vibrant music, theatre, and creative industries centered around London and Edinburgh.',
        'Highly walkable towns, picturesque countryside, and extensive rail connections.'
      ],
      the_bad: [
        'Notoriously unpredictable, frequently gray and overcast weather across seasons.',
        'Steep cost of living, particularly housing costs across London and southern England.',
        'Post-Brexit trade bottlenecks and strains on the National Health Service.'
      ]
    },
    australia: {
      leader: { name: 'Anthony Albanese', title: 'Prime Minister' },
      the_good: [
        'Outstanding outdoor lifestyle with pristine surf beaches and over 300 days of sunshine.',
        'High minimum wages, strong social safety net, and world-class coffee culture.',
        'Incredible endemic wildlife and natural wonders like the Great Barrier Reef and Uluru.'
      ],
      the_bad: [
        'Intense UV radiation necessitating vigilant sun protection year-round.',
        'Extreme geographical distances leading to prolonged, costly domestic and overseas flights.',
        'High housing market unaffordability in major capitals like Sydney and Melbourne.'
      ]
    },
    algeria: {
      leader: { name: 'Abdelmadjid Tebboune', title: 'President' },
      the_good: [
        'Unspoiled, magnificent Sahara landscapes (Tassili n\'Ajjer) and historic Roman ruins.',
        'Warm, deeply hospitable culture with generous culinary and tea traditions.',
        'Affordable everyday living costs, subsidized utilities, and rich Mediterranean history.'
      ],
      the_bad: [
        'Rigid visa acquisition process and underdeveloped international tourism infrastructure.',
        'Economic vulnerability due to heavy reliance on oil and gas exports.',
        'Bureaucratic administrative procedures that can slow business operations.'
      ]
    },
    france: {
      leader: { name: 'Emmanuel Macron', title: 'President' },
      the_good: [
        'Unmatched culinary mastery, artisanal bakery traditions, and historic wine regions.',
        'Generous annual leave and social safety net that prioritizes work-life equilibrium.',
        'Dense network of high-speed TGV trains connecting stunning historic regions.'
      ],
      the_bad: [
        'Complex administrative bureaucracy with paperwork-heavy government procedures.',
        'High income and social tax rates compared to international averages.',
        'Periodic transportation and public sector strikes causing travel interruptions.'
      ]
    },
    'united arab emirates': {
      leader: { name: 'Mohamed bin Zayed Al Nahyan', title: 'President' },
      the_good: [
        'Ultra-modern architecture, tax-free personal income, and premier global air hub.',
        'Exceptional personal safety, zero-tolerance crime policy, and luxurious hospitality.',
        'Dynamic international business environment uniting talent from across the globe.'
      ],
      the_bad: [
        'Oppressive, scorching summer heat with temperatures exceeding 45°C (113°F).',
        'Relatively high cost of luxury living, dining, and private school education.',
        'Strict legal frameworks and censorship regulations regarding public behavior.'
      ]
    },
    germany: {
      leader: { name: 'Frank-Walter Steinmeier', title: 'President' },
      the_good: [
        'Superb industrial engineering, strong worker protections, and tuition-free higher education.',
        'Extensive public transport, cycling infrastructure, and generous green urban spaces.',
        'Rich classical music heritage, historic castles, and vibrant techno/art scene in Berlin.'
      ],
      the_bad: [
        'Sluggish digital modernization in public offices, often relying on paper mail and fax.',
        'High income tax rates and energy costs across household sectors.',
        'Strict Sunday store closures and reserved social interaction for newcomers.'
      ]
    },
  };

  const matchKey = Object.keys(curated).find((key) => c.includes(key));
  if (matchKey) {
    const item = curated[matchKey];
    return {
      country,
      leader: item.leader,
      the_good: item.the_good,
      the_bad: item.the_bad,
      fallback: true,
      note: 'Simulated via Edge Knowledge Base',
    };
  }

  return {
    country,
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
    note: 'Simulated via Edge Knowledge Base',
  };
}
