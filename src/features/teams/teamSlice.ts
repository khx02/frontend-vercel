import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type TeamModel, type UserTeamsState } from "@/types/team";
import { teamApi } from "@/api/team";

const initialState: UserTeamsState = {
  teams: [],
  isFetchingTeams: false,
};

export const fetchTeams = createAsyncThunk('teams/fetchTeams', async () => {
  const teams = await teamApi.getUserTeams();
  return teams;
});

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams(state, action: PayloadAction<TeamModel[]>) {
      state.teams = action.payload;
    },

    addTeam(state, action: PayloadAction<TeamModel>) {
      state.teams.push(action.payload);
    },

    removeTeam(state, action: PayloadAction<string>) {
      state.teams = state.teams.filter(team => team.id !== action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.isFetchingTeams = true;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.isFetchingTeams = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state) => {
        state.isFetchingTeams = false;
      });
  },
});

export const { setTeams, addTeam, removeTeam } = teamsSlice.actions;
export default teamsSlice.reducer;
