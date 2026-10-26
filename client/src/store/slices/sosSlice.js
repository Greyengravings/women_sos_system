import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_URL = `${API_BASE}/sos`;

const initialState = {
  activeSOS: null,
  history: [],
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

export const triggerSOS = createAsyncThunk('sos/trigger', async (location, thunkAPI) => {
  try {
    const response = await axios.post(API_URL, { location }, getAuthConfig(thunkAPI));
    return response.data.data.sos;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getActiveSOS = createAsyncThunk('sos/getActive', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/active`, getAuthConfig(thunkAPI));
    return response.data.data.sos;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateSOSStatus = createAsyncThunk('sos/updateStatus', async ({ id, status }, thunkAPI) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status }, getAuthConfig(thunkAPI));
    return response.data.data.sos;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getSOSHistory = createAsyncThunk('sos/getHistory', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/history`, getAuthConfig(thunkAPI));
    return response.data.data.history;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateSOSLocation = createAsyncThunk('sos/updateLocation', async ({ id, location }, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/location`, { location }, getAuthConfig(thunkAPI));
    return response.data.data.location;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const sosSlice = createSlice({
  name: 'sos',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.message = '';
    },
    // Real-Time Socket Reducers
    setRealtimeSOS: (state, action) => {
      const sos = action.payload.sos || action.payload;
      state.activeSOS = sos;
      if (!state.history.some((item) => item._id === sos._id)) {
        state.history.unshift(sos);
      }
    },
    updateRealtimeSOSStatus: (state, action) => {
      const { sos, status } = action.payload;
      const updatedSOS = sos || action.payload;
      const currentStatus = status || updatedSOS.status;

      if (currentStatus === 'CLOSED' || currentStatus === 'CANCELLED') {
        if (state.activeSOS && state.activeSOS._id === updatedSOS._id) {
          state.activeSOS = null;
        }
      } else if (state.activeSOS && state.activeSOS._id === updatedSOS._id) {
        state.activeSOS = updatedSOS;
      }

      // Update history
      state.history = state.history.map((item) =>
        item._id === updatedSOS._id ? { ...item, ...updatedSOS, status: currentStatus } : item
      );
    },
    updateRealtimeSOSLocation: (state, action) => {
      const { sosId, location } = action.payload;
      if (state.activeSOS && (state.activeSOS._id === sosId || !sosId)) {
        state.activeSOS = {
          ...state.activeSOS,
          location: location
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerSOS.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(triggerSOS.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSOS = action.payload;
      })
      .addCase(triggerSOS.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getActiveSOS.fulfilled, (state, action) => {
        state.activeSOS = action.payload;
      })
      .addCase(updateSOSStatus.fulfilled, (state, action) => {
        if (action.payload.status === 'CLOSED' || action.payload.status === 'CANCELLED') {
          state.activeSOS = null;
        } else {
          state.activeSOS = action.payload;
        }
      })
      .addCase(getSOSHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const { reset, setRealtimeSOS, updateRealtimeSOSStatus, updateRealtimeSOSLocation } = sosSlice.actions;
export default sosSlice.reducer;
