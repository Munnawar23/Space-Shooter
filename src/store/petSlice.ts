import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PetState {
  hunger: number;
  energy: number;
  happiness: number;
  lastUpdated: number;
  isSleeping: boolean;
}

const initialState: PetState = {
  hunger: 25,
  energy: 25,
  happiness: 25,
  lastUpdated: Date.now(),
  isSleeping: false,
}; 

const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {
    feed: (state) => {
      state.hunger = Math.min(100, state.hunger + 5);
      state.lastUpdated = Date.now();
    },
    sleep: (state) => {
      state.energy = Math.min(100, state.energy + 5);
      state.lastUpdated = Date.now();
    },
    play: (state) => {
      state.happiness = Math.min(100, state.happiness + 5);
      state.lastUpdated = Date.now();
    },
    setIsSleeping: (state, action: PayloadAction<boolean>) => {
      state.isSleeping = action.payload;
      state.lastUpdated = Date.now();
    },
    applyDecay: (state, action: PayloadAction<number>) => {
      const now = action.payload;
      const diffMs = now - state.lastUpdated;
      const diffSeconds = diffMs / 1000;

      if (diffSeconds > 0) {
        // Hunger and Happiness always decay
        const decayAmount = diffSeconds * 0.25; // 1% every 4 seconds
        state.hunger = Math.max(0, state.hunger - decayAmount);
        state.happiness = Math.max(0, state.happiness - decayAmount);

        if (state.isSleeping) {
          // Sleep gains 1% energy every 2 seconds = 0.5% per second
          const energyGain = diffSeconds * 0.5;
          state.energy = Math.min(100, state.energy + energyGain);
          
          // Auto wake up at 100%
          if (state.energy >= 100) {
            state.isSleeping = false;
          }
        } else {
          // Decays normally when awake
          state.energy = Math.max(0, state.energy - decayAmount);
        }
        
        // Update the timestamp
        state.lastUpdated = now;
      }
    },
    resetPet: () => initialState,
  },
});

export const { feed, sleep, play, setIsSleeping, applyDecay, resetPet } = petSlice.actions;
export default petSlice.reducer;
