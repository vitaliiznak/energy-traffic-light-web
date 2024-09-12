import { createStore } from "solid-js/store";
import { fetchLoadData } from "../LoadGraph";

interface PowerLoadEntry {
  timestamp: number;
  Wert: number;
  is_peak: boolean;
}

interface SimulationState {
  currentTime: number;
  gridPowerLoad: PowerLoadEntry[];
  householdPowerLoad: PowerLoadEntry[];
  allGridPowerLoad: PowerLoadEntry[];
  allHouseholdPowerLoad: PowerLoadEntry[];
}

const [state, setState] = createStore<SimulationState>({
  currentTime: new Date("2024-07-10T00:00:00").getTime(),
  gridPowerLoad: [],
  householdPowerLoad: [],
  allGridPowerLoad: [],
  allHouseholdPowerLoad: [],
});

const filterLast24Hours = (data: PowerLoadEntry[], currentTime: number): PowerLoadEntry[] => {
  const oneDayAgo = currentTime - 24 * 60 * 60 * 1000;
  return data.filter(entry => entry.timestamp * 1000 <= currentTime && entry.timestamp * 1000 > oneDayAgo);
};

export const simulationStore = {
  get state() {
    return state;
  },
  setCurrentTime(time: number) {
    setState("currentTime", time);
    setState({
      gridPowerLoad: filterLast24Hours(state.allGridPowerLoad, time),
      householdPowerLoad: filterLast24Hours(state.allHouseholdPowerLoad, time),
    });
  },
  async initializeData() {
    let gridData = await fetchLoadData("grid");
    let householdData = await fetchLoadData("household");
  
    // Sort both datasets by timestamp in ascending order
    gridData = gridData.sort((a, b) => a.timestamp - b.timestamp);
    householdData = householdData.sort((a, b) => a.timestamp - b.timestamp);

    // Find the most recent timestamp available in both datasets
    const mostRecentOverlap = Math.min(
      gridData[gridData.length - 1].timestamp,
      householdData[householdData.length - 1].timestamp
    );

    // Find the index of the most recent overlap in gridData
    const gridCutoffIndex = gridData.findIndex(entry => entry.timestamp > mostRecentOverlap);
    const householdCutoffIndex = householdData.findIndex(entry => entry.timestamp > mostRecentOverlap);

    // Slice the arrays up to the cutoff indices (or keep all if no cutoff found)
    gridData = gridData.slice(0, gridCutoffIndex === -1 ? undefined : gridCutoffIndex);
    householdData = householdData.slice(0, householdCutoffIndex === -1 ? undefined : householdCutoffIndex);

    setState({
      currentTime: mostRecentOverlap * 1000, // Convert to milliseconds
      allGridPowerLoad: gridData,
      allHouseholdPowerLoad: householdData,
      gridPowerLoad: filterLast24Hours(gridData, mostRecentOverlap * 1000),
      householdPowerLoad: filterLast24Hours(householdData, mostRecentOverlap * 1000),
    });
  },
};