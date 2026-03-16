import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { container } from "@/utils/di/inversify.config";
import SidebarService, { SidebarItem } from "@/utils/services/sidebar-service";

export interface SidebarState {
  items: SidebarItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SidebarState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchSidebarItems = createAsyncThunk(
  "sidebar/fetchSidebarItems",
  async (_, { rejectWithValue }) => {
    const sidebarService = container.get(SidebarService);
    const response = await sidebarService.getSidebarItems();

    if (response?.successResponse?.data) {
      return response.successResponse.data;
    }

    const errorMessage =
      response?.errorResponse?.message || "Failed to load sidebar items.";
    return rejectWithValue(errorMessage);
  }
);

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    resetSidebar(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSidebarItems.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSidebarItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload as SidebarItem[];
        state.error = null;
      })
      .addCase(fetchSidebarItems.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to load sidebar items.";
      });
  },
});

export const { resetSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
