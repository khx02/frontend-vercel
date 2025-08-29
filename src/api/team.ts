import type { CreateTeamPayload, GetUserTeamsRes, JoinTeamPayload, TeamModel } from "@/types/team";
import { apiClient } from "./client";

export const teamApi = {
  join: async (data: JoinTeamPayload): Promise<void> => {
    await apiClient.post(`/team/join-team/${data.team_id}`, data);
  },

  create: async (data: CreateTeamPayload): Promise<TeamModel> => {
    const response = await apiClient.post<TeamModel>(`/teams/create-team`, data);
    return response.data
  },

  getUserTeams: async (): Promise<TeamModel[]> => {
    const response = await apiClient.get<GetUserTeamsRes>(`/users/get-current-user-teams`);
    return response.data.teams;
  }
};
