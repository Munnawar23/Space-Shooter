import { configureStore } from '@reduxjs/toolkit';
import petReducer, { PetState } from './petSlice';
import { storage } from '@/utils/storage';

const PET_STATE_KEY = 'redux_pet_state';

// Load preloaded state from MMKV
const loadPreloadedState = () => {
  try {
    const serializedState = storage.getString(PET_STATE_KEY);
    if (serializedState) {
      return { pet: JSON.parse(serializedState) as PetState };
    }
  } catch (e) {
    console.warn('Failed to load state from MMKV:', e);
  }
  return undefined;
};

export const store = configureStore({
  reducer: {
    pet: petReducer,
  },
  preloadedState: loadPreloadedState(),
});

// Subscribe to store changes and persist to MMKV
store.subscribe(() => {
  try {
    const state = store.getState();
    storage.set(PET_STATE_KEY, JSON.stringify(state.pet));
  } catch (e) {
    console.warn('Failed to save state to MMKV:', e);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
