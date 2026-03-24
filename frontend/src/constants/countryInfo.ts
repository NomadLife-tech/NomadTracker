import { CountryInfo } from '../types';

export const COUNTRY_INFO: Record<string, CountryInfo> = {
  // Major Countries with comprehensive info
  US: {
    emergencyNumbers: { police: '911', ambulance: '911', fire: '911', general: '911' },
    visaResources: [
      { name: 'U.S. Department of State', url: 'https://travel.state.gov/content/travel/en/us-visas.html', type: 'visa' },
      { name: 'USCIS', url: 'https://www.uscis.gov', type: 'immigration' },
      { name: 'ESTA Application', url: 'https://esta.cbp.dhs.gov', type: 'visa' },
    ],
    currencyCode: 'USD',
    drivingSide: 'right',
    timezone: 'America/New_York',
  },
  GB: {
    emergencyNumbers: { police: '999', ambulance: '999', fire: '999', general: '112' },
    visaResources: [
      { name: 'UK Visas and Immigration', url: 'https://www.gov.uk/browse/visas-immigration', type: 'visa' },
      { name: 'Apply for UK Visa', url: 'https://www.gov.uk/apply-to-come-to-the-uk', type: 'visa' },
    ],
    currencyCode: 'GBP',
    drivingSide: 'left',
    timezone: 'Europe/London',
  },
  DE: {
    emergencyNumbers: { police: '110', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'German Federal Foreign Office', url: 'https://www.auswaertiges-amt.de/en/visa-service', type: 'visa' },
      { name: 'Germany Visa Application', url: 'https://visa.diplo.de', type: 'visa' },
      { name: 'Make it in Germany', url: 'https://www.make-it-in-germany.com/en/', type: 'immigration' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Berlin',
  },
  FR: {
    emergencyNumbers: { police: '17', ambulance: '15', fire: '18', general: '112' },
    visaResources: [
      { name: 'France-Visas', url: 'https://france-visas.gouv.fr/en', type: 'visa' },
      { name: 'Campus France', url: 'https://www.campusfrance.org/en', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Paris',
  },
  ES: {
    emergencyNumbers: { police: '091', ambulance: '112', fire: '080', general: '112', tourist: '902 102 112' },
    visaResources: [
      { name: 'Spain Visa Portal', url: 'https://www.exteriores.gob.es/en/Paginas/index.aspx', type: 'visa' },
      { name: 'BLS Spain Visa', url: 'https://www.blsspainvisa.com', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Madrid',
  },
  IT: {
    emergencyNumbers: { police: '113', ambulance: '118', fire: '115', general: '112' },
    visaResources: [
      { name: 'Italian Ministry of Foreign Affairs', url: 'https://vistoperitalia.esteri.it', type: 'visa' },
      { name: 'Italy Visa Portal', url: 'https://www.esteri.it/en/servizi-consolari-e-visti/', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Rome',
  },
  PT: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'AIMA Portugal', url: 'https://aima.gov.pt/en/', type: 'immigration' },
      { name: 'VFS Global Portugal', url: 'https://www.vfsglobal.com/portugal', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Lisbon',
  },
  NL: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'IND Netherlands', url: 'https://ind.nl/en', type: 'immigration' },
      { name: 'Netherlands Visa', url: 'https://www.netherlandsandyou.nl/travel-and-residence/visas-for-the-netherlands', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Amsterdam',
  },
  BE: {
    emergencyNumbers: { police: '101', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Belgium Visa', url: 'https://diplomatie.belgium.be/en/travel-belgium/visa-belgium', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Brussels',
  },
  AT: {
    emergencyNumbers: { police: '133', ambulance: '144', fire: '122', general: '112' },
    visaResources: [
      { name: 'Austrian Embassy', url: 'https://www.bmeia.gv.at/en/austrian-embassy-other-country/', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Vienna',
  },
  CH: {
    emergencyNumbers: { police: '117', ambulance: '144', fire: '118', general: '112' },
    visaResources: [
      { name: 'Swiss SEM', url: 'https://www.sem.admin.ch/sem/en/home/themen/einreise.html', type: 'immigration' },
    ],
    currencyCode: 'CHF',
    drivingSide: 'right',
    timezone: 'Europe/Zurich',
  },
  GR: {
    emergencyNumbers: { police: '100', ambulance: '166', fire: '199', general: '112', tourist: '171' },
    visaResources: [
      { name: 'Greek Ministry of Foreign Affairs', url: 'https://www.mfa.gr/en/visas/', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Athens',
  },
  SE: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Swedish Migration Agency', url: 'https://www.migrationsverket.se/English.html', type: 'immigration' },
    ],
    currencyCode: 'SEK',
    drivingSide: 'right',
    timezone: 'Europe/Stockholm',
  },
  NO: {
    emergencyNumbers: { police: '112', ambulance: '113', fire: '110', general: '112' },
    visaResources: [
      { name: 'UDI Norway', url: 'https://www.udi.no/en/', type: 'immigration' },
    ],
    currencyCode: 'NOK',
    drivingSide: 'right',
    timezone: 'Europe/Oslo',
  },
  DK: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'New to Denmark', url: 'https://www.nyidanmark.dk/en-GB', type: 'immigration' },
    ],
    currencyCode: 'DKK',
    drivingSide: 'right',
    timezone: 'Europe/Copenhagen',
  },
  FI: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Finnish Immigration Service', url: 'https://migri.fi/en/home', type: 'immigration' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Helsinki',
  },
  PL: {
    emergencyNumbers: { police: '997', ambulance: '999', fire: '998', general: '112' },
    visaResources: [
      { name: 'Poland Visa Info', url: 'https://www.gov.pl/web/diplomacy/visas', type: 'visa' },
    ],
    currencyCode: 'PLN',
    drivingSide: 'right',
    timezone: 'Europe/Warsaw',
  },
  CZ: {
    emergencyNumbers: { police: '158', ambulance: '155', fire: '150', general: '112' },
    visaResources: [
      { name: 'Czech MFA', url: 'https://www.mzv.cz/jnp/en/information_for_aliens/index.html', type: 'visa' },
    ],
    currencyCode: 'CZK',
    drivingSide: 'right',
    timezone: 'Europe/Prague',
  },
  HU: {
    emergencyNumbers: { police: '107', ambulance: '104', fire: '105', general: '112' },
    visaResources: [
      { name: 'Hungary Immigration', url: 'https://konzuliszolgalat.kormany.hu/en', type: 'immigration' },
    ],
    currencyCode: 'HUF',
    drivingSide: 'right',
    timezone: 'Europe/Budapest',
  },
  IE: {
    emergencyNumbers: { police: '999', ambulance: '999', fire: '999', general: '112' },
    visaResources: [
      { name: 'Irish Immigration', url: 'https://www.irishimmigration.ie', type: 'immigration' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'left',
    timezone: 'Europe/Dublin',
  },
  JP: {
    emergencyNumbers: { police: '110', ambulance: '119', fire: '119', general: '110' },
    visaResources: [
      { name: 'Japan Visa Portal', url: 'https://www.mofa.go.jp/j_info/visit/visa/', type: 'visa' },
      { name: 'Immigration Services Agency', url: 'https://www.moj.go.jp/isa/index.html', type: 'immigration' },
    ],
    currencyCode: 'JPY',
    drivingSide: 'left',
    timezone: 'Asia/Tokyo',
  },
  KR: {
    emergencyNumbers: { police: '112', ambulance: '119', fire: '119', general: '112', tourist: '1330' },
    visaResources: [
      { name: 'Korea Visa Portal', url: 'https://www.visa.go.kr/main/openMain.do', type: 'visa' },
      { name: 'K-ETA', url: 'https://www.k-eta.go.kr', type: 'visa' },
    ],
    currencyCode: 'KRW',
    drivingSide: 'right',
    timezone: 'Asia/Seoul',
  },
  CN: {
    emergencyNumbers: { police: '110', ambulance: '120', fire: '119', general: '110' },
    visaResources: [
      { name: 'China Visa Application', url: 'https://www.visaforchina.org', type: 'visa' },
    ],
    currencyCode: 'CNY',
    drivingSide: 'right',
    timezone: 'Asia/Shanghai',
  },
  TW: {
    emergencyNumbers: { police: '110', ambulance: '119', fire: '119', general: '110' },
    visaResources: [
      { name: 'Bureau of Consular Affairs', url: 'https://www.boca.gov.tw/mp-2.html', type: 'visa' },
    ],
    currencyCode: 'TWD',
    drivingSide: 'right',
    timezone: 'Asia/Taipei',
  },
  HK: {
    emergencyNumbers: { police: '999', ambulance: '999', fire: '999', general: '999' },
    visaResources: [
      { name: 'HK Immigration', url: 'https://www.immd.gov.hk/eng/services/index.html', type: 'immigration' },
    ],
    currencyCode: 'HKD',
    drivingSide: 'left',
    timezone: 'Asia/Hong_Kong',
  },
  SG: {
    emergencyNumbers: { police: '999', ambulance: '995', fire: '995', general: '999' },
    visaResources: [
      { name: 'ICA Singapore', url: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore', type: 'immigration' },
    ],
    currencyCode: 'SGD',
    drivingSide: 'left',
    timezone: 'Asia/Singapore',
  },
  MY: {
    emergencyNumbers: { police: '999', ambulance: '999', fire: '994', general: '999', tourist: '03-2615 8188' },
    visaResources: [
      { name: 'Malaysia Immigration', url: 'https://www.imi.gov.my', type: 'immigration' },
    ],
    currencyCode: 'MYR',
    drivingSide: 'left',
    timezone: 'Asia/Kuala_Lumpur',
  },
  TH: {
    emergencyNumbers: { police: '191', ambulance: '1669', fire: '199', general: '191', tourist: '1155' },
    visaResources: [
      { name: 'Thai Immigration', url: 'https://immigration.go.th', type: 'immigration' },
      { name: 'Thai e-Visa', url: 'https://www.thaievisa.go.th', type: 'visa' },
    ],
    currencyCode: 'THB',
    drivingSide: 'left',
    timezone: 'Asia/Bangkok',
  },
  ID: {
    emergencyNumbers: { police: '110', ambulance: '118', fire: '113', general: '112' },
    visaResources: [
      { name: 'Indonesia Immigration', url: 'https://www.imigrasi.go.id', type: 'immigration' },
      { name: 'Visa Online', url: 'https://visa-online.imigrasi.go.id', type: 'visa' },
    ],
    currencyCode: 'IDR',
    drivingSide: 'left',
    timezone: 'Asia/Jakarta',
  },
  VN: {
    emergencyNumbers: { police: '113', ambulance: '115', fire: '114', general: '113' },
    visaResources: [
      { name: 'Vietnam e-Visa', url: 'https://evisa.xuatnhapcanh.gov.vn', type: 'visa' },
    ],
    currencyCode: 'VND',
    drivingSide: 'right',
    timezone: 'Asia/Ho_Chi_Minh',
  },
  PH: {
    emergencyNumbers: { police: '911', ambulance: '911', fire: '911', general: '911' },
    visaResources: [
      { name: 'Bureau of Immigration', url: 'https://immigration.gov.ph', type: 'immigration' },
    ],
    currencyCode: 'PHP',
    drivingSide: 'right',
    timezone: 'Asia/Manila',
  },
  IN: {
    emergencyNumbers: { police: '100', ambulance: '102', fire: '101', general: '112', tourist: '1363' },
    visaResources: [
      { name: 'Indian e-Visa', url: 'https://indianvisaonline.gov.in', type: 'visa' },
    ],
    currencyCode: 'INR',
    drivingSide: 'left',
    timezone: 'Asia/Kolkata',
  },
  AU: {
    emergencyNumbers: { police: '000', ambulance: '000', fire: '000', general: '000' },
    visaResources: [
      { name: 'Australian Immigration', url: 'https://immi.homeaffairs.gov.au', type: 'immigration' },
      { name: 'ETA Application', url: 'https://www.eta.homeaffairs.gov.au', type: 'visa' },
    ],
    currencyCode: 'AUD',
    drivingSide: 'left',
    timezone: 'Australia/Sydney',
  },
  NZ: {
    emergencyNumbers: { police: '111', ambulance: '111', fire: '111', general: '111' },
    visaResources: [
      { name: 'Immigration New Zealand', url: 'https://www.immigration.govt.nz', type: 'immigration' },
      { name: 'NZeTA', url: 'https://nzeta.immigration.govt.nz', type: 'visa' },
    ],
    currencyCode: 'NZD',
    drivingSide: 'left',
    timezone: 'Pacific/Auckland',
  },
  CA: {
    emergencyNumbers: { police: '911', ambulance: '911', fire: '911', general: '911' },
    visaResources: [
      { name: 'IRCC Canada', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html', type: 'immigration' },
      { name: 'eTA Canada', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html', type: 'visa' },
    ],
    currencyCode: 'CAD',
    drivingSide: 'right',
    timezone: 'America/Toronto',
  },
  MX: {
    emergencyNumbers: { police: '911', ambulance: '911', fire: '911', general: '911', tourist: '078' },
    visaResources: [
      { name: 'INM Mexico', url: 'https://www.gob.mx/inm', type: 'immigration' },
    ],
    currencyCode: 'MXN',
    drivingSide: 'right',
    timezone: 'America/Mexico_City',
  },
  BR: {
    emergencyNumbers: { police: '190', ambulance: '192', fire: '193', general: '190', tourist: '0800-999-0220' },
    visaResources: [
      { name: 'Brazil Visa Portal', url: 'https://www.gov.br/mre/pt-br/assuntos/portal-consular/vistos', type: 'visa' },
    ],
    currencyCode: 'BRL',
    drivingSide: 'right',
    timezone: 'America/Sao_Paulo',
  },
  AR: {
    emergencyNumbers: { police: '911', ambulance: '107', fire: '100', general: '911', tourist: '0800-999-5000' },
    visaResources: [
      { name: 'Argentina Migration', url: 'https://www.argentina.gob.ar/interior/migraciones', type: 'immigration' },
    ],
    currencyCode: 'ARS',
    drivingSide: 'right',
    timezone: 'America/Argentina/Buenos_Aires',
  },
  CL: {
    emergencyNumbers: { police: '133', ambulance: '131', fire: '132', general: '133' },
    visaResources: [
      { name: 'Chile PDI', url: 'https://www.pdichile.cl', type: 'immigration' },
    ],
    currencyCode: 'CLP',
    drivingSide: 'right',
    timezone: 'America/Santiago',
  },
  CO: {
    emergencyNumbers: { police: '123', ambulance: '123', fire: '119', general: '123' },
    visaResources: [
      { name: 'Colombia Migration', url: 'https://www.migracioncolombia.gov.co', type: 'immigration' },
    ],
    currencyCode: 'COP',
    drivingSide: 'right',
    timezone: 'America/Bogota',
  },
  PE: {
    emergencyNumbers: { police: '105', ambulance: '117', fire: '116', general: '105', tourist: '0800-22221' },
    visaResources: [
      { name: 'Peru Migration', url: 'https://www.migraciones.gob.pe', type: 'immigration' },
    ],
    currencyCode: 'PEN',
    drivingSide: 'right',
    timezone: 'America/Lima',
  },
  AE: {
    emergencyNumbers: { police: '999', ambulance: '998', fire: '997', general: '999' },
    visaResources: [
      { name: 'UAE ICP', url: 'https://icp.gov.ae/en/', type: 'immigration' },
      { name: 'Dubai Visa', url: 'https://www.gdrfad.gov.ae', type: 'visa' },
    ],
    currencyCode: 'AED',
    drivingSide: 'right',
    timezone: 'Asia/Dubai',
  },
  SA: {
    emergencyNumbers: { police: '999', ambulance: '997', fire: '998', general: '911' },
    visaResources: [
      { name: 'Saudi eVisa', url: 'https://visa.visitsaudi.com', type: 'visa' },
    ],
    currencyCode: 'SAR',
    drivingSide: 'right',
    timezone: 'Asia/Riyadh',
  },
  QA: {
    emergencyNumbers: { police: '999', ambulance: '999', fire: '999', general: '999' },
    visaResources: [
      { name: 'Qatar Portal', url: 'https://portal.moi.gov.qa', type: 'immigration' },
    ],
    currencyCode: 'QAR',
    drivingSide: 'right',
    timezone: 'Asia/Qatar',
  },
  EG: {
    emergencyNumbers: { police: '122', ambulance: '123', fire: '180', general: '122', tourist: '126' },
    visaResources: [
      { name: 'Egypt eVisa', url: 'https://visa2egypt.gov.eg', type: 'visa' },
    ],
    currencyCode: 'EGP',
    drivingSide: 'right',
    timezone: 'Africa/Cairo',
  },
  ZA: {
    emergencyNumbers: { police: '10111', ambulance: '10177', fire: '10177', general: '112' },
    visaResources: [
      { name: 'DHA South Africa', url: 'http://www.dha.gov.za', type: 'immigration' },
    ],
    currencyCode: 'ZAR',
    drivingSide: 'left',
    timezone: 'Africa/Johannesburg',
  },
  KE: {
    emergencyNumbers: { police: '999', ambulance: '999', fire: '999', general: '999', tourist: '0800 723 253' },
    visaResources: [
      { name: 'Kenya eTA', url: 'https://www.etakenya.go.ke', type: 'visa' },
    ],
    currencyCode: 'KES',
    drivingSide: 'left',
    timezone: 'Africa/Nairobi',
  },
  MA: {
    emergencyNumbers: { police: '19', ambulance: '15', fire: '15', general: '112' },
    visaResources: [
      { name: 'Morocco eVisa', url: 'https://www.consulat.ma/en', type: 'visa' },
    ],
    currencyCode: 'MAD',
    drivingSide: 'right',
    timezone: 'Africa/Casablanca',
  },
  TR: {
    emergencyNumbers: { police: '155', ambulance: '112', fire: '110', general: '112', tourist: '153' },
    visaResources: [
      { name: 'Turkey eVisa', url: 'https://www.evisa.gov.tr/en/', type: 'visa' },
    ],
    currencyCode: 'TRY',
    drivingSide: 'right',
    timezone: 'Europe/Istanbul',
  },
  IL: {
    emergencyNumbers: { police: '100', ambulance: '101', fire: '102', general: '100' },
    visaResources: [
      { name: 'Israel PIBA', url: 'https://www.gov.il/en/departments/immigration_authority', type: 'immigration' },
    ],
    currencyCode: 'ILS',
    drivingSide: 'right',
    timezone: 'Asia/Jerusalem',
  },
  RU: {
    emergencyNumbers: { police: '102', ambulance: '103', fire: '101', general: '112' },
    visaResources: [
      { name: 'Russia eVisa', url: 'https://electronic-visa.kdmid.ru', type: 'visa' },
    ],
    currencyCode: 'RUB',
    drivingSide: 'right',
    timezone: 'Europe/Moscow',
  },
  UA: {
    emergencyNumbers: { police: '102', ambulance: '103', fire: '101', general: '112' },
    visaResources: [
      { name: 'Ukraine Migration', url: 'https://dmsu.gov.ua/en-home.html', type: 'immigration' },
    ],
    currencyCode: 'UAH',
    drivingSide: 'right',
    timezone: 'Europe/Kiev',
  },
  HR: {
    emergencyNumbers: { police: '192', ambulance: '194', fire: '193', general: '112' },
    visaResources: [
      { name: 'Croatia MUP', url: 'https://mup.gov.hr/aliens-702/702', type: 'immigration' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Zagreb',
  },
  RO: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Romania MAE', url: 'https://www.mae.ro/en/node/2084', type: 'visa' },
    ],
    currencyCode: 'RON',
    drivingSide: 'right',
    timezone: 'Europe/Bucharest',
  },
  BG: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Bulgaria MFA', url: 'https://www.mfa.bg/en/services-travel/consular-services/visas', type: 'visa' },
    ],
    currencyCode: 'BGN',
    drivingSide: 'right',
    timezone: 'Europe/Sofia',
  },
  RS: {
    emergencyNumbers: { police: '192', ambulance: '194', fire: '193', general: '112' },
    visaResources: [
      { name: 'Serbia MFA', url: 'https://www.mfa.gov.rs/en/citizens/travel-serbia/visa-regime', type: 'visa' },
    ],
    currencyCode: 'RSD',
    drivingSide: 'right',
    timezone: 'Europe/Belgrade',
  },
  GE: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Georgia PSDA', url: 'https://sda.gov.ge/?lang=en', type: 'immigration' },
    ],
    currencyCode: 'GEL',
    drivingSide: 'right',
    timezone: 'Asia/Tbilisi',
  },
  AM: {
    emergencyNumbers: { police: '102', ambulance: '103', fire: '101', general: '911' },
    visaResources: [
      { name: 'Armenia eVisa', url: 'https://evisa.mfa.am', type: 'visa' },
    ],
    currencyCode: 'AMD',
    drivingSide: 'right',
    timezone: 'Asia/Yerevan',
  },
  AZ: {
    emergencyNumbers: { police: '102', ambulance: '103', fire: '101', general: '112' },
    visaResources: [
      { name: 'ASAN Visa', url: 'https://evisa.gov.az', type: 'visa' },
    ],
    currencyCode: 'AZN',
    drivingSide: 'right',
    timezone: 'Asia/Baku',
  },
  KZ: {
    emergencyNumbers: { police: '102', ambulance: '103', fire: '101', general: '112' },
    visaResources: [
      { name: 'Kazakhstan eVisa', url: 'https://www.vmp.gov.kz', type: 'visa' },
    ],
    currencyCode: 'KZT',
    drivingSide: 'right',
    timezone: 'Asia/Almaty',
  },
  UZ: {
    emergencyNumbers: { police: '102', ambulance: '103', fire: '101', general: '1050' },
    visaResources: [
      { name: 'Uzbekistan eVisa', url: 'https://e-visa.gov.uz/main', type: 'visa' },
    ],
    currencyCode: 'UZS',
    drivingSide: 'right',
    timezone: 'Asia/Tashkent',
  },
  LK: {
    emergencyNumbers: { police: '119', ambulance: '110', fire: '111', general: '119', tourist: '1912' },
    visaResources: [
      { name: 'Sri Lanka ETA', url: 'https://www.eta.gov.lk', type: 'visa' },
    ],
    currencyCode: 'LKR',
    drivingSide: 'left',
    timezone: 'Asia/Colombo',
  },
  NP: {
    emergencyNumbers: { police: '100', ambulance: '102', fire: '101', general: '100', tourist: '1144' },
    visaResources: [
      { name: 'Nepal Immigration', url: 'https://immigration.gov.np', type: 'immigration' },
    ],
    currencyCode: 'NPR',
    drivingSide: 'left',
    timezone: 'Asia/Kathmandu',
  },
  BD: {
    emergencyNumbers: { police: '999', ambulance: '999', fire: '999', general: '999' },
    visaResources: [
      { name: 'Bangladesh Immigration', url: 'https://www.dip.gov.bd', type: 'immigration' },
    ],
    currencyCode: 'BDT',
    drivingSide: 'left',
    timezone: 'Asia/Dhaka',
  },
  MM: {
    emergencyNumbers: { police: '199', ambulance: '192', fire: '191', general: '199' },
    visaResources: [
      { name: 'Myanmar eVisa', url: 'https://evisa.moip.gov.mm', type: 'visa' },
    ],
    currencyCode: 'MMK',
    drivingSide: 'right',
    timezone: 'Asia/Yangon',
  },
  KH: {
    emergencyNumbers: { police: '117', ambulance: '119', fire: '118', general: '117', tourist: '1200' },
    visaResources: [
      { name: 'Cambodia eVisa', url: 'https://www.evisa.gov.kh', type: 'visa' },
    ],
    currencyCode: 'KHR',
    drivingSide: 'right',
    timezone: 'Asia/Phnom_Penh',
  },
  LA: {
    emergencyNumbers: { police: '191', ambulance: '195', fire: '190', general: '191' },
    visaResources: [
      { name: 'Laos eVisa', url: 'https://laoevisa.gov.la', type: 'visa' },
    ],
    currencyCode: 'LAK',
    drivingSide: 'right',
    timezone: 'Asia/Vientiane',
  },
  MV: {
    emergencyNumbers: { police: '119', ambulance: '102', fire: '118', general: '119' },
    visaResources: [
      { name: 'Maldives Immigration', url: 'https://immigration.gov.mv', type: 'immigration' },
    ],
    currencyCode: 'MVR',
    drivingSide: 'left',
    timezone: 'Indian/Maldives',
  },
  BT: {
    emergencyNumbers: { police: '113', ambulance: '112', fire: '110', general: '112' },
    visaResources: [
      { name: 'Bhutan Tourism', url: 'https://www.tourism.gov.bt', type: 'visa' },
    ],
    currencyCode: 'BTN',
    drivingSide: 'left',
    timezone: 'Asia/Thimphu',
  },
  MN: {
    emergencyNumbers: { police: '102', ambulance: '103', fire: '101', general: '105' },
    visaResources: [
      { name: 'Mongolia Immigration', url: 'https://immigration.gov.mn/en/', type: 'immigration' },
    ],
    currencyCode: 'MNT',
    drivingSide: 'right',
    timezone: 'Asia/Ulaanbaatar',
  },
  PA: {
    emergencyNumbers: { police: '104', ambulance: '911', fire: '103', general: '911' },
    visaResources: [
      { name: 'Panama Migration', url: 'https://www.migracion.gob.pa', type: 'immigration' },
    ],
    currencyCode: 'PAB',
    drivingSide: 'right',
    timezone: 'America/Panama',
  },
  CR: {
    emergencyNumbers: { police: '911', ambulance: '911', fire: '911', general: '911' },
    visaResources: [
      { name: 'Costa Rica Migration', url: 'https://www.migracion.go.cr', type: 'immigration' },
    ],
    currencyCode: 'CRC',
    drivingSide: 'right',
    timezone: 'America/Costa_Rica',
  },
  EC: {
    emergencyNumbers: { police: '911', ambulance: '911', fire: '911', general: '911' },
    visaResources: [
      { name: 'Ecuador Migration', url: 'https://www.cancilleria.gob.ec', type: 'immigration' },
    ],
    currencyCode: 'USD',
    drivingSide: 'right',
    timezone: 'America/Guayaquil',
  },
  UY: {
    emergencyNumbers: { police: '911', ambulance: '105', fire: '104', general: '911' },
    visaResources: [
      { name: 'Uruguay Migration', url: 'https://migracion.minterior.gub.uy', type: 'immigration' },
    ],
    currencyCode: 'UYU',
    drivingSide: 'right',
    timezone: 'America/Montevideo',
  },
  PY: {
    emergencyNumbers: { police: '911', ambulance: '141', fire: '132', general: '911' },
    visaResources: [
      { name: 'Paraguay Migration', url: 'https://www.migraciones.gov.py', type: 'immigration' },
    ],
    currencyCode: 'PYG',
    drivingSide: 'right',
    timezone: 'America/Asuncion',
  },
  BO: {
    emergencyNumbers: { police: '110', ambulance: '118', fire: '119', general: '110' },
    visaResources: [
      { name: 'Bolivia Migration', url: 'https://www.migracion.gob.bo', type: 'immigration' },
    ],
    currencyCode: 'BOB',
    drivingSide: 'right',
    timezone: 'America/La_Paz',
  },
  IS: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Directorate of Immigration', url: 'https://utl.is/index.php/en/', type: 'immigration' },
    ],
    currencyCode: 'ISK',
    drivingSide: 'right',
    timezone: 'Atlantic/Reykjavik',
  },
  LU: {
    emergencyNumbers: { police: '113', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Luxembourg Immigration', url: 'https://maee.gouvernement.lu/en/services-aux-citoyens/visas.html', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Luxembourg',
  },
  MT: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Identity Malta', url: 'https://identitymalta.com', type: 'immigration' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'left',
    timezone: 'Europe/Malta',
  },
  CY: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Cyprus Civil Registry', url: 'http://www.moi.gov.cy/moi/crmd/crmd.nsf', type: 'immigration' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'left',
    timezone: 'Asia/Nicosia',
  },
  EE: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Estonia PPA', url: 'https://www.politsei.ee/en/', type: 'immigration' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Tallinn',
  },
  LV: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Latvia PMLP', url: 'https://www.pmlp.gov.lv/en', type: 'immigration' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Riga',
  },
  LT: {
    emergencyNumbers: { police: '112', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Lithuania Migration', url: 'https://www.migracija.lt/en', type: 'immigration' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Vilnius',
  },
  SK: {
    emergencyNumbers: { police: '158', ambulance: '155', fire: '150', general: '112' },
    visaResources: [
      { name: 'Slovakia MFA', url: 'https://www.mzv.sk/web/en/consular-info/visa-information', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Bratislava',
  },
  SI: {
    emergencyNumbers: { police: '113', ambulance: '112', fire: '112', general: '112' },
    visaResources: [
      { name: 'Slovenia MFA', url: 'https://www.gov.si/en/topics/entry-and-residence/', type: 'immigration' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Ljubljana',
  },
  ME: {
    emergencyNumbers: { police: '122', ambulance: '124', fire: '123', general: '112' },
    visaResources: [
      { name: 'Montenegro MFA', url: 'https://www.gov.me/en/diplomatic-missions/visa-requirements', type: 'visa' },
    ],
    currencyCode: 'EUR',
    drivingSide: 'right',
    timezone: 'Europe/Podgorica',
  },
  AL: {
    emergencyNumbers: { police: '129', ambulance: '127', fire: '128', general: '112' },
    visaResources: [
      { name: 'Albania e-Visa', url: 'https://e-visa.al', type: 'visa' },
    ],
    currencyCode: 'ALL',
    drivingSide: 'right',
    timezone: 'Europe/Tirane',
  },
  MK: {
    emergencyNumbers: { police: '192', ambulance: '194', fire: '193', general: '112' },
    visaResources: [
      { name: 'North Macedonia MFA', url: 'https://www.mfa.gov.mk/en/page/8/visa-information', type: 'visa' },
    ],
    currencyCode: 'MKD',
    drivingSide: 'right',
    timezone: 'Europe/Skopje',
  },
  BA: {
    emergencyNumbers: { police: '122', ambulance: '124', fire: '123', general: '112' },
    visaResources: [
      { name: 'Bosnia MFA', url: 'http://www.mvp.gov.ba/konzularne_informacije/vize/', type: 'visa' },
    ],
    currencyCode: 'BAM',
    drivingSide: 'right',
    timezone: 'Europe/Sarajevo',
  },
  MD: {
    emergencyNumbers: { police: '902', ambulance: '903', fire: '901', general: '112' },
    visaResources: [
      { name: 'Moldova BMA', url: 'https://bma.gov.md/en', type: 'immigration' },
    ],
    currencyCode: 'MDL',
    drivingSide: 'right',
    timezone: 'Europe/Chisinau',
  },
  BY: {
    emergencyNumbers: { police: '102', ambulance: '103', fire: '101', general: '112' },
    visaResources: [
      { name: 'Belarus MFA', url: 'https://mfa.gov.by/en/visa/', type: 'visa' },
    ],
    currencyCode: 'BYN',
    drivingSide: 'right',
    timezone: 'Europe/Minsk',
  },
};

export function getCountryInfo(code: string): CountryInfo | undefined {
  return COUNTRY_INFO[code];
}
