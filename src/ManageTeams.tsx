import { useSelector } from "react-redux";
import { Card, CardContent } from "./components/ui/card";
import { useAppDispatch } from "./hooks/redux";
import type { RootState } from "./lib/store";
import { useEffect, useState } from "react";
import { fetchTeams, removeTeam } from "./features/teams/teamSlice";
import { Button } from "./components/ui/button";
import { CreateTeam } from "./components/team/CreateTeam";
import { JoinTeam } from "./components/team/JoinTeam";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "./components/ui/dialog";

export function ManageTeams() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { teams } = useSelector((state: RootState) => state.teams);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleLeaveGroup = (teamId: string) => () => {
    try {
      dispatch(removeTeam(teamId));
      setIsOpen(false);
    } catch (err) {
    } finally {
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-left mb-8">Manage Teams</h1>

      <h2 className="text-xl font-bold text-left mb-4">My Teams</h2>
      <div className="flex flex-col gap-4">
        {teams.map(team => (
          <Card>
            <CardContent>
              <div className="w-full flex flex-row justify-between items-center">
                <p className="font-semibold">{team.name}</p>

                <Dialog
                  open={isOpen}
                  onOpenChange={setIsOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive">Leave</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      Once you leave you will need to join the team again. Are you sure you
                      want to leave <span className="font-semibold">{team.name}</span>?
                    </DialogDescription>
                    <DialogFooter>
                      <Button
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleLeaveGroup(team.id)}
                      >
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </div>
            </CardContent>
          </Card>
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
