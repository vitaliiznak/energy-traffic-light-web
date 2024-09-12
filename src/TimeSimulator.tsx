import { createSignal, createEffect } from 'solid-js';
import { simulationStore } from './store/simulationStore';

export const createTimeSimulator = (startTime: number, onTimeUpdate: (newTime: number) => void) => {
  const [speed, setSpeed] = createSignal(1);
  const [isPlaying, setIsPlaying] = createSignal(false);

  let intervalId: number;

  const updateTime = () => {
    if (isPlaying()) {
      const newTime = simulationStore.state.currentTime + 1000 * speed(); // Increment by 1 second * speed
      simulationStore.setCurrentTime(newTime);
    }
  };

  const start = () => {
    intervalId = setInterval(updateTime, 1000);
  };

  const stop = () => {
    clearInterval(intervalId);
  };

  const setSimulationSpeed = (newSpeed: number) => {
    if (newSpeed >= 0.01 && newSpeed <= 24) {
      setSpeed(newSpeed);
    } else {
      console.warn('Invalid simulation speed. Please use a value between 0.01 and 24.');
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying());
  };

  const jumpToTime = (timestamp: number) => {
    const newDate = new Date(timestamp);
    if (isNaN(newDate.getTime())) {
      console.warn('Invalid date. The simulation time was not changed.');
    } else {
      onTimeUpdate(timestamp);
    }
  };

  const advanceTime = (minutes: number) => {
    const newTime = new Date(simulationStore.state.currentTime + minutes * 60 * 1000);
    onTimeUpdate(newTime.getTime());
  };

  createEffect(() => {
    stop();
    start();
  });

  return {
    setSimulationSpeed,
    togglePlayPause,
    jumpToTime,
    isPlaying,
    speed,
    advanceTime,
  };
};