export interface VerifiedLeader {
  name: string;
  title: string;
  headOfState?: string;
  governmentType?: string;
}

/**
 * Fact-checked, strictly verified directory of world leaders,
 * distinguishing executive head of government (President, Prime Minister, Chancellor)
 * and ceremonial or constitutional head of state.
 */
export const VERIFIED_LEADERS: Record<string, VerifiedLeader> = {
  nigeria: {
    name: 'Bola Ahmed Tinubu',
    title: 'President',
    governmentType: 'Federal Presidential Republic',
  },
  'united states': {
    name: 'Donald Trump',
    title: 'President',
    governmentType: 'Federal Constitutional Presidential Republic',
  },
  'united kingdom': {
    name: 'Keir Starmer',
    title: 'Prime Minister',
    headOfState: 'King Charles III',
    governmentType: 'Parliamentary Constitutional Monarchy',
  },
  canada: {
    name: 'Justin Trudeau',
    title: 'Prime Minister',
    headOfState: 'King Charles III',
    governmentType: 'Federal Parliamentary Constitutional Monarchy',
  },
  france: {
    name: 'Emmanuel Macron',
    title: 'President',
    headOfState: 'Emmanuel Macron',
    governmentType: 'Semi-Presidential Republic',
  },
  germany: {
    name: 'Olaf Scholz',
    title: 'Federal Chancellor',
    headOfState: 'Frank-Walter Steinmeier (President)',
    governmentType: 'Federal Parliamentary Republic',
  },
  italy: {
    name: 'Giorgia Meloni',
    title: 'President of the Council of Ministers (Prime Minister)',
    headOfState: 'Sergio Mattarella (President)',
    governmentType: 'Unitary Parliamentary Republic',
  },
  japan: {
    name: 'Shigeru Ishiba',
    title: 'Prime Minister',
    headOfState: 'Emperor Naruhito',
    governmentType: 'Unitary Parliamentary Constitutional Monarchy',
  },
  india: {
    name: 'Narendra Modi',
    title: 'Prime Minister',
    headOfState: 'Droupadi Murmu (President)',
    governmentType: 'Federal Parliamentary Republic',
  },
  brazil: {
    name: 'Luiz Inácio Lula da Silva',
    title: 'President',
    governmentType: 'Federal Presidential Republic',
  },
  'south africa': {
    name: 'Cyril Ramaphosa',
    title: 'President',
    governmentType: 'Parliamentary Republic with Executive President',
  },
  mexico: {
    name: 'Claudia Sheinbaum',
    title: 'President',
    governmentType: 'Federal Presidential Republic',
  },
  australia: {
    name: 'Anthony Albanese',
    title: 'Prime Minister',
    headOfState: 'King Charles III',
    governmentType: 'Federal Parliamentary Constitutional Monarchy',
  },
  algeria: {
    name: 'Abdelmadjid Tebboune',
    title: 'President',
    headOfState: 'Abdelmadjid Tebboune',
    governmentType: 'Semi-Presidential Republic',
  },
  egypt: {
    name: 'Abdel Fattah el-Sisi',
    title: 'President',
    governmentType: 'Semi-Presidential Republic',
  },
  ghana: {
    name: 'Nana Akufo-Addo',
    title: 'President',
    governmentType: 'Unitary Presidential Republic',
  },
  kenya: {
    name: 'William Ruto',
    title: 'President',
    governmentType: 'Unitary Presidential Republic',
  },
  spain: {
    name: 'Pedro Sánchez',
    title: 'President of the Government (Prime Minister)',
    headOfState: 'King Felipe VI',
    governmentType: 'Parliamentary Constitutional Monarchy',
  },
  turkey: {
    name: 'Recep Tayyip Erdoğan',
    title: 'President',
    governmentType: 'Unitary Presidential Republic',
  },
  china: {
    name: 'Xi Jinping',
    title: 'President & General Secretary',
    governmentType: 'Unitary One-Party Socialist Republic',
  },
  russia: {
    name: 'Vladimir Putin',
    title: 'President',
    headOfState: 'Vladimir Putin',
    governmentType: 'Federal Semi-Presidential Republic',
  },
  indonesia: {
    name: 'Prabowo Subianto',
    title: 'President',
    governmentType: 'Unitary Presidential Republic',
  },
  argentina: {
    name: 'Javier Milei',
    title: 'President',
    governmentType: 'Federal Presidential Republic',
  },
  'south korea': {
    name: 'Yoon Suk-yeol',
    title: 'President',
    governmentType: 'Unitary Presidential Republic',
  },
  'saudi arabia': {
    name: 'Mohammed bin Salman',
    title: 'Crown Prince & Prime Minister',
    headOfState: 'King Salman bin Abdulaziz',
    governmentType: 'Absolute Monarchy',
  },
  'united arab emirates': {
    name: 'Mohamed bin Zayed Al Nahyan',
    title: 'President & Ruler of Abu Dhabi',
    governmentType: 'Federal Elective Constitutional Monarchy',
  },
  singapore: {
    name: 'Lawrence Wong',
    title: 'Prime Minister',
    headOfState: 'Tharman Shanmugaratnam (President)',
    governmentType: 'Unitary Parliamentary Republic',
  },
  'new zealand': {
    name: 'Christopher Luxon',
    title: 'Prime Minister',
    headOfState: 'King Charles III',
    governmentType: 'Unitary Parliamentary Constitutional Monarchy',
  },
  morocco: {
    name: 'Mohammed VI',
    title: 'King',
    headOfState: 'King Mohammed VI',
    governmentType: 'Parliamentary Constitutional Monarchy',
  },
  ethiopia: {
    name: 'Abiy Ahmed',
    title: 'Prime Minister',
    headOfState: 'Taye Atske Selassie (President)',
    governmentType: 'Federal Parliamentary Republic',
  },
  rwanda: {
    name: 'Paul Kagame',
    title: 'President',
    governmentType: 'Unitary Presidential Republic',
  },
  senegal: {
    name: 'Bassirou Diomaye Faye',
    title: 'President',
    governmentType: 'Unitary Presidential Republic',
  },
  colombia: {
    name: 'Gustavo Petro',
    title: 'President',
    governmentType: 'Unitary Presidential Republic',
  },
  chile: {
    name: 'Gabriel Boric',
    title: 'President',
    governmentType: 'Unitary Presidential Republic',
  },
  ukraine: {
    name: 'Volodymyr Zelenskyy',
    title: 'President',
    governmentType: 'Unitary Semi-Presidential Republic',
  },
  poland: {
    name: 'Donald Tusk',
    title: 'Prime Minister',
    headOfState: 'Andrzej Duda (President)',
    governmentType: 'Unitary Parliamentary Republic',
  },
  netherlands: {
    name: 'Dick Schoof',
    title: 'Prime Minister',
    headOfState: 'King Willem-Alexander',
    governmentType: 'Unitary Parliamentary Constitutional Monarchy',
  },
  switzerland: {
    name: 'Viola Amherd',
    title: 'President of the Confederation',
    governmentType: 'Federal Direct-Democratic Republic',
  },
  sweden: {
    name: 'Ulf Kristersson',
    title: 'Prime Minister',
    headOfState: 'King Carl XVI Gustaf',
    governmentType: 'Unitary Parliamentary Constitutional Monarchy',
  },
  norway: {
    name: 'Jonas Gahr Støre',
    title: 'Prime Minister',
    headOfState: 'King Harald V',
    governmentType: 'Unitary Parliamentary Constitutional Monarchy',
  },
  pakistan: {
    name: 'Shehbaz Sharif',
    title: 'Prime Minister',
    headOfState: 'Asif Ali Zardari (President)',
    governmentType: 'Federal Parliamentary Republic',
  },
  bangladesh: {
    name: 'Muhammad Yunus',
    title: 'Chief Adviser (Head of Interim Government)',
    headOfState: 'Mohammed Shahabuddin (President)',
    governmentType: 'Unitary Parliamentary Republic (Interim)',
  },
  philippines: {
    name: 'Ferdinand Marcos Jr.',
    title: 'President',
    governmentType: 'Unitary Presidential Republic',
  },
  vietnam: {
    name: 'Lương Cường',
    title: 'State President',
    headOfState: 'Lương Cường',
    governmentType: 'Unitary One-Party Socialist Republic',
  },
  thailand: {
    name: 'Paetongtarn Shinawatra',
    title: 'Prime Minister',
    headOfState: 'King Vajiralongkorn (Rama X)',
    governmentType: 'Unitary Parliamentary Constitutional Monarchy',
  },
  malaysia: {
    name: 'Anwar Ibrahim',
    title: 'Prime Minister',
    headOfState: 'Sultan Ibrahim Iskandar (Yang di-Pertuan Agong)',
    governmentType: 'Federal Parliamentary Elective Constitutional Monarchy',
  },
};

export function getVerifiedLeader(countryName: string): VerifiedLeader | null {
  const norm = countryName.trim().toLowerCase();
  
  // Direct match
  if (VERIFIED_LEADERS[norm]) {
    return VERIFIED_LEADERS[norm];
  }

  // Partial match
  const matchKey = Object.keys(VERIFIED_LEADERS).find((k) => norm.includes(k) || k.includes(norm));
  if (matchKey) {
    return VERIFIED_LEADERS[matchKey];
  }

  return null;
}
