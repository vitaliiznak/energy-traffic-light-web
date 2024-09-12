import { Component, createSignal, onMount, createEffect, onCleanup } from 'solid-js';
import { css } from '@emotion/css';
import Chart from 'chart.js/auto';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { spacing } from './styles/common';
import { mean } from 'lodash';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

interface PowerGridEntry {
  timestamp: number;  // Unix timestamp
  Wert: number;  // Kilowatt load
  is_peak: boolean;
}

interface LoadData {
  timestamp: number;
  value: number;
  is_peak: boolean;
}

const fetchLoadData = async (type: 'grid' | 'household'): Promise<LoadData[]> => {
  try {
    const url = `${import.meta.env.BASE_URL}data/${type}_power_load.json`;
    console.log(`Fetching data from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    console.log(`Raw response: ${text.substring(0, 100)}...`);
    const data = JSON.parse(text);
    return data.sort((a: LoadData, b: LoadData) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error(`Error fetching ${type} load data:`, error);
    return [];
  }
};

export const LoadGraph: Component = () => {
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
    console.log('Fetching grid data...');
    const allGridData = await fetchLoadData('grid');
    console.log('Grid data:', allGridData);
    console.log('Fetching household data...');
    const allHouseholdData = await fetchLoadData('household');
    console.log('Household data:', allHouseholdData);
    
    let filteredData: PowerGridEntry[];
    let labels: string[];
    let chartTitle: string;

    const now = new Date(Math.max(
      ...allGridData.map(entry => entry.timestamp * 1000),
      ...allHouseholdData.map(entry => entry.timestamp * 1000)
    ));
    console.log('Latest timestamp:', now);

    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (mode === 'daily') {
      filteredData = allGridData.filter(entry => {
        const entryDate = new Date(entry.timestamp * 1000);
        return entryDate <= now && entryDate > oneDayAgo;
      });
      filteredData = smoothData(filteredData, 5);
      labels = filteredData.map(entry => new Date(entry.timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      chartTitle = `Daily View - ${formatDate(now)}`;
    } else if (mode === 'weekly') {
      filteredData = allGridData.filter(entry => {
        const entryDate = new Date(entry.timestamp * 1000);
        return entryDate <= now && entryDate > oneWeekAgo;
      });
      filteredData = downsampleData(filteredData, 168);
      filteredData = smoothData(filteredData, 3);
      labels = filteredData.map(entry => new Date(entry.timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short' }));
      chartTitle = `Weekly View - ${formatDate(oneWeekAgo)} to ${formatDate(now)}`;
    } else {
      filteredData = allGridData.filter(entry => {
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
            callback: (value: number) => `${value} kW`,
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
            text: 'Grid Power Load (kW)',
          },
        },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: `Grid Load - ${chartTitle}`,
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        annotation: {
          annotations: getPeakRegions(filteredData).map(region => ({
            type: 'box',
            xMin: region.start,
            xMax: region.end,
            backgroundColor: 'rgba(255, 99, 132, 0.25)',
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 1,
            label: {
              display: true,
              content: 'Peak',
              position: 'start',
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              color: 'white',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }))
        }
      },
    };
    gridChart.update();

    let filteredHouseholdData = allHouseholdData.filter(entry => {
      const entryDate = new Date(entry.timestamp * 1000);
      return entryDate <= now && entryDate > (mode === 'daily' ? oneDayAgo : mode === 'weekly' ? oneWeekAgo : oneMonthAgo);
    });

    filteredHouseholdData = downsampleData(filteredHouseholdData, mode === 'daily' ? filteredData.length : mode === 'weekly' ? 168 : 240);
    filteredHouseholdData = smoothData(filteredHouseholdData, mode === 'daily' ? 5 : mode === 'weekly' ? 3 : 5);

    householdChart.data.labels = labels;
    householdChart.data.datasets = [
      {
        label: '🏠 Current Household Power Load (kW)',
        data: filteredHouseholdData.map(entry => entry.Wert),
        borderColor: colors.secondary,
        backgroundColor: `${colors.secondary}33`,
        fill: true,
        pointStyle: 'triangle',
        pointBackgroundColor: filteredHouseholdData.map(entry => entry.is_peak ? 'red' : colors.secondary),
        pointRadius: filteredHouseholdData.map(entry => entry.is_peak ? 6 : 3),
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
        label: `🏠 ${comparison === 'lastPeriod' ? 'Last Period' : 'Last Year'} Household Power Load (kW)`,
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
            text: 'Household Power Load (kW)',
          },
        },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: `Household Load - ${chartTitle}`,
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        annotation: {
          annotations: getPeakRegions(filteredData).map(region => ({
            type: 'box',
            xMin: region.start,
            xMax: region.end,
            backgroundColor: 'rgba(255, 99, 132, 0.25)',
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 1,
            label: {
              display: true,
              content: 'Peak',
              position: 'start',
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              color: 'white',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }))
        }
      },
    };
    householdChart.update();

    console.log('Charts updated');

    updateBackgroundGrid(labels.length);
  };

  const getPeakRegions = (data: PowerGridEntry[]) => {
    const regions = [];
    let start = -1;

    data.forEach((d, index) => {
      if (d.is_peak && start === -1) {
        start = index;
      } else if (!d.is_peak && start !== -1) {
        regions.push({ start, end: index - 1 });
        start = -1;
      }
    });

    if (start !== -1) {
      regions.push({ start, end: data.length - 1 });
    }

    return regions;
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
            label: '⚡ Grid Load (kW)',
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
            label: '🏠 Household Power Load (kW)',
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
      <h2 class={styles.title}>Power Grid Load</h2>
      <div class={styles.controlsSection}>
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