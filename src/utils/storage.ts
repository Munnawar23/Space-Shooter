import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export const StorageKeys = {
  PET_NAME: 'pet_name',
  HAS_COMPLETED_ONBOARDING: 'has_completed_onboarding',
};
