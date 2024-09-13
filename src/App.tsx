import './styles/gloabal.css'
import { Component, createSignal, createEffect, onMount } from 'solid-js';
import { css } from '@emotion/css';
import { colors } from './styles/colors';
import { spacing } from './styles/common';
import { typography } from './styles/typography';
import { commonStyles } from './styles/common';
import { TrafficLight } from './TrafficLight';
import { LoadGraph } from './LoadGraph';
import { EnergyInsights } from './EnergyInsights';

import { BillEstimator } from './BillEstimator';
import { CarbonFootprintCalculator } from './CarbonFootprintCalculator';
import { Clock } from './Clock';
import { createTimeSimulator } from './TimeSimulator';
import { simulationStore } from './store/simulationStore';

type ComponentKey = 'LoadGraph' | 'TrafficLight' | 'GamificationIncentives' | 'BillEstimator' | 'CarbonFootprintCalculator';

const componentMap: Record<ComponentKey, Component<{ currentTime: () => number }>> = {
  LoadGraph,
  TrafficLight,
  EnergyInsights,
  GamificationIncentives,
  BillEstimator,
  CarbonFootprintCalculator,
};

const App: Component = () => {
  const [mainView, setMainView] = createSignal<ComponentKey>('LoadGraph');
  const { 
    setSimulationSpeed, 
    togglePlayPause, 
    jumpToTime, 
    isPlaying, 
    speed,
    advanceTime
  } = createTimeSimulator(simulationStore.state.currentTime, (newTime) => simulationStore.setCurrentTime(newTime));

  onMount(() => {
    simulationStore.initializeData();
  });

  const [errorMessage, setErrorMessage] = createSignal('');
  const [manualSpeed, setManualSpeed] = createSignal(1);

  const handleSpeedChange = (newSpeed: number) => {
    if (newSpeed >= 0.1 && newSpeed <= 24) {
      setManualSpeed(newSpeed);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid speed. Please use a value between 0.1 and 24 hours/second.');
    }
  };

  const handlePlayPause = () => {
    if (!isPlaying()) {
      setSimulationSpeed(manualSpeed());
    }
    togglePlayPause();
  };

  const handleAdvanceTime = (minutes: number) => {
    if (isPlaying()) {
      togglePlayPause();
    }
    advanceTime(minutes);
  };

  createEffect(() => {
    if (!isPlaying()) {
      setSimulationSpeed(0);
    }
  });

  const handleDateChange = (e: Event) => {
    const newDate = new Date((e.target as HTMLInputElement).value);
    if (isNaN(newDate.getTime())) {
      setErrorMessage('Invalid date. Please enter a valid date and time.');
    } else {
      jumpToTime(newDate.getTime());
      setErrorMessage('');
    }
  };

  const styles = {
    mainContainer: css`
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: ${spacing.lg};
      background-color: ${colors.background};
      color: ${colors.text};
    `,
    header: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${spacing.md};
      background-color: ${colors.primaryDark};
      border-bottom: 2px solid ${colors.primary};
    `,
    title: css`
      font-size: ${typography.fontSize['2xl']};
      font-weight: ${typography.fontWeight.bold};
      color: ${colors.primary};
    `,
    mainView: css`
      background-color: ${colors.surface};
      border-radius: 12px;
      padding: ${spacing.lg};
      box-shadow: 0 4px 6px ${colors.shadow};
      margin-bottom: ${spacing.lg};
    `,
    dashboardGrid: css`
      display: grid;
      grid-template-columns: 1fr;
      gap: ${spacing.lg};

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }
    `,
    gridItem: css`
      background-color: ${colors.surface};
      border-radius: 12px;
      padding: ${spacing.lg};
      box-shadow: 0 4px 6px ${colors.shadow};
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 8px ${colors.shadow};
      }
    `,
    expandButton: css`
      position: absolute;
      top: ${spacing.sm};
      right: ${spacing.sm};
      background-color: ${colors.primary};
      color: ${colors.text};
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.3s ease;

      &:hover {
        background-color: ${colors.primaryDark};
        transform: scale(1.1);
      }
    `,
    timeControls: css`
      display: flex;
      align-items: center;
      gap: ${spacing.md};
      background-color: ${colors.surface};
      padding: ${spacing.sm} ${spacing.md};
      border-radius: 8px;
    `,
    speedControl: css`
      display: flex;
      align-items: center;
      gap: ${spacing.sm};
    `,
    speedButton: css`
      ${commonStyles.button}
      ${commonStyles.primaryButton}
      padding: ${spacing.xs} ${spacing.sm};
      font-size: ${typography.fontSize.sm};
    `,
    speedDisplay: css`
      font-size: ${typography.fontSize.lg};
      font-weight: ${typography.fontWeight.bold};
      color: ${colors.primary};
      min-width: 60px;
      text-align: center;
    `,
    playPauseButton: css`
      ${commonStyles.button}
      ${commonStyles.primaryButton}
      padding: ${spacing.sm};
      display: flex;
      align-items: center;
      justify-content: center;
    `,
    advanceButton: css`
      ${commonStyles.button}
      ${commonStyles.secondaryButton}
      padding: ${spacing.xs} ${spacing.sm};
      font-size: ${typography.fontSize.sm};
    `,
    input: css`
      ${commonStyles.input}
      width: auto;
    `,
    errorMessage: css`
      color: ${colors.error};
      font-size: ${typography.fontSize.sm};
      margin-top: ${spacing.xs};
    `,
  };

  return (
    <div class={styles.mainContainer}>
      <header class={styles.header}>
        <h1 class={styles.title}>Energy Traffic Lights</h1>
        <Clock currentTime={simulationStore.state.currentTime} />
        <div class={styles.timeControls}>
          <button class={styles.playPauseButton} onClick={handlePlayPause} title={isPlaying() ? 'Pause' : 'Play'}>
            <i class={`fas ${isPlaying() ? "fa-pause" : "fa-play"}`} style="font-size: 20px;"></i>
          </button>
          <div class={styles.speedControl}>
            <button class={styles.speedButton} onClick={() => handleSpeedChange(Math.max(0.1, manualSpeed() - 0.1))}>-</button>
            <span class={styles.speedDisplay}>{manualSpeed().toFixed(1)}x</span>
            <button class={styles.speedButton} onClick={() => handleSpeedChange(Math.min(24, manualSpeed() + 0.1))}>+</button>
          </div>
          <button class={styles.advanceButton} onClick={() => handleAdvanceTime(15)}>
            <i class="fas fa-forward" style="font-size: 12px;"></i> 15m
          </button>
          <button class={styles.advanceButton} onClick={() => handleAdvanceTime(60)}>
            <i class="fas fa-forward" style="font-size: 12px;"></i> 1h
          </button>
          <button class={styles.advanceButton} onClick={() => handleAdvanceTime(1440)}>
            <i class="fas fa-forward" style="font-size: 12px;"></i> 1d
          </button>
          <input
            type="datetime-local"
            class={styles.input}
            value={new Date(simulationStore.state.currentTime).toISOString().slice(0, 16)}
            onInput={handleDateChange}
          />
        </div>
        {errorMessage() && <div class={styles.errorMessage}>{errorMessage()}</div>}
      </header>
      <main class={styles.mainView}>
        {(() => {
          const Component = componentMap[mainView()];
          return <Component currentTime={simulationStore.state.currentTime} />;
        })()}
      </main>
      <div class={styles.dashboardGrid}>
        {Object.keys(componentMap).map((key) => {
          if (key !== mainView()) {
            const Component = componentMap[key as ComponentKey];
            return (
              <div class={styles.gridItem}>
                <Component currentTime={simulationStore.state.currentTime} />
                <button
                  class={styles.expandButton}
                  onClick={() => setMainView(key as ComponentKey)}
                  title="Expand to main view"
                >
                  <i class="fas fa-expand" style="font-size: 16px;"></i>
                </button>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default App;