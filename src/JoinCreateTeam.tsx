import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import z from "zod";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamApi } from "./api/team";

const joinFormSchema = z.object({
  team_id: z.string(),
});

export function JoinCreateTeam() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof joinFormSchema>>({
    resolver: zodResolver(joinFormSchema),
  });

  async function onSubmit(values: z.infer<typeof joinFormSchema>) {
    setError(null);
    setIsLoading(true);

    try {
      await teamApi.join(
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center items-center gap-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Join Team</CardTitle>
          <CardDescription>
            Already have a team? Enter your team code below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          <Input />
        </CardContent>
      </Card>
    </div>
  )
}
