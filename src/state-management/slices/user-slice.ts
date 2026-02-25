import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUserProfile = createAsyncThunk("user/fetchUserProfile", async () => {
    const response = await fetch("/api/user-profile");
    const data = await response.json();
    return data;
});

const userSlice = createSlice({
    name: "user",
    initialState: {
        username: "",
        profileUrl: "",
        status: "idle",
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.username = action.payload.username;
                state.profileUrl = action.payload.profileUrl;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message ?? null;
            });
    },
});

export default userSlice.reducer;
