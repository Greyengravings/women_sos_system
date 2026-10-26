import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_URL = `${API_BASE}/contacts`;

const initialState = {
  contacts: [],
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

export const getContacts = createAsyncThunk('contacts/getAll', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL, getAuthConfig(thunkAPI));
    return response.data.data.contacts;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createContact = createAsyncThunk('contacts/create', async (contactData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL, contactData, getAuthConfig(thunkAPI));
    return response.data.data.contact;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteContact = createAsyncThunk('contacts/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig(thunkAPI));
    return id;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    reset: (state) => initialState,
    handleRealtimeContactUpdate: (state, action) => {
      const { action: type, contact, contactId } = action.payload;
      if (type === 'create') {
        if (!state.contacts.some((c) => c._id === contact._id)) {
          state.contacts.push(contact);
        }
      } else if (type === 'update') {
        state.contacts = state.contacts.map((c) => (c._id === contact._id ? contact : c));
      } else if (type === 'delete') {
        state.contacts = state.contacts.filter((c) => c._id !== contactId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getContacts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = action.payload;
      })
      .addCase(getContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        if (!state.contacts.some((c) => c._id === action.payload._id)) {
          state.contacts.push(action.payload);
        }
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter((c) => c._id !== action.payload);
      });
  },
});

export const { reset, handleRealtimeContactUpdate } = contactSlice.actions;
export default contactSlice.reducer;
