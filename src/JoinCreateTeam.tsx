import { useNavigate } from "react-router";
import { CreateTeam } from "./components/team/CreateTeam";
import { JoinTeam } from "./components/team/JoinTeam";
import { useAppDispatch } from "./hooks/redux";
import { fetchTeams } from "./features/teams/teamSlice";

export function JoinCreateTeam() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onJoin = async () => {
    const teams = await dispatch(fetchTeams()).unwrap();

    if (teams.length === 0) {
      throw new Error("Failed to join team, invalid code");
    }

    navigate('/dashboard');
  }

  const onCreate = async () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-10">
      <JoinTeam
        onJoin={onJoin}
        description="Already have a team? Enter your team code below."
      />
      <CreateTeam
        onCreate={onCreate}
        description="Don't have a team? Create a team now."
      />
    </div>
  )
}
