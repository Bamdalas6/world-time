import { CountryInsights } from '../types';

const insightsCache = new Map<string, CountryInsights>();

export async function fetchCountryInsights(country: string): Promise<CountryInsights> {
  const normalizedKey = country.trim().toLowerCase();
  if (insightsCache.has(normalizedKey)) {
    return insightsCache.get(normalizedKey)!;
  }

  try {
    const response = await fetch(`/api/insights?country=${encodeURIComponent(country)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.the_good && data.the_bad) {
        const enriched: CountryInsights = {
          country: data.country || country,
          leader: data.leader || { name: 'Head of State', title: 'President' },
          the_good: data.the_good || [],
          the_bad: data.the_bad || [],
          funFacts: data.funFacts || [],
          cuisine: data.cuisine || [],
          festivals: data.festivals || [],
          knownFor: data.knownFor || '',
          cultureDescription: data.cultureDescription || '',
          fallback: data.fallback,
          note: data.note,
        };
        insightsCache.set(normalizedKey, enriched);
        return enriched;
      }
    }
  } catch (err) {
    console.info('Worker endpoint unavailable, using cultural knowledge base:', err);
  }

  const fallback = generateCulturalInsights(country);
  insightsCache.set(normalizedKey, fallback);
  return fallback;
}

function generateCulturalInsights(country: string): CountryInsights {
  const c = country.toLowerCase();

  const db: Record<string, Omit<CountryInsights, 'country' | 'fallback' | 'note'>> = {
    japan: {
      leader: { name: 'Shigeru Ishiba', title: 'Prime Minister' },
      the_good: ['World-class public transit, exceptional cleanliness, and one of the lowest crime rates globally.', 'Remarkable fusion of centuries-old traditions (tea ceremonies, sumo) with cutting-edge technology.', 'Universal healthcare system, incredible seasonal cuisine, and unparalleled hospitality culture (omotenashi).'],
      the_bad: ['Severe demographic crisis with aging population and workforce shortage.', 'Rigid corporate work culture with persistent long-hours expectations (karoshi).', 'Frequent natural disasters including earthquakes, typhoons, and volcanic activity.'],
      funFacts: ['Japan has over 6,800 islands but 97% of the population lives on just four main islands.', 'There are more pets than children in Japan — over 15 million cats and dogs vs 12 million kids under 15.', 'Japan\'s Shinkansen bullet trains have an average delay of just 17 seconds per year.'],
      cuisine: ['Sushi & Sashimi — fresh raw fish on vinegared rice', 'Ramen — rich broth noodle soup with regional variations', 'Tempura — lightly battered, perfectly fried seafood and vegetables'],
      festivals: ['Cherry Blossom Festival (Hanami) — Spring celebration under sakura trees', 'Gion Matsuri — Kyoto\'s month-long festival with elaborate floats (July)', 'Obon Festival — Honoring ancestral spirits with lanterns and dance (August)'],
      knownFor: 'A unique harmony of ancient tradition and futuristic innovation, from zen temples to robot restaurants.',
      cultureDescription: 'Japanese culture is built on respect, precision, and aesthetic beauty. From the meditative art of ikebana flower arranging to the bustling energy of Tokyo\'s Shibuya crossing, Japan seamlessly blends the contemplative with the contemporary. Seasonal awareness (kisetsukan) permeates everything from cuisine to fashion.',
    },
    'united states': {
      leader: { name: 'Joe Biden', title: 'President' },
      the_good: ['Global leader in technology, innovation, and higher education with world-renowned universities.', 'Breathtaking geographic diversity — from Hawaiian volcanoes to Alaskan glaciers, 63 national parks.', 'Vibrant melting-pot culture driving global trends in music, film, fashion, and entrepreneurship.'],
      the_bad: ['Extremely expensive private healthcare system without universal coverage.', 'Significant wealth inequality and housing affordability crisis in major metros.', 'Deep political polarization and car-dependent infrastructure outside major cities.'],
      funFacts: ['The US has no official national language — English is the de facto language but not legally mandated.', 'Alaska is simultaneously the most northern, western, AND eastern state (the Aleutian Islands cross the 180° meridian).', 'The US interstate highway system requires that one mile in every five be straight, originally designed as emergency airstrips.'],
      cuisine: ['BBQ — slow-smoked meats with regional sauce styles (Texas, Carolina, KC)', 'Hamburger — the iconic American sandwich, perfected in diners nationwide', 'New York-style Pizza — thin crust, foldable slices, a cultural institution'],
      festivals: ['Thanksgiving — family feast with turkey, gratitude, and football (November)', 'Independence Day (4th of July) — fireworks, parades, and patriotic celebrations', 'Mardi Gras — New Orleans\' legendary carnival with parades, jazz, and revelry (February/March)'],
      knownFor: 'The land of opportunity — a nation of dreamers, innovators, and cultural disruptors that shaped the modern world.',
      cultureDescription: 'American culture is a kaleidoscope of immigrant traditions, regional identities, and entrepreneurial spirit. From Nashville\'s honky-tonks to Silicon Valley\'s garages, the US celebrates reinvention. Its cultural exports — Hollywood, hip-hop, jazz, tech startups — have reshaped global popular culture.',
    },
    'united kingdom': {
      leader: { name: 'Keir Starmer', title: 'Prime Minister' },
      the_good: ['Extraordinary historical heritage, free world-class museums, and iconic literary traditions.', 'Vibrant creative industries — London is a global capital for theatre, music, fashion, and finance.', 'Excellent public healthcare (NHS), extensive rail network, and walkable historic cities.'],
      the_bad: ['Notoriously gray, rainy, and unpredictable weather throughout much of the year.', 'Severe housing affordability crisis, particularly across London and the Southeast.', 'Post-Brexit trade complications and strain on public services.'],
      funFacts: ['The Queen\'s (now King\'s) Guard are not just ceremonial — they are fully operational soldiers who will challenge you.', 'London has more Indian restaurants than Mumbai and more languages spoken (300+) than any other city on Earth.', 'The British drink approximately 165 million cups of tea every single day.'],
      cuisine: ['Fish and Chips — battered cod with thick-cut chips, wrapped in paper', 'Full English Breakfast — eggs, bacon, sausages, beans, toast, tomato, and mushrooms', 'Sunday Roast — roasted meat with Yorkshire pudding, roast potatoes, and gravy'],
      festivals: ['Notting Hill Carnival — Europe\'s largest street festival celebrating Caribbean culture (August)', 'Edinburgh Fringe Festival — world\'s biggest arts festival with thousands of shows (August)', 'Bonfire Night — fireworks and bonfires commemorating Guy Fawkes (November 5th)'],
      knownFor: 'The birthplace of Shakespeare, the Industrial Revolution, and afternoon tea — a small island that shaped the world.',
      cultureDescription: 'British culture is a sophisticated blend of royal pageantry and punk rebellion, ancient castles and avant-garde art. The pub is the social heart of communities, cricket is a religion in summer, and dry wit is the national communication style. Despite its compact size, each region — from Scottish Highlands to Cornish coasts — has a fiercely distinct identity.',
    },
    france: {
      leader: { name: 'Emmanuel Macron', title: 'President' },
      the_good: ['Unrivaled culinary mastery — world capital of gastronomy, wine, and patisserie.', 'Generous work-life balance with 5 weeks paid vacation and 35-hour work week.', 'Extraordinary architecture, art (Louvre has 380,000+ pieces), and high-speed TGV rail network.'],
      the_bad: ['Complex bureaucratic administration — paperwork for everything.', 'High income and social taxation rates relative to other developed nations.', 'Frequent transport strikes and demonstrations disrupting daily life.'],
      funFacts: ['France is the most visited country on Earth with 90+ million international tourists annually.', 'The French Army is the only military in Europe that still has carrier pigeons in service.', 'France has 12 different time zones (counting overseas territories) — more than any other country.'],
      cuisine: ['Croissant — the buttery, flaky crescent that defines French breakfast', 'Coq au Vin — chicken braised in wine, mushrooms, and lardons', 'Crème Brûlée — caramelized custard dessert with a crackling sugar top'],
      festivals: ['Bastille Day (14 July) — national celebration with military parade and fireworks on the Champs-Élysées', 'Cannes Film Festival — glamorous international cinema showcase on the Riviera (May)', 'Fête de la Musique — free live music on every street corner across France (June 21)'],
      knownFor: 'The art of living well — where every meal is a ceremony and beauty is a civic duty.',
      cultureDescription: 'French culture elevates the everyday to an art form. A morning espresso at a zinc-topped café, an afternoon stroll through market stalls overflowing with fromage and flowers, an evening at the theatre — life in France is savored, never rushed. Fashion, philosophy, and the concept of joie de vivre are national exports.',
    },
    germany: {
      leader: { name: 'Frank-Walter Steinmeier', title: 'President' },
      the_good: ['Engineering excellence, strong worker protections, and tuition-free public universities.', 'Extensive public transit, cycling infrastructure, and well-maintained green urban spaces.', 'Rich cultural heritage — classical music, Bauhaus design, Christmas markets, and vibrant Berlin nightlife.'],
      the_bad: ['Sluggish digital modernization in government — fax machines still common.', 'High income taxes and expensive energy costs.', 'Strict Sunday store closures (Sonntagsruhe) and reserved social norms for newcomers.'],
      funFacts: ['Germany has over 1,500 different types of beer and 1,300 breweries.', 'There\'s no speed limit on approximately 70% of the Autobahn highway network.', 'Germany was the first country to adopt Daylight Saving Time in 1916.'],
      cuisine: ['Bratwurst — grilled sausage, a staple at every market and festival', 'Pretzel (Brezel) — soft, salted, twisted bread perfection', 'Schnitzel — breaded, pan-fried cutlet served with lemon and potato salad'],
      festivals: ['Oktoberfest — Munich\'s legendary 16-day beer festival (September-October)', 'Karneval — Rhineland\'s wild pre-Lent carnival with costumes and parades (February)', 'Christmas Markets (Weihnachtsmärkte) — enchanting winter markets with Glühwein and gingerbread'],
      knownFor: 'Precision engineering, world-class beer, Christmas markets, and the cultural renaissance of reunified Berlin.',
      cultureDescription: 'German culture values Ordnung (order), Gründlichkeit (thoroughness), and Gemütlichkeit (coziness). From the philosophical traditions of Kant and Goethe to the techno temples of Berghain, Germany bridges intellectual rigor with creative freedom. Regional identity is strong — a Bavarian and a Berliner inhabit vastly different cultural worlds.',
    },
    italy: {
      leader: { name: 'Sergio Mattarella', title: 'President' },
      the_good: ['Unparalleled artistic and architectural heritage — Rome, Florence, Venice are living museums.', 'Legendary Mediterranean cuisine, wine, and the ritual of multi-course family meals.', 'Beautiful coastlines, Alps, and a relaxed "dolce vita" pace of life in smaller towns.'],
      the_bad: ['Complex and slow bureaucratic processes for residents and businesses.', 'North-South economic divide with higher unemployment in the Mezzogiorno.', 'Aging infrastructure and frequent political instability with rotating governments.'],
      funFacts: ['Italy has the most UNESCO World Heritage Sites of any country — 59 in total.', 'Italians consume 26 kg of pasta per person per year — more than any other nation.', 'The University of Bologna, founded in 1088, is the oldest continuously operating university in the world.'],
      cuisine: ['Pizza Margherita — tomato, mozzarella, basil on thin Neapolitan crust', 'Pasta Carbonara — spaghetti with egg, pecorino, guanciale, and black pepper', 'Gelato — Italian ice cream that\'s denser, smoother, and more flavorful than regular ice cream'],
      festivals: ['Venice Carnival — masked ball extravaganza with elaborate costumes (February)', 'Palio di Siena — intense bareback horse race in Siena\'s main square (July/August)', 'Ferragosto — midsummer national holiday when all of Italy heads to the beach (August 15)'],
      knownFor: 'Where art, food, and passion converge — the cradle of the Renaissance and the birthplace of la dolce vita.',
      cultureDescription: 'Italian culture is a sensory feast. Every piazza tells a story, every meal is a communion, and every gesture is operatic. Family is sacred, regional pride is fierce (don\'t call a Sicilian dish "Italian" to a Milanese), and beauty in all forms — from Michelangelo to a perfectly pulled espresso — is a daily pursuit.',
    },
    spain: {
      leader: { name: 'Pedro Sánchez', title: 'Prime Minister' },
      the_good: ['Vibrant nightlife, world-class cuisine (tapas culture), and 300+ days of sunshine.', 'Excellent high-speed rail (AVE), affordable healthcare, and rich festival traditions.', 'Incredible architectural diversity from Gaudí\'s Barcelona to Moorish Andalusia.'],
      the_bad: ['Persistently high youth unemployment (around 25-30%).', 'Intense summer heat in southern regions (40°C+) and drought concerns.', 'Regional separatist tensions (Catalonia, Basque Country) creating political complexity.'],
      funFacts: ['Spain\'s La Tomatina festival sees participants throw over 150,000 tomatoes in one hour.', 'Spanish is the world\'s 4th most spoken language with 580+ million speakers.', 'Spain operates in the "wrong" time zone — geographically aligned with the UK but uses Central European Time.'],
      cuisine: ['Paella — saffron-infused rice with seafood, chicken, or vegetables from Valencia', 'Tapas — small shared plates culture that turns eating into a social adventure', 'Churros con Chocolate — fried dough sticks dipped in thick hot chocolate'],
      festivals: ['La Tomatina — the world\'s biggest food fight in Buñol (last Wednesday of August)', 'Running of the Bulls (San Fermín) — Pamplona\'s legendary bull run (July)', 'Las Fallas — enormous artistic sculptures burned in Valencia\'s fire festival (March)'],
      knownFor: 'The land of flamenco, siestas, and tapas — where life is lived passionately and loudly.',
      cultureDescription: 'Spanish culture runs on passion, community, and rhythm. The day peaks twice — once during the long lunch and again when the night begins at 10 PM. Flamenco embodies the Spanish soul: intensity, pride, and raw emotion. Spaniards live outdoors, socialize in plazas, and treat every meal as an event worth celebrating.',
    },
    australia: {
      leader: { name: 'Anthony Albanese', title: 'Prime Minister' },
      the_good: ['Unbeatable outdoor lifestyle — pristine beaches, sunshine, and incredible natural beauty.', 'High minimum wages, strong social safety net, and world-class coffee culture.', 'Unique endemic wildlife and natural wonders (Great Barrier Reef, Uluru, rainforests).'],
      the_bad: ['Extreme UV radiation requiring year-round vigilant sun protection.', 'Vast geographic isolation leading to expensive, lengthy international flights.', 'Severe housing affordability crisis in Sydney, Melbourne, and Brisbane.'],
      funFacts: ['Australia has more than 10,000 beaches — you could visit a new one every day for over 27 years.', 'The Great Barrier Reef is the largest living structure on Earth, visible from space.', 'Kangaroos and emus were chosen for Australia\'s coat of arms because neither animal can walk backward — symbolizing progress.'],
      cuisine: ['Vegemite on Toast — the iconic savory yeast spread that divides the world', 'Meat Pie — flaky pastry with minced meat gravy, the national snack', 'Pavlova — crispy meringue topped with cream and fresh fruit (also claimed by NZ!)'],
      festivals: ['Sydney New Year\'s Eve — spectacular harbour fireworks watched by 1 billion globally', 'Melbourne Cup — "The race that stops a nation" horse race (first Tuesday in November)', 'Vivid Sydney — dazzling festival of light, music, and ideas transforming the harbour (May-June)'],
      knownFor: 'Sun, surf, and the great outdoors — a continent-nation where nature is staggeringly vast and the people are laid-back.',
      cultureDescription: 'Australian culture is defined by mateship, outdoor living, and irreverent humor. Barbecues (barbies) are a national institution, the beach is practically a religion, and "no worries" is both a greeting and a philosophy. Indigenous Aboriginal culture, the world\'s oldest living civilization (65,000+ years), adds profound spiritual depth to this sun-drenched land.',
    },
    brazil: {
      leader: { name: 'Luiz Inácio Lula da Silva', title: 'President' },
      the_good: ['Infectious energy, music (samba, bossa nova), and the greatest football culture on Earth.', 'Stunning natural beauty — Amazon rainforest, Iguazu Falls, and 7,400 km of coastline.', 'Warm, welcoming people with a vibrant multicultural identity and legendary nightlife.'],
      the_bad: ['Stark wealth inequality and favela poverty in major urban centers.', 'High rates of urban crime and public safety concerns in certain areas.', 'Ongoing Amazon deforestation and environmental governance challenges.'],
      funFacts: ['Brazil is the only Portuguese-speaking country in the Americas and the largest in South America.', 'Rio\'s Carnival is the world\'s biggest party — 2 million people dance in the streets daily for 5 days.', 'Brazil has won the FIFA World Cup 5 times — more than any other country.'],
      cuisine: ['Feijoada — rich black bean stew with pork, Brazil\'s national dish', 'Pão de Queijo — addictive chewy cheese bread balls', 'Açaí Bowl — frozen açaí berry blended thick, topped with granola and banana'],
      festivals: ['Carnival — the world\'s most spectacular party with samba parades (February/March)', 'Festa Junina — traditional harvest festivals with bonfires and forró dancing (June)', 'Réveillon — massive New Year\'s Eve beach celebrations, especially Copacabana'],
      knownFor: 'Rhythm, color, and alegria — where football is religion, dance is language, and the Amazon breathes life into the planet.',
      cultureDescription: 'Brazilian culture is a joyful fusion of Indigenous, African, and Portuguese traditions. Music pulses through everything — from samba schools practicing year-round for Carnival to bossa nova drifting from beachside bars. Brazilians are famously warm and physical, greeting with hugs and cheek kisses. Football isn\'t just a sport; it\'s identity, community, and art.',
    },
    india: {
      leader: { name: 'Droupadi Murmu', title: 'President' },
      the_good: ['Extraordinary cultural diversity — 22 official languages, hundreds of festivals, and ancient spiritual traditions.', 'Booming tech and startup ecosystem with world-class IT talent.', 'Incredibly affordable travel, street food paradise, and some of the most hospitable people you\'ll meet.'],
      the_bad: ['Severe air pollution in major cities, especially Delhi during winter.', 'Intense bureaucracy and infrastructure challenges in many regions.', 'Extreme wealth disparity and overcrowding in urban areas.'],
      funFacts: ['India has the world\'s largest postal network with over 155,000 post offices.', 'The game of chess was invented in India, originally called "Chaturanga" in the 6th century.', 'India\'s space program (ISRO) sent a Mars orbiter (Mangalyaan) for less than the budget of the movie "Gravity."'],
      cuisine: ['Butter Chicken — creamy tomato-based curry that conquered the world', 'Biryani — fragrant layered rice with spiced meat, a celebration in every bite', 'Dosa — crispy fermented rice crepe with sambar and chutneys from South India'],
      festivals: ['Diwali — Festival of Lights with millions of oil lamps, fireworks, and sweets (October/November)', 'Holi — Festival of Colors where strangers become friends through colored powder (March)', 'Kumbh Mela — world\'s largest human gathering, a Hindu pilgrimage attracting 120+ million people'],
      knownFor: 'A civilization of contrasts — ancient temples and Silicon Valley ambitions, spice-laden cuisine and spiritual enlightenment.',
      cultureDescription: 'India is not one culture but thousands woven into a vibrant tapestry. Every state is essentially a different country with its own language, cuisine, dress, and customs. The concept of "Atithi Devo Bhava" (the guest is God) drives legendary hospitality. Spiritual traditions — Hindu, Buddhist, Sikh, Jain — coexist with a tech-savvy, youthful population racing toward the future.',
    },
    china: {
      leader: { name: 'Xi Jinping', title: 'President' },
      the_good: ['5,000 years of continuous civilization with extraordinary historical sites (Great Wall, Forbidden City, Terracotta Army).', 'World-leading high-speed rail network, rapid technological innovation, and efficient infrastructure.', 'Incredibly diverse regional cuisines, ancient traditional medicine, and rich philosophical traditions.'],
      the_bad: ['Strict internet censorship (Great Firewall) blocking Google, social media, and many western services.', 'Severe air quality issues in industrial and northern cities.', 'Complex visa requirements and significant language barrier outside major cities.'],
      funFacts: ['China\'s high-speed rail network is longer than the rest of the world\'s combined — over 42,000 km.', 'Table tennis (ping pong) is China\'s national sport, and they\'ve won 60% of all World Championship gold medals.', 'The Great Wall of China is not actually visible from space with the naked eye — that\'s a myth.'],
      cuisine: ['Peking Duck — lacquered, roasted duck carved tableside and wrapped in thin pancakes', 'Dim Sum — Cantonese steamed and fried dumplings served in bamboo baskets', 'Kung Pao Chicken — spicy stir-fried chicken with peanuts and chili peppers from Sichuan'],
      festivals: ['Chinese New Year (Spring Festival) — the world\'s largest annual human migration, 15 days of celebration', 'Mid-Autumn Festival — mooncakes, lanterns, and family reunion under the harvest moon', 'Dragon Boat Festival — dragon boat races and zongzi rice dumplings honoring poet Qu Yuan'],
      knownFor: 'The Middle Kingdom — an ancient civilization that invented paper, printing, gunpowder, and the compass, now building the future.',
      cultureDescription: 'Chinese culture is layered with millennia of philosophical thought (Confucianism, Taoism, Buddhism), artistic mastery (calligraphy, silk painting, ceramics), and culinary genius. Family bonds are the bedrock of society, respect for elders is paramount, and the concept of "face" (mianzi) governs social interactions. Modern China buzzes with cashless payment, AI innovation, and a cultural confidence rooted in its extraordinary past.',
    },
    'south korea': {
      leader: { name: 'Yoon Suk-yeol', title: 'President' },
      the_good: ['Global cultural powerhouse — K-pop, K-drama, and Korean cinema (Parasite) dominate worldwide.', 'Blazing fast internet (world\'s highest average speed), cutting-edge technology, and stunning skincare innovation.', 'Incredibly safe, clean cities with exceptional public transportation and 24/7 convenience culture.'],
      the_bad: ['Intense academic and workplace pressure culture with long working hours.', 'One of the world\'s lowest birth rates creating demographic concerns.', 'Ongoing geopolitical tension with North Korea and mandatory military service.'],
      funFacts: ['South Korea has the world\'s fastest internet speed, averaging over 200 Mbps.', 'Koreans are considered 1 year old at birth — everyone ages a year together on New Year\'s Day.', 'Seoul\'s Gangnam district, made famous by PSY\'s song, has some of the world\'s most expensive real estate.'],
      cuisine: ['Korean BBQ (Gogigui) — grilled meat at the table with banchan side dishes', 'Kimchi — fermented spicy cabbage, the soul of Korean cuisine (200+ varieties)', 'Bibimbap — mixed rice bowl with vegetables, egg, meat, and gochujang chili paste'],
      festivals: ['Chuseok — Korean Thanksgiving with ancestral rites and songpyeon rice cakes (September)', 'Boryeong Mud Festival — fun-filled mud wrestling and mud sliding on the beach (July)', 'Seollal — Lunar New Year with traditional games, food, and family gatherings'],
      knownFor: 'The K-wave capital of the world — where tradition meets hyper-modernity in neon-lit streets.',
      cultureDescription: 'Korean culture is a dynamic collision of Confucian tradition and hyper-modern pop culture. K-pop idols train for years with military discipline, skincare routines are 10-step rituals, and food is communal and abundant. The "ppalli ppalli" (hurry hurry) mentality drives relentless innovation, while jimjilbangs (bathhouses), mountain hiking, and soju-fueled dinners provide essential counterbalance.',
    },
    mexico: {
      leader: { name: 'Claudia Sheinbaum', title: 'President' },
      the_good: ['Spectacular blend of ancient civilizations (Maya, Aztec) and vibrant modern culture.', 'Incredible cuisine (UNESCO Intangible Heritage), warm people, and affordable cost of living.', 'Stunning geographic diversity — Caribbean beaches, deserts, mountains, jungles, and colonial cities.'],
      the_bad: ['Security concerns in certain regions due to organized crime.', 'Significant economic inequality between northern and southern states.', 'Infrastructure gaps and bureaucratic complexity in government services.'],
      funFacts: ['Mexico City is sinking at a rate of 20 inches per year because it was built on a lake (ancient Tenochtitlan).', 'Mexico introduced chocolate (xocolatl), chili peppers, corn, and vanilla to the world.', 'The world\'s smallest volcano (Cuexcomate, 13m tall) is in Puebla, Mexico.'],
      cuisine: ['Tacos al Pastor — spit-roasted pork with pineapple on corn tortillas', 'Mole — complex sauce with 20+ ingredients including chocolate and chili', 'Tamales — corn dough filled with meat or beans, steamed in corn husks'],
      festivals: ['Día de los Muertos — colorful celebration honoring deceased loved ones (November 1-2)', 'Guelaguetza — Oaxaca\'s folk dance festival celebrating indigenous cultures (July)', 'Independence Day — patriotic celebrations with the "Grito" presidential shout (September 15-16)'],
      knownFor: 'Ancient pyramids, Day of the Dead, and the most complex cuisine in the Americas — a civilization that gave the world chocolate.',
      cultureDescription: 'Mexican culture is a vivid tapestry woven from pre-Columbian grandeur, Spanish colonial influence, and irrepressible creative energy. Color is everywhere — in murals, textiles, papel picado, and the food itself. Family and community are everything, celebrations are frequent and elaborate, and the relationship with death (Día de los Muertos) is uniquely philosophical and joyful.',
    },
    algeria: {
      leader: { name: 'Abdelmadjid Tebboune', title: 'President' },
      the_good: ['Magnificent Sahara desert landscapes (Tassili n\'Ajjer) and UNESCO Roman ruins (Timgad, Djemila).', 'Warm, generous hospitality with rich Berber and Arabic cultural heritage.', 'Affordable cost of living, Mediterranean coastline, and ancient Casbah architecture.'],
      the_bad: ['Complex visa requirements and underdeveloped international tourism infrastructure.', 'Heavy economic dependence on oil and natural gas exports.', 'Bureaucratic administrative processes and youth unemployment challenges.'],
      funFacts: ['Algeria is the largest country in Africa — bigger than all of Western Europe combined.', 'The Sahara Desert covers 80% of Algeria\'s territory — an area larger than Western Europe.', 'Algeria\'s ancient city of Timgad was a complete Roman colonial town, perfectly preserved under sand for centuries.'],
      cuisine: ['Couscous — steamed semolina with vegetables and meat, the national dish', 'Mechoui — whole roasted lamb seasoned with cumin, a celebration centerpiece', 'Makroud — date-filled semolina pastry soaked in honey'],
      festivals: ['Yennayer — Berber/Amazigh New Year celebration (January 12)', 'National Day (November 1) — commemorating the start of the independence revolution', 'Ghardaia M\'zab Festival — celebrating the unique architecture and culture of M\'zab Valley'],
      knownFor: 'Africa\'s largest nation — where the Sahara meets the Mediterranean, and Roman ruins stand alongside ancient Berber heritage.',
      cultureDescription: 'Algerian culture blends Berber (Amazigh) identity, Arab-Islamic traditions, and French colonial influence into something uniquely its own. Hospitality is paramount — guests are treated like family and refusing mint tea is unthinkable. The Casbah of Algiers, a UNESCO World Heritage labyrinth, embodies the country\'s layered history.',
    },
    morocco: {
      leader: { name: 'Mohammed VI', title: 'King' },
      the_good: ['Enchanting medinas, stunning riads, and extraordinary craft traditions (zellige, leather).', 'Strategic location between Europe and Africa with diverse landscapes (Atlas, Sahara, coast).', 'Rich, aromatic cuisine and legendary hospitality culture.'],
      the_bad: ['Aggressive haggling culture in tourist areas can be overwhelming for newcomers.', 'Significant economic inequality between urban and rural regions.', 'Complex bureaucracy and occasional infrastructure limitations.'],
      funFacts: ['Morocco is home to the world\'s oldest continuously operating university — University of al-Qarawiyyin, founded in 859 AD.', 'The country produces 80% of the world\'s supply of argan oil.', 'Moroccan mint tea is poured from a height to create a frothy top — it\'s rude to decline.'],
      cuisine: ['Tagine — slow-cooked stew in a conical clay pot with preserved lemons', 'Couscous Friday — weekly family tradition of couscous with seven vegetables', 'Pastilla — sweet and savory phyllo pie with pigeon/chicken, almonds, and cinnamon'],
      festivals: ['Fes Festival of World Sacred Music — spiritual music from global traditions (June)', 'Rose Festival — celebrating the rose harvest in Kelaat M\'Gouna (May)', 'Eid al-Fitr — joyous celebration marking the end of Ramadan with feasts'],
      knownFor: 'The gateway between Europe and Africa — a sensory wonderland of spice souks, mosaic palaces, and Saharan starscapes.',
      cultureDescription: 'Moroccan culture is an intoxicating blend of Berber, Arab, and Andalusian influences. The medina is a universe unto itself — artisans hammer copper, dyers drape rainbow skeins, and the call to prayer echoes five times daily. Hospitality is sacred, expressed through elaborate tea ceremonies and multi-course feasts served on ornate brass tables.',
    },
    'saudi arabia': {
      leader: { name: 'Salman bin Abdulaziz', title: 'King' },
      the_good: ['Custodian of Islam\'s two holiest cities (Mecca and Medina), profound spiritual significance.', 'Rapid modernization under Vision 2030 with megaprojects (NEOM, Red Sea tourism).', 'Tax-free personal income and massive investment in entertainment and cultural infrastructure.'],
      the_bad: ['Extreme summer heat exceeding 50°C (122°F) in many regions.', 'Strict social and legal codes with limited personal freedoms by Western standards.', 'Heavy reliance on oil economy despite diversification efforts.'],
      funFacts: ['Saudi Arabia has no rivers — it\'s the largest country in the world without a single river.', 'The annual Hajj pilgrimage to Mecca draws over 2 million Muslims from every corner of the globe.', 'Saudi Arabia\'s NEOM project aims to build a 170km-long linear city called "The Line" — with no cars or streets.'],
      cuisine: ['Kabsa — spiced rice with meat, the beloved national dish', 'Shawarma — spit-roasted meat wrapped in flatbread with garlic sauce', 'Dates with Arabic Coffee (Gahwa) — the essential gesture of Saudi hospitality'],
      festivals: ['Hajj — the world\'s largest annual pilgrimage to Mecca (varies by Islamic calendar)', 'Riyadh Season — massive entertainment festival with concerts and events (October-March)', 'Janadriyah — national heritage and culture festival celebrating Saudi traditions'],
      knownFor: 'The spiritual heart of the Islamic world, now reinventing itself as a tourism and entertainment destination at breathtaking speed.',
      cultureDescription: 'Saudi culture is rooted in Islamic tradition, Bedouin heritage, and the bonds of tribal hospitality. Generosity is a cornerstone — guests are honored with dates, Arabic coffee, and lavish meals. The kingdom is undergoing a historic cultural transformation, opening cinemas, hosting concerts, and welcoming international tourists while maintaining its spiritual identity.',
    },
    'united arab emirates': {
      leader: { name: 'Mohamed bin Zayed Al Nahyan', title: 'President' },
      the_good: ['Ultra-modern architecture, zero personal income tax, and world-class luxury.', 'Exceptional safety, multicultural environment uniting 200+ nationalities.', 'Premier global air hub (Emirates, Etihad) with ambitious future cities.'],
      the_bad: ['Oppressive summer heat exceeding 45°C with extreme humidity.', 'Very high cost of luxury living, private education, and dining.', 'Strict legal regulations and censorship of public behavior.'],
      funFacts: ['Dubai\'s Burj Khalifa is the tallest building in the world at 828m — visible from 95km away.', 'The UAE has the world\'s richest horse race (Dubai World Cup) with \\$12M in prize money.', 'Abu Dhabi\'s Sheikh Zayed Grand Mosque has the world\'s largest hand-knotted carpet (5,627 sq meters).'],
      cuisine: ['Al Machboos — spiced rice with meat or seafood, a traditional Emirati favorite', 'Luqaimat — sweet fried dumplings drizzled with date syrup', 'Shawarma — the unofficial street food king of the UAE'],
      festivals: ['Dubai Shopping Festival — month-long shopping and entertainment extravaganza (January)', 'Abu Dhabi Grand Prix — Formula 1 under the lights at Yas Marina (November)', 'National Day — spectacular celebrations on December 2 with air shows and fireworks'],
      knownFor: 'From desert to dazzle in 50 years — the world\'s most ambitious urban transformation.',
      cultureDescription: 'Emirati culture balances proud Bedouin heritage with futuristic ambition. Traditional falconry and camel racing coexist with robot police and the world\'s tallest buildings. Hospitality remains sacred — Arabic coffee and dates greet every visitor. The UAE is a remarkable experiment in multiculturalism, where nearly 90% of residents are expatriates living alongside local traditions.',
    },
    nigeria: {
      leader: { name: 'Bola Tinubu', title: 'President' },
      the_good: ['Africa\'s largest economy with a thriving tech scene ("Silicon Lagoon") and creative industries.', 'Nollywood is the world\'s second-largest film industry by volume.', 'Incredibly vibrant music (Afrobeats), fashion, and entrepreneurial energy.'],
      the_bad: ['Significant infrastructure gaps including unreliable power supply.', 'Security challenges in certain regions.', 'High inflation and currency volatility affecting daily living costs.'],
      funFacts: ['Nigeria has over 520 living languages — one of the most linguistically diverse nations on Earth.', 'Lagos was the fastest-growing city in Africa and is projected to become the world\'s largest city by 2100.', 'Afrobeats artists like Burna Boy and Wizkid have topped global charts, making Nigerian music a worldwide phenomenon.'],
      cuisine: ['Jollof Rice — the beloved West African rice dish that sparks friendly rivalry with Ghana', 'Suya — spicy grilled skewered meat coated in ground peanut spice mix', 'Pounded Yam and Egusi Soup — stretchy yam dough dipped in melon seed soup'],
      festivals: ['Lagos Carnival — colorful street parade celebrating Nigerian culture (April)', 'Osun-Osogbo Festival — UNESCO-listed sacred grove celebration (August)', 'Durbar Festival — spectacular horse parade in northern Nigeria after Eid'],
      knownFor: 'The Giant of Africa — where Afrobeats, Nollywood, and unstoppable entrepreneurial energy are reshaping the continent.',
      cultureDescription: 'Nigerian culture is loud, proud, and endlessly creative. The country\'s 250+ ethnic groups each bring distinct traditions, music, and cuisine. Lagos pulses with entrepreneurial hustle and nightlife that rivals any global city. Nigerians are known for their warmth, humor, and resilience, and their cultural exports — music, film, fashion — are conquering the world.',
    },
    egypt: {
      leader: { name: 'Abdel Fattah el-Sisi', title: 'President' },
      the_good: ['Home to the Great Pyramids, the Sphinx, and 5,000 years of unbroken civilization.', 'The Nile River creates a stunning fertile corridor through the desert.', 'Warm, hospitable people and incredibly affordable travel experiences.'],
      the_bad: ['Intense summer heat in Upper Egypt exceeding 45°C.', 'Traffic congestion in Cairo is legendary and chaotic.', 'Bureaucratic complexity and occasional political instability.'],
      funFacts: ['The Great Pyramid of Giza was the tallest man-made structure for 3,800 years.', 'Ancient Egyptians invented toothpaste, paper (papyrus), and the 365-day calendar.', 'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.'],
      cuisine: ['Koshari — street food classic: rice, lentils, macaroni, and tomato sauce', 'Ful Medames — slow-cooked fava beans, the quintessential Egyptian breakfast', 'Molokhia — green jute leaf soup served over rice, a home-cooked staple'],
      festivals: ['Sham el-Nessim — ancient spring festival dating back 4,500 years (April)', 'Moulid an-Nabi — celebrating Prophet Muhammad\'s birthday with sweets and parades', 'Abu Simbel Sun Festival — when sunlight illuminates Ramesses II\'s inner temple (February 22 & October 22)'],
      knownFor: 'The land of pharaohs, pyramids, and the life-giving Nile — humanity\'s greatest ancient civilization.',
      cultureDescription: 'Egyptian culture carries the weight and wonder of being humanity\'s oldest continuous civilization. Modern Egyptians are incredibly social, humorous, and hospitable — sharing tea and conversation is a national pastime. Cairo\'s streets blend ancient minarets with modern chaos, while the Nile remains the spiritual and physical lifeline it has been for millennia.',
    },
    turkey: {
      leader: { name: 'Recep Tayyip Erdoğan', title: 'President' },
      the_good: ['Extraordinary crossroads of East and West — Byzantine and Ottoman heritage coexist magnificently.', 'World-class cuisine, stunning coastlines (Turkish Riviera), and legendary hospitality.', 'Affordable luxury travel with rich historical sites (Hagia Sophia, Ephesus, Cappadocia).'],
      the_bad: ['High inflation and currency instability affecting daily costs.', 'Political polarization and press freedom concerns.', 'Seismic vulnerability — major earthquake risk in many regions.'],
      funFacts: ['Turkey is home to two of the Seven Wonders of the Ancient World (Temple of Artemis and Mausoleum at Halicarnassus).', 'Turkish people consume more tea per capita than any other nation — even more than the British.', 'The iconic tulip actually originated in Turkey, not the Netherlands — the Dutch imported bulbs from Ottoman gardens.'],
      cuisine: ['Kebab — grilled meat perfection in dozens of regional styles (Adana, İskender, Döner)', 'Baklava — layers of phyllo, pistachios, and honey syrup', 'Turkish Breakfast — an elaborate spread of cheeses, olives, eggs, honey, and fresh bread'],
      festivals: ['Whirling Dervish Ceremonies — mesmerizing Sufi spiritual dance in Konya (December)', 'Istanbul Music Festival — classical and contemporary music across historic venues (June)', 'Kirkpinar Oil Wrestling — the world\'s oldest continuously held sporting event since 1362'],
      knownFor: 'Where continents collide — a land straddling Europe and Asia, where grand bazaars meet Cappadocian hot air balloons.',
      cultureDescription: 'Turkish culture is a mesmerizing bridge between East and West. Istanbul alone embodies this duality — Byzantine churches turned mosques stand beside modern galleries. Turkish hospitality (misafirperverlik) is legendary; refusing çay (tea) is nearly impossible. The hammam (bathhouse) tradition, carpet weaving, and the art of the Turkish coffee fortune reading reveal a culture that treasures ritual and connection.',
    },
    russia: {
      leader: { name: 'Vladimir Putin', title: 'President' },
      the_good: ['Extraordinary cultural heritage — Bolshoi Ballet, Hermitage Museum, and literary giants (Tolstoy, Dostoevsky).', 'Vast, breathtaking landscapes from Arctic tundra to Lake Baikal (deepest lake on Earth).', 'World-class classical music, chess tradition, and architectural grandeur.'],
      the_bad: ['Extreme cold — Siberian winters can reach -50°C and winter lasts 6+ months.', 'Complex visa processes and significant language barrier outside Moscow/St. Petersburg.', 'Political tensions affecting international relations and travel advisories.'],
      funFacts: ['Russia spans 11 time zones — when it\'s midnight in Kaliningrad, it\'s 10 AM in Kamchatka.', 'Lake Baikal contains 20% of the world\'s unfrozen fresh water.', 'The Moscow Metro is so deep that some stations double as Cold War nuclear shelters, and it\'s decorated like a palace.'],
      cuisine: ['Borscht — vibrant beetroot soup served with sour cream', 'Pelmeni — Siberian dumplings filled with meat', 'Blini — thin pancakes served with caviar, sour cream, or jam'],
      festivals: ['Maslenitsa — "Butter Week" before Lent with pancakes, folk music, and effigy burning', 'White Nights Festival — St. Petersburg\'s magical 24-hour daylight with ballet and concerts (June)', 'Victory Day — solemn and grand commemoration of WWII victory (May 9)'],
      knownFor: 'The world\'s largest country — where onion-domed cathedrals, ballet, and the Trans-Siberian Railway define an epic scale.',
      cultureDescription: 'Russian culture is one of dramatic extremes — vast frozen landscapes and passionate souls, stern exteriors and deep emotional warmth. The "Russian soul" (russkaya dusha) values intensity, philosophical depth, and endurance. Literature and music are national treasures, vodka toasts are elaborate rituals, and the banya (steam bath) followed by a plunge in cold water is the ultimate cultural experience.',
    },
    argentina: {
      leader: { name: 'Javier Milei', title: 'President' },
      the_good: ['World capital of tango, passionate football culture, and exceptional Malbec wine regions.', 'Incredible natural diversity from Patagonian glaciers to Iguazú Falls.', 'Vibrant Buenos Aires nightlife, excellent steak, and strong literary tradition.'],
      the_bad: ['Chronic inflation and economic instability affecting purchasing power.', 'Bureaucratic complexity and unpredictable currency exchange rates.', 'Urban safety concerns in certain neighborhoods of Buenos Aires.'],
      funFacts: ['Argentina has the widest avenue in the world — Avenida 9 de Julio is 140 meters wide.', 'Argentines consume the most beef per capita in the world — about 50 kg per person per year.', 'The country is named after the Latin word "argentum" (silver) due to legends of vast silver deposits.'],
      cuisine: ['Asado — slow-grilled beef over open flames, a sacred Sunday ritual', 'Empanadas — savory pastries filled with meat, cheese, or vegetables', 'Dulce de Leche — caramelized milk spread that goes on absolutely everything'],
      festivals: ['Tango Festival — Buenos Aires celebrates its signature dance (August)', 'Vendimia — Mendoza\'s grape harvest festival with wine, music, and beauty pageant (March)', 'Carnival de Gualeguaychú — Argentina\'s answer to Rio\'s Carnival (January-February)'],
      knownFor: 'The land of tango, Messi, and Malbec — where passion runs through everything from football stadiums to steakhouse grills.',
      cultureDescription: 'Argentine culture is defined by passion, nostalgia, and the art of conversation. The asado (barbecue) is a Sunday religion, mate sharing is a friendship ritual, and tango embodies the bittersweet soul of Buenos Aires. Porteños (Buenos Aires residents) dine at 10 PM, debate philosophy at midnight, and take their football with life-or-death seriousness.',
    },
    thailand: {
      leader: { name: 'Paetongtarn Shinawatra', title: 'Prime Minister' },
      the_good: ['Legendary hospitality ("Land of Smiles"), spectacular Buddhist temples, and paradise islands.', 'World-renowned street food scene — affordable, diverse, and absolutely delicious.', 'Excellent value for money with modern infrastructure and rich cultural experiences.'],
      the_bad: ['Extreme humidity and heat during hot season (March-May).', 'Heavy traffic congestion in Bangkok and aggressive tuk-tuk pricing for tourists.', 'Occasional political instability and strict lèse-majesté laws.'],
      funFacts: ['Thailand is the only Southeast Asian country never colonized by a European power — "Thai" means "free."', 'Bangkok\'s full ceremonial name has 168 characters — it\'s the longest city name in the world.', 'The Thai king\'s pet dog once held the rank of Air Chief Marshal in the Royal Thai Air Force.'],
      cuisine: ['Pad Thai — stir-fried rice noodles with shrimp, peanuts, and tamarind sauce', 'Tom Yum Goong — hot and sour shrimp soup with lemongrass and galangal', 'Green Curry — coconut milk curry with Thai basil, bamboo shoots, and chilies'],
      festivals: ['Songkran (Thai New Year) — world\'s biggest water fight celebrating the new year (April 13-15)', 'Loy Krathong — floating lanterns and flower baskets on rivers under the full moon (November)', 'Yi Peng — sky lantern festival in Chiang Mai (November)'],
      knownFor: 'The Land of Smiles — where golden temples, floating markets, and the world\'s best street food create pure magic.',
      cultureDescription: 'Thai culture is a graceful blend of Buddhist spirituality, royal tradition, and joyful daily life. The wai (prayer-like greeting) reflects deep respect, and monks in saffron robes are a daily sight. Thai people approach life with sanuk (fun) and mai pen rai (no worries). The food alone — from morning congee to late-night pad thai on a street corner — is worth crossing the world for.',
    },
  };

  const matchKey = Object.keys(db).find((key) => c.includes(key));
  if (matchKey) {
    return { country, ...db[matchKey], fallback: true, note: 'Powered by Edge Cultural Knowledge Base' };
  }

  return {
    country,
    leader: { name: 'Head of State', title: 'President / Prime Minister' },
    the_good: ['Rich cultural traditions, architectural heritage, and renowned regional gastronomy.', 'Diverse natural landscapes, historic landmarks, and welcoming local communities.', 'Strategic regional significance with unique artisan craftsmanship and trade networks.'],
    the_bad: ['Navigating local administrative and bureaucratic processes can be complex for newcomers.', 'Economic sensitivity to global inflation, energy prices, and commodity fluctuations.', 'Seasonal climatic variations requiring mindful advance travel preparation.'],
    funFacts: [`${country} has its own unique cultural traditions passed down through generations.`, `The local cuisine features distinctive flavors and cooking techniques you won't find anywhere else.`, `The country's natural landscape ranges from mountains to coastline, offering diverse experiences.`],
    cuisine: ['Traditional rice or grain-based dishes with local spices', 'Grilled meats and seafood prepared with indigenous techniques', 'Sweet pastries and desserts unique to the region'],
    festivals: ['National Independence Day celebrations', 'Traditional harvest or seasonal festival', 'Religious and cultural community gatherings'],
    knownFor: `A nation with its own distinctive character, traditions, and contributions to the world.`,
    cultureDescription: `${country} possesses a rich cultural tapestry shaped by centuries of history, geographic influences, and the resilience of its people. Visitors are often struck by the warmth of local hospitality and the depth of artistic and culinary traditions.`,
    fallback: true,
    note: 'Powered by Edge Cultural Knowledge Base',
  };
}
