import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type TeamModel, type UserTeamsState } from "@/types/team";
import { teamApi } from "@/api/team";

const getSelectedTeamFromStorage = (): TeamModel | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem("selectedTeam");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

const saveSelectedTeamToStorage = (team: TeamModel | null) => {
  if (typeof window === 'undefined') return null;
  try {
    if (team) {
      localStorage.setItem("selectedTeam", JSON.stringify(team));
    } else {
      localStorage.removeItem("selectedTeam");
    }
  } catch {
    // ignore localstorage errors 
  }
}

export const removeTeam = createAsyncThunk('teams/removeTeam', async (team_id: string) => {
  await teamApi.leave({ team_id: team_id });
  return team_id;
});

const initialState: UserTeamsState = {
  teams: [],
  isFetchingTeams: false,
  selectedTeam: getSelectedTeamFromStorage(),
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
    // removeTeam(state, action: PayloadAction<string>) {
    //   state.teams = state.teams.filter(team => team.id !== action.payload);
    // },

    // Selected team operations
    setSelectedTeam(state, action: PayloadAction<TeamModel | null>) {
      state.selectedTeam = action.payload;
      saveSelectedTeamToStorage(action.payload);
    },
    setSelectedTeamById(state, action: PayloadAction<string>) {
      const team = state.teams.find(team => team.id === action.payload);
      state.selectedTeam = team || null;
      saveSelectedTeamToStorage(team || null);
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

        // if there is a selected team, validate the selected team exists
        if (state.selectedTeam && !action.payload.find(team => team.id === state.selectedTeam!.id)) {
          const team = action.payload.length > 0 ? action.payload[0] : null;
          state.selectedTeam = team;
          saveSelectedTeamToStorage(team);
        }

        // Select first team if no team is selected and teams exist
        else if (!state.selectedTeam && action.payload.length > 0) {
          const team = action.payload[0];
          state.selectedTeam = team;
          saveSelectedTeamToStorage(team);
        }
      })
      .addCase(fetchTeams.rejected, (state) => {
        state.isFetchingTeams = false;
      })
      .addCase(removeTeam.fulfilled, (state, action) => {
        const removedTeamId = action.payload;
        state.teams = state.teams.filter(team => team.id !== removedTeamId);

        if (state.selectedTeam && state.selectedTeam.id === removedTeamId) {
          const newSelectedTeam = state.teams.length > 0 ? state.teams[0] : null;
          state.selectedTeam = newSelectedTeam;
          saveSelectedTeamToStorage(newSelectedTeam);
        }
      });
  },
});

export const {
  setTeams,
  addTeam,
  setSelectedTeam,
  setSelectedTeamById,
  clearSelectedTeam,
} = teamsSlice.actions;

export default teamsSlice.reducer;
