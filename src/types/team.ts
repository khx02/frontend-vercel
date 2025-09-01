export interface JoinTeamPayload {
  team_id: string;
}

export interface CreateTeamPayload {
  name: string;
}

export interface CreateTeamRes {
  team: TeamModel;
}

export interface LeaveTeamPayload {
  team_id: string;
}

export interface TeamModel {
  id: string;
  name: string;
  member_ids: string[];
  exec_member_ids: string[];
  kanban_ids: string[];
  project_ids: string[];
}

export interface GetUserTeamsRes {
  teams: TeamModel[];
}

export interface UserTeamsState {
  teams: TeamModel[];
  isFetchingTeams: boolean;
  selectedTeam: TeamModel | null;
}
