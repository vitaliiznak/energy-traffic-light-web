import { Component, createSignal, onMount, createEffect, onCleanup } from 'solid-js';
import { css } from '@emotion/css';
import Chart from 'chart.js/auto';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { spacing } from './styles/common';
import { mean } from 'lodash';

interface PowerGridEntry {
  timestamp: number;  // Unix timestamp
  Wert: number;  // Kilowatt consumption
  is_peak: boolean;
}

interface ConsumptionData {
  timestamp: number;
  value: number;
  is_peak: boolean;
}

const fetchConsumptionData = async (type: 'grid' | 'household'): Promise<ConsumptionData[]> => {
  // In a real application, this would be an API call
  const response = await fetch(`/api/${type}-consumption`);
  const data = await response.json();
  return data;
};

export const ConsumptionGraph: Component = () => {
  let gridChartRef: HTMLCanvasElement | undefined;
  let householdChartRef: HTMLCanvasElement | undefined;
  let gridChart: Chart | undefined;
  let householdChart: Chart | undefined;
  const [viewMode, setViewMode] = createSignal<'daily' | 'weekly' | 'monthly'>('daily');
  const [comparisonMode, setComparisonMode] = createSignal<'none' | 'lastPeriod' | 'lastYear'>('none');
  const [gridLoadData, setGridLoadData] = createSignal<PowerGridEntry[]>([]);
  const [householdLoadData, setHouseholdLoadData] = createSignal<number[]>([]);
  const [historicalHouseholdData, setHistoricalHouseholdData] = createSignal<number[]>([]);
  const [latestTimestamp, setLatestTimestamp] = createSignal<Date>(new Date());

  const fetchData = async () => {
    const response = await fetch('data/household_power_consumption.json');
    const data: PowerGridEntry[] = await response.json();
    return data.sort((a, b) => a.timestamp - b.timestamp);
  };

  const downsampleData = (data: PowerGridEntry[], targetPoints: number): PowerGridEntry[] => {
    if (data.length <= targetPoints) return data;

    const factor = Math.floor(data.length / targetPoints);
    const downsampled: PowerGridEntry[] = [];

    for (let i = 0; i < data.length; i += factor) {
      const chunk = data.slice(i, i + factor);
      const avgTimestamp = Math.round(mean(chunk.map(entry => entry.timestamp)));
      const avgWert = mean(chunk.map(entry => entry.Wert));
      const isPeak = chunk.some(entry => entry.is_peak);
      downsampled.push({ timestamp: avgTimestamp, Wert: avgWert, is_peak: isPeak });
    }

    return downsampled;
  };

  const smoothData = (data: PowerGridEntry[], windowSize: number): PowerGridEntry[] => {
    const smoothed: PowerGridEntry[] = [];
    for (let i = 0; i < data.length; i++) {
      const window = data.slice(Math.max(0, i - windowSize), i + 1);
      const avgWert = mean(window.map(entry => entry.Wert));
      const isPeak = window.some(entry => entry.is_peak);
      smoothed.push({ timestamp: data[i].timestamp, Wert: avgWert, is_peak: isPeak });
    }
    return smoothed;
  };

  const updateCharts = async () => {
    if (!gridChart || !householdChart) {
      console.error('Charts not initialized');
      return;
    }

    const mode = viewMode();
    const comparison = comparisonMode();
    const allData = await fetchData();
    
    let filteredData: PowerGridEntry[];
    let labels: string[];
    let chartTitle: string;

    const now = new Date(allData[allData.length - 1].timestamp * 1000);
    console.log('Latest timestamp:', now);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (mode === 'daily') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredData = allData.filter(entry => {
        const entryDate = new Date(entry.timestamp * 1000);
        return entryDate <= now && entryDate > oneDayAgo;
      });
      filteredData = smoothData(filteredData, 5);
      labels = filteredData.map(entry => new Date(entry.timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      chartTitle = `Daily View - ${formatDate(now)}`;
    } else if (mode === 'weekly') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = allData.filter(entry => {
        const entryDate = new Date(entry.timestamp * 1000);
        return entryDate <= now && entryDate > oneWeekAgo;
      });
      filteredData = downsampleData(filteredData, 168);
      filteredData = smoothData(filteredData, 3);
      labels = filteredData.map(entry => new Date(entry.timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short' }));
      chartTitle = `Weekly View - ${formatDate(oneWeekAgo)} to ${formatDate(now)}`;
    } else {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredData = allData.filter(entry => {
        const entryDate = new Date(entry.timestamp * 1000);
        return entryDate <= now && entryDate > oneMonthAgo;
      });
      filteredData = downsampleData(filteredData, 240);
      filteredData = smoothData(filteredData, 5);
      labels = filteredData.map(entry => new Date(entry.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      chartTitle = `Monthly View - ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    }

    console.log('Filtered data:', filteredData);
    console.log('Labels:', labels);

    setGridLoadData(filteredData);
    setHouseholdLoadData(filteredData.map(entry => entry.Wert));

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: true,
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: `${colors.border}33`,
          },
          ticks: {
            callback: (value: number) => `${value} kWh`,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            color: colors.text,
            font: {
              size: 12,
              family: typography.fontFamily,
            },
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
      },
    };

    gridChart.data.labels = labels;
    gridChart.data.datasets[0].data = filteredData.map(entry => entry.Wert);
    gridChart.data.datasets[0].pointBackgroundColor = filteredData.map(entry => entry.is_peak ? 'red' : colors.primary);
    gridChart.data.datasets[0].pointRadius = filteredData.map(entry => entry.is_peak ? 6 : 3);
    gridChart.options = {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        x: {
          ...commonOptions.scales.x,
          ticks: {
            display: mode !== 'daily',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: mode === 'weekly' ? 7 : 10,
          },
        },
        y: {
          ...commonOptions.scales.y,
          title: {
            display: true,
            text: 'Grid Power Consumption (kWh)',
          },
        },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: `Grid Consumption - ${chartTitle}`,
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
    };
    gridChart.update();

    householdChart.data.labels = labels;
    householdChart.data.datasets = [
      {
        label: '🏠 Current Household Power Consumption (kWh)',
        data: filteredData.map(entry => entry.Wert),
        borderColor: colors.secondary,
        backgroundColor: `${colors.secondary}33`,
        fill: true,
        pointStyle: 'triangle',
        pointBackgroundColor: filteredData.map(entry => entry.is_peak ? 'red' : colors.secondary),
        pointRadius: filteredData.map(entry => entry.is_peak ? 6 : 3),
      }
    ];

    if (comparison !== 'none') {
      const comparisonData = filteredData.map(entry => ({
        ...entry,
        timestamp: entry.timestamp - (comparison === 'lastPeriod' ? 
          (mode === 'daily' ? 24 * 60 * 60 : mode === 'weekly' ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60) :
          365 * 24 * 60 * 60)
      }));

      householdChart.data.datasets.push({
        label: `🏠 ${comparison === 'lastPeriod' ? 'Last Period' : 'Last Year'} Household Power Consumption (kWh)`,
        data: comparisonData.map(entry => entry.Wert),
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}33`,
        fill: true,
        pointStyle: 'circle',
        borderDash: [5, 5],
      });
    }

    householdChart.options = {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        x: {
          ...commonOptions.scales.x,
          ticks: {
            display: true,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: mode === 'weekly' ? 7 : 10,
          },
        },
        y: {
          ...commonOptions.scales.y,
          title: {
            display: true,
            text: 'Household Power Consumption (kWh)',
          },
        },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: `Household Consumption - ${chartTitle}`,
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
    };
    householdChart.update();

    console.log('Charts updated');

    updateBackgroundGrid(labels.length);
  };

  const updateBackgroundGrid = (divisions: number) => {
    const gridContainer = document.querySelector(`.${styles.gridContainer}`);
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    const gridWidth = 100 / (divisions - 1);

    for (let i = 0; i < divisions; i++) {
      const gridLine = document.createElement('div');
      gridLine.className = styles.gridLine;
      gridLine.style.left = `${i * gridWidth}%`;
      gridContainer.appendChild(gridLine);
    }
  };

  const resize = () => {
    if (gridChart) {
      gridChart.resize();
    }
    if (householdChart) {
      householdChart.resize();
    }
  };

  createEffect(() => {
    viewMode();
    comparisonMode();
    updateCharts();
  });

  onMount(() => {
    console.log('Component mounted');
    if (!gridChartRef || !householdChartRef) {
      console.error('Chart refs not found');
      return;
    }

    // Initialize charts
    gridChart = new Chart(gridChartRef, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '⚡ Grid Consumption (kWh)',
            data: [],
            borderColor: colors.primary, 
            backgroundColor: `${colors.primary}33`,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    householdChart = new Chart(householdChartRef, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '🏠 Household Energy Consumption (kWh)',
            data: [],
            borderColor: colors.secondary,
            backgroundColor: `${colors.secondary}33`,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    console.log('Charts initialized');

    updateCharts();
    resize();

    window.addEventListener('resize', resize);
    onCleanup(() => {
      window.removeEventListener('resize', resize);
    });
  });

  const styles = {
    container: css`
      display: flex;
      flex-direction: column;
      background-color: ${colors.surface};
      border-radius: 12px;
      padding: ${spacing.lg};
      box-shadow: 0 4px 6px ${colors.shadow};
    `,
    title: css`
      font-size: ${typography.fontSize.xl};
      font-weight: ${typography.fontWeight.bold};
      margin-bottom: ${spacing.md};
      text-align: center;
      color: ${colors.primary};
    `,
    graphsContainer: css`
      display: flex;
      flex-direction: column;
      gap: ${spacing.md};
      position: relative;
    `,
    graphWrapper: css`
      height: 300px;
      width: 100%;
      position: relative;
      z-index: 2;
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
    `,
    gridContainer: css`
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
    `,
    gridLine: css`
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: ${colors.border};
      opacity: 0.2;
    `,
    controlsSection: css`
      margin-bottom: ${spacing.md};
    `,
    controlsTitle: css`
      font-size: ${typography.fontSize.sm};
      font-weight: ${typography.fontWeight.medium};
      color: ${colors.textLight};
      margin-bottom: ${spacing.xs};
    `,
    controls: css`
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: ${spacing.sm};
      margin-bottom: ${spacing.md};
    `,
    button: css`
      padding: ${spacing.sm} ${spacing.md};
      background-color: ${colors.primary};
      color: ${colors.text};
      border: none;
      border-radius: 20px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
      font-weight: ${typography.fontWeight.medium};

      &:hover {
        background-color: ${colors.primaryDark};
        transform: translateY(-2px);
      }

      &.active {
        background-color: ${colors.secondary};
      }
    `,
    comparisonControls: css`
      position: absolute;
      top: ${spacing.xs};
      right: ${spacing.xs};
      display: flex;
      gap: ${spacing.xs};
      z-index: 3;
    `,
    comparisonButton: css`
      padding: ${spacing.xs} ${spacing.sm};
      background-color: ${colors.primary};
      color: ${colors.text};
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
      font-weight: ${typography.fontWeight.medium};
      font-size: ${typography.fontSize.xs};

      &:hover {
        background-color: ${colors.primaryDark};
        transform: translateY(-1px);
      }

      &.active {
        background-color: ${colors.secondary};
      }
    `,
  };

  return (
    <div class={styles.container}>
      <h2 class={styles.title}>Energy Consumption</h2>
      <div class={styles.controlsSection}>
        <div class={styles.controlsTitle}>View Mode</div>
        <div class={styles.controls}>
          <button
            class={styles.button}
            classList={{ active: viewMode() === 'daily' }}
            onClick={() => setViewMode('daily')}
          >
            Daily
          </button>
          <button
            class={styles.button}
            classList={{ active: viewMode() === 'weekly' }}
            onClick={() => setViewMode('weekly')}
          >
            Weekly
          </button>
          <button
            class={styles.button}
            classList={{ active: viewMode() === 'monthly' }}
            onClick={() => setViewMode('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>
      <div class={styles.graphsContainer}>
        <div class={styles.gridContainer}></div>
        <div class={styles.graphWrapper}>
          <canvas ref={gridChartRef} width="100%" height="100%" />
        </div>
        <div class={styles.graphWrapper}>
          <div class={styles.comparisonControls}>
            <button
              class={styles.comparisonButton}
              classList={{ active: comparisonMode() === 'none' }}
              onClick={() => setComparisonMode('none')}
            >
              Current Only
            </button>
            <button
              class={styles.comparisonButton}
              classList={{ active: comparisonMode() === 'lastPeriod' }}
              onClick={() => setComparisonMode('lastPeriod')}
            >
              vs Last Period
            </button>
            <button
              class={styles.comparisonButton}
              classList={{ active: comparisonMode() === 'lastYear' }}
              onClick={() => setComparisonMode('lastYear')}
            >
              vs Last Year
            </button>
          </div>
          <canvas ref={householdChartRef} width="100%" height="100%" />
        </div>
      </div>
    </div>
  );
};