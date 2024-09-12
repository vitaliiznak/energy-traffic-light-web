import { Component, createSignal, onMount, createEffect } from 'solid-js';
import { css } from '@emotion/css';
import Chart from 'chart.js/auto';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { spacing } from './styles/common';

export const ConsumptionGraph: Component = () => {
  let chartRef: HTMLCanvasElement | undefined;
  let chart: Chart | undefined;
  const [viewMode, setViewMode] = createSignal<'daily' | 'weekly' | 'monthly'>('daily');
  const [gridLoadData, setGridLoadData] = createSignal<number[]>([]);
  const [comparisonMode, setComparisonMode] = createSignal<'lastPeriod' | 'lastYear'>('lastPeriod');

  const getComparisonLabel = () => {
    switch (viewMode()) {
      case 'daily':
        return 'Yesterday';
      case 'weekly':
        return 'Last Week';
      case 'monthly':
        return 'Last Month';
      default:
        return 'Last Period';
    }
  };

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
    graphContainer: css`
      height: 300px;
      width: 100%;
      margin: 0 auto;
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
  };

  const generateMockData = (days: number) => {
    const data = [];
    const gridLoad = [];
    const historicalData = [];
    for (let i = 0; i < days; i++) {
      data.push(Math.random() * 5 + 1);
      gridLoad.push(Math.random() * 100);
      historicalData.push(Math.random() * 5 + 0.5);
    }
    return { consumptionData: data, gridLoadData: gridLoad, historicalData };
  };

  const updateChart = () => {
    if (!chart) return;

    const mode = viewMode();
    let { consumptionData, gridLoadData: newGridLoadData, historicalData } = generateMockData(
      mode === 'daily' ? 24 : mode === 'weekly' ? 7 : 30
    );
    setGridLoadData(newGridLoadData);

    const labels = {
      daily: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      monthly: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    };

    chart.data.labels = labels[mode];
    chart.data.datasets[0].data = consumptionData;
    chart.data.datasets[1].data = newGridLoadData;
    chart.data.datasets[2].data = historicalData;
    chart.update();
  };

  createEffect(() => {
    viewMode();
    comparisonMode();
    updateChart();
  });

  onMount(() => {
    if (!chartRef) return;

    chart = new Chart(chartRef, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Current Energy Consumption (kWh)',
            data: [],
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}33`,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: 'Grid Load (%)',
            data: [],
            borderColor: colors.secondary,
            backgroundColor: `${colors.secondary}33`,
            fill: true,
            yAxisID: 'y1',
          },
          {
            label: () => comparisonMode() === 'lastPeriod' ? `${getComparisonLabel()} (kWh)` : 'Last Year (kWh)',
            data: [],
            borderColor: colors.warning,
            backgroundColor: `${colors.warning}33`,
            fill: true,
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Energy Consumption (kWh)',
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Grid Load (%)',
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });

    updateChart();
  });

  return (
    <div class={styles.container}>
      <h2 class={styles.title}>Energy Consumption Comparison</h2>
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
      <div class={styles.controls}>
        <button
          class={styles.button}
          classList={{ active: comparisonMode() === 'lastPeriod' }}
          onClick={() => setComparisonMode('lastPeriod')}
        >
          Compare to {getComparisonLabel()}
        </button>
        <button
          class={styles.button}
          classList={{ active: comparisonMode() === 'lastYear' }}
          onClick={() => setComparisonMode('lastYear')}
        >
          Compare to Last Year
        </button>
      </div>
      <div class={styles.graphContainer}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};