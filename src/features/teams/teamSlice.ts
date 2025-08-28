import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type TeamModel, type UserTeamsState } from "@/types/team";
import { teamApi } from "@/api/team";

const initialState: UserTeamsState = {
  teams: [],
  isFetchingTeams: false,
  selectedTeam: null,
};

export const fetchTeams = createAsyncThunk('teams/fetchTeams', async () => {
  const teams = await teamApi.getUserTeams();
  return teams;
});

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    // Teams list operations
    setTeams(state, action: PayloadAction<TeamModel[]>) {
      state.teams = action.payload;
    },
    addTeam(state, action: PayloadAction<TeamModel>) {
      state.teams.push(action.payload);
    },
    removeTeam(state, action: PayloadAction<string>) {
      state.teams = state.teams.filter(team => team.id !== action.payload);
    },

    // Selected team operations
    setSelectedTeam(state, action: PayloadAction<TeamModel | null>) {
      state.selectedTeam = action.payload;
    },
    setSelectedTeamById(state, action: PayloadAction<string>) {
      console.log("Updating selected team...");

      const team = state.teams.find(team => team.id === action.payload);
      state.selectedTeam = team || null;

      console.log("New selected Team:", state.selectedTeam);
    },
    clearSelectedTeam(state) {
      state.selectedTeam = null;
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

        console.log("Selected team:", state.selectedTeam);

        // Select first team if no team is selected and teams exist
        if (!state.selectedTeam && action.payload.length > 0) {
          state.selectedTeam = action.payload[0];
          console.log("No team selected, setting team:", action.payload[0]);
        }
        // Validate the selected team exists
        else if (state.selectedTeam && !action.payload.find(team => team.id === state.selectedTeam!.id)) {
          state.selectedTeam = action.payload.length > 0 ? action.payload[0] : null;
          console.log("Team no longer exists, setting new team:", state.selectedTeam);
        }
      })
      .addCase(fetchTeams.rejected, (state) => {
        state.isFetchingTeams = false;
      });
  },
});

export const {
  setTeams,
  addTeam,
  removeTeam,
  setSelectedTeam,
  setSelectedTeamById,
  clearSelectedTeam,
} = teamsSlice.actions;

export default teamsSlice.reducer;
