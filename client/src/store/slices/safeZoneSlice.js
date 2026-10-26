import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_URL = `${API_BASE}/safe-zones`;

const initialState = {
  safeZones: [],
  isLoading: false,
  isError: false,
  message: '',
};

const getAuthConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getSafeZones = createAsyncThunk('safeZones/getAll', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL, getAuthConfig(thunkAPI));
    return response.data.data.safeZones;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createSafeZone = createAsyncThunk('safeZones/create', async (safeZoneData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL, safeZoneData, getAuthConfig(thunkAPI));
    return response.data.data.safeZone;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteSafeZone = createAsyncThunk('safeZones/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig(thunkAPI));
    return id;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const safeZoneSlice = createSlice({
  name: 'safeZones',
  initialState,
  reducers: {
    reset: (state) => initialState,
    handleRealtimeSafeZoneUpdate: (state, action) => {
      const { action: type, safeZone, safeZoneId } = action.payload;
      if (type === 'create') {
        if (!state.safeZones.some((sz) => sz._id === safeZone._id)) {
          state.safeZones.push(safeZone);
        }
      } else if (type === 'delete') {
        state.safeZones = state.safeZones.filter((sz) => sz._id !== safeZoneId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSafeZones.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSafeZones.fulfilled, (state, action) => {
        state.isLoading = false;
        state.safeZones = action.payload;
      })
      .addCase(getSafeZones.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createSafeZone.fulfilled, (state, action) => {
        if (!state.safeZones.some((sz) => sz._id === action.payload._id)) {
          state.safeZones.push(action.payload);
        }
      })
      .addCase(deleteSafeZone.fulfilled, (state, action) => {
        state.safeZones = state.safeZones.filter((sz) => sz._id !== action.payload);
      });
  },
});

export const { reset, handleRealtimeSafeZoneUpdate } = safeZoneSlice.actions;
export default safeZoneSlice.reducer;
