import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contactReducer from './slices/contactSlice';
import sosReducer from './slices/sosSlice';
import safeZoneReducer from './slices/safeZoneSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactReducer,
    sos: sosReducer,
    safeZones: safeZoneReducer,
  },
});
