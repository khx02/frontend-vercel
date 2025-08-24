import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type TeamModel, type UserTeamsState } from "@/types/team";
import { teamApi } from "@/api/team";

const initialState: UserTeamsState = {
  teams: [],
};

export const fetchTeams = createAsyncThunk('teams/fetchTeams', async () => {
  const teams = teamApi.getUserTeams();
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
    builder.addCase(fetchTeams.fulfilled, (state, action) => {
      state.teams = action.payload;
    });
  },
});

export const { setTeams, addTeam, removeTeam } = teamsSlice.actions;
export default teamsSlice.reducer;
