import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAppDispatch } from "@/hooks/redux";
import { useNavigate } from "react-router";
import { teamApi } from "@/api/team";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addTeam } from "@/features/teams/teamSlice";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";

const createFormSchema = z.object({
  name: z.string(),
});

export function CreateTeam() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
  });

  async function handleCreateTeam(values: z.infer<typeof createFormSchema>) {
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        name: values.name,
      }
      const team = await teamApi.create(payload);
      // TODO: Set team with team response
      // const teams = await dispatch(fetchTeams()).unwrap();
      dispatch(addTeam(team));

      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create team, please try again");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create Team</CardTitle>
        <CardDescription>
          Don't have a team? Create a team now.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateTeam)}>
            {error && (
              <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="pb-4">
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input id="name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              disabled={isLoading}
              type="submit"
              className="w-full"
            >
              Create Team
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
