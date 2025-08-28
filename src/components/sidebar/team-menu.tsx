import { useAppDispatch } from "@/hooks/redux";
import type { RootState } from "@/lib/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "../ui/select";
import { fetchTeams, setSelectedTeamById } from "@/features/teams/teamSlice";

export function TeamsMenu() {
  const dispatch = useAppDispatch();
  const { teams, isFetchingTeams, selectedTeam } = useSelector((state: RootState) => state.teams);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleTeamChange = (teamId: string) => {
    dispatch(setSelectedTeamById(teamId));
  }

  return (
    <Select
      disabled={isFetchingTeams}
      value={selectedTeam?.id || ""}
      onValueChange={handleTeamChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isFetchingTeams ? "Loading..." : "Select Team"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Your Teams</SelectLabel>
          {teams.map(team => (
            <SelectItem value={team.id} key={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
