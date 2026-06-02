/**
 * Country Name Localization Utility
 * Self-contained country name translations to avoid Metro bundler issues
 * with dynamic imports in third-party libraries.
 * 
 * Covers all Schengen countries + major travel destinations
 */

type CountryTranslations = { [langCode: string]: { [countryCode: string]: string } };

// Comprehensive country name translations for all supported languages
const COUNTRY_NAMES: CountryTranslations = {
  en: {
    // Schengen Area
    AT: 'Austria', BE: 'Belgium', HR: 'Croatia', CZ: 'Czech Republic', DK: 'Denmark',
    EE: 'Estonia', FI: 'Finland', FR: 'France', DE: 'Germany', GR: 'Greece',
    HU: 'Hungary', IS: 'Iceland', IT: 'Italy', LV: 'Latvia', LI: 'Liechtenstein',
    LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'Netherlands', NO: 'Norway',
    PL: 'Poland', PT: 'Portugal', SK: 'Slovakia', SI: 'Slovenia', ES: 'Spain',
    SE: 'Sweden', CH: 'Switzerland',
    // Other European
    AL: 'Albania', AD: 'Andorra', BY: 'Belarus', BA: 'Bosnia and Herzegovina',
    BG: 'Bulgaria', CY: 'Cyprus', GB: 'United Kingdom', IE: 'Ireland', XK: 'Kosovo',
    MD: 'Moldova', MC: 'Monaco', ME: 'Montenegro', MK: 'North Macedonia', RO: 'Romania',
    RU: 'Russia', SM: 'San Marino', RS: 'Serbia', TR: 'Turkey', UA: 'Ukraine', VA: 'Vatican City',
    // Americas
    US: 'United States', CA: 'Canada', MX: 'Mexico', BR: 'Brazil', AR: 'Argentina',
    CL: 'Chile', CO: 'Colombia', PE: 'Peru', VE: 'Venezuela', EC: 'Ecuador',
    BO: 'Bolivia', PY: 'Paraguay', UY: 'Uruguay', PA: 'Panama', CR: 'Costa Rica',
    CU: 'Cuba', DO: 'Dominican Republic', PR: 'Puerto Rico', JM: 'Jamaica', HT: 'Haiti',
    TT: 'Trinidad and Tobago', BB: 'Barbados', BS: 'Bahamas',
    // Asia Pacific
    JP: 'Japan', KR: 'South Korea', CN: 'China', TW: 'Taiwan', HK: 'Hong Kong',
    SG: 'Singapore', MY: 'Malaysia', TH: 'Thailand', ID: 'Indonesia', VN: 'Vietnam',
    PH: 'Philippines', IN: 'India', PK: 'Pakistan', BD: 'Bangladesh', LK: 'Sri Lanka',
    NP: 'Nepal', MM: 'Myanmar', KH: 'Cambodia', LA: 'Laos', BT: 'Bhutan',
    MV: 'Maldives', MN: 'Mongolia', AU: 'Australia', NZ: 'New Zealand',
    // Middle East & Africa
    AE: 'United Arab Emirates', SA: 'Saudi Arabia', QA: 'Qatar', KW: 'Kuwait',
    BH: 'Bahrain', OM: 'Oman', IL: 'Israel', JO: 'Jordan', LB: 'Lebanon',
    EG: 'Egypt', MA: 'Morocco', TN: 'Tunisia', DZ: 'Algeria', ZA: 'South Africa',
    KE: 'Kenya', NG: 'Nigeria', GH: 'Ghana', ET: 'Ethiopia', TZ: 'Tanzania',
    // Central Asia & Caucasus
    GE: 'Georgia', AM: 'Armenia', AZ: 'Azerbaijan', KZ: 'Kazakhstan', UZ: 'Uzbekistan',
    AF: 'Afghanistan',
  },
  es: {
    // Schengen Area
    AT: 'Austria', BE: 'Bélgica', HR: 'Croacia', CZ: 'República Checa', DK: 'Dinamarca',
    EE: 'Estonia', FI: 'Finlandia', FR: 'Francia', DE: 'Alemania', GR: 'Grecia',
    HU: 'Hungría', IS: 'Islandia', IT: 'Italia', LV: 'Letonia', LI: 'Liechtenstein',
    LT: 'Lituania', LU: 'Luxemburgo', MT: 'Malta', NL: 'Países Bajos', NO: 'Noruega',
    PL: 'Polonia', PT: 'Portugal', SK: 'Eslovaquia', SI: 'Eslovenia', ES: 'España',
    SE: 'Suecia', CH: 'Suiza',
    // Other European
    AL: 'Albania', AD: 'Andorra', BY: 'Bielorrusia', BA: 'Bosnia y Herzegovina',
    BG: 'Bulgaria', CY: 'Chipre', GB: 'Reino Unido', IE: 'Irlanda', XK: 'Kosovo',
    MD: 'Moldavia', MC: 'Mónaco', ME: 'Montenegro', MK: 'Macedonia del Norte', RO: 'Rumania',
    RU: 'Rusia', SM: 'San Marino', RS: 'Serbia', TR: 'Turquía', UA: 'Ucrania', VA: 'Ciudad del Vaticano',
    // Americas
    US: 'Estados Unidos', CA: 'Canadá', MX: 'México', BR: 'Brasil', AR: 'Argentina',
    CL: 'Chile', CO: 'Colombia', PE: 'Perú', VE: 'Venezuela', EC: 'Ecuador',
    BO: 'Bolivia', PY: 'Paraguay', UY: 'Uruguay', PA: 'Panamá', CR: 'Costa Rica',
    CU: 'Cuba', DO: 'República Dominicana', PR: 'Puerto Rico', JM: 'Jamaica', HT: 'Haití',
    TT: 'Trinidad y Tobago', BB: 'Barbados', BS: 'Bahamas',
    // Asia Pacific
    JP: 'Japón', KR: 'Corea del Sur', CN: 'China', TW: 'Taiwán', HK: 'Hong Kong',
    SG: 'Singapur', MY: 'Malasia', TH: 'Tailandia', ID: 'Indonesia', VN: 'Vietnam',
    PH: 'Filipinas', IN: 'India', PK: 'Pakistán', BD: 'Bangladesh', LK: 'Sri Lanka',
    NP: 'Nepal', MM: 'Myanmar', KH: 'Camboya', LA: 'Laos', BT: 'Bután',
    MV: 'Maldivas', MN: 'Mongolia', AU: 'Australia', NZ: 'Nueva Zelanda',
    // Middle East & Africa
    AE: 'Emiratos Árabes Unidos', SA: 'Arabia Saudita', QA: 'Catar', KW: 'Kuwait',
    BH: 'Bahréin', OM: 'Omán', IL: 'Israel', JO: 'Jordania', LB: 'Líbano',
    EG: 'Egipto', MA: 'Marruecos', TN: 'Túnez', DZ: 'Argelia', ZA: 'Sudáfrica',
    KE: 'Kenia', NG: 'Nigeria', GH: 'Ghana', ET: 'Etiopía', TZ: 'Tanzania',
    // Central Asia & Caucasus
    GE: 'Georgia', AM: 'Armenia', AZ: 'Azerbaiyán', KZ: 'Kazajistán', UZ: 'Uzbekistán',
    AF: 'Afganistán',
  },
  fr: {
    // Schengen Area
    AT: 'Autriche', BE: 'Belgique', HR: 'Croatie', CZ: 'République tchèque', DK: 'Danemark',
    EE: 'Estonie', FI: 'Finlande', FR: 'France', DE: 'Allemagne', GR: 'Grèce',
    HU: 'Hongrie', IS: 'Islande', IT: 'Italie', LV: 'Lettonie', LI: 'Liechtenstein',
    LT: 'Lituanie', LU: 'Luxembourg', MT: 'Malte', NL: 'Pays-Bas', NO: 'Norvège',
    PL: 'Pologne', PT: 'Portugal', SK: 'Slovaquie', SI: 'Slovénie', ES: 'Espagne',
    SE: 'Suède', CH: 'Suisse',
    // Other European
    AL: 'Albanie', AD: 'Andorre', BY: 'Biélorussie', BA: 'Bosnie-Herzégovine',
    BG: 'Bulgarie', CY: 'Chypre', GB: 'Royaume-Uni', IE: 'Irlande', XK: 'Kosovo',
    MD: 'Moldavie', MC: 'Monaco', ME: 'Monténégro', MK: 'Macédoine du Nord', RO: 'Roumanie',
    RU: 'Russie', SM: 'Saint-Marin', RS: 'Serbie', TR: 'Turquie', UA: 'Ukraine', VA: 'Vatican',
    // Americas
    US: 'États-Unis', CA: 'Canada', MX: 'Mexique', BR: 'Brésil', AR: 'Argentine',
    CL: 'Chili', CO: 'Colombie', PE: 'Pérou', VE: 'Venezuela', EC: 'Équateur',
    BO: 'Bolivie', PY: 'Paraguay', UY: 'Uruguay', PA: 'Panama', CR: 'Costa Rica',
    CU: 'Cuba', DO: 'République dominicaine', PR: 'Porto Rico', JM: 'Jamaïque', HT: 'Haïti',
    TT: 'Trinité-et-Tobago', BB: 'Barbade', BS: 'Bahamas',
    // Asia Pacific
    JP: 'Japon', KR: 'Corée du Sud', CN: 'Chine', TW: 'Taïwan', HK: 'Hong Kong',
    SG: 'Singapour', MY: 'Malaisie', TH: 'Thaïlande', ID: 'Indonésie', VN: 'Vietnam',
    PH: 'Philippines', IN: 'Inde', PK: 'Pakistan', BD: 'Bangladesh', LK: 'Sri Lanka',
    NP: 'Népal', MM: 'Myanmar', KH: 'Cambodge', LA: 'Laos', BT: 'Bhoutan',
    MV: 'Maldives', MN: 'Mongolie', AU: 'Australie', NZ: 'Nouvelle-Zélande',
    // Middle East & Africa
    AE: 'Émirats arabes unis', SA: 'Arabie saoudite', QA: 'Qatar', KW: 'Koweït',
    BH: 'Bahreïn', OM: 'Oman', IL: 'Israël', JO: 'Jordanie', LB: 'Liban',
    EG: 'Égypte', MA: 'Maroc', TN: 'Tunisie', DZ: 'Algérie', ZA: 'Afrique du Sud',
    KE: 'Kenya', NG: 'Nigeria', GH: 'Ghana', ET: 'Éthiopie', TZ: 'Tanzanie',
    // Central Asia & Caucasus
    GE: 'Géorgie', AM: 'Arménie', AZ: 'Azerbaïdjan', KZ: 'Kazakhstan', UZ: 'Ouzbékistan',
    AF: 'Afghanistan',
  },
  de: {
    // Schengen Area
    AT: 'Österreich', BE: 'Belgien', HR: 'Kroatien', CZ: 'Tschechien', DK: 'Dänemark',
    EE: 'Estland', FI: 'Finnland', FR: 'Frankreich', DE: 'Deutschland', GR: 'Griechenland',
    HU: 'Ungarn', IS: 'Island', IT: 'Italien', LV: 'Lettland', LI: 'Liechtenstein',
    LT: 'Litauen', LU: 'Luxemburg', MT: 'Malta', NL: 'Niederlande', NO: 'Norwegen',
    PL: 'Polen', PT: 'Portugal', SK: 'Slowakei', SI: 'Slowenien', ES: 'Spanien',
    SE: 'Schweden', CH: 'Schweiz',
    // Other European
    AL: 'Albanien', AD: 'Andorra', BY: 'Belarus', BA: 'Bosnien und Herzegowina',
    BG: 'Bulgarien', CY: 'Zypern', GB: 'Vereinigtes Königreich', IE: 'Irland', XK: 'Kosovo',
    MD: 'Moldau', MC: 'Monaco', ME: 'Montenegro', MK: 'Nordmazedonien', RO: 'Rumänien',
    RU: 'Russland', SM: 'San Marino', RS: 'Serbien', TR: 'Türkei', UA: 'Ukraine', VA: 'Vatikanstadt',
    // Americas
    US: 'Vereinigte Staaten', CA: 'Kanada', MX: 'Mexiko', BR: 'Brasilien', AR: 'Argentinien',
    CL: 'Chile', CO: 'Kolumbien', PE: 'Peru', VE: 'Venezuela', EC: 'Ecuador',
    BO: 'Bolivien', PY: 'Paraguay', UY: 'Uruguay', PA: 'Panama', CR: 'Costa Rica',
    CU: 'Kuba', DO: 'Dominikanische Republik', PR: 'Puerto Rico', JM: 'Jamaika', HT: 'Haiti',
    TT: 'Trinidad und Tobago', BB: 'Barbados', BS: 'Bahamas',
    // Asia Pacific
    JP: 'Japan', KR: 'Südkorea', CN: 'China', TW: 'Taiwan', HK: 'Hongkong',
    SG: 'Singapur', MY: 'Malaysia', TH: 'Thailand', ID: 'Indonesien', VN: 'Vietnam',
    PH: 'Philippinen', IN: 'Indien', PK: 'Pakistan', BD: 'Bangladesch', LK: 'Sri Lanka',
    NP: 'Nepal', MM: 'Myanmar', KH: 'Kambodscha', LA: 'Laos', BT: 'Bhutan',
    MV: 'Malediven', MN: 'Mongolei', AU: 'Australien', NZ: 'Neuseeland',
    // Middle East & Africa
    AE: 'Vereinigte Arabische Emirate', SA: 'Saudi-Arabien', QA: 'Katar', KW: 'Kuwait',
    BH: 'Bahrain', OM: 'Oman', IL: 'Israel', JO: 'Jordanien', LB: 'Libanon',
    EG: 'Ägypten', MA: 'Marokko', TN: 'Tunesien', DZ: 'Algerien', ZA: 'Südafrika',
    KE: 'Kenia', NG: 'Nigeria', GH: 'Ghana', ET: 'Äthiopien', TZ: 'Tansania',
    // Central Asia & Caucasus
    GE: 'Georgien', AM: 'Armenien', AZ: 'Aserbaidschan', KZ: 'Kasachstan', UZ: 'Usbekistan',
    AF: 'Afghanistan',
  },
  pt: {
    // Schengen Area
    AT: 'Áustria', BE: 'Bélgica', HR: 'Croácia', CZ: 'República Tcheca', DK: 'Dinamarca',
    EE: 'Estônia', FI: 'Finlândia', FR: 'França', DE: 'Alemanha', GR: 'Grécia',
    HU: 'Hungria', IS: 'Islândia', IT: 'Itália', LV: 'Letônia', LI: 'Liechtenstein',
    LT: 'Lituânia', LU: 'Luxemburgo', MT: 'Malta', NL: 'Países Baixos', NO: 'Noruega',
    PL: 'Polônia', PT: 'Portugal', SK: 'Eslováquia', SI: 'Eslovênia', ES: 'Espanha',
    SE: 'Suécia', CH: 'Suíça',
    // Other European
    AL: 'Albânia', AD: 'Andorra', BY: 'Belarus', BA: 'Bósnia e Herzegovina',
    BG: 'Bulgária', CY: 'Chipre', GB: 'Reino Unido', IE: 'Irlanda', XK: 'Kosovo',
    MD: 'Moldávia', MC: 'Mônaco', ME: 'Montenegro', MK: 'Macedônia do Norte', RO: 'Romênia',
    RU: 'Rússia', SM: 'San Marino', RS: 'Sérvia', TR: 'Turquia', UA: 'Ucrânia', VA: 'Vaticano',
    // Americas
    US: 'Estados Unidos', CA: 'Canadá', MX: 'México', BR: 'Brasil', AR: 'Argentina',
    CL: 'Chile', CO: 'Colômbia', PE: 'Peru', VE: 'Venezuela', EC: 'Equador',
    BO: 'Bolívia', PY: 'Paraguai', UY: 'Uruguai', PA: 'Panamá', CR: 'Costa Rica',
    CU: 'Cuba', DO: 'República Dominicana', PR: 'Porto Rico', JM: 'Jamaica', HT: 'Haiti',
    TT: 'Trinidad e Tobago', BB: 'Barbados', BS: 'Bahamas',
    // Asia Pacific
    JP: 'Japão', KR: 'Coreia do Sul', CN: 'China', TW: 'Taiwan', HK: 'Hong Kong',
    SG: 'Singapura', MY: 'Malásia', TH: 'Tailândia', ID: 'Indonésia', VN: 'Vietnã',
    PH: 'Filipinas', IN: 'Índia', PK: 'Paquistão', BD: 'Bangladesh', LK: 'Sri Lanka',
    NP: 'Nepal', MM: 'Myanmar', KH: 'Camboja', LA: 'Laos', BT: 'Butão',
    MV: 'Maldivas', MN: 'Mongólia', AU: 'Austrália', NZ: 'Nova Zelândia',
    // Middle East & Africa
    AE: 'Emirados Árabes Unidos', SA: 'Arábia Saudita', QA: 'Catar', KW: 'Kuwait',
    BH: 'Bahrein', OM: 'Omã', IL: 'Israel', JO: 'Jordânia', LB: 'Líbano',
    EG: 'Egito', MA: 'Marrocos', TN: 'Tunísia', DZ: 'Argélia', ZA: 'África do Sul',
    KE: 'Quênia', NG: 'Nigéria', GH: 'Gana', ET: 'Etiópia', TZ: 'Tanzânia',
    // Central Asia & Caucasus
    GE: 'Geórgia', AM: 'Armênia', AZ: 'Azerbaijão', KZ: 'Cazaquistão', UZ: 'Uzbequistão',
    AF: 'Afeganistão',
  },
  zh: {
    // Schengen Area
    AT: '奥地利', BE: '比利时', HR: '克罗地亚', CZ: '捷克', DK: '丹麦',
    EE: '爱沙尼亚', FI: '芬兰', FR: '法国', DE: '德国', GR: '希腊',
    HU: '匈牙利', IS: '冰岛', IT: '意大利', LV: '拉脱维亚', LI: '列支敦士登',
    LT: '立陶宛', LU: '卢森堡', MT: '马耳他', NL: '荷兰', NO: '挪威',
    PL: '波兰', PT: '葡萄牙', SK: '斯洛伐克', SI: '斯洛文尼亚', ES: '西班牙',
    SE: '瑞典', CH: '瑞士',
    // Other European
    AL: '阿尔巴尼亚', AD: '安道尔', BY: '白俄罗斯', BA: '波斯尼亚和黑塞哥维那',
    BG: '保加利亚', CY: '塞浦路斯', GB: '英国', IE: '爱尔兰', XK: '科索沃',
    MD: '摩尔多瓦', MC: '摩纳哥', ME: '黑山', MK: '北马其顿', RO: '罗马尼亚',
    RU: '俄罗斯', SM: '圣马力诺', RS: '塞尔维亚', TR: '土耳其', UA: '乌克兰', VA: '梵蒂冈',
    // Americas
    US: '美国', CA: '加拿大', MX: '墨西哥', BR: '巴西', AR: '阿根廷',
    CL: '智利', CO: '哥伦比亚', PE: '秘鲁', VE: '委内瑞拉', EC: '厄瓜多尔',
    BO: '玻利维亚', PY: '巴拉圭', UY: '乌拉圭', PA: '巴拿马', CR: '哥斯达黎加',
    CU: '古巴', DO: '多米尼加', PR: '波多黎各', JM: '牙买加', HT: '海地',
    TT: '特立尼达和多巴哥', BB: '巴巴多斯', BS: '巴哈马',
    // Asia Pacific
    JP: '日本', KR: '韩国', CN: '中国', TW: '台湾', HK: '香港',
    SG: '新加坡', MY: '马来西亚', TH: '泰国', ID: '印度尼西亚', VN: '越南',
    PH: '菲律宾', IN: '印度', PK: '巴基斯坦', BD: '孟加拉国', LK: '斯里兰卡',
    NP: '尼泊尔', MM: '缅甸', KH: '柬埔寨', LA: '老挝', BT: '不丹',
    MV: '马尔代夫', MN: '蒙古', AU: '澳大利亚', NZ: '新西兰',
    // Middle East & Africa
    AE: '阿联酋', SA: '沙特阿拉伯', QA: '卡塔尔', KW: '科威特',
    BH: '巴林', OM: '阿曼', IL: '以色列', JO: '约旦', LB: '黎巴嫩',
    EG: '埃及', MA: '摩洛哥', TN: '突尼斯', DZ: '阿尔及利亚', ZA: '南非',
    KE: '肯尼亚', NG: '尼日利亚', GH: '加纳', ET: '埃塞俄比亚', TZ: '坦桑尼亚',
    // Central Asia & Caucasus
    GE: '格鲁吉亚', AM: '亚美尼亚', AZ: '阿塞拜疆', KZ: '哈萨克斯坦', UZ: '乌兹别克斯坦',
    AF: '阿富汗',
  },
  ja: {
    // Schengen Area
    AT: 'オーストリア', BE: 'ベルギー', HR: 'クロアチア', CZ: 'チェコ', DK: 'デンマーク',
    EE: 'エストニア', FI: 'フィンランド', FR: 'フランス', DE: 'ドイツ', GR: 'ギリシャ',
    HU: 'ハンガリー', IS: 'アイスランド', IT: 'イタリア', LV: 'ラトビア', LI: 'リヒテンシュタイン',
    LT: 'リトアニア', LU: 'ルクセンブルク', MT: 'マルタ', NL: 'オランダ', NO: 'ノルウェー',
    PL: 'ポーランド', PT: 'ポルトガル', SK: 'スロバキア', SI: 'スロベニア', ES: 'スペイン',
    SE: 'スウェーデン', CH: 'スイス',
    // Other European
    AL: 'アルバニア', AD: 'アンドラ', BY: 'ベラルーシ', BA: 'ボスニア・ヘルツェゴビナ',
    BG: 'ブルガリア', CY: 'キプロス', GB: 'イギリス', IE: 'アイルランド', XK: 'コソボ',
    MD: 'モルドバ', MC: 'モナコ', ME: 'モンテネグロ', MK: '北マケドニア', RO: 'ルーマニア',
    RU: 'ロシア', SM: 'サンマリノ', RS: 'セルビア', TR: 'トルコ', UA: 'ウクライナ', VA: 'バチカン',
    // Americas
    US: 'アメリカ', CA: 'カナダ', MX: 'メキシコ', BR: 'ブラジル', AR: 'アルゼンチン',
    CL: 'チリ', CO: 'コロンビア', PE: 'ペルー', VE: 'ベネズエラ', EC: 'エクアドル',
    BO: 'ボリビア', PY: 'パラグアイ', UY: 'ウルグアイ', PA: 'パナマ', CR: 'コスタリカ',
    CU: 'キューバ', DO: 'ドミニカ共和国', PR: 'プエルトリコ', JM: 'ジャマイカ', HT: 'ハイチ',
    TT: 'トリニダード・トバゴ', BB: 'バルバドス', BS: 'バハマ',
    // Asia Pacific
    JP: '日本', KR: '韓国', CN: '中国', TW: '台湾', HK: '香港',
    SG: 'シンガポール', MY: 'マレーシア', TH: 'タイ', ID: 'インドネシア', VN: 'ベトナム',
    PH: 'フィリピン', IN: 'インド', PK: 'パキスタン', BD: 'バングラデシュ', LK: 'スリランカ',
    NP: 'ネパール', MM: 'ミャンマー', KH: 'カンボジア', LA: 'ラオス', BT: 'ブータン',
    MV: 'モルディブ', MN: 'モンゴル', AU: 'オーストラリア', NZ: 'ニュージーランド',
    // Middle East & Africa
    AE: 'アラブ首長国連邦', SA: 'サウジアラビア', QA: 'カタール', KW: 'クウェート',
    BH: 'バーレーン', OM: 'オマーン', IL: 'イスラエル', JO: 'ヨルダン', LB: 'レバノン',
    EG: 'エジプト', MA: 'モロッコ', TN: 'チュニジア', DZ: 'アルジェリア', ZA: '南アフリカ',
    KE: 'ケニア', NG: 'ナイジェリア', GH: 'ガーナ', ET: 'エチオピア', TZ: 'タンザニア',
    // Central Asia & Caucasus
    GE: 'ジョージア', AM: 'アルメニア', AZ: 'アゼルバイジャン', KZ: 'カザフスタン', UZ: 'ウズベキスタン',
    AF: 'アフガニスタン',
  },
  ko: {
    // Schengen Area
    AT: '오스트리아', BE: '벨기에', HR: '크로아티아', CZ: '체코', DK: '덴마크',
    EE: '에스토니아', FI: '핀란드', FR: '프랑스', DE: '독일', GR: '그리스',
    HU: '헝가리', IS: '아이슬란드', IT: '이탈리아', LV: '라트비아', LI: '리히텐슈타인',
    LT: '리투아니아', LU: '룩셈부르크', MT: '몰타', NL: '네덜란드', NO: '노르웨이',
    PL: '폴란드', PT: '포르투갈', SK: '슬로바키아', SI: '슬로베니아', ES: '스페인',
    SE: '스웨덴', CH: '스위스',
    // Other European
    AL: '알바니아', AD: '안도라', BY: '벨라루스', BA: '보스니아 헤르체고비나',
    BG: '불가리아', CY: '키프로스', GB: '영국', IE: '아일랜드', XK: '코소보',
    MD: '몰도바', MC: '모나코', ME: '몬테네그로', MK: '북마케도니아', RO: '루마니아',
    RU: '러시아', SM: '산마리노', RS: '세르비아', TR: '튀르키예', UA: '우크라이나', VA: '바티칸',
    // Americas
    US: '미국', CA: '캐나다', MX: '멕시코', BR: '브라질', AR: '아르헨티나',
    CL: '칠레', CO: '콜롬비아', PE: '페루', VE: '베네수엘라', EC: '에콰도르',
    BO: '볼리비아', PY: '파라과이', UY: '우루과이', PA: '파나마', CR: '코스타리카',
    CU: '쿠바', DO: '도미니카 공화국', PR: '푸에르토리코', JM: '자메이카', HT: '아이티',
    TT: '트리니다드 토바고', BB: '바베이도스', BS: '바하마',
    // Asia Pacific
    JP: '일본', KR: '대한민국', CN: '중국', TW: '대만', HK: '홍콩',
    SG: '싱가포르', MY: '말레이시아', TH: '태국', ID: '인도네시아', VN: '베트남',
    PH: '필리핀', IN: '인도', PK: '파키스탄', BD: '방글라데시', LK: '스리랑카',
    NP: '네팔', MM: '미얀마', KH: '캄보디아', LA: '라오스', BT: '부탄',
    MV: '몰디브', MN: '몽골', AU: '호주', NZ: '뉴질랜드',
    // Middle East & Africa
    AE: '아랍에미리트', SA: '사우디아라비아', QA: '카타르', KW: '쿠웨이트',
    BH: '바레인', OM: '오만', IL: '이스라엘', JO: '요르단', LB: '레바논',
    EG: '이집트', MA: '모로코', TN: '튀니지', DZ: '알제리', ZA: '남아프리카공화국',
    KE: '케냐', NG: '나이지리아', GH: '가나', ET: '에티오피아', TZ: '탄자니아',
    // Central Asia & Caucasus
    GE: '조지아', AM: '아르메니아', AZ: '아제르바이잔', KZ: '카자흐스탄', UZ: '우즈베키스탄',
    AF: '아프가니스탄',
  },
  it: {
    // Schengen Area
    AT: 'Austria', BE: 'Belgio', HR: 'Croazia', CZ: 'Repubblica Ceca', DK: 'Danimarca',
    EE: 'Estonia', FI: 'Finlandia', FR: 'Francia', DE: 'Germania', GR: 'Grecia',
    HU: 'Ungheria', IS: 'Islanda', IT: 'Italia', LV: 'Lettonia', LI: 'Liechtenstein',
    LT: 'Lituania', LU: 'Lussemburgo', MT: 'Malta', NL: 'Paesi Bassi', NO: 'Norvegia',
    PL: 'Polonia', PT: 'Portogallo', SK: 'Slovacchia', SI: 'Slovenia', ES: 'Spagna',
    SE: 'Svezia', CH: 'Svizzera',
    // Other European
    AL: 'Albania', AD: 'Andorra', BY: 'Bielorussia', BA: 'Bosnia ed Erzegovina',
    BG: 'Bulgaria', CY: 'Cipro', GB: 'Regno Unito', IE: 'Irlanda', XK: 'Kosovo',
    MD: 'Moldavia', MC: 'Monaco', ME: 'Montenegro', MK: 'Macedonia del Nord', RO: 'Romania',
    RU: 'Russia', SM: 'San Marino', RS: 'Serbia', TR: 'Turchia', UA: 'Ucraina', VA: 'Città del Vaticano',
    // Americas
    US: 'Stati Uniti', CA: 'Canada', MX: 'Messico', BR: 'Brasile', AR: 'Argentina',
    CL: 'Cile', CO: 'Colombia', PE: 'Perù', VE: 'Venezuela', EC: 'Ecuador',
    BO: 'Bolivia', PY: 'Paraguay', UY: 'Uruguay', PA: 'Panama', CR: 'Costa Rica',
    CU: 'Cuba', DO: 'Repubblica Dominicana', PR: 'Porto Rico', JM: 'Giamaica', HT: 'Haiti',
    TT: 'Trinidad e Tobago', BB: 'Barbados', BS: 'Bahamas',
    // Asia Pacific
    JP: 'Giappone', KR: 'Corea del Sud', CN: 'Cina', TW: 'Taiwan', HK: 'Hong Kong',
    SG: 'Singapore', MY: 'Malesia', TH: 'Thailandia', ID: 'Indonesia', VN: 'Vietnam',
    PH: 'Filippine', IN: 'India', PK: 'Pakistan', BD: 'Bangladesh', LK: 'Sri Lanka',
    NP: 'Nepal', MM: 'Myanmar', KH: 'Cambogia', LA: 'Laos', BT: 'Bhutan',
    MV: 'Maldive', MN: 'Mongolia', AU: 'Australia', NZ: 'Nuova Zelanda',
    // Middle East & Africa
    AE: 'Emirati Arabi Uniti', SA: 'Arabia Saudita', QA: 'Qatar', KW: 'Kuwait',
    BH: 'Bahrein', OM: 'Oman', IL: 'Israele', JO: 'Giordania', LB: 'Libano',
    EG: 'Egitto', MA: 'Marocco', TN: 'Tunisia', DZ: 'Algeria', ZA: 'Sudafrica',
    KE: 'Kenya', NG: 'Nigeria', GH: 'Ghana', ET: 'Etiopia', TZ: 'Tanzania',
    // Central Asia & Caucasus
    GE: 'Georgia', AM: 'Armenia', AZ: 'Azerbaigian', KZ: 'Kazakistan', UZ: 'Uzbekistan',
    AF: 'Afghanistan',
  },
  ru: {
    // Schengen Area
    AT: 'Австрия', BE: 'Бельгия', HR: 'Хорватия', CZ: 'Чехия', DK: 'Дания',
    EE: 'Эстония', FI: 'Финляндия', FR: 'Франция', DE: 'Германия', GR: 'Греция',
    HU: 'Венгрия', IS: 'Исландия', IT: 'Италия', LV: 'Латвия', LI: 'Лихтенштейн',
    LT: 'Литва', LU: 'Люксембург', MT: 'Мальта', NL: 'Нидерланды', NO: 'Норвегия',
    PL: 'Польша', PT: 'Португалия', SK: 'Словакия', SI: 'Словения', ES: 'Испания',
    SE: 'Швеция', CH: 'Швейцария',
    // Other European
    AL: 'Албания', AD: 'Андорра', BY: 'Беларусь', BA: 'Босния и Герцеговина',
    BG: 'Болгария', CY: 'Кипр', GB: 'Великобритания', IE: 'Ирландия', XK: 'Косово',
    MD: 'Молдова', MC: 'Монако', ME: 'Черногория', MK: 'Северная Македония', RO: 'Румыния',
    RU: 'Россия', SM: 'Сан-Марино', RS: 'Сербия', TR: 'Турция', UA: 'Украина', VA: 'Ватикан',
    // Americas
    US: 'США', CA: 'Канада', MX: 'Мексика', BR: 'Бразилия', AR: 'Аргентина',
    CL: 'Чили', CO: 'Колумбия', PE: 'Перу', VE: 'Венесуэла', EC: 'Эквадор',
    BO: 'Боливия', PY: 'Парагвай', UY: 'Уругвай', PA: 'Панама', CR: 'Коста-Рика',
    CU: 'Куба', DO: 'Доминиканская Республика', PR: 'Пуэрто-Рико', JM: 'Ямайка', HT: 'Гаити',
    TT: 'Тринидад и Тобаго', BB: 'Барбадос', BS: 'Багамы',
    // Asia Pacific
    JP: 'Япония', KR: 'Южная Корея', CN: 'Китай', TW: 'Тайвань', HK: 'Гонконг',
    SG: 'Сингапур', MY: 'Малайзия', TH: 'Таиланд', ID: 'Индонезия', VN: 'Вьетнам',
    PH: 'Филиппины', IN: 'Индия', PK: 'Пакистан', BD: 'Бангладеш', LK: 'Шри-Ланка',
    NP: 'Непал', MM: 'Мьянма', KH: 'Камбоджа', LA: 'Лаос', BT: 'Бутан',
    MV: 'Мальдивы', MN: 'Монголия', AU: 'Австралия', NZ: 'Новая Зеландия',
    // Middle East & Africa
    AE: 'ОАЭ', SA: 'Саудовская Аравия', QA: 'Катар', KW: 'Кувейт',
    BH: 'Бахрейн', OM: 'Оман', IL: 'Израиль', JO: 'Иордания', LB: 'Ливан',
    EG: 'Египет', MA: 'Марокко', TN: 'Тунис', DZ: 'Алжир', ZA: 'ЮАР',
    KE: 'Кения', NG: 'Нигерия', GH: 'Гана', ET: 'Эфиопия', TZ: 'Танзания',
    // Central Asia & Caucasus
    GE: 'Грузия', AM: 'Армения', AZ: 'Азербайджан', KZ: 'Казахстан', UZ: 'Узбекистан',
    AF: 'Афганистан',
  },
};

/**
 * Get translated country name by ISO 2-letter code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'DE', 'PT')
 * @param language - App language code (e.g., 'en', 'pt', 'es')
 * @returns Translated country name, or English fallback if not found
 */
export function getTranslatedCountryName(countryCode: string, language: string): string {
  if (!countryCode) return '';
  
  const code = countryCode.toUpperCase();
  const langData = COUNTRY_NAMES[language] || COUNTRY_NAMES.en;
  
  // Return translated name, fallback to English, then code itself
  return langData[code] || COUNTRY_NAMES.en[code] || code;
}

/**
 * Get all countries with translated names for a given language
 * @param language - App language code
 * @returns Object mapping country codes to translated names
 */
export function getAllTranslatedCountryNames(language: string): { [code: string]: string } {
  return COUNTRY_NAMES[language] || COUNTRY_NAMES.en;
}

export default {
  getTranslatedCountryName,
  getAllTranslatedCountryNames,
};
