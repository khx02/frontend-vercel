import { CreateTeam } from "./components/team/CreateTeam";
import { JoinTeam } from "./components/team/JoinTeam";

export function JoinCreateTeam() {

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-10">
      <JoinTeam />
      <CreateTeam />
    </div>
  )
}
