import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./components/ui/form";
import { Input } from "./components/ui/input";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "./lib/store";
import { fetchTeams } from "./features/teams/teamSlice";

const logInFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LogIn() {
  const { login, isLoading } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof logInFormSchema>>({
    resolver: zodResolver(logInFormSchema),
  });

  async function onSubmit(values: z.infer<typeof logInFormSchema>) {
    setError(null);

    try {
      await login(values.email, values.password);
      const teams = await dispatch(fetchTeams()).unwrap();

      // If user has teams, navigate to dashboard, otherwise prompt user to
      // create/join a team.
      teams.length === 0 ? navigate('/teams/join') : navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
          <CardAction>
            <Button variant="link">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@example.com" type="email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
