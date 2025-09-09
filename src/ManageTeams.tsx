import { useSelector } from "react-redux";
import { useAppDispatch } from "./hooks/redux";
import type { RootState } from "./lib/store";
import { useEffect } from "react";
import { fetchTeams, removeTeam } from "./features/teams/teamSlice";
import { CreateTeam } from "./components/team/CreateTeam";
import { JoinTeam } from "./components/team/JoinTeam";
import { LeaveTeamDialog } from "./components/team/LeaveTeamDialog";
import { extractErrorMessage } from "./utils/errorHandling";

export function ManageTeams() {
  const dispatch = useAppDispatch();
  const { teams } = useSelector((state: RootState) => state.teams);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleLeaveGroup = async (teamId: string) => {
    try {
      await dispatch(removeTeam(teamId)).unwrap();
    } catch (error) {
      console.log("Manage Teams Error:", error);
      const errMsg = typeof error === "string" ? error : extractErrorMessage(error);
      throw new Error(errMsg);
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-left mb-8">Manage Teams</h1>

      <h2 className="text-xl font-bold text-left mb-4">My Teams</h2>
      <div className="flex flex-col gap-4">
        {teams.map(team => (
          <LeaveTeamDialog
            team={team}
            onLeave={handleLeaveGroup}
            key={team.id}
          />
        ))}
      </div>

      <div className="flex justify-around mt-12">
        <CreateTeam
          description="Create a new team"
        />
        <JoinTeam
          description="Joining a new team? Enter the team code below"
        />
      </div>
    </div>
  );
}
