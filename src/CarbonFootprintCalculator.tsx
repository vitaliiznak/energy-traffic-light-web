import { Component, createSignal } from 'solid-js';
import { css, keyframes } from '@emotion/css';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { spacing, commonStyles } from './styles/common';

interface Dinosaur {
  name: string;
  emoji: string;
  powerOutput: number; // kWh per day
}

const dinosaurs: Dinosaur[] = [
  { name: 'T-Rex', emoji: '🦖', powerOutput: 100 },
  { name: 'Brachiosaurus', emoji: '🦕', powerOutput: 200 },
  { name: 'Velociraptor', emoji: '🦖', powerOutput: 50 },
  { name: 'Stegosaurus', emoji: '🦕', powerOutput: 75 },
  { name: 'Triceratops', emoji: '🦏', powerOutput: 150 },
];

export const CarbonFootprintCalculator: Component = () => {
  const [energy, setEnergy] = createSignal(0);
  const [carbonFootprint, setCarbonFootprint] = createSignal(0);

  const calculateCarbonFootprint = (kwh: number) => {
    return kwh * 0.5;
  };

  const handleEnergyChange = (value: number) => {
    setEnergy(value);
    setCarbonFootprint(calculateCarbonFootprint(value));
  };

  const calculateDinosaurs = (kwh: number) => {
    const result: { dino: Dinosaur; count: number }[] = [];
    dinosaurs.forEach(dino => {
      const count = Math.ceil(kwh / dino.powerOutput);
      result.push({ dino, count });
    });
    return result.sort((a, b) => a.count - b.count);
  };

  const calculateTrees = (co2: number) => {
    // Assuming 1 tree absorbs about 22 kg of CO2 per year
    return Math.ceil(co2 / 22);
  };

  const bounceAnimation = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  `;

  const styles = {
    container: css`
      ${commonStyles.card}
      max-width: 500px;
      margin: 0 auto;
    `,
    title: css`
      ${commonStyles.sectionTitle}
      text-align: center;
      color: ${colors.primary};
    `,
    inputContainer: css`
      display: flex;
      align-items: center;
      margin-bottom: ${spacing.md};
    `,
    input: css`
      ${commonStyles.input}
      flex-grow: 1;
      margin-right: ${spacing.sm};
    `,
    unit: css`
      font-size: ${typography.fontSize.sm};
      color: ${colors.textLight};
    `,
    resultContainer: css`
      text-align: center;
    `,
    result: css`
      font-size: ${typography.fontSize.xl};
      font-weight: ${typography.fontWeight.bold};
      color: ${colors.secondary};
      margin-bottom: ${spacing.sm};
    `,
    dinoContainer: css`
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: ${spacing.md};
    `,
    dinoRow: css`
      display: flex;
      align-items: center;
      margin-bottom: ${spacing.xs};
    `,
    dinoEmoji: css`
      font-size: 24px;
      margin-right: ${spacing.xs};
      animation: ${bounceAnimation} 2s infinite;
    `,
    dinoText: css`
      font-size: ${typography.fontSize.sm};
    `,
    treeContainer: css`
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: ${spacing.md};
    `,
    treeEmoji: css`
      font-size: 24px;
      margin-right: ${spacing.xs};
    `,
    message: css`
      font-size: ${typography.fontSize.sm};
      color: ${colors.textLight};
      text-align: center;
      margin-top: ${spacing.sm};
    `,
  };

  return (
    <div class={styles.container}>
      <h2 class={styles.title}>Jurassic Power Calculator</h2>
      <div>How much power you consumed?</div>
      <div class={styles.inputContainer}>
        <input
          type="number"
          class={styles.input}
          value={energy()}
          onInput={(e) => handleEnergyChange(parseFloat(e.currentTarget.value) || 0)}
          placeholder="Enter energy consumption"
        />
        <span class={styles.unit}>kW*h</span>
      </div>
      <div class={styles.resultContainer}>
        <div class={styles.result}>{carbonFootprint().toFixed(2)} kg CO2</div>
        <div class={styles.dinoContainer}>
          {calculateDinosaurs(energy()).map(({ dino, count }) => (
            <div class={styles.dinoRow}>
              <span class={styles.dinoEmoji}>{dino.emoji}</span>
              <span class={styles.dinoText}>
                {count} {dino.name}(s) could power your home for a day!
              </span>
            </div>
          ))}
        </div>
        <div class={styles.treeContainer}>
          <span class={styles.treeEmoji}>🌳</span>
          <span class={styles.dinoText}>
            {calculateTrees(carbonFootprint())} trees needed to offset your carbon footprint!
          </span>
        </div>
      </div>
      <div class={styles.message}>
        {energy() === 0
          ? "Let's see how many dinos you need to power your home!"
          : "Time to build a Jurassic Power Plant or start a massive reforestation project!"}
      </div>
    </div>
  );
};

