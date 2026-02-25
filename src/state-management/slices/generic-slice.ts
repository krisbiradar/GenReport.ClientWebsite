// src/redux/genericSlice.ts
import { container } from '@/utils/di/inversify.config';
import { HttpErrorResponse } from '@/utils/models/shared/http-error-response';
import { HttpSuccessResponse } from '@/utils/models/shared/http-success-response';
import ApiClient from '@/utils/services/api-client';
import { createSlice, createAsyncThunk, PayloadAction, Draft } from '@reduxjs/toolkit';
import { HttpStatusCode } from 'axios';


interface GenericState<T extends object> {
  data: T | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Generic function to create a slice
export function createGenericSlice<T extends object>(name: string, endPoint: string, queryParams: URLSearchParams) {
  const initialState: GenericState<T> = {
    data: null,
    status: 'idle',
    error: null,
  };

  // Thunk to fetch data from the API
  const fetchGenericData = createAsyncThunk<T | HttpErrorResponse>(`${name}/fetchData`, async (): Promise<T | HttpErrorResponse> => {
    const client = container.get(ApiClient);
    let response = await client.sendHttpGet<T>(endPoint, queryParams)
    if (response.successResponse) {
      return response.successResponse.data;
    }
    console.error("Something went wrong", response.errorResponse);
    return response.errorResponse || new HttpErrorResponse(HttpStatusCode.NotImplemented, "unknown error occured", "UNKNOWN ERROR", []);
  });

  const genericSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchGenericData.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchGenericData.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.data = (action.payload as Draft<T>);
        })
        .addCase(fetchGenericData.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || 'Something went wrong';
        });
    },
  });

  return { reducer: genericSlice.reducer, actions: { fetchGenericData } };
}
