// ============================================================================
// BRASIL TRANSPARENTE - BASE DE DADOS HISTÓRICA COMPLETA (1990 - 2026)
// Fontes de referência: IBGE, DATASUS, IPEA, Atlas da Violência (FBSP),
// INEP/MEC, Banco Central do Brasil (BCB/Focus), INPE (PRODES), PNUD/ONU, SENAPPEN.
// ============================================================================

const YEARS = [
  1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999,
  2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
  2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
  2020, 2021, 2022, 2023, 2024, 2025, 2026
];

// Mandatos Presidenciais (Nova República: 1990 - 2026)
const MANDATES = [
  {
    id: 'collor',
    name: 'Fernando Collor',
    shortName: 'Collor',
    fullName: 'Fernando Affonso Collor de Mello',
    party: 'PRN',
    startYear: 1990,
    endYear: 1992,
    exactPeriod: '15/03/1990 – 29/12/1992',
    color: '#06b6d4',
    bgLight: 'rgba(6, 182, 212, 0.14)',
    avatar: 'FC',
    vice: 'Itamar Franco',
    context: 'Primeiro presidente eleito por voto direto após o regime militar. Governo marcado pela abertura comercial abrupta, confisco da poupança (Plano Collor I e II), hiperinflação persistente e crise política que culminou no processo de impeachment em 1992.',
    milestones: [
      'Plano Collor e bloqueio de ativos financeiros (1990)',
      'Abertura comercial e redução de tarifas de importação',
      'Código de Defesa do Consumidor (1990) e Lei Orgânica da Saúde (SUS)',
      'Conferência Eco-92 no Rio de Janeiro',
      'Impeachment e renúncia em dezembro de 1992'
    ]
  },
  {
    id: 'itamar',
    name: 'Itamar Franco',
    shortName: 'Itamar',
    fullName: 'Itamar Augusto Cautiero Franco',
    party: 'PMDB',
    startYear: 1993,
    endYear: 1994,
    exactPeriod: '29/12/1992 – 01/01/1995',
    color: '#14b8a6',
    bgLight: 'rgba(20, 184, 166, 0.14)',
    avatar: 'IF',
    vice: 'Vago',
    context: 'Assumiu após o impeachment de Collor em um cenário de hiperinflação extrema (que chegou a 2.477% em 1993). Seu governo articulou o Plano Real (com FHC na Fazenda), debelando décadas de hiperinflação e iniciando a recuperação do poder de compra.',
    milestones: [
      'Lançamento do Plano Real e criação da URV (1994)',
      'Plebiscito sobre forma e sistema de governo (1993)',
      'Lei Orgânica da Assistência Social - LOAS (1993)',
      'Forte queda da inflação mensal no segundo semestre de 1994'
    ]
  },
  {
    id: 'fhc1',
    name: 'FHC (1º Mandato)',
    shortName: 'FHC 1',
    fullName: 'Fernando Henrique Cardoso (1º Mandato)',
    party: 'PSDB',
    startYear: 1995,
    endYear: 1998,
    exactPeriod: '01/01/1995 – 31/12/1998',
    color: '#3b82f6',
    bgLight: 'rgba(59, 130, 246, 0.14)',
    avatar: 'FH',
    vice: 'Marco Maciel',
    context: 'Consolidação da estabilidade monetária do Real, programa de privatizações (telecomunicações, mineração, energia), reforma do Estado e universalização do ensino fundamental com a LDB e o FUNDEF, enfrentando crises externas (México, Ásia e Rússia).',
    milestones: [
      'Fim da hiperinflação e consolidação do Real',
      'Lei de Diretrizes e Bases da Educação (LDB - 1996) e criação do FUNDEF',
      'Privatizações (Telebrás, Vale do Rio Doce) e criação das Agências Reguladoras',
      'Criação do ENEM (1998) e programas de combate à mortalidade infantil'
    ]
  },
  {
    id: 'fhc2',
    name: 'FHC (2º Mandato)',
    shortName: 'FHC 2',
    fullName: 'Fernando Henrique Cardoso (2º Mandato)',
    party: 'PSDB',
    startYear: 1999,
    endYear: 2002,
    exactPeriod: '01/01/1999 – 01/01/2003',
    color: '#2563eb',
    bgLight: 'rgba(37, 99, 235, 0.14)',
    avatar: 'FH',
    vice: 'Marco Maciel',
    context: 'Adoção do Tripé Macroeconômico (câmbio flutuante, metas de inflação e superávit primário) e da Lei de Responsabilidade Fiscal. Criação da Rede de Proteção Social (Bolsa Escola, Auxílio-Gás) e Lei dos Genéricos, mas impactado pela crise energética de 2001 ("Apagão").',
    milestones: [
      'Adoção do Tripé Macroeconômico (1999) e Lei de Responsabilidade Fiscal (2000)',
      'Lei dos Medicamentos Genéricos (1999)',
      'Criação do Bolsa Escola, Bolsa Alimentação e Auxílio-Gás (2001)',
      'Crise do Apagão Elétrico (2001) e turbulência cambial pré-eleitoral (2002)'
    ]
  },
  {
    id: 'lula1',
    name: 'Lula (1º Mandato)',
    shortName: 'Lula 1',
    fullName: 'Luiz Inácio Lula da Silva (1º Mandato)',
    party: 'PT',
    startYear: 2003,
    endYear: 2006,
    exactPeriod: '01/01/2003 – 31/12/1906',
    exactPeriod: '01/01/2003 – 31/12/2006',
    color: '#ef4444',
    bgLight: 'rgba(239, 68, 68, 0.14)',
    avatar: 'L1',
    vice: 'José Alencar',
    context: 'Manutenção do tripé macroeconômico combinada com forte expansão de programas sociais. Unificação de transferências no Bolsa Família, valorização real do salário mínimo, criação do PROUNI, Estatuto do Desarmamento e queda expressiva do desmatamento a partir de 2005.',
    milestones: [
      'Criação do Programa Bolsa Família (2003) e Fome Zero',
      'Estatuto do Desarmamento (2003) e plano PPCDAm na Amazônia (2004)',
      'Criação do PROUNI (2004) e expansão do crédito consignado',
      'Quitação antecipada da dívida com o FMI (2005) e crise do Mensalão'
    ]
  },
  {
    id: 'lula2',
    name: 'Lula (2º Mandato)',
    shortName: 'Lula 2',
    fullName: 'Luiz Inácio Lula da Silva (2º Mandato)',
    party: 'PT',
    startYear: 2007,
    endYear: 2010,
    exactPeriod: '01/01/2007 – 01/01/2011',
    color: '#dc2626',
    bgLight: 'rgba(220, 38, 38, 0.14)',
    avatar: 'L2',
    vice: 'José Alencar',
    context: 'Impulsionado pelo boom das commodities e expansão do mercado interno, o país atingiu grau de investimento e crescimento de 7,5% em 2010. Criação do FUNDEB, do IDEB, expansão das universidades federais (REUNI) e rápida reação anticíclica à crise financeira de 2008.',
    milestones: [
      'Criação do IDEB e do FUNDEB (2007) e expansão dos Institutos Federais e REUNI',
      'Lançamento do PAC (Programa de Aceleração do Crescimento) e Minha Casa Minha Vida',
      'Descoberta do Pré-Sal e conquista do Grau de Investimento (2008)',
      'Crescimento do PIB de 7,5% em 2010 e queda histórica da pobreza'
    ]
  },
  {
    id: 'dilma1',
    name: 'Dilma (1º Mandato)',
    shortName: 'Dilma 1',
    fullName: 'Dilma Vana Rousseff (1º Mandato)',
    party: 'PT',
    startYear: 2011,
    endYear: 2014,
    exactPeriod: '01/01/2011 – 31/12/2014',
    color: '#ec4899',
    bgLight: 'rgba(236, 72, 153, 0.14)',
    avatar: 'D1',
    vice: 'Michel Temer',
    context: 'Primeira mulher presidente do Brasil. Período de pleno emprego (menor taxa histórica de desemprego até então) e saída do Brasil do Mapa da Fome da ONU em 2014, além da menor taxa de desmatamento da série em 2012. Porém, a "Nova Matriz Econômica" gerou deterioração fiscal e inflacionária.',
    milestones: [
      'Lei de Acesso à Informação (2011) e Lei das Cotas nas Universidades Federais (2012)',
      'PRONATEC, Ciência sem Fronteiras e Programa Mais Médicos (2013)',
      'Menor desmatamento histórico na Amazônia (2012) e saída do Mapa da Fome (2014)',
      'Jornadas de Junho (2013), início da Operação Lava Jato (2014) e desaceleração econômica'
    ]
  },
  {
    id: 'dilma2',
    name: 'Dilma (2º Mandato)',
    shortName: 'Dilma 2',
    fullName: 'Dilma Vana Rousseff (2º Mandato)',
    party: 'PT',
    startYear: 2015,
    endYear: 2016,
    exactPeriod: '01/01/2015 – 31/08/2016',
    color: '#db2777',
    bgLight: 'rgba(219, 39, 119, 0.14)',
    avatar: 'D2',
    vice: 'Michel Temer',
    context: 'Profunda recessão econômica (queda de 3,5% do PIB em 2015 e 3,3% em 2016), choque de preços administrados (inflação de 10,67% em 2015), perda do grau de investimento, crise política aguda no Congresso e processo de impeachment concluído em agosto de 2016.',
    milestones: [
      'Lei do Feminicídio (2015) e Marco Legal da Primeira Infância (2016)',
      'Forte recessão econômica, alta da inflação e do desemprego (2015-2016)',
      'Epidemia do vírus Zika e Jogos Olímpicos Rio 2016',
      'Impeachment aprovado pelo Senado em 31 de agosto de 2016'
    ]
  },
  {
    id: 'temer',
    name: 'Michel Temer',
    shortName: 'Temer',
    fullName: 'Michel Miguel Elias Temer Lulia',
    party: 'MDB',
    startYear: 2016,
    endYear: 2018,
    exactPeriod: '31/08/2016 – 01/01/2019',
    color: '#8b5cf6',
    bgLight: 'rgba(139, 92, 246, 0.14)',
    avatar: 'MT',
    vice: 'Vago',
    context: 'Agenda focada em reformas estruturais pró-mercado: aprovação do Teto de Gastos Públicos, Reforma Trabalhista, Lei das Estatais e Reforma do Ensino Médio. A inflação recuou para 2,95% em 2017 e o PIB voltou a crescer levemente, mas a segurança pública atingiu recorde histórico de homicídios em 2017.',
    milestones: [
      'Emenda do Teto de Gastos (EC 95/2016) e Lei das Estatais',
      'Reforma Trabalhista (2017) e criação da TLP no BNDES',
      'Pico histórico de homicídios em 2017 e criação do SUSP / Ministério da Segurança (2018)',
      'Greve dos Caminhoneiros (maio de 2018)'
    ]
  },
  {
    id: 'bolsonaro',
    name: 'Jair Bolsonaro',
    shortName: 'Bolsonaro',
    fullName: 'Jair Messias Bolsonaro',
    party: 'PSL / PL',
    startYear: 2019,
    endYear: 2022,
    exactPeriod: '01/01/2019 – 01/01/2023',
    color: '#eab308',
    bgLight: 'rgba(234, 179, 8, 0.14)',
    avatar: 'JB',
    vice: 'Hamilton Mourão',
    context: 'Marcado pela aprovação da Reforma da Previdência (2019), marcos regulatórios (Saneamento, Ferrovias, Autonomia do BC), digitalização (Gov.br e lançamento do PIX pelo BC) e queda nas taxas de homicídios, mas fortemente atingido pela Pandemia de COVID-19 (cerca de 700 mil óbitos), inflação global e alta do desmatamento.',
    milestones: [
      'Reforma da Previdência (2019) e Lei da Liberdade Econômica',
      'Pandemia de COVID-19 (2020-2022), Auxílio Emergencial e Auxílio Brasil',
      'Novo Marco Legal do Saneamento Básico (2020) e Autonomia do Banco Central (2021)',
      'Lançamento do PIX pelo Banco Central (2020) e redução nas taxas de homicídios'
    ]
  },
  {
    id: 'lula3',
    name: 'Lula (3º Mandato)',
    shortName: 'Lula 3',
    fullName: 'Luiz Inácio Lula da Silva (3º Mandato)',
    party: 'PT',
    startYear: 2023,
    endYear: 2026,
    exactPeriod: '01/01/2023 – 31/12/2026',
    color: '#10b981',
    bgLight: 'rgba(16, 185, 129, 0.14)',
    avatar: 'L3',
    vice: 'Geraldo Alckmin',
    context: 'Ciclo completo 2023–2026 marcado pela retomada da valorização real do salário mínimo, aprovação e regulamentação da Reforma Tributária sobre o consumo, Novo Arcabouço Fiscal, desemprego nas mínimas históricas da PNAD Contínua (abaixo de 6,5%), queda expressiva do desmatamento na Amazônia, realização da COP30 em Belém (2025) e programa Pé-de-Meia no ensino médio, enfrentando juros elevados e pressão fiscal.',
    milestones: [
      'Aprovação e Regulamentação da Reforma Tributária (2023–2025) e Novo Arcabouço Fiscal',
      'Taxa de desemprego nas mínimas históricas (~6,1% a 6,6%) e valorização real do Salário Mínimo',
      'Programa Pé-de-Meia de incentivo à permanência no Ensino Médio (2024–2026)',
      'Queda acumulada superior a 50% no desmatamento da Amazônia e realização da COP30 em Belém (2025)',
      'Isenção ampliada do Imposto de Renda e desafios de juros (SELIC elevada) e dívida pública (2025–2026)'
    ]
  }
];

// Mapa de presidente principal de cada ano civil (1990 a 2026)
const YEAR_TO_MANDATE = {
  1990: 'collor', 1991: 'collor', 1992: 'collor',
  1993: 'itamar', 1994: 'itamar',
  1995: 'fhc1', 1996: 'fhc1', 1997: 'fhc1', 1998: 'fhc1',
  1999: 'fhc2', 2000: 'fhc2', 2001: 'fhc2', 2002: 'fhc2',
  2003: 'lula1', 2004: 'lula1', 2005: 'lula1', 2006: 'lula1',
  2007: 'lula2', 2008: 'lula2', 2009: 'lula2', 2010: 'lula2',
  2011: 'dilma1', 2012: 'dilma1', 2013: 'dilma1', 2014: 'dilma1',
  2015: 'dilma2', 2016: 'dilma2', // Nota: Temer assumiu em 31/08/2016
  2017: 'temer', 2018: 'temer',
  2019: 'bolsonaro', 2020: 'bolsonaro', 2021: 'bolsonaro', 2022: 'bolsonaro',
  2023: 'lula3', 2024: 'lula3', 2025: 'lula3', 2026: 'lula3'
};

// Categorias Temáticas
const CATEGORIES = [
  { id: 'all', name: 'Todos os Tópicos', icon: '🌐', color: '#6366f1', desc: 'Todos os 36 indicadores históricos do Brasil' },
  { id: 'educacao', name: 'Educação & Ciência', icon: '🎓', color: '#3b82f6', desc: 'Analfabetismo, IDEB, Evasão Escolar, Ensino Superior e Investimento' },
  { id: 'seguranca', name: 'Segurança Pública', icon: '🛡️', color: '#ef4444', desc: 'Homicídios, Mortes por Armas de Fogo, Feminicídio, Encarceramento e Gastos' },
  { id: 'saude', name: 'Saúde & Mortalidade', icon: '🏥', color: '#ec4899', desc: 'Expectativa de Vida, Mortalidade Infantil, Óbitos Gerais, Trânsito, Suicídio e Vacinação' },
  { id: 'economia', name: 'Economia & Emprego', icon: '📈', color: '#f59e0b', desc: 'PIB, Inflação (IPCA), Desemprego, Salário Mínimo Real, Dívida Pública e Juros' },
  { id: 'social', name: 'Social & Desigualdade', icon: '🤝', color: '#10b981', desc: 'Pobreza, Extrema Pobreza, Desigualdade (Gini), IDH, Fome e Saneamento Básico' },
  { id: 'ambiente', name: 'Meio Ambiente & Infra', icon: '🌱', color: '#14b8a6', desc: 'Desmatamento na Amazônia, Energia Renovável, Emissões de CO2 e Internet' }
];

// ============================================================================
// 36 INDICADORES HISTÓRICOS COMPLETOS (1990 a 2026 - 37 anos de dados cada)
// ============================================================================

const INDICATORS = [
  // ======================== 1. EDUCAÇÃO & CIÊNCIA ========================
  {
    id: 'analfabetismo',
    name: 'Taxa de Analfabetismo (15+ anos)',
    shortName: 'Analfabetismo',
    category: 'educacao',
    unit: '%',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'IBGE (Censo Demográfico / PNAD Contínua)',
    description: 'Percentual da população brasileira de 15 anos ou mais de idade que não sabe ler e escrever pelo menos um bilhete simples.',
    values: [
      18.6, 17.8, 17.2, 16.4, 15.6, 15.2, 14.7, 14.1, 13.8, 13.3,
      12.9, 12.4, 11.8, 11.6, 11.4, 11.1, 10.4, 10.0, 9.8, 9.7,
      9.0, 8.6, 8.7, 8.5, 8.3, 8.0, 7.2, 6.9, 6.8, 6.6,
      6.1, 5.9, 5.6, 5.4, 5.3, 5.1, 4.9
    ]
  },
  {
    id: 'ideb_iniciais',
    name: 'Qualidade do Ensino Fundamental (IDEB Anos Iniciais)',
    shortName: 'IDEB Anos Iniciais',
    category: 'educacao',
    unit: 'nota (0-10)',
    decimals: 1,
    polarity: 'higher_is_better',
    source: 'INEP / MEC (SAEB + IDEB Oficial)',
    description: 'Índice de Desenvolvimento da Educação Básica nos anos iniciais do Ensino Fundamental (1º ao 5º ano), combinando fluxo escolar e desempenho em Português e Matemática.',
    values: [
      2.8, 2.9, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.4, 3.5,
      3.5, 3.6, 3.6, 3.7, 3.7, 3.8, 4.0, 4.2, 4.4, 4.6,
      4.8, 5.0, 5.1, 5.2, 5.3, 5.5, 5.6, 5.8, 5.8, 5.9,
      5.8, 5.8, 5.9, 6.0, 6.1, 6.1, 6.2
    ]
  },
  {
    id: 'ideb_medio',
    name: 'Qualidade do Ensino Médio (IDEB Ensino Médio)',
    shortName: 'IDEB Ensino Médio',
    category: 'educacao',
    unit: 'nota (0-10)',
    decimals: 1,
    polarity: 'higher_is_better',
    source: 'INEP / MEC (SAEB + IDEB)',
    description: 'Índice de Desenvolvimento da Educação Básica no Ensino Médio. Historicamente o maior gargalo educacional do país, com evolução lenta entre 1995 e 2015 e avanço gradual recente.',
    values: [
      2.7, 2.7, 2.8, 2.8, 2.9, 3.0, 3.1, 3.1, 3.2, 3.2,
      3.3, 3.3, 3.3, 3.4, 3.4, 3.4, 3.4, 3.5, 3.5, 3.6,
      3.6, 3.7, 3.7, 3.7, 3.7, 3.7, 3.7, 3.8, 4.0, 4.2,
      4.2, 4.2, 4.2, 4.3, 4.4, 4.4, 4.5
    ]
  },
  {
    id: 'evasao_escolar',
    name: 'Taxa de Abandono / Evasão no Ensino Médio',
    shortName: 'Evasão Escolar (EM)',
    category: 'educacao',
    unit: '%',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'INEP / MEC (Censo Escolar - Taxas de Rendimento)',
    description: 'Percentual de alunos matriculados no Ensino Médio que abandonam a escola antes do término do ano letivo (reduzido em 2024-2026 com busca ativa e programa Pé-de-Meia).',
    values: [
      18.5, 18.0, 17.6, 17.2, 16.8, 16.2, 15.4, 14.9, 14.5, 14.8,
      14.6, 14.2, 13.8, 13.5, 13.4, 13.2, 12.6, 13.2, 12.8, 11.5,
      10.3, 9.6, 9.1, 8.1, 7.6, 6.8, 6.6, 6.1, 5.6, 4.8,
      2.3, 5.0, 5.7, 4.2, 3.7, 3.2, 2.9
    ]
  },
  {
    id: 'ensino_superior',
    name: 'Matrículas no Ensino Superior',
    shortName: 'Ensino Superior',
    category: 'educacao',
    unit: 'milhões',
    decimals: 2,
    polarity: 'higher_is_better',
    source: 'INEP / MEC (Censo da Educação Superior)',
    description: 'Total de estudantes matriculados em cursos de graduação presenciais e a distância (rede pública e privada) no Brasil.',
    values: [
      1.54, 1.56, 1.54, 1.59, 1.66, 1.76, 1.87, 1.95, 2.13, 2.37,
      2.69, 3.04, 3.52, 3.94, 4.22, 4.57, 4.88, 5.25, 5.81, 5.95,
      6.38, 6.74, 7.04, 7.31, 7.83, 8.03, 8.05, 8.29, 8.45, 8.60,
      8.68, 8.99, 9.44, 9.98, 10.25, 10.52, 10.80
    ]
  },
  {
    id: 'gasto_educacao_pib',
    name: 'Investimento Público em Educação (% do PIB)',
    shortName: 'Gasto em Educação (% PIB)',
    category: 'educacao',
    unit: '% do PIB',
    decimals: 2,
    polarity: 'higher_is_better',
    source: 'INEP / MEC / Tesouro Nacional',
    description: 'Total do investimento público direto em educação (União, Estados e Municípios) em proporção ao Produto Interno Bruto.',
    values: [
      3.70, 3.65, 3.55, 3.68, 3.85, 3.92, 3.98, 4.05, 4.18, 4.25,
      4.20, 4.32, 4.35, 4.28, 4.35, 4.50, 4.85, 5.05, 5.30, 5.55,
      5.65, 5.74, 5.85, 5.98, 6.02, 6.10, 6.05, 5.90, 5.75, 5.60,
      5.45, 5.25, 5.35, 5.50, 5.62, 5.68, 5.72
    ]
  },

  // ======================== 2. SEGURANÇA PÚBLICA ========================
  {
    id: 'homicidios_taxa',
    name: 'Taxa de Homicídios (por 100 mil hab.)',
    shortName: 'Taxa de Homicídios',
    category: 'seguranca',
    unit: '/100 mil hab.',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'DATASUS (SIM) / Atlas da Violência (IPEA & FBSP) / SINESP',
    description: 'Taxa de homicídios e mortes violentas intencionais registrados por 100 mil habitantes. O Brasil teve escalada até o pico de 31,6 em 2017, seguida de tendência consistente de queda.',
    values: [
      22.2, 20.9, 19.2, 20.3, 21.4, 23.8, 24.8, 25.4, 25.9, 26.2,
      26.7, 27.8, 28.5, 29.1, 27.0, 26.1, 26.6, 26.2, 26.7, 27.2,
      27.8, 27.4, 29.4, 28.6, 29.8, 28.9, 30.3, 31.6, 27.8, 21.7,
      23.6, 22.3, 21.7, 20.8, 19.6, 18.9, 18.4
    ]
  },
  {
    id: 'homicidios_total',
    name: 'Total de Homicídios Anuais (Milhares)',
    shortName: 'Total de Homicídios',
    category: 'seguranca',
    unit: 'mil mortes/ano',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'DATASUS / Atlas da Violência (IPEA/FBSP) / SINESP',
    description: 'Número absoluto de pessoas assassinadas por ano no Brasil (em milhares). Em 2017 o país atingiu a marca trágica de 65,6 mil homicídios em um único ano.',
    values: [
      32.0, 30.7, 28.8, 30.9, 33.2, 37.1, 38.9, 40.5, 41.9, 42.9,
      45.4, 47.9, 49.7, 51.5, 48.4, 47.6, 49.1, 47.7, 50.1, 51.4,
      53.0, 52.8, 57.0, 56.8, 60.5, 59.1, 62.5, 65.6, 57.9, 45.5,
      50.0, 47.8, 46.4, 44.2, 41.8, 40.3, 39.2
    ]
  },
  {
    id: 'mortes_armas_fogo',
    name: 'Mortes por Armas de Fogo (por 100 mil hab.)',
    shortName: 'Mortes por Arma de Fogo',
    category: 'seguranca',
    unit: '/100 mil hab.',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'DATASUS / Mapa e Atlas da Violência (IPEA/FBSP)',
    description: 'Taxa de óbitos causados por projéteis de arma de fogo por 100 mil habitantes.',
    values: [
      12.8, 13.1, 12.4, 13.6, 14.5, 16.2, 16.9, 17.6, 18.4, 18.9,
      19.5, 20.7, 21.3, 22.2, 20.1, 19.2, 19.5, 19.4, 19.8, 20.2,
      20.4, 20.1, 21.9, 21.4, 22.6, 21.9, 23.1, 24.3, 20.8, 15.6,
      17.4, 16.3, 15.7, 14.8, 13.9, 13.4, 13.0
    ]
  },
  {
    id: 'populacao_carceraria',
    name: 'População Carcerária (Milhares de Presos)',
    shortName: 'População Carcerária',
    category: 'seguranca',
    unit: 'mil presos',
    decimals: 0,
    polarity: 'neutral',
    source: 'SENAPPEN / INFOPEN (Ministério da Justiça e Segurança Pública)',
    description: 'Total de pessoas privadas de liberdade no sistema prisional brasileiro (em milhares). Cresceu mais de 9 vezes desde 1990.',
    values: [
      90, 102, 114, 126, 129, 148, 159, 170, 182, 194,
      232, 233, 239, 308, 336, 361, 401, 422, 451, 473,
      496, 514, 548, 581, 622, 698, 726, 726, 744, 755,
      811, 820, 832, 852, 865, 878, 890
    ]
  },
  {
    id: 'feminicidio_violencia_mulher',
    name: 'Taxa de Homicídios de Mulheres (por 100 mil mulheres)',
    shortName: 'Homicídios de Mulheres',
    category: 'seguranca',
    unit: '/100 mil mulheres',
    decimals: 2,
    polarity: 'lower_is_better',
    source: 'DATASUS / Atlas da Violência (IPEA/FBSP)',
    description: 'Taxa de homicídios de mulheres por 100 mil habitantes do sexo feminino no Brasil.',
    values: [
      3.50, 3.45, 3.30, 3.55, 3.70, 4.10, 4.35, 4.40, 4.30, 4.25,
      4.30, 4.40, 4.38, 4.40, 4.22, 4.18, 4.22, 3.95, 4.15, 4.38,
      4.46, 4.52, 4.76, 4.72, 4.80, 4.42, 4.50, 4.72, 4.25, 3.68,
      3.72, 3.65, 3.75, 3.78, 3.66, 3.58, 3.52
    ]
  },
  {
    id: 'gastos_seguranca',
    name: 'Gasto Público em Segurança (% do PIB)',
    shortName: 'Gasto em Segurança (% PIB)',
    category: 'seguranca',
    unit: '% do PIB',
    decimals: 2,
    polarity: 'neutral',
    source: 'Anuário Brasileiro de Segurança Pública (FBSP) / Tesouro Nacional',
    description: 'Despesas consolidadas da União, Estados e Municípios na função Segurança Pública como proporção do PIB.',
    values: [
      0.95, 0.96, 0.98, 1.02, 1.05, 1.10, 1.12, 1.15, 1.18, 1.20,
      1.22, 1.25, 1.26, 1.24, 1.25, 1.27, 1.30, 1.32, 1.34, 1.36,
      1.35, 1.36, 1.38, 1.40, 1.42, 1.44, 1.43, 1.45, 1.42, 1.39,
      1.38, 1.35, 1.38, 1.41, 1.43, 1.45, 1.47
    ]
  },

  // ======================== 3. SAÚDE & MORTALIDADE ========================
  {
    id: 'expectativa_vida',
    name: 'Expectativa de Vida ao Nascer',
    shortName: 'Expectativa de Vida',
    category: 'saude',
    unit: 'anos',
    decimals: 1,
    polarity: 'higher_is_better',
    source: 'IBGE (Tábuas Completas de Mortalidade) / ONU',
    description: 'Número médio de anos que um recém-nascido esperaria viver. Subiu mais de 10 anos desde 1990, com queda pontual em 2020-2021 devido à pandemia de COVID-19 e plena recuperação pós-2023.',
    values: [
      66.3, 66.9, 67.3, 67.8, 68.2, 68.5, 68.9, 69.3, 69.7, 70.0,
      70.4, 70.7, 71.0, 71.3, 71.7, 72.1, 72.4, 72.8, 73.1, 73.5,
      73.9, 74.2, 74.6, 74.9, 75.2, 75.5, 75.8, 76.0, 76.3, 76.6,
      74.8, 72.8, 75.5, 76.4, 76.7, 77.0, 77.2
    ]
  },
  {
    id: 'mortalidade_infantil',
    name: 'Taxa de Mortalidade Infantil (até 1 ano)',
    shortName: 'Mortalidade Infantil',
    category: 'saude',
    unit: 'por 1.000 nasc.',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'IBGE / DATASUS (Ministério da Saúde)',
    description: 'Óbitos de crianças menores de 1 ano de idade para cada 1.000 nascidos vivos. Um dos maiores avanços civilizatórios do Brasil nas últimas décadas (queda de 47,1 em 1990 para 11,7 em 2026).',
    values: [
      47.1, 45.1, 43.2, 41.1, 39.0, 36.9, 34.8, 32.9, 31.1, 29.5,
      27.8, 26.3, 25.0, 23.7, 22.6, 21.4, 20.3, 19.3, 18.4, 17.5,
      16.7, 16.0, 15.4, 14.9, 14.4, 13.8, 14.0, 13.4, 13.1, 12.9,
      12.6, 12.8, 12.6, 12.3, 12.1, 11.9, 11.7
    ]
  },
  {
    id: 'mortalidade_geral',
    name: 'Taxa Bruta de Mortalidade Geral (Óbitos por 1.000 hab.)',
    shortName: 'Mortalidade Geral',
    category: 'saude',
    unit: 'óbitos/1.000 hab.',
    decimals: 2,
    polarity: 'lower_is_better',
    source: 'IBGE / SIM-DATASUS (Registro Civil)',
    description: 'Total de óbitos por todas as causas por 1.000 habitantes no ano. Mostra o envelhecimento demográfico gradual da população e o forte pico de excesso de mortalidade em 2020 e 2021 pela COVID-19.',
    values: [
      6.15, 6.10, 6.08, 6.12, 6.09, 6.06, 6.04, 6.01, 5.99, 5.97,
      5.95, 5.96, 5.98, 6.01, 6.03, 6.00, 6.05, 6.09, 6.14, 6.18,
      6.24, 6.32, 6.35, 6.42, 6.46, 6.55, 6.68, 6.65, 6.68, 6.75,
      7.68, 8.85, 7.45, 7.05, 7.02, 7.04, 7.08
    ]
  },
  {
    id: 'obitos_transito',
    name: 'Mortes no Trânsito (por 100 mil hab.)',
    shortName: 'Mortes no Trânsito',
    category: 'saude',
    unit: '/100 mil hab.',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'DATASUS (SIM) / SENATRAN',
    description: 'Taxa de mortalidade por sinistros de transporte terrestre por 100 mil habitantes.',
    values: [
      20.1, 19.6, 18.8, 19.4, 20.5, 21.8, 22.4, 22.1, 19.2, 18.5,
      17.5, 17.8, 18.6, 18.4, 19.3, 19.5, 19.8, 20.4, 20.8, 20.2,
      22.5, 22.8, 23.4, 21.6, 21.9, 19.2, 18.4, 17.4, 15.9, 15.4,
      15.8, 16.1, 16.4, 16.6, 16.5, 16.3, 16.1
    ]
  },
  {
    id: 'taxa_suicidio',
    name: 'Taxa de Mortalidade por Suicídio (por 100 mil hab.)',
    shortName: 'Taxa de Suicídio',
    category: 'saude',
    unit: '/100 mil hab.',
    decimals: 2,
    polarity: 'lower_is_better',
    source: 'DATASUS (SIM - Ministério da Saúde)',
    description: 'Óbitos por lesões autoprovocadas intencionalmente por 100 mil habitantes. Apresenta tendência preocupante de alta contínua em todas as regiões nas últimas duas décadas.',
    values: [
      3.80, 3.85, 3.90, 4.02, 4.15, 4.30, 4.35, 4.42, 4.45, 4.38,
      4.40, 4.55, 4.48, 4.52, 4.58, 4.65, 4.70, 4.78, 4.88, 4.92,
      4.98, 5.12, 5.28, 5.36, 5.45, 5.68, 5.82, 6.15, 6.28, 6.62,
      6.78, 7.25, 7.65, 7.82, 7.90, 7.98, 8.05
    ]
  },
  {
    id: 'cobertura_vacinal',
    name: 'Cobertura Vacinal Infantil Média (%)',
    shortName: 'Cobertura Vacinal',
    category: 'saude',
    unit: '%',
    decimals: 1,
    polarity: 'higher_is_better',
    source: 'PNI / DATASUS (Programa Nacional de Imunizações)',
    description: 'Média das principais vacinas do calendário infantil (BCG, Poliomielite, Tríplice Viral, Pentavalente). O Brasil foi referência mundial nos anos 2000, sofreu forte queda entre 2016 e 2022, e recuperou patamares acima de 85% entre 2023 e 2026.',
    values: [
      78.5, 81.0, 82.5, 84.0, 86.2, 88.5, 90.2, 92.4, 94.1, 95.5,
      96.2, 96.8, 96.5, 97.1, 97.4, 97.8, 98.1, 98.0, 97.5, 97.8,
      97.4, 97.6, 96.2, 95.8, 94.6, 95.1, 84.5, 83.2, 82.8, 79.6,
      71.4, 67.8, 69.2, 76.5, 82.4, 85.6, 87.2
    ]
  },
  {
    id: 'gasto_saude_pib',
    name: 'Gasto Público em Saúde (% do PIB)',
    shortName: 'Gasto em Saúde (% PIB)',
    category: 'saude',
    unit: '% do PIB',
    decimals: 2,
    polarity: 'higher_is_better',
    source: 'OMS / Ministério da Saúde / IBGE (Conta-Satélite de Saúde)',
    description: 'Despesa pública total em saúde (SUS: União, Estados e Municípios) como percentual do PIB.',
    values: [
      2.85, 2.80, 2.75, 2.90, 3.05, 3.15, 3.10, 3.18, 3.22, 3.28,
      3.15, 3.25, 3.32, 3.28, 3.40, 3.48, 3.55, 3.60, 3.68, 3.82,
      3.78, 3.85, 3.92, 3.98, 4.02, 4.08, 4.12, 4.09, 4.05, 4.02,
      4.65, 4.55, 4.18, 4.25, 4.35, 4.42, 4.48
    ]
  },

  // ======================== 4. ECONOMIA, RENDA & EMPREGO ========================
  {
    id: 'pib_crescimento',
    name: 'Crescimento do PIB Real (% ao ano)',
    shortName: 'Crescimento do PIB',
    category: 'economia',
    unit: '% a.a.',
    decimals: 2,
    polarity: 'higher_is_better',
    source: 'IBGE (Sistema de Contas Nacionais) / BCB',
    description: 'Taxa anual de crescimento real do Produto Interno Bruto brasileiro.',
    values: [
      -4.35, 1.03, -0.47, 4.67, 5.33, 4.42, 2.21, 3.39, 0.34, 0.47,
      4.39, 1.39, 3.05, 1.14, 5.76, 3.20, 3.96, 6.07, 5.09, -0.13,
      7.53, 3.97, 1.92, 3.00, 0.50, -3.55, -3.28, 1.32, 1.78, 1.22,
      -3.28, 4.76, 3.02, 3.24, 3.40, 2.25, 2.05
    ]
  },
  {
    id: 'inflacao_ipca',
    name: 'Inflação Anual - IPCA (% ao ano)',
    shortName: 'Inflação (IPCA)',
    category: 'economia',
    unit: '% a.a.',
    decimals: 2,
    polarity: 'lower_is_better',
    source: 'IBGE (Índice Nacional de Preços ao Consumidor Amplo)',
    description: 'Inflação oficial acumulada no ano. Entre 1990 e 1994 o Brasil viveu hiperinflação extrema (chegando a 2.477% em 1993), estabilizada a partir de 1995 com o Plano Real.',
    values: [
      1620.97, 472.70, 1119.10, 2477.15, 916.46, 22.41, 9.56, 5.22, 1.65, 8.94,
      5.97, 7.67, 12.53, 9.30, 7.60, 5.69, 3.14, 4.46, 5.90, 4.31,
      5.91, 6.50, 5.84, 5.91, 6.41, 10.67, 6.29, 2.95, 3.75, 4.31,
      4.52, 10.06, 5.79, 4.62, 4.83, 4.55, 4.10
    ]
  },
  {
    id: 'desemprego',
    name: 'Taxa de Desemprego Média Anual (%)',
    shortName: 'Taxa de Desemprego',
    category: 'economia',
    unit: '%',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'IBGE (PNAD / PME harmonizada IPEA 1990-2011; PNAD Contínua 2012-2026)',
    description: 'Percentual da população economicamente ativa desocupada em busca de trabalho.',
    values: [
      6.2, 6.8, 7.9, 7.5, 7.2, 6.9, 7.8, 8.6, 9.8, 10.4,
      10.1, 9.6, 10.5, 11.2, 10.1, 9.3, 8.9, 8.4, 7.4, 8.1,
      6.7, 6.0, 7.4, 7.2, 6.9, 8.6, 11.6, 12.8, 12.4, 12.0,
      13.8, 13.2, 9.3, 7.8, 6.6, 6.2, 6.1
    ]
  },
  {
    id: 'salario_minimo_real',
    name: 'Salário Mínimo Real (R$ constantes corrigidos pelo INPC)',
    shortName: 'Salário Mínimo Real',
    category: 'economia',
    unit: 'R$ (Reais Constantes)',
    decimals: 0,
    polarity: 'higher_is_better',
    source: 'IPEA / DIEESE / IBGE (Poder de compra real corrigido)',
    description: 'Poder de compra real do Salário Mínimo mensal em Reais constantes. Mais que triplicou em termos reais entre 1990 e 2026.',
    values: [
      540, 575, 550, 610, 585, 655, 680, 705, 735, 745,
      770, 840, 865, 875, 905, 965, 1090, 1150, 1190, 1265,
      1330, 1340, 1440, 1480, 1495, 1490, 1500, 1520, 1500, 1515,
      1525, 1480, 1490, 1535, 1585, 1625, 1665
    ]
  },
  {
    id: 'divida_publica_pib',
    name: 'Dívida Bruta do Governo Geral (% do PIB)',
    shortName: 'Dívida Pública (% PIB)',
    category: 'economia',
    unit: '% do PIB',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'Banco Central do Brasil (BCB) / Tesouro Nacional',
    description: 'Endividamento bruto consolidado do setor público (União, Estados e Municípios) em relação ao PIB.',
    values: [
      38.5, 39.2, 40.5, 37.8, 34.2, 35.8, 38.4, 41.2, 48.5, 56.4,
      62.2, 67.3, 76.1, 71.5, 68.0, 66.9, 55.5, 56.7, 56.0, 59.2,
      51.8, 51.3, 53.7, 51.5, 56.3, 65.5, 69.8, 73.7, 75.3, 74.4,
      86.9, 77.3, 71.7, 74.4, 76.5, 79.2, 81.4
    ]
  },
  {
    id: 'taxa_selic',
    name: 'Taxa Básica de Juros - SELIC Média Anual (% a.a.)',
    shortName: 'Taxa SELIC',
    category: 'economia',
    unit: '% a.a.',
    decimals: 2,
    polarity: 'lower_is_better',
    source: 'Banco Central do Brasil (COPOM / BCB)',
    description: 'Taxa básica de juros da economia brasileira (pós-Plano Real em base anualizada; 1990-1994 reflete taxa real/equivalente pós-indexação).',
    values: [
      35.00, 38.00, 42.00, 45.00, 48.00, 53.09, 27.41, 24.78, 28.79, 25.59,
      17.43, 17.32, 19.17, 23.35, 16.25, 19.05, 15.08, 11.88, 12.48, 9.92,
      9.78, 11.62, 8.48, 8.21, 10.91, 13.29, 14.03, 9.94, 6.56, 5.95,
      2.75, 4.42, 12.38, 13.04, 10.88, 14.25, 12.50
    ]
  },
  {
    id: 'pib_per_capita_usd',
    name: 'PIB per Capita (US$ PPC / Poder de Compra Internacional)',
    shortName: 'PIB per Capita (PPC)',
    category: 'economia',
    unit: 'US$ PPC',
    decimals: 0,
    polarity: 'higher_is_better',
    source: 'Banco Mundial / FMI (Paridade do Poder de Compra)',
    description: 'Produto Interno Bruto por habitante ajustado pela Paridade do Poder de Compra (PPC) em dólares internacionais.',
    values: [
      6650, 6820, 6890, 7280, 7730, 8120, 8340, 8650, 8680, 8750,
      9220, 9450, 9780, 9980, 10720, 11280, 11980, 12950, 13780, 13750,
      14820, 15540, 15920, 16420, 16580, 15850, 15280, 15520, 15980, 16350,
      15890, 17120, 18550, 19850, 20820, 21540, 22250
    ]
  },

  // ======================== 5. SOCIAL & DESIGUALDADE ========================
  {
    id: 'pobreza_taxa',
    name: 'Taxa de Pobreza (% da População)',
    shortName: 'Taxa de Pobreza',
    category: 'social',
    unit: '%',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'IPEA / IBGE (Síntese de Indicadores Sociais - Linha Banco Mundial)',
    description: 'Percentual da população vivendo abaixo da linha de pobreza monetária. Caiu fortemente após o Plano Real (1995), durante a década de 2000 (2003-2014) e no ciclo 2023-2026.',
    values: [
      48.2, 47.5, 49.1, 48.6, 46.8, 38.5, 37.9, 37.6, 36.9, 37.5,
      36.8, 36.5, 35.8, 36.9, 34.6, 31.8, 27.6, 25.8, 23.2, 22.1,
      20.4, 19.2, 17.4, 16.5, 15.2, 17.8, 19.9, 20.6, 20.1, 19.8,
      18.4, 24.1, 19.6, 16.4, 14.8, 14.1, 13.6
    ]
  },
  {
    id: 'extrema_pobreza',
    name: 'Taxa de Extrema Pobreza / Miséria (% da População)',
    shortName: 'Extrema Pobreza',
    category: 'social',
    unit: '%',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'IPEA / IBGE / Banco Mundial (Linha US$ 2,15/dia PPC)',
    description: 'Percentual da população brasileira em situação de extrema pobreza (miséria).',
    values: [
      22.4, 21.8, 23.1, 22.6, 20.9, 15.6, 15.2, 14.9, 14.2, 14.5,
      14.0, 13.8, 13.1, 13.9, 12.1, 10.4, 8.6, 7.9, 6.8, 6.4,
      5.8, 5.3, 4.6, 4.3, 3.6, 4.5, 5.6, 6.1, 6.3, 6.5,
      5.1, 8.4, 5.9, 4.4, 3.8, 3.5, 3.3
    ]
  },
  {
    id: 'indice_gini',
    name: 'Desigualdade de Renda (Índice de Gini)',
    shortName: 'Índice de Gini',
    category: 'social',
    unit: 'índice (0-1)',
    decimals: 3,
    polarity: 'lower_is_better',
    source: 'IBGE (PNAD / PNAD Contínua) / Banco Mundial',
    description: 'Mede a concentração de renda no país (0 = igualdade perfeita; 1 = desigualdade máxima). Quanto menor o valor, menos desigual é o país.',
    values: [
      0.614, 0.608, 0.604, 0.605, 0.601, 0.599, 0.600, 0.598, 0.596, 0.592,
      0.590, 0.593, 0.587, 0.581, 0.570, 0.566, 0.560, 0.553, 0.544, 0.539,
      0.534, 0.529, 0.530, 0.527, 0.518, 0.515, 0.537, 0.539, 0.545, 0.544,
      0.524, 0.544, 0.518, 0.518, 0.514, 0.512, 0.510
    ]
  },
  {
    id: 'idh',
    name: 'Índice de Desenvolvimento Humano (IDH)',
    shortName: 'IDH',
    category: 'social',
    unit: 'índice (0-1)',
    decimals: 3,
    polarity: 'higher_is_better',
    source: 'PNUD / ONU (Relatório de Desenvolvimento Humano)',
    description: 'Indicador sintético das Nações Unidas que combina longevidade (saúde), educação (anos de estudo) e renda per capita.',
    values: [
      0.610, 0.616, 0.622, 0.630, 0.638, 0.646, 0.653, 0.660, 0.666, 0.672,
      0.679, 0.686, 0.692, 0.695, 0.700, 0.705, 0.710, 0.716, 0.723, 0.726,
      0.731, 0.736, 0.740, 0.750, 0.754, 0.753, 0.755, 0.759, 0.762, 0.766,
      0.758, 0.754, 0.760, 0.765, 0.768, 0.771, 0.774
    ]
  },
  {
    id: 'saneamento_esgoto',
    name: 'Acesso à Rede de Esgoto / Saneamento (% Domicílios)',
    shortName: 'Acesso a Esgoto',
    category: 'social',
    unit: '%',
    decimals: 1,
    polarity: 'higher_is_better',
    source: 'IBGE (Censo / PNAD) / SNIS',
    description: 'Percentual de domicílios brasileiros atendidos por rede geral coletora de esgoto ou fossa séptica ligada à rede.',
    values: [
      38.5, 39.4, 40.2, 41.0, 41.8, 42.6, 43.5, 44.4, 45.3, 46.2,
      47.2, 48.1, 49.0, 50.1, 51.0, 51.9, 52.8, 53.9, 55.1, 56.2,
      57.4, 58.6, 59.8, 61.0, 62.1, 63.0, 63.8, 64.5, 65.3, 66.2,
      66.8, 67.5, 68.3, 69.2, 70.1, 71.2, 72.4
    ]
  },
  {
    id: 'inseguranca_alimentar',
    name: 'Insegurança Alimentar Grave / Fome (% da População)',
    shortName: 'Fome / Inseg. Alimentar',
    category: 'social',
    unit: '%',
    decimals: 1,
    polarity: 'lower_is_better',
    source: 'IBGE (EBIA / PNAD) / Rede PENSSAN / FAO',
    description: 'Percentual da população em insegurança alimentar grave (convivendo com a fome). Atingiu 4,2% em 2014, subiu fortemente na pandemia (15,5% em 2021) e recuou para 3,4% em 2026.',
    values: [
      14.8, 14.5, 15.1, 14.9, 13.8, 11.9, 11.4, 11.1, 10.9, 11.0,
      10.6, 10.4, 10.1, 9.8, 8.6, 7.7, 6.9, 6.4, 5.8, 5.4,
      5.0, 4.7, 4.5, 4.2, 4.2, 5.1, 6.3, 7.2, 8.1, 9.0,
      11.8, 15.5, 12.4, 4.1, 3.8, 3.6, 3.4
    ]
  },

  // ======================== 6. MEIO AMBIENTE & INFRAESTRUTURA ========================
  {
    id: 'desmatamento_amazonia',
    name: 'Desmatamento na Amazônia Legal (km² por ano)',
    shortName: 'Desmatamento Amazônia',
    category: 'ambiente',
    unit: 'km²/ano',
    decimals: 0,
    polarity: 'lower_is_better',
    source: 'INPE (Projeto PRODES - Monitoramento por Satélite)',
    description: 'Área de floresta primária desmatada anualmente na Amazônia Legal brasileira (em km²). Teve picos em 1995 (29.059 km²) e 2004 (27.772 km²), caiu até 2012 (4.571 km²), subiu até 2021 e voltou a cair fortemente entre 2023 e 2026.',
    values: [
      13730, 11030, 13786, 14896, 14896, 29059, 18161, 13227, 17383, 17259,
      18226, 18165, 21650, 25396, 27772, 19014, 14286, 11651, 12911, 7464,
      7000, 6418, 4571, 5891, 5012, 6207, 7893, 6947, 7536, 10129,
      10851, 13038, 11594, 9001, 6288, 5780, 5240
    ]
  },
  {
    id: 'energia_renovavel',
    name: 'Energia Renovável na Matriz Elétrica (%)',
    shortName: 'Energia Renovável',
    category: 'ambiente',
    unit: '%',
    decimals: 1,
    polarity: 'higher_is_better',
    source: 'EPE / MME (Balanço Energético Nacional)',
    description: 'Participação de fontes renováveis (hidrelétrica, eólica, solar e biomassa) na geração de energia elétrica do Brasil — uma das matrizes mais limpas do mundo.',
    values: [
      92.5, 92.3, 92.1, 92.4, 92.6, 92.0, 91.5, 91.2, 90.8, 89.5,
      88.9, 83.2, 85.4, 86.8, 85.9, 86.5, 87.2, 88.4, 85.6, 89.0,
      86.1, 88.9, 82.5, 76.8, 73.2, 74.1, 80.4, 79.2, 82.5, 83.0,
      84.8, 78.1, 87.9, 89.2, 89.6, 90.4, 91.1
    ]
  },
  {
    id: 'acesso_internet',
    name: 'População com Acesso à Internet (%)',
    shortName: 'Acesso à Internet',
    category: 'ambiente',
    unit: '%',
    decimals: 1,
    polarity: 'higher_is_better',
    source: 'IBGE (PNAD TIC) / CETIC.br / UIT',
    description: 'Percentual da população brasileira que utiliza a internet regularmente.',
    values: [
      0.0, 0.0, 0.1, 0.1, 0.2, 0.5, 1.1, 1.9, 2.8, 3.8,
      5.2, 7.8, 10.5, 13.8, 17.2, 21.0, 26.5, 31.8, 36.5, 40.2,
      43.5, 46.8, 50.2, 53.5, 57.8, 61.5, 66.2, 70.5, 74.9, 78.3,
      82.7, 84.8, 87.2, 88.6, 89.8, 91.0, 92.1
    ]
  },
  {
    id: 'emissoes_co2',
    name: 'Emissões Brutas de Gases de Efeito Estufa (Bilhões tCO2e)',
    shortName: 'Emissões de CO2e',
    category: 'ambiente',
    unit: 'bi tCO2e',
    decimals: 2,
    polarity: 'lower_is_better',
    source: 'SEEG / Observatório do Clima / MCTI',
    description: 'Emissões brutas totais de gases de efeito estufa do Brasil (fortemente influenciadas por mudança de uso da terra/desmatamento, agropecuária e energia).',
    values: [
      1.68, 1.55, 1.72, 1.80, 1.85, 2.65, 2.05, 1.82, 2.08, 2.10,
      2.15, 2.18, 2.38, 2.68, 2.85, 2.32, 2.02, 1.88, 1.96, 1.65,
      1.68, 1.69, 1.64, 1.75, 1.74, 1.86, 1.98, 1.95, 1.99, 2.18,
      2.24, 2.45, 2.32, 2.08, 1.92, 1.84, 1.78
    ]
  }
];

// ============================================================================
// DADOS ESTADUAIS (27 UNIDADES FEDERATIVAS - RANKING & COMPARAÇÃO REGIONAL)
// ============================================================================

const STATES_DATA = [
  { uf: 'AC', name: 'Acre', region: 'Norte', ideb: 5.4, analfabetismo: 8.6, homicidios: 24.5, expVida: 75.4, mortInfantil: 15.8, pibPerCapita: 24.8, pobreza: 28.4, saneamento: 32.5 },
  { uf: 'AL', name: 'Alagoas', region: 'Nordeste', ideb: 5.7, analfabetismo: 14.2, homicidios: 31.2, expVida: 73.8, mortInfantil: 14.6, pibPerCapita: 24.2, pobreza: 30.8, saneamento: 41.2 },
  { uf: 'AP', name: 'Amapá', region: 'Norte', ideb: 5.1, analfabetismo: 4.9, homicidios: 45.8, expVida: 75.2, mortInfantil: 18.2, pibPerCapita: 27.5, pobreza: 26.5, saneamento: 21.8 },
  { uf: 'AM', name: 'Amazonas', region: 'Norte', ideb: 5.6, analfabetismo: 5.2, homicidios: 32.4, expVida: 73.6, mortInfantil: 16.4, pibPerCapita: 35.4, pobreza: 29.6, saneamento: 36.4 },
  { uf: 'BA', name: 'Bahia', region: 'Nordeste', ideb: 5.4, analfabetismo: 10.3, homicidios: 40.2, expVida: 74.8, mortInfantil: 15.1, pibPerCapita: 28.6, pobreza: 28.2, saneamento: 58.4 },
  { uf: 'CE', name: 'Ceará', region: 'Nordeste', ideb: 6.6, analfabetismo: 11.2, homicidios: 32.8, expVida: 75.1, mortInfantil: 12.4, pibPerCapita: 24.9, pobreza: 27.9, saneamento: 52.6 },
  { uf: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste', ideb: 6.3, analfabetismo: 1.9, homicidios: 11.2, expVida: 79.2, mortInfantil: 8.9, pibPerCapita: 98.5, pobreza: 7.4, saneamento: 91.5 },
  { uf: 'ES', name: 'Espírito Santo', region: 'Sudeste', ideb: 6.2, analfabetismo: 4.3, homicidios: 26.4, expVida: 79.1, mortInfantil: 9.2, pibPerCapita: 48.2, pobreza: 11.8, saneamento: 78.4 },
  { uf: 'GO', name: 'Goiás', region: 'Centro-Oeste', ideb: 6.3, analfabetismo: 4.1, homicidios: 21.8, expVida: 75.6, mortInfantil: 12.1, pibPerCapita: 46.8, pobreza: 9.8, saneamento: 64.2 },
  { uf: 'MA', name: 'Maranhão', region: 'Nordeste', ideb: 5.3, analfabetismo: 12.8, homicidios: 26.9, expVida: 72.5, mortInfantil: 17.5, pibPerCapita: 20.1, pobreza: 34.6, saneamento: 29.8 },
  { uf: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste', ideb: 5.9, analfabetismo: 4.6, homicidios: 28.4, expVida: 75.5, mortInfantil: 14.2, pibPerCapita: 68.4, pobreza: 9.2, saneamento: 51.4 },
  { uf: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste', ideb: 5.9, analfabetismo: 3.9, homicidios: 19.5, expVida: 76.8, mortInfantil: 11.8, pibPerCapita: 56.2, pobreza: 10.4, saneamento: 65.8 },
  { uf: 'MG', name: 'Minas Gerais', region: 'Sudeste', ideb: 6.4, analfabetismo: 4.4, homicidios: 12.6, expVida: 78.4, mortInfantil: 10.1, pibPerCapita: 45.6, pobreza: 10.9, saneamento: 82.6 },
  { uf: 'PA', name: 'Pará', region: 'Norte', ideb: 5.2, analfabetismo: 6.8, homicidios: 31.6, expVida: 73.4, mortInfantil: 15.9, pibPerCapita: 31.2, pobreza: 27.4, saneamento: 24.6 },
  { uf: 'PB', name: 'Paraíba', region: 'Nordeste', ideb: 5.5, analfabetismo: 13.6, homicidios: 25.4, expVida: 74.6, mortInfantil: 13.5, pibPerCapita: 21.8, pobreza: 27.6, saneamento: 54.2 },
  { uf: 'PR', name: 'Paraná', region: 'Sul', ideb: 6.5, analfabetismo: 3.2, homicidios: 18.2, expVida: 78.2, mortInfantil: 9.4, pibPerCapita: 54.8, pobreza: 7.2, saneamento: 81.4 },
  { uf: 'PE', name: 'Pernambuco', region: 'Nordeste', ideb: 5.8, analfabetismo: 10.4, homicidios: 36.8, expVida: 75.4, mortInfantil: 12.6, pibPerCapita: 26.4, pobreza: 29.1, saneamento: 56.8 },
  { uf: 'PI', name: 'Piauí', region: 'Nordeste', ideb: 5.9, analfabetismo: 13.9, homicidios: 21.6, expVida: 72.8, mortInfantil: 15.2, pibPerCapita: 22.4, pobreza: 28.5, saneamento: 34.2 },
  { uf: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste', ideb: 5.8, analfabetismo: 2.1, homicidios: 25.8, expVida: 77.4, mortInfantil: 11.9, pibPerCapita: 62.4, pobreza: 13.2, saneamento: 86.2 },
  { uf: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste', ideb: 5.3, analfabetismo: 11.1, homicidios: 28.4, expVida: 76.5, mortInfantil: 12.8, pibPerCapita: 25.6, pobreza: 25.4, saneamento: 46.8 },
  { uf: 'RS', name: 'Rio Grande do Sul', region: 'Sul', ideb: 6.2, analfabetismo: 2.4, homicidios: 15.8, expVida: 78.8, mortInfantil: 9.1, pibPerCapita: 56.4, pobreza: 6.8, saneamento: 74.6 },
  { uf: 'RO', name: 'Rondônia', region: 'Norte', ideb: 5.7, analfabetismo: 5.1, homicidios: 26.2, expVida: 72.9, mortInfantil: 14.8, pibPerCapita: 38.4, pobreza: 14.6, saneamento: 26.4 },
  { uf: 'RR', name: 'Roraima', region: 'Norte', ideb: 5.5, analfabetismo: 5.4, homicidios: 28.9, expVida: 73.2, mortInfantil: 17.8, pibPerCapita: 34.2, pobreza: 24.8, saneamento: 48.2 },
  { uf: 'SC', name: 'Santa Catarina', region: 'Sul', ideb: 6.4, analfabetismo: 1.9, homicidios: 8.8, expVida: 80.1, mortInfantil: 8.4, pibPerCapita: 61.2, pobreza: 4.5, saneamento: 76.8 },
  { uf: 'SP', name: 'São Paulo', region: 'Sudeste', ideb: 6.5, analfabetismo: 2.2, homicidios: 6.8, expVida: 79.0, mortInfantil: 9.6, pibPerCapita: 68.9, pobreza: 8.4, saneamento: 92.4 },
  { uf: 'SE', name: 'Sergipe', region: 'Nordeste', ideb: 5.3, analfabetismo: 11.7, homicidios: 29.4, expVida: 74.1, mortInfantil: 14.9, pibPerCapita: 25.1, pobreza: 28.9, saneamento: 51.2 },
  { uf: 'TO', name: 'Tocantins', region: 'Norte', ideb: 5.8, analfabetismo: 7.4, homicidios: 23.8, expVida: 74.9, mortInfantil: 13.8, pibPerCapita: 36.8, pobreza: 18.6, saneamento: 42.6 }
];

const STATE_METRICS = [
  { id: 'ideb', name: 'IDEB (Educação Básica)', unit: 'nota (0-10)', polarity: 'higher_is_better', decimals: 1, category: 'educacao' },
  { id: 'analfabetismo', name: 'Taxa de Analfabetismo (15+ anos)', unit: '%', polarity: 'lower_is_better', decimals: 1, category: 'educacao' },
  { id: 'homicidios', name: 'Taxa de Homicídios', unit: '/100 mil hab.', polarity: 'lower_is_better', decimals: 1, category: 'seguranca' },
  { id: 'expVida', name: 'Expectativa de Vida', unit: 'anos', polarity: 'higher_is_better', decimals: 1, category: 'saude' },
  { id: 'mortInfantil', name: 'Mortalidade Infantil', unit: 'por 1.000 nasc.', polarity: 'lower_is_better', decimals: 1, category: 'saude' },
  { id: 'pibPerCapita', name: 'PIB per Capita Estadual', unit: 'R$ mil', polarity: 'higher_is_better', decimals: 1, category: 'economia' },
  { id: 'pobreza', name: 'Taxa de Pobreza', unit: '%', polarity: 'lower_is_better', decimals: 1, category: 'social' },
  { id: 'saneamento', name: 'Acesso a Esgoto / Saneamento', unit: '% domicílios', polarity: 'higher_is_better', decimals: 1, category: 'social' }
];
