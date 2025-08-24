import type { JoinTeamPayload, TeamModel } from "@/types/team";
import { apiClient } from "./client";

export const teamApi = {
  join: (data: JoinTeamPayload): Promise<void> =>
    apiClient.post(`/team/join_team/${data.team_id}`, data),

  getUserTeams: (): Promise<TeamModel[]> =>
    apiClient.get(`/users/get-user-teams`),
};
