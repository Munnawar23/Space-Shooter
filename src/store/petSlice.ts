import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PetState {
  hunger: number;
  energy: number;
  happiness: number;
  cleanliness: number;
  lastUpdated: number;
  isSleeping: boolean;
}

const initialState: PetState = {
  hunger: 25,
  energy: 25,
  happiness: 25,
  cleanliness: 50,
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
    scrub: (state, action: PayloadAction<number>) => {
      state.cleanliness = Math.min(100, state.cleanliness + action.payload);
      state.lastUpdated = Date.now();
    },
    applyDecay: (state, action: PayloadAction<number>) => {
      const now = action.payload;
      const diffMs = now - state.lastUpdated;
      const diffSeconds = diffMs / 1000;

      if (diffSeconds > 0) {
        // Hunger and Happiness decay 1% every 4 seconds
        const generalDecayAmount = diffSeconds * 0.25;
        // Cleanliness decays 1% every 6 seconds
        const cleanlinessDecayAmount = diffSeconds * (1 / 6);

        state.hunger = Math.max(0, state.hunger - generalDecayAmount);
        state.happiness = Math.max(0, state.happiness - generalDecayAmount);
        state.cleanliness = Math.max(0, state.cleanliness - cleanlinessDecayAmount);

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
          state.energy = Math.max(0, state.energy - generalDecayAmount);
        }
        
        // Update the timestamp
        state.lastUpdated = now;
      }
    },
    resetPet: () => initialState,
  },
});

export const { feed, sleep, play, setIsSleeping, scrub, applyDecay, resetPet } = petSlice.actions;
export default petSlice.reducer;
