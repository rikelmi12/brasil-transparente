// ============================================================================
// BRASIL TRANSPARENTE - MOTOR INTERATIVO DE ANÁLISE & VISUALIZAÇÃO (app.js)
// ============================================================================

const APP_STATE = {
  currentView: 'view-overview',
  theme: 'dark',
  startYear: 1990,
  endYear: 2026,
  highlightedMandateId: null,
  selectedCategory: 'all',
  selectedIndicatorId: 'homicidios_taxa',
  mainValueMode: 'raw', // 'raw' | 'pct_change' | 'mandate_avg'
  mainChartType: 'line', // 'line' | 'bar'
  showPresidentialBands: true,
  mandateRankSort: 'chrono', // 'chrono' | 'best'
  comparatorCalcMode: 'avg', // 'avg' | 'delta' | 'end'
  correlationScaleMode: 'dual' // 'dual' | 'norm'
};

// Instâncias de gráficos Chart.js
let mainChartInstance = null;
let compRadarChartInstance = null;
let compBarChartInstance = null;
let corrLineChartInstance = null;
let corrScatterChartInstance = null;
let statesBarChartInstance = null;

// Eras Consolidadas extras para o Comparador de Governos
const CONSOLIDATED_ERAS = [
  {
    id: 'era_fhc',
    name: 'Era FHC Consolidada (1995–2002)',
    shortName: 'FHC Total',
    party: 'PSDB',
    startYear: 1995,
    endYear: 2002,
    yearsList: [1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002],
    color: '#2563eb'
  },
  {
    id: 'era_lula_1_2',
    name: 'Era Lula I e II (2003–2010)',
    shortName: 'Lula 1+2',
    party: 'PT',
    startYear: 2003,
    endYear: 2010,
    yearsList: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
    color: '#dc2626'
  },
  {
    id: 'era_lula_todos',
    name: 'Lula Todos os Mandatos (03–10 + 23–26)',
    shortName: 'Lula (1+2+3)',
    party: 'PT',
    startYear: 2003,
    endYear: 2026,
    yearsList: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2023, 2024, 2025, 2026],
    color: '#10b981'
  },
  {
    id: 'era_dilma',
    name: 'Era Dilma Consolidada (2011–2016)',
    shortName: 'Dilma 1+2',
    party: 'PT',
    startYear: 2011,
    endYear: 2016,
    yearsList: [2011, 2012, 2013, 2014, 2015, 2016],
    color: '#ec4899'
  }
];

// ============================================================================
// UTILITÁRIOS DE FORMATAÇÃO E ESTATÍSTICA
// ============================================================================

function formatValue(val, decimals = 1, unit = '') {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const formatted = Number(val).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  if (!unit) return formatted;
  if (unit === '%' || unit.startsWith('%')) return `${formatted}${unit}`;
  if (unit === 'R$ (2024)') return `R$ ${formatted}`;
  if (unit === 'US$ PPC') return `US$ ${formatted}`;
  return `${formatted} ${unit}`;
}

function getIndicatorById(id) {
  return INDICATORS.find(i => i.id === id) || INDICATORS[0];
}

function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}

function getMandateOrEraById(id) {
  return MANDATES.find(m => m.id === id) || CONSOLIDATED_ERAS.find(e => e.id === id);
}

// Calcula estatísticas completas de um indicador durante um mandato ou era
function computeMandateIndicatorStats(indicator, mandateObj) {
  const yearsList = mandateObj.yearsList
    ? mandateObj.yearsList
    : YEARS.filter(y => y >= mandateObj.startYear && y <= mandateObj.endYear);

  const indices = yearsList.map(y => YEARS.indexOf(y)).filter(idx => idx !== -1);
  const vals = indices.map(idx => indicator.values[idx]);

  const sum = vals.reduce((a, b) => a + b, 0);
  const avg = vals.length ? sum / vals.length : 0;

  // Valor inicial: usamos o ano imediatamente anterior ao mandato (herança recebida) quando disponível e contínuo,
  // ou o primeiro ano do mandato (ex: 1990 para Collor ou eras não contínuas)
  const firstYearIdx = YEARS.indexOf(mandateObj.startYear);
  const baseIdx = (!mandateObj.yearsList && firstYearIdx > 0) ? firstYearIdx - 1 : firstYearIdx;
  const startFirstYearVal = indicator.values[firstYearIdx];
  const baseVal = indicator.values[baseIdx];
  const endVal = vals[vals.length - 1];

  // Variação dentro do mandato (do primeiro ao último ano ou base -> fim)
  const deltaAbs = endVal - startFirstYearVal;
  const deltaPct = startFirstYearVal !== 0 ? ((endVal - startFirstYearVal) / Math.abs(startFirstYearVal)) * 100 : 0;

  // Variação em relação à entrega do governo anterior
  const deltaFromPrevGov = endVal - baseVal;

  // Avalia se a variação (deltaAbs) foi positiva para o país segundo a polaridade
  let isGoodDelta = null;
  if (Math.abs(deltaAbs) > 0.0001 && indicator.polarity !== 'neutral') {
    if (indicator.polarity === 'higher_is_better') {
      isGoodDelta = deltaAbs > 0;
    } else if (indicator.polarity === 'lower_is_better') {
      isGoodDelta = deltaAbs < 0;
    }
  }

  return {
    mandate: mandateObj,
    yearsList,
    vals,
    avg,
    startVal: startFirstYearVal,
    baseVal,
    endVal,
    deltaAbs,
    deltaPct,
    deltaFromPrevGov,
    isGoodDelta,
    minVal: Math.min(...vals),
    maxVal: Math.max(...vals)
  };
}

// ============================================================================
// PLUGIN CHART.JS: FAIXAS COLORIDAS DOS MANDATOS PRESIDENCIAIS NO FUNDO
// ============================================================================

const presidentialBandsPlugin = {
  id: 'presidentialBands',
  beforeDatasetsDraw(chart, args, pluginOptions) {
    if (!pluginOptions || !pluginOptions.enabled) return;
    const { ctx, chartArea, scales } = chart;
    if (!chartArea || !scales.x) return;

    const labels = chart.data.labels || [];
    if (!labels.length) return;

    ctx.save();

    MANDATES.forEach((m) => {
      // Para evitar sobreposição visual de 2016 no fundo contínuo anual,
      // Temer começa visualmente na transição de 2016->2017 no eixo anual
      const visualStartYear = m.id === 'temer' ? 2016.5 : m.startYear;
      const visualEndYear = m.id === 'dilma2' ? 2016.5 : m.endYear;

      const firstLabelYear = Number(labels[0]);
      const lastLabelYear = Number(labels[labels.length - 1]);

      if (visualEndYear < firstLabelYear || visualStartYear > lastLabelYear) return;

      // Calcula coordenadas X de início e fim da faixa
      const getXForYear = (yr) => {
        const floorY = Math.floor(yr);
        const frac = yr - floorY;
        const idx = labels.indexOf(floorY);
        if (idx === -1) {
          if (yr <= firstLabelYear) return chartArea.left;
          if (yr >= lastLabelYear) return chartArea.right;
          return chartArea.left;
        }
        const xBase = scales.x.getPixelForValue(idx);
        const step = labels.length > 1
          ? (scales.x.getPixelForValue(Math.min(idx + 1, labels.length - 1)) - scales.x.getPixelForValue(Math.max(idx - 1, 0))) / (idx === 0 || idx === labels.length - 1 ? 1 : 2)
          : chartArea.width;

        if (frac > 0) {
          return xBase + step * (frac - 0.5);
        }
        return xBase - step * 0.5;
      };

      const xStart = Math.max(chartArea.left, getXForYear(visualStartYear));
      const xEnd = Math.min(chartArea.right, getXForYear(visualEndYear + 1));
      const width = xEnd - xStart;

      if (width <= 2) return;

      const isHighlighted = APP_STATE.highlightedMandateId === m.id;
      ctx.fillStyle = isHighlighted
        ? m.color + '38'
        : (APP_STATE.theme === 'dark' ? m.color + '16' : m.color + '18');
      ctx.fillRect(xStart, chartArea.top, width, chartArea.bottom - chartArea.top);

      // Linha divisória vertical sutil
      ctx.strokeStyle = isHighlighted ? m.color : (m.color + '55');
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(xStart, chartArea.top);
      ctx.lineTo(xStart, chartArea.bottom);
      ctx.stroke();

      // Rótulo do presidente no topo da faixa
      if (width > 30) {
        ctx.fillStyle = isHighlighted
          ? m.color
          : (APP_STATE.theme === 'dark' ? '#e2e8f0' : '#1e293b');
        ctx.font = `${isHighlighted ? '800' : '700'} 10px Inter, sans-serif`;
        ctx.textAlign = 'center';
        const labelText = width > 62 ? m.shortName : m.avatar;
        ctx.fillText(labelText, xStart + width / 2, chartArea.top + 13);
      }
    });

    ctx.restore();
  }
};

Chart.register(presidentialBandsPlugin);

// ============================================================================
// INICIALIZAÇÃO GERAL DO APP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initYearSelectors();
  renderPresidentsTimelineStrip();
  renderCategoryPills();
  initAllDropdowns();
  renderOverviewPanel();
  renderIndicatorCardsGrid();
  renderComparatorView();
  renderCorrelationView();
  renderGovernmentProfilesView();
  renderStatesView();
  renderRawDataTable();
});

function initYearSelectors() {
  const startSel = document.getElementById('globalStartYear');
  const endSel = document.getElementById('globalEndYear');
  startSel.innerHTML = '';
  endSel.innerHTML = '';

  YEARS.forEach(y => {
    const opt1 = document.createElement('option');
    opt1.value = y;
    opt1.textContent = y;
    if (y === APP_STATE.startYear) opt1.selected = true;
    startSel.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = y;
    opt2.textContent = y;
    if (y === APP_STATE.endYear) opt2.selected = true;
    endSel.appendChild(opt2);
  });
}

function initAllDropdowns() {
  const populateIndicatorSelect = (selectEl, selectedId) => {
    selectEl.innerHTML = '';
    CATEGORIES.filter(c => c.id !== 'all').forEach(cat => {
      const group = document.createElement('optgroup');
      group.label = `${cat.icon} ${cat.name}`;
      INDICATORS.filter(i => i.category === cat.id).forEach(ind => {
        const opt = document.createElement('option');
        opt.value = ind.id;
        opt.textContent = `${ind.name} (${ind.unit})`;
        if (ind.id === selectedId) opt.selected = true;
        group.appendChild(opt);
      });
      selectEl.appendChild(group);
    });
  };

  populateIndicatorSelect(document.getElementById('mainIndicatorSelect'), APP_STATE.selectedIndicatorId);
  populateIndicatorSelect(document.getElementById('compBarIndicatorSelect'), 'pib_crescimento');
  populateIndicatorSelect(document.getElementById('corrSelectA'), 'salario_minimo_real');
  populateIndicatorSelect(document.getElementById('corrSelectB'), 'pobreza_taxa');

  // Seletores de governos no comparador
  const defaultGovs = ['fhc2', 'lula2', 'bolsonaro', 'lula3'];
  ['compSelect1', 'compSelect2', 'compSelect3', 'compSelect4'].forEach((selId, idx) => {
    const sel = document.getElementById(selId);
    sel.innerHTML = '';
    if (idx === 3) {
      const noneOpt = document.createElement('option');
      noneOpt.value = 'none';
      noneOpt.textContent = '— Nenhum (Apenas 3 Governos) —';
      sel.appendChild(noneOpt);
    }

    const grpMandates = document.createElement('optgroup');
    grpMandates.label = '🏛️ Mandatos Individuais (1990–2026)';
    MANDATES.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.name} [${m.party}] (${m.startYear}–${m.endYear})`;
      if (m.id === defaultGovs[idx]) opt.selected = true;
      grpMandates.appendChild(opt);
    });
    sel.appendChild(grpMandates);

    const grpEras = document.createElement('optgroup');
    grpEras.label = '📚 Eras Presidenciais Consolidadas';
    CONSOLIDATED_ERAS.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = `${e.name}`;
      if (e.id === defaultGovs[idx]) opt.selected = true;
      grpEras.appendChild(opt);
    });
    sel.appendChild(grpEras);
  });

  // Seletor de métricas estaduais
  const stateSel = document.getElementById('stateMetricSelect');
  stateSel.innerHTML = '';
  STATE_METRICS.forEach(sm => {
    const opt = document.createElement('option');
    opt.value = sm.id;
    opt.textContent = `${sm.name} (${sm.unit})`;
    stateSel.appendChild(opt);
  });
}

// ============================================================================
// NAVEGAÇÃO DE TELAS E TEMA
// ============================================================================

function switchView(viewId) {
  APP_STATE.currentView = viewId;
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === viewId);
  });
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });

  // Redimensiona gráficos ativos se necessário
  if (viewId === 'view-overview') renderOverviewPanel();
  if (viewId === 'view-comparator') renderComparatorView();
  if (viewId === 'view-correlation') renderCorrelationView();
  if (viewId === 'view-states') renderStatesView();
}

function toggleTheme() {
  APP_STATE.theme = APP_STATE.theme === 'dark' ? 'light' : 'dark';
  if (APP_STATE.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById('btnThemeToggle').innerHTML = '🌙 Tema Escuro';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('btnThemeToggle').innerHTML = '☀️ Tema Claro';
  }
  renderOverviewPanel();
  if (APP_STATE.currentView === 'view-comparator') renderComparatorView();
  if (APP_STATE.currentView === 'view-correlation') renderCorrelationView();
  if (APP_STATE.currentView === 'view-states') renderStatesView();
}

// ============================================================================
// BARRA DE MANDATOS PRESIDENCIAIS NO TOPO
// ============================================================================

function renderPresidentsTimelineStrip() {
  const container = document.getElementById('presidentsTimelineStrip');
  container.innerHTML = '';

  MANDATES.forEach(m => {
    const isActive = APP_STATE.highlightedMandateId === m.id;
    const pill = document.createElement('button');
    pill.className = `president-pill ${isActive ? 'active' : ''}`;
    pill.style.setProperty('--pres-color', m.color);
    pill.style.setProperty('--pres-bg', m.bgLight);
    pill.title = `${m.fullName} (${m.exactPeriod}) — Clique para destacar este governo nos gráficos`;

    pill.innerHTML = `
      <div class="pres-pill-top">
        <span class="pres-avatar-mini">${m.avatar}</span>
        <span class="pres-party-tag">${m.party}</span>
      </div>
      <div class="pres-pill-name">${m.shortName}</div>
      <div class="pres-pill-years">${m.startYear}–${m.endYear}</div>
    `;

    pill.onclick = () => {
      if (APP_STATE.highlightedMandateId === m.id) {
        APP_STATE.highlightedMandateId = null;
      } else {
        APP_STATE.highlightedMandateId = m.id;
        // Se o mandato estiver fora do filtro de ano atual, expande o filtro para incluí-lo
        if (APP_STATE.startYear > m.startYear || APP_STATE.endYear < m.endYear) {
          APP_STATE.startYear = 1990;
          APP_STATE.endYear = 2026;
          initYearSelectors();
        }
      }
      renderPresidentsTimelineStrip();
      renderOverviewPanel();
      if (APP_STATE.currentView === 'view-correlation') renderCorrelationView();
    };

    container.appendChild(pill);
  });
}

function onYearRangeChange() {
  let s = Number(document.getElementById('globalStartYear').value);
  let e = Number(document.getElementById('globalEndYear').value);
  if (s > e) {
    const tmp = s;
    s = e;
    e = tmp;
    document.getElementById('globalStartYear').value = s;
    document.getElementById('globalEndYear').value = e;
  }
  APP_STATE.startYear = s;
  APP_STATE.endYear = e;
  renderOverviewPanel();
  renderIndicatorCardsGrid();
  if (APP_STATE.currentView === 'view-correlation') renderCorrelationView();
}

function resetTimelineFilter() {
  APP_STATE.startYear = 1990;
  APP_STATE.endYear = 2026;
  APP_STATE.highlightedMandateId = null;
  initYearSelectors();
  renderPresidentsTimelineStrip();
  renderOverviewPanel();
  renderIndicatorCardsGrid();
  if (APP_STATE.currentView === 'view-correlation') renderCorrelationView();
}

// ============================================================================
// VIEW 1: PAINEL PRINCIPAL (GRÁFICO, KPIs, RANKING DE MANDATOS E SPARKLINES)
// ============================================================================

function renderCategoryPills() {
  const container = document.getElementById('categoryPillsContainer');
  container.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const count = cat.id === 'all'
      ? INDICATORS.length
      : INDICATORS.filter(i => i.category === cat.id).length;

    const btn = document.createElement('button');
    btn.className = `cat-btn ${APP_STATE.selectedCategory === cat.id ? 'active' : ''}`;
    btn.style.setProperty('--cat-color', cat.color);
    btn.innerHTML = `${cat.icon} ${cat.name} <span style="opacity:0.75; font-size:0.72rem;">(${count})</span>`;
    btn.onclick = () => {
      APP_STATE.selectedCategory = cat.id;
      renderCategoryPills();
      renderIndicatorCardsGrid();
    };
    container.appendChild(btn);
  });
}

function onMainIndicatorChange(indId) {
  APP_STATE.selectedIndicatorId = indId;
  document.getElementById('mainIndicatorSelect').value = indId;
  renderOverviewPanel();
  // Atualiza destaque nos cards abaixo
  document.querySelectorAll('.ind-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.id === indId);
  });
}

function setMainValueMode(mode) {
  APP_STATE.mainValueMode = mode;
  document.querySelectorAll('[data-mode]').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  renderOverviewPanel();
}

function setMainChartType(type) {
  APP_STATE.mainChartType = type;
  document.querySelectorAll('[data-chart]').forEach(b => {
    b.classList.toggle('active', b.dataset.chart === type);
  });
  renderOverviewPanel();
}

function togglePresidentialBands() {
  APP_STATE.showPresidentialBands = !APP_STATE.showPresidentialBands;
  document.getElementById('btnToggleBands').classList.toggle('active', APP_STATE.showPresidentialBands);
  renderOverviewPanel();
}

function setMandateRankSort(sortMode) {
  APP_STATE.mandateRankSort = sortMode;
  document.getElementById('btnSortChrono').classList.toggle('active', sortMode === 'chrono');
  document.getElementById('btnSortBest').classList.toggle('active', sortMode === 'best');
  renderMandatePerformanceList();
}

function renderOverviewPanel() {
  const ind = getIndicatorById(APP_STATE.selectedIndicatorId);
  const cat = getCategoryById(ind.category);

  // Metadados e Polaridade
  const polarityHtml = ind.polarity === 'higher_is_better'
    ? `<span class="polarity-badge polarity-good-up">⬆️ Quanto MAIOR, melhor</span>`
    : ind.polarity === 'lower_is_better'
      ? `<span class="polarity-badge polarity-good-down">⬇️ Quanto MENOR, melhor</span>`
      : `<span class="polarity-badge">⚖️ Indicador Estrutural</span>`;

  document.getElementById('mainIndicatorMeta').innerHTML = `
    <span style="color:${cat.color}; font-weight:700;">${cat.icon} ${cat.name}</span>
    <span>•</span>
    <span>Unidade: <strong>${ind.unit}</strong></span>
    <span>•</span>
    <span>Fonte: <strong>${ind.source}</strong></span>
    ${polarityHtml}
  `;

  // Dica especial se for IPCA com hiperinflação (1990-1994)
  let extraTip = '';
  if (ind.id === 'inflacao_ipca' && APP_STATE.startYear < 1995 && APP_STATE.mainValueMode !== 'mandate_avg') {
    extraTip = ` <button class="preset-chip" style="margin-left:0.5rem; border-color:var(--accent-yellow); color:var(--accent-yellow);" onclick="document.getElementById('globalStartYear').value=1995; onYearRangeChange();">💡 Filtrar Pós-Plano Real (1995–2026) para ver escala normal</button>`;
  }

  document.getElementById('mainIndicatorDesc').innerHTML = `${ind.description}${extraTip}`;

  renderMainChart(ind, cat);
  renderMainKpis(ind);
  renderMandatePerformanceList();
}

function renderMainChart(ind, cat) {
  const ctx = document.getElementById('mainTimelineChart').getContext('2d');
  if (mainChartInstance) {
    mainChartInstance.destroy();
  }

  const textColor = APP_STATE.theme === 'dark' ? '#cbd5e1' : '#334155';
  const gridColor = APP_STATE.theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)';

  // Modo 3: Média por Governo (Barras por Mandato)
  if (APP_STATE.mainValueMode === 'mandate_avg') {
    const mandateStats = MANDATES.map(m => computeMandateIndicatorStats(ind, m));
    const labels = mandateStats.map(ms => `${ms.mandate.shortName} (${ms.mandate.startYear}-${String(ms.mandate.endYear).slice(2)})`);
    const dataVals = mandateStats.map(ms => Number(ms.avg.toFixed(ind.decimals)));
    const bgColors = mandateStats.map(ms =>
      APP_STATE.highlightedMandateId && APP_STATE.highlightedMandateId !== ms.mandate.id
        ? ms.mandate.color + '44'
        : ms.mandate.color + 'cc'
    );

    mainChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `Média no Mandato (${ind.unit})`,
          data: dataVals,
          backgroundColor: bgColors,
          borderColor: mandateStats.map(ms => ms.mandate.color),
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          presidentialBands: { enabled: false },
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const ms = mandateStats[context.dataIndex];
                return [
                  `Média no Governo: ${formatValue(ms.avg, ind.decimals, ind.unit)}`,
                  `Início (${ms.mandate.startYear}): ${formatValue(ms.startVal, ind.decimals, ind.unit)}`,
                  `Entrega (${ms.mandate.endYear}): ${formatValue(ms.endVal, ind.decimals, ind.unit)}`,
                  `Variação: ${ms.deltaAbs >= 0 ? '+' : ''}${formatValue(ms.deltaAbs, ind.decimals, ind.unit)}`
                ];
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: textColor, font: { weight: '600', size: 11 } }, grid: { display: false } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        }
      }
    });
    return;
  }

  // Modo 1 (Valor Real) ou Modo 2 (Variação Anual %)
  const filteredYears = [];
  const filteredVals = [];
  const pointColors = [];
  const pointRadii = [];

  YEARS.forEach((yr, idx) => {
    if (yr < APP_STATE.startYear || yr > APP_STATE.endYear) return;
    filteredYears.push(yr);

    let val = ind.values[idx];
    if (APP_STATE.mainValueMode === 'pct_change') {
      if (idx === 0) {
        val = 0;
      } else {
        const prev = ind.values[idx - 1];
        val = prev !== 0 ? ((ind.values[idx] - prev) / Math.abs(prev)) * 100 : 0;
      }
    }
    filteredVals.push(Number(val.toFixed(2)));

    const mId = YEAR_TO_MANDATE[yr];
    const mObj = getMandateOrEraById(mId);
    const isHl = APP_STATE.highlightedMandateId === mId;
    pointColors.push(mObj ? mObj.color : cat.color);
    pointRadii.push(isHl ? 6.5 : 4);
  });

  const isBar = APP_STATE.mainChartType === 'bar';

  mainChartInstance = new Chart(ctx, {
    type: isBar ? 'bar' : 'line',
    data: {
      labels: filteredYears,
      datasets: [{
        label: APP_STATE.mainValueMode === 'pct_change' ? 'Variação Anual (%)' : `${ind.name} (${ind.unit})`,
        data: filteredVals,
        borderColor: isBar ? pointColors : cat.color,
        backgroundColor: isBar
          ? pointColors.map(c => c + 'bb')
          : (context) => {
              const chart = context.chart;
              const { ctx: c, chartArea } = chart;
              if (!chartArea) return cat.color + '22';
              const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, cat.color + '55');
              gradient.addColorStop(1, cat.color + '05');
              return gradient;
            },
        pointBackgroundColor: pointColors,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: pointRadii,
        pointHoverRadius: 8,
        borderWidth: isBar ? 1.5 : 3,
        borderRadius: isBar ? 4 : 0,
        fill: !isBar,
        tension: 0.28
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        presidentialBands: {
          enabled: APP_STATE.showPresidentialBands
        },
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(148, 163, 184, 0.3)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            title: (items) => {
              const yr = Number(items[0].label);
              const mId = YEAR_TO_MANDATE[yr];
              const mObj = getMandateOrEraById(mId);
              const presLabel = yr === 2016
                ? 'Dilma Rousseff (jan-ago) / Michel Temer (set-dez)'
                : `${mObj.name} (${mObj.party})`;
              return `Ano ${yr} — Presidência: ${presLabel}`;
            },
            label: (context) => {
              const yr = Number(context.label);
              const realIdx = YEARS.indexOf(yr);
              const rawVal = ind.values[realIdx];
              const prevVal = realIdx > 0 ? ind.values[realIdx - 1] : null;
              const diff = prevVal !== null ? rawVal - prevVal : null;
              const lines = [
                `Valor em ${yr}: ${formatValue(rawVal, ind.decimals, ind.unit)}`
              ];
              if (diff !== null) {
                const sign = diff >= 0 ? '+' : '';
                lines.push(`Variação vs ${yr - 1}: ${sign}${formatValue(diff, ind.decimals, ind.unit)}`);
              }
              return lines;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 18 },
          grid: { color: gridColor }
        },
        y: {
          ticks: {
            color: textColor,
            callback: (val) => APP_STATE.mainValueMode === 'pct_change' ? `${val}%` : formatValue(val, ind.decimals, '')
          },
          grid: { color: gridColor }
        }
      }
    }
  });
}

function renderMainKpis(ind) {
  const startIdx = YEARS.indexOf(APP_STATE.startYear);
  const endIdx = YEARS.indexOf(APP_STATE.endYear);
  const sliceVals = ind.values.slice(startIdx, endIdx + 1);
  const sliceYears = YEARS.slice(startIdx, endIdx + 1);

  const firstVal = sliceVals[0];
  const lastVal = sliceVals[sliceVals.length - 1];
  const totalDelta = lastVal - firstVal;
  const totalPct = firstVal !== 0 ? ((lastVal - firstVal) / Math.abs(firstVal)) * 100 : 0;

  // Melhor e pior ano no período selecionado conforme polaridade
  let bestVal = sliceVals[0];
  let worstVal = sliceVals[0];
  let bestYear = sliceYears[0];
  let worstYear = sliceYears[0];

  sliceVals.forEach((v, i) => {
    if (ind.polarity === 'lower_is_better') {
      if (v < bestVal) { bestVal = v; bestYear = sliceYears[i]; }
      if (v > worstVal) { worstVal = v; worstYear = sliceYears[i]; }
    } else {
      if (v > bestVal) { bestVal = v; bestYear = sliceYears[i]; }
      if (v < worstVal) { worstVal = v; worstYear = sliceYears[i]; }
    }
  });

  const bestPres = getMandateOrEraById(YEAR_TO_MANDATE[bestYear]);
  const worstPres = getMandateOrEraById(YEAR_TO_MANDATE[worstYear]);

  const isOverallGood = ind.polarity === 'higher_is_better'
    ? totalDelta >= 0
    : ind.polarity === 'lower_is_better'
      ? totalDelta <= 0
      : true;

  const deltaClass = isOverallGood ? 'var(--good-text)' : 'var(--bad-text)';
  const sign = totalDelta >= 0 ? '+' : '';

  document.getElementById('mainKpiStrip').innerHTML = `
    <div class="kpi-box">
      <div class="kpi-label">Valor Inicial (${APP_STATE.startYear})</div>
      <div class="kpi-val">${formatValue(firstVal, ind.decimals, ind.unit)}</div>
      <div class="kpi-sub">Governo ${getMandateOrEraById(YEAR_TO_MANDATE[APP_STATE.startYear]).shortName}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Valor Mais Recente (${APP_STATE.endYear})</div>
      <div class="kpi-val">${formatValue(lastVal, ind.decimals, ind.unit)}</div>
      <div class="kpi-sub">Governo ${getMandateOrEraById(YEAR_TO_MANDATE[APP_STATE.endYear]).shortName}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Evolução no Período (${APP_STATE.startYear}→${APP_STATE.endYear})</div>
      <div class="kpi-val" style="color:${deltaClass}">${sign}${formatValue(totalDelta, ind.decimals, ind.unit)}</div>
      <div class="kpi-sub">${sign}${totalPct.toFixed(1)}% de variação acumulada</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Melhor Marca vs Pior Marca</div>
      <div class="kpi-val" style="font-size:0.95rem; color:var(--good-text);">
        🏅 ${bestYear} (${bestPres.shortName}): ${formatValue(bestVal, ind.decimals, ind.unit)}
      </div>
      <div class="kpi-sub" style="color:var(--bad-text);">
        ⚠️ ${worstYear} (${worstPres.shortName}): ${formatValue(worstVal, ind.decimals, ind.unit)}
      </div>
    </div>
  `;
}

// Renderiza a lista lateral direita de como cada presidente se saiu no indicador atual
function renderMandatePerformanceList() {
  const ind = getIndicatorById(APP_STATE.selectedIndicatorId);
  const container = document.getElementById('mandatePerformanceList');
  container.innerHTML = '';

  let statsList = MANDATES.map(m => computeMandateIndicatorStats(ind, m));

  if (APP_STATE.mandateRankSort === 'best') {
    statsList.sort((a, b) => {
      if (ind.polarity === 'lower_is_better') return a.avg - b.avg;
      return b.avg - a.avg;
    });
  }

  statsList.forEach((st, idx) => {
    const m = st.mandate;
    const isHl = APP_STATE.highlightedMandateId === m.id;
    const row = document.createElement('div');
    row.className = 'mandate-perf-row';
    row.style.setProperty('--pres-color', m.color);
    if (isHl) {
      row.style.background = m.bgLight;
      row.style.borderColor = m.color;
    }

    const deltaSign = st.deltaAbs >= 0 ? '+' : '';
    const pillClass = st.isGoodDelta === null
      ? 'delta-neutral'
      : st.isGoodDelta ? 'delta-good' : 'delta-bad';

    const rankBadge = APP_STATE.mandateRankSort === 'best'
      ? `<span style="font-size:0.7rem; background:var(--bg-elevated); padding:0.1rem 0.35rem; border-radius:4px;">#${idx + 1}º</span>`
      : '';

    row.innerHTML = `
      <div class="mp-pres-info">
        <div class="mp-pres-name">
          ${rankBadge}
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${m.color};"></span>
          ${m.name}
        </div>
        <div class="mp-pres-years">${m.party} • ${m.startYear}–${m.endYear} (${formatValue(st.startVal, ind.decimals, '')} → ${formatValue(st.endVal, ind.decimals, '')})</div>
      </div>

      <div class="mp-stat-col">
        <span class="mp-stat-label">Média Governo</span>
        <span class="mp-stat-val">${formatValue(st.avg, ind.decimals, ind.unit)}</span>
      </div>

      <div class="mp-stat-col">
        <span class="mp-stat-label">Variação Mandato</span>
        <span class="delta-pill ${pillClass}">
          ${deltaSign}${formatValue(st.deltaAbs, ind.decimals, ind.unit)}
        </span>
      </div>
    `;

    row.onclick = () => {
      APP_STATE.highlightedMandateId = APP_STATE.highlightedMandateId === m.id ? null : m.id;
      renderPresidentsTimelineStrip();
      renderOverviewPanel();
    };

    container.appendChild(row);
  });
}

// ============================================================================
// GRADE DE CARTÕES DE TODOS OS 36 INDICADORES COM SPARKLINE SVG
// ============================================================================

function createSparklineSVG(values, color) {
  if (!values || values.length < 2) return '';
  const w = 260;
  const h = 56;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const areaPoints = `${pad},${h - pad} ${points.join(' ')} ${w - pad},${h - pad}`;
  const lastPt = points[points.length - 1].split(',');

  return `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">
      <polygon points="${areaPoints}" fill="${color}" fill-opacity="0.14" />
      <polyline fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="${points.join(' ')}" />
      <circle cx="${lastPt[0]}" cy="${lastPt[1]}" r="3.5" fill="${color}" />
    </svg>
  `;
}

function renderIndicatorCardsGrid() {
  const container = document.getElementById('allIndicatorsGrid');
  const query = (document.getElementById('indicatorSearchInput').value || '').trim().toLowerCase();
  container.innerHTML = '';

  const startIdx = YEARS.indexOf(APP_STATE.startYear);
  const endIdx = YEARS.indexOf(APP_STATE.endYear);

  const filtered = INDICATORS.filter(ind => {
    const matchCat = APP_STATE.selectedCategory === 'all' || ind.category === APP_STATE.selectedCategory;
    const matchSearch = !query ||
      ind.name.toLowerCase().includes(query) ||
      ind.shortName.toLowerCase().includes(query) ||
      ind.description.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  document.getElementById('indicatorCountLabel').textContent = filtered.length;

  filtered.forEach(ind => {
    const cat = getCategoryById(ind.category);
    const slice = ind.values.slice(startIdx, endIdx + 1);
    const vStart = slice[0];
    const vEnd = slice[slice.length - 1];
    const delta = vEnd - vStart;

    let isGood = true;
    if (ind.polarity === 'higher_is_better') isGood = delta >= 0;
    if (ind.polarity === 'lower_is_better') isGood = delta <= 0;

    const sparkColor = ind.polarity === 'neutral'
      ? cat.color
      : isGood ? '#10b981' : '#ef4444';

    const pillClass = ind.polarity === 'neutral'
      ? 'delta-neutral'
      : isGood ? 'delta-good' : 'delta-bad';

    const card = document.createElement('div');
    card.className = `ind-card ${APP_STATE.selectedIndicatorId === ind.id ? 'selected' : ''}`;
    card.dataset.id = ind.id;

    card.innerHTML = `
      <div>
        <div class="ind-card-top">
          <span class="ind-cat-tag" style="background:${cat.color}22; color:${cat.color};">
            ${cat.icon} ${cat.name}
          </span>
          <span class="delta-pill ${pillClass}">
            ${delta >= 0 ? '+' : ''}${formatValue(delta, ind.decimals, ind.unit)}
          </span>
        </div>
        <div class="ind-card-title">${ind.name}</div>
      </div>

      <div class="ind-card-numbers">
        <div>
          <span class="ind-current-val">${formatValue(vEnd, ind.decimals, '')}</span>
          <span class="ind-unit">${ind.unit} (${APP_STATE.endYear})</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted);">
          Em ${APP_STATE.startYear}: <strong>${formatValue(vStart, ind.decimals, '')}</strong>
        </div>
      </div>

      <div class="ind-spark-wrap">
        ${createSparklineSVG(slice, sparkColor)}
      </div>

      <div class="ind-card-footer">
        <span>Fonte: ${ind.source.split('(')[0].trim()}</span>
        <span style="color:var(--accent-blue); font-weight:700;">Ver gráfico →</span>
      </div>
    `;

    card.onclick = () => {
      onMainIndicatorChange(ind.id);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    container.appendChild(card);
  });
}

// ============================================================================
// VIEW 2: COMPARADOR DIRETO DE PRESIDENTES (RADAR, BARRAS, PLACAR E TABELA)
// ============================================================================

function getSelectedComparatorGovernments() {
  const ids = [
    document.getElementById('compSelect1').value,
    document.getElementById('compSelect2').value,
    document.getElementById('compSelect3').value,
    document.getElementById('compSelect4').value
  ].filter(id => id && id !== 'none');

  // Remove duplicatas mantendo ordem
  const uniqueIds = [...new Set(ids)];
  return uniqueIds.map(id => getMandateOrEraById(id)).filter(Boolean);
}

function setComparatorCalcMode(mode) {
  APP_STATE.comparatorCalcMode = mode;
  document.getElementById('compMetricAvg').classList.toggle('active', mode === 'avg');
  document.getElementById('compMetricDelta').classList.toggle('active', mode === 'delta');
  document.getElementById('compMetricEnd').classList.toggle('active', mode === 'end');
  renderComparatorView();
}

function applyComparatorPreset(idsArray) {
  ['compSelect1', 'compSelect2', 'compSelect3', 'compSelect4'].forEach((selId, i) => {
    document.getElementById(selId).value = idsArray[i] || 'none';
  });
  renderComparatorView();
}

function getComparatorMetricValue(statsObj, mode) {
  if (mode === 'delta') return statsObj.deltaAbs;
  if (mode === 'end') return statsObj.endVal;
  return statsObj.avg;
}

function renderComparatorView() {
  const govs = getSelectedComparatorGovernments();
  renderComparatorScoreboard(govs);
  renderComparatorRadarChart(govs);
  renderComparatorBarChart();
  renderComparatorTable();
}

function renderComparatorScoreboard(govs) {
  const winCounts = {};
  govs.forEach(g => { winCounts[g.id] = { totalWins: 0, byCat: {} }; });

  INDICATORS.filter(ind => ind.polarity !== 'neutral').forEach(ind => {
    const scores = govs.map(g => {
      const st = computeMandateIndicatorStats(ind, g);
      const val = getComparatorMetricValue(st, APP_STATE.comparatorCalcMode);
      return { govId: g.id, val };
    });

    let bestVal = scores[0].val;
    scores.forEach(s => {
      if (ind.polarity === 'lower_is_better') {
        if (s.val < bestVal) bestVal = s.val;
      } else {
        if (s.val > bestVal) bestVal = s.val;
      }
    });

    scores.forEach(s => {
      if (Math.abs(s.val - bestVal) < 0.0001) {
        winCounts[s.govId].totalWins += 1;
        winCounts[s.govId].byCat[ind.category] = (winCounts[s.govId].byCat[ind.category] || 0) + 1;
      }
    });
  });

  const modeLabel = APP_STATE.comparatorCalcMode === 'avg'
    ? 'Média no Mandato'
    : APP_STATE.comparatorCalcMode === 'delta'
      ? 'Evolução (Início → Fim)'
      : 'Valor na Entrega';

  const container = document.getElementById('comparatorScoreboard');
  container.innerHTML = '';

  govs.forEach(g => {
    const w = winCounts[g.id];
    const card = document.createElement('div');
    card.className = 'score-card';
    card.style.setProperty('--pres-color', g.color);
    card.innerHTML = `
      <div class="score-card-title">
        <span>${g.name}</span>
        <span class="pres-party-tag">${g.party}</span>
      </div>
      <div style="font-size:0.75rem; color:var(--text-muted);">Período: ${g.startYear}–${g.endYear}</div>
      <div class="score-big">${w.totalWins} <span style="font-size:0.82rem; font-weight:600; color:var(--text-secondary);">indicadores líderes</span></div>
      <div style="font-size:0.74rem; color:var(--text-muted);">
        Critério ativo: <strong>${modeLabel}</strong> (de 34 indicadores avaliados)
      </div>
    `;
    container.appendChild(card);
  });
}

function renderComparatorRadarChart(govs) {
  const ctx = document.getElementById('comparatorRadarChart').getContext('2d');
  if (compRadarChartInstance) compRadarChartInstance.destroy();

  const cats = CATEGORIES.filter(c => c.id !== 'all');
  const labels = cats.map(c => `${c.icon} ${c.name.split('&')[0].trim()}`);

  // Calcula nota de 0 a 100 para cada governo em cada categoria comparando contra todos os 11 mandatos históricos
  const datasets = govs.map(g => {
    const catScores = cats.map(cat => {
      const catInds = INDICATORS.filter(i => i.category === cat.id && i.polarity !== 'neutral');
      const normScores = catInds.map(ind => {
        const allStats = MANDATES.map(m => getComparatorMetricValue(computeMandateIndicatorStats(ind, m), APP_STATE.comparatorCalcMode));
        const gVal = getComparatorMetricValue(computeMandateIndicatorStats(ind, g), APP_STATE.comparatorCalcMode);
        const min = Math.min(...allStats, gVal);
        const max = Math.max(...allStats, gVal);
        if (max - min === 0) return 50;
        const ratio = (gVal - min) / (max - min);
        return ind.polarity === 'lower_is_better' ? (1 - ratio) * 100 : ratio * 100;
      });
      const avgScore = normScores.reduce((a, b) => a + b, 0) / (normScores.length || 1);
      return Number(avgScore.toFixed(1));
    });

    return {
      label: g.shortName,
      data: catScores,
      borderColor: g.color,
      backgroundColor: g.color + '28',
      pointBackgroundColor: g.color,
      borderWidth: 2.5
    };
  });

  const textColor = APP_STATE.theme === 'dark' ? '#e2e8f0' : '#1e293b';
  const gridColor = APP_STATE.theme === 'dark' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.12)';

  compRadarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 25, display: false },
          grid: { color: gridColor },
          angleLines: { color: gridColor },
          pointLabels: { color: textColor, font: { size: 11, weight: '700' } }
        }
      },
      plugins: {
        presidentialBands: { enabled: false },
        legend: {
          position: 'bottom',
          labels: { color: textColor, font: { weight: '700' } }
        }
      }
    }
  });
}

function renderComparatorBarChart() {
  const ctx = document.getElementById('comparatorBarChart').getContext('2d');
  if (compBarChartInstance) compBarChartInstance.destroy();

  const indId = document.getElementById('compBarIndicatorSelect').value;
  const ind = getIndicatorById(indId);
  const selectedGovIds = getSelectedComparatorGovernments().map(g => g.id);

  const statsAll = MANDATES.map(m => computeMandateIndicatorStats(ind, m));
  const labels = statsAll.map(s => s.mandate.shortName);
  const values = statsAll.map(s => Number(getComparatorMetricValue(s, APP_STATE.comparatorCalcMode).toFixed(ind.decimals)));

  const colors = statsAll.map(s =>
    selectedGovIds.includes(s.mandate.id) ? s.mandate.color : s.mandate.color + '55'
  );

  const textColor = APP_STATE.theme === 'dark' ? '#cbd5e1' : '#334155';
  const gridColor = APP_STATE.theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)';

  compBarChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: ind.name,
        data: values,
        backgroundColor: colors,
        borderColor: statsAll.map(s => s.mandate.color),
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        presidentialBands: { enabled: false },
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `${ind.shortName}: ${formatValue(c.raw, ind.decimals, ind.unit)}`
          }
        }
      },
      scales: {
        x: { ticks: { color: textColor, font: { weight: '600', size: 11 } }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      }
    }
  });
}

function renderComparatorTable() {
  const govs = getSelectedComparatorGovernments();
  const catFilter = document.getElementById('compTableCategoryFilter').value;
  const table = document.getElementById('comparatorFullTable');

  const inds = INDICATORS.filter(i => catFilter === 'all' || i.category === catFilter);

  let thead = `
    <thead>
      <tr>
        <th>Categoria</th>
        <th>Indicador</th>
        <th>Critério Melhor</th>
        ${govs.map(g => `<th style="border-top: 3px solid ${g.color};">${g.name}<br><small style="font-weight:500; opacity:0.8;">${g.startYear}–${g.endYear}</small></th>`).join('')}
      </tr>
    </thead>
  `;

  let tbody = '<tbody>';
  inds.forEach(ind => {
    const cat = getCategoryById(ind.category);
    const govStats = govs.map(g => {
      const st = computeMandateIndicatorStats(ind, g);
      return {
        gov: g,
        st,
        val: getComparatorMetricValue(st, APP_STATE.comparatorCalcMode)
      };
    });

    let bestVal = govStats[0].val;
    govStats.forEach(gs => {
      if (ind.polarity === 'lower_is_better') {
        if (gs.val < bestVal) bestVal = gs.val;
      } else {
        if (gs.val > bestVal) bestVal = gs.val;
      }
    });

    const polText = ind.polarity === 'higher_is_better'
      ? '⬆️ Maior'
      : ind.polarity === 'lower_is_better'
        ? '⬇️ Menor'
        : '⚖️ Neutro';

    tbody += `
      <tr>
        <td><span style="color:${cat.color}; font-weight:700;">${cat.icon} ${cat.name.split('&')[0]}</span></td>
        <td>
          <strong>${ind.name}</strong>
          <div style="font-size:0.72rem; color:var(--text-muted);">Unidade: ${ind.unit}</div>
        </td>
        <td><span style="font-size:0.75rem;">${polText}</span></td>
        ${govStats.map(gs => {
          const isWinner = ind.polarity !== 'neutral' && Math.abs(gs.val - bestVal) < 0.0001;
          const sign = APP_STATE.comparatorCalcMode === 'delta' && gs.val >= 0 ? '+' : '';
          return `
            <td class="${isWinner ? 'winner-cell' : ''}">
              <div style="font-size:0.9rem; font-weight:700;">
                ${isWinner ? '🏆 ' : ''}${sign}${formatValue(gs.val, ind.decimals, ind.unit)}
              </div>
              <div style="font-size:0.71rem; color:var(--text-muted);">
                Início: ${formatValue(gs.st.startVal, ind.decimals, '')} → Fim: ${formatValue(gs.st.endVal, ind.decimals, '')}
              </div>
            </td>
          `;
        }).join('')}
      </tr>
    `;
  });
  tbody += '</tbody>';
  table.innerHTML = thead + tbody;
}

// ============================================================================
// VIEW 3: CRUZAMENTO DE DADOS & CORRELAÇÃO ESTATÍSTICA
// ============================================================================

function setCorrelationScaleMode(mode) {
  APP_STATE.correlationScaleMode = mode;
  document.getElementById('corrScaleDual').classList.toggle('active', mode === 'dual');
  document.getElementById('corrScaleNorm').classList.toggle('active', mode === 'norm');
  renderCorrelationView();
}

function setCorrelationPair(idA, idB) {
  document.getElementById('corrSelectA').value = idA;
  document.getElementById('corrSelectB').value = idB;
  renderCorrelationView();
}

function computePearsonCorrelation(x, y) {
  const n = x.length;
  if (n < 2) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

function renderCorrelationView() {
  const indA = getIndicatorById(document.getElementById('corrSelectA').value);
  const indB = getIndicatorById(document.getElementById('corrSelectB').value);

  const startIdx = YEARS.indexOf(APP_STATE.startYear);
  const endIdx = YEARS.indexOf(APP_STATE.endYear);
  const yearsSlice = YEARS.slice(startIdx, endIdx + 1);
  const valsA = indA.values.slice(startIdx, endIdx + 1);
  const valsB = indB.values.slice(startIdx, endIdx + 1);

  const r = computePearsonCorrelation(valsA, valsB);
  const absR = Math.abs(r);
  let strength = 'Fraca / Inexistente';
  if (absR >= 0.75) strength = 'Forte';
  else if (absR >= 0.45) strength = 'Moderada';

  const direction = r > 0.15
    ? 'Positiva (Sobem/Caem juntos)'
    : r < -0.15
      ? 'Inversa / Negativa (Quando um sobe, o outro cai)'
      : 'Sem tendência linear clara';

  document.getElementById('correlationStatsBanner').innerHTML = `
    <div class="kpi-box" style="background:var(--bg-card);">
      <div class="kpi-label">Coeficiente de Correlação (Pearson r)</div>
      <div class="kpi-val" style="color:var(--accent-blue);">${r >= 0 ? '+' : ''}${r.toFixed(2)}</div>
      <div class="kpi-sub">Intensidade: <strong>${strength}</strong> (${APP_STATE.startYear}–${APP_STATE.endYear})</div>
    </div>
    <div class="kpi-box" style="background:var(--bg-card);">
      <div class="kpi-label">Relação Observada</div>
      <div class="kpi-val" style="font-size:1rem;">${direction}</div>
      <div class="kpi-sub">${indA.shortName} × ${indB.shortName}</div>
    </div>
    <div class="kpi-box" style="background:var(--bg-card);">
      <div class="kpi-label">Indicador A (${APP_STATE.startYear} → ${APP_STATE.endYear})</div>
      <div class="kpi-val" style="color:#3b82f6; font-size:1rem;">${formatValue(valsA[0], indA.decimals, indA.unit)} → ${formatValue(valsA[valsA.length - 1], indA.decimals, indA.unit)}</div>
      <div class="kpi-sub">${indA.name}</div>
    </div>
    <div class="kpi-box" style="background:var(--bg-card);">
      <div class="kpi-label">Indicador B (${APP_STATE.startYear} → ${APP_STATE.endYear})</div>
      <div class="kpi-val" style="color:#10b981; font-size:1rem;">${formatValue(valsB[0], indB.decimals, indB.unit)} → ${formatValue(valsB[valsB.length - 1], indB.decimals, indB.unit)}</div>
      <div class="kpi-sub">${indB.name}</div>
    </div>
  `;

  const textColor = APP_STATE.theme === 'dark' ? '#cbd5e1' : '#334155';
  const gridColor = APP_STATE.theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)';

  // 1. Gráfico de Linha Duplo
  const ctxLine = document.getElementById('correlationLineChart').getContext('2d');
  if (corrLineChartInstance) corrLineChartInstance.destroy();

  const normalize0100 = (arr) => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const rng = max - min || 1;
    return arr.map(v => Number((((v - min) / rng) * 100).toFixed(1)));
  };

  const dataA = APP_STATE.correlationScaleMode === 'norm' ? normalize0100(valsA) : valsA;
  const dataB = APP_STATE.correlationScaleMode === 'norm' ? normalize0100(valsB) : valsB;

  corrLineChartInstance = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: yearsSlice,
      datasets: [
        {
          label: `${indA.shortName} (${indA.unit})`,
          data: dataA,
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f633',
          yAxisID: 'y',
          borderWidth: 3,
          tension: 0.25,
          pointRadius: 3.5
        },
        {
          label: `${indB.shortName} (${indB.unit})`,
          data: dataB,
          borderColor: '#10b981',
          backgroundColor: '#10b98133',
          yAxisID: APP_STATE.correlationScaleMode === 'norm' ? 'y' : 'y1',
          borderWidth: 3,
          tension: 0.25,
          pointRadius: 3.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        presidentialBands: { enabled: true },
        legend: { labels: { color: textColor, font: { weight: '700' } } }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: {
          type: 'linear',
          position: 'left',
          ticks: { color: '#3b82f6' },
          grid: { color: gridColor }
        },
        y1: {
          type: 'linear',
          position: 'right',
          display: APP_STATE.correlationScaleMode === 'dual',
          ticks: { color: '#10b981' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });

  // 2. Gráfico de Dispersão (Scatter) colorido por Presidente
  const ctxScatter = document.getElementById('correlationScatterChart').getContext('2d');
  if (corrScatterChartInstance) corrScatterChartInstance.destroy();

  const scatterDatasets = MANDATES.map(m => {
    const pts = [];
    yearsSlice.forEach((yr, idx) => {
      if (YEAR_TO_MANDATE[yr] === m.id) {
        pts.push({ x: valsA[idx], y: valsB[idx], year: yr });
      }
    });
    return {
      label: m.shortName,
      data: pts,
      backgroundColor: m.color,
      borderColor: '#fff',
      borderWidth: 1.5,
      pointRadius: 6.5,
      pointHoverRadius: 9
    };
  }).filter(ds => ds.data.length > 0);

  corrScatterChartInstance = new Chart(ctxScatter, {
    type: 'scatter',
    data: { datasets: scatterDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        presidentialBands: { enabled: false },
        legend: {
          position: 'bottom',
          labels: { color: textColor, boxWidth: 10, font: { size: 11, weight: '600' } }
        },
        tooltip: {
          callbacks: {
            label: (c) => {
              const pt = c.raw;
              return `${pt.year} (${c.dataset.label}): ${indA.shortName}=${formatValue(pt.x, indA.decimals, indA.unit)} | ${indB.shortName}=${formatValue(pt.y, indB.decimals, indB.unit)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: `${indA.name} (${indA.unit})`, color: textColor, font: { weight: '700' } },
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          title: { display: true, text: `${indB.name} (${indB.unit})`, color: textColor, font: { weight: '700' } },
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

// ============================================================================
// VIEW 4: RAIO-X COMPLETO DOS GOVERNOS (FICHAS PRESIDENCIAIS AUTOMÁTICAS)
// ============================================================================

function renderGovernmentProfilesView() {
  const container = document.getElementById('governmentProfilesContainer');
  container.innerHTML = '';

  MANDATES.forEach(m => {
    // Avalia todos os indicadores para este mandato para destacar os 4 maiores avanços e os 4 maiores desafios
    const allPerf = INDICATORS.filter(i => i.polarity !== 'neutral').map(ind => {
      const st = computeMandateIndicatorStats(ind, m);
      // Calcula o score percentual normalizado de melhoria
      const rawPct = st.deltaPct;
      const improvementScore = ind.polarity === 'higher_is_better' ? rawPct : -rawPct;
      return { ind, st, improvementScore };
    });

    const sortedGood = [...allPerf].sort((a, b) => b.improvementScore - a.improvementScore);
    const topPositives = sortedGood.filter(x => x.improvementScore > 0).slice(0, 4);
    const topChallenges = [...allPerf].sort((a, b) => a.improvementScore - b.improvementScore).slice(0, 4);

    // Estatísticas-chave fixas do mandato
    const pibSt = computeMandateIndicatorStats(getIndicatorById('pib_crescimento'), m);
    const ipcaSt = computeMandateIndicatorStats(getIndicatorById('inflacao_ipca'), m);
    const homSt = computeMandateIndicatorStats(getIndicatorById('homicidios_taxa'), m);
    const pobSt = computeMandateIndicatorStats(getIndicatorById('pobreza_taxa'), m);

    const card = document.createElement('div');
    card.className = 'gov-card';
    card.style.setProperty('--pres-color', m.color);

    card.innerHTML = `
      <div class="gov-card-header">
        <div class="gov-avatar-lg">${m.avatar}</div>
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            <h3 style="font-size:1.15rem; font-weight:800;">${m.fullName}</h3>
            <span class="pres-party-tag" style="background:${m.color}28; color:${m.color};">${m.party}</span>
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">
            Mandato: ${m.exactPeriod} • Vice: ${m.vice}
          </div>
        </div>
      </div>

      <p class="gov-context">${m.context}</p>

      <!-- Resumo de 4 Pilares Rápidos -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.5rem;">
        <div class="kpi-box" style="padding:0.5rem;">
          <div class="kpi-label" style="font-size:0.65rem;">PIB Médio</div>
          <div class="kpi-val" style="font-size:0.95rem;">${pibSt.avg >= 0 ? '+' : ''}${pibSt.avg.toFixed(1)}%</div>
        </div>
        <div class="kpi-box" style="padding:0.5rem;">
          <div class="kpi-label" style="font-size:0.65rem;">IPCA Médio</div>
          <div class="kpi-val" style="font-size:0.95rem;">${ipcaSt.avg.toFixed(1)}%</div>
        </div>
        <div class="kpi-box" style="padding:0.5rem;">
          <div class="kpi-label" style="font-size:0.65rem;">Homicídios</div>
          <div class="kpi-val" style="font-size:0.95rem;">${homSt.startVal.toFixed(1)}→${homSt.endVal.toFixed(1)}</div>
        </div>
        <div class="kpi-box" style="padding:0.5rem;">
          <div class="kpi-label" style="font-size:0.65rem;">Pobreza</div>
          <div class="kpi-val" style="font-size:0.95rem;">${pobSt.startVal.toFixed(1)}%→${pobSt.endVal.toFixed(1)}%</div>
        </div>
      </div>

      <div class="gov-highlights-cols">
        <div class="gov-hl-box">
          <h4 style="color:var(--good-text);">✅ Melhores Resultados no Período</h4>
          <ul class="gov-hl-list">
            ${topPositives.map(item => `
              <li>
                <strong>${item.ind.shortName}:</strong>
                <span style="color:var(--good-text); font-weight:700;">
                  ${formatValue(item.st.startVal, item.ind.decimals, '')} → ${formatValue(item.st.endVal, item.ind.decimals, item.ind.unit)}
                </span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="gov-hl-box">
          <h4 style="color:var(--bad-text);">⚠️ Pontos Críticos / Desafios</h4>
          <ul class="gov-hl-list">
            ${topChallenges.map(item => `
              <li>
                <strong>${item.ind.shortName}:</strong>
                <span style="color:var(--bad-text); font-weight:700;">
                  ${formatValue(item.st.startVal, item.ind.decimals, '')} → ${formatValue(item.st.endVal, item.ind.decimals, item.ind.unit)}
                </span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <div class="gov-milestones">
        <h4>📌 Principais Marcos Históricos & Políticas</h4>
        <ul>
          ${m.milestones.map(ms => `<li>${ms}</li>`).join('')}
        </ul>
      </div>
    `;

    container.appendChild(card);
  });
}

// ============================================================================
// VIEW 5: ESTADOS & REGIÕES (27 UFs)
// ============================================================================

const REGION_COLORS = {
  'Norte': '#10b981',
  'Nordeste': '#f59e0b',
  'Centro-Oeste': '#8b5cf6',
  'Sudeste': '#3b82f6',
  'Sul': '#ec4899'
};

function renderStatesView() {
  const metricId = document.getElementById('stateMetricSelect').value || 'ideb';
  const regionFilter = document.getElementById('stateRegionFilter').value || 'all';
  const metric = STATE_METRICS.find(m => m.id === metricId) || STATE_METRICS[0];

  document.getElementById('stateChartTitle').textContent = `📊 Ranking Estadual: ${metric.name} (${metric.unit})`;

  const filteredStates = STATES_DATA.filter(s => regionFilter === 'all' || s.region === regionFilter);

  // Ordena do melhor para o pior segundo a polaridade do indicador
  filteredStates.sort((a, b) => {
    if (metric.polarity === 'lower_is_better') return a[metricId] - b[metricId];
    return b[metricId] - a[metricId];
  });

  const ctx = document.getElementById('statesBarChart').getContext('2d');
  if (statesBarChartInstance) statesBarChartInstance.destroy();

  const textColor = APP_STATE.theme === 'dark' ? '#cbd5e1' : '#334155';
  const gridColor = APP_STATE.theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)';

  statesBarChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: filteredStates.map((s, idx) => `${idx + 1}º ${s.uf} - ${s.name}`),
      datasets: [{
        label: `${metric.name} (${metric.unit})`,
        data: filteredStates.map(s => s[metricId]),
        backgroundColor: filteredStates.map(s => REGION_COLORS[s.region] + 'cc'),
        borderColor: filteredStates.map(s => REGION_COLORS[s.region]),
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        presidentialBands: { enabled: false },
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor, font: { size: 11, weight: '600' } }, grid: { display: false } }
      }
    }
  });

  // Tabela das 27 UFs
  const table = document.getElementById('statesRankingTable');
  let html = `
    <thead>
      <tr>
        <th>Pos.</th>
        <th>UF</th>
        <th>Região</th>
        <th>IDEB</th>
        <th>Analfab.</th>
        <th>Homicídios</th>
        <th>Exp. Vida</th>
        <th>Mort. Inf.</th>
        <th>Pobreza</th>
        <th>Esgoto</th>
      </tr>
    </thead>
    <tbody>
  `;

  filteredStates.forEach((s, idx) => {
    const regColor = REGION_COLORS[s.region];
    html += `
      <tr>
        <td><strong>#${idx + 1}º</strong></td>
        <td><strong>${s.name} (${s.uf})</strong></td>
        <td><span style="color:${regColor}; font-weight:700;">${s.region}</span></td>
        <td>${s.ideb.toFixed(1)}</td>
        <td>${s.analfabetismo.toFixed(1)}%</td>
        <td>${s.homicidios.toFixed(1)}</td>
        <td>${s.expVida.toFixed(1)} a</td>
        <td>${s.mortInfantil.toFixed(1)}</td>
        <td>${s.pobreza.toFixed(1)}%</td>
        <td>${s.saneamento.toFixed(1)}%</td>
      </tr>
    `;
  });

  html += '</tbody>';
  table.innerHTML = html;
}

// ============================================================================
// VIEW 6: TABELA HISTÓRICA BRUTA (1990–2024) E EXPORTAÇÃO CSV
// ============================================================================

function renderRawDataTable() {
  const catFilter = document.getElementById('rawTableCategorySelect').value || 'all';
  const inds = INDICATORS.filter(i => catFilter === 'all' || i.category === catFilter);
  const table = document.getElementById('rawHistoricalTable');

  let thead = `
    <thead>
      <tr>
        <th>Ano</th>
        <th>Presidente no Poder</th>
        <th>Partido</th>
        ${inds.map(i => `<th title="${i.name}">${i.shortName}<br><small style="font-weight:400; opacity:0.8;">(${i.unit})</small></th>`).join('')}
      </tr>
    </thead>
  `;

  let tbody = '<tbody>';
  YEARS.forEach((yr, yrIdx) => {
    const mObj = getMandateOrEraById(YEAR_TO_MANDATE[yr]);
    const presDisplay = yr === 2016 ? 'Dilma 2 / Temer' : mObj.name;
    const partyDisplay = yr === 2016 ? 'PT / MDB' : mObj.party;

    tbody += `
      <tr>
        <td><strong>${yr}</strong></td>
        <td style="border-left: 4px solid ${mObj.color}; font-weight:700;">${presDisplay}</td>
        <td><span class="pres-party-tag">${partyDisplay}</span></td>
        ${inds.map(i => `<td>${formatValue(i.values[yrIdx], i.decimals, '')}</td>`).join('')}
      </tr>
    `;
  });
  tbody += '</tbody>';
  table.innerHTML = thead + tbody;
}

function exportFullDatasetCSV() {
  const headers = ['Ano', 'Presidente', 'Partido', ...INDICATORS.map(i => `"${i.name} (${i.unit})"` )];
  const rows = [headers.join(';')];

  YEARS.forEach((yr, idx) => {
    const mObj = getMandateOrEraById(YEAR_TO_MANDATE[yr]);
    const pres = yr === 2016 ? 'Dilma Rousseff / Michel Temer' : mObj.name;
    const party = yr === 2016 ? 'PT / MDB' : mObj.party;
    const vals = INDICATORS.map(i => String(i.values[idx]).replace('.', ','));
    rows.push([yr, `"${pres}"`, `"${party}"`, ...vals].join(';'));
  });

  const csvContent = '\uFEFF' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'brasil_transparente_1990_2024_completo.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
