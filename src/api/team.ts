import type { GetUserTeamsRes, JoinTeamPayload, TeamModel } from "@/types/team";
import { apiClient } from "./client";

export const teamApi = {
  join: async (data: JoinTeamPayload): Promise<void> => {
    await apiClient.post(`/team/join-team/${data.team_id}`, data);
  },

  getUserTeams: async (): Promise<TeamModel[]> => {
    const response = await apiClient.get<GetUserTeamsRes>(`/users/get-user-teams`);
    return response.data.teams;
  }
};
