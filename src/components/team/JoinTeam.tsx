import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { teamApi } from "@/api/team";
import { useAppDispatch } from "@/hooks/redux";
import { fetchTeams } from "@/features/teams/teamSlice";

const joinFormSchema = z.object({
  team_id: z.string(),
});

export function JoinTeam() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof joinFormSchema>>({
    resolver: zodResolver(joinFormSchema),
  });

  async function onSubmit(values: z.infer<typeof joinFormSchema>) {
    setError(null);
    setIsLoading(true);

    try {
      await teamApi.join({ team_id: values.team_id });
      const teams = await dispatch(fetchTeams()).unwrap();

      if (teams.length === 0) {
        setError("Failed to join team, invalid code");
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full max-w-sm max-h-sm">
      <CardHeader>
        <CardTitle>Join Team</CardTitle>
        <CardDescription>
          Already have a team? Enter your team code below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {error && (
              <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="team_id"
              render={({ field }) => (
                <FormItem className="pb-4">
                  <FormLabel>Team Code</FormLabel>
                  <FormControl>
                    <Input id="team_id" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              disabled={isLoading}
              type="submit"
              className="w-full"
            >
              Join Team
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>

  );
}
