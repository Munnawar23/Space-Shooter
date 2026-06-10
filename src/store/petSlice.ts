import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PetState {
  hunger: number;
  energy: number;
  happiness: number;
  lastUpdated: number;
}

const initialState: PetState = {
  hunger: 25,
  energy: 25,
  happiness: 25,
  lastUpdated: Date.now(),
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
    applyDecay: (state, action: PayloadAction<number>) => {
      const now = action.payload;
      const diffMs = now - state.lastUpdated;
      const diffSeconds = diffMs / 1000;

      if (diffSeconds > 0) {
        const decayAmount = diffSeconds * 0.25; // 1% every 4 seconds
        // Apply decay and cap at 0
        state.hunger = Math.max(0, state.hunger - decayAmount);
        state.energy = Math.max(0, state.energy - decayAmount);
        state.happiness = Math.max(0, state.happiness - decayAmount);
        
        // Update the timestamp
        state.lastUpdated = now;
      }
    },
    resetPet: () => initialState,
  },
});

export const { feed, sleep, play, applyDecay, resetPet } = petSlice.actions;
export default petSlice.reducer;
