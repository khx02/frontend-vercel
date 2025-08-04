import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./components/ui/form";
import { Input } from "./components/ui/input";
import { Link, useNavigate } from "react-router";
import { useState } from "react";

const logInFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LogIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof logInFormSchema>>({
    resolver: zodResolver(logInFormSchema),
  });

  async function onSubmit(values: z.infer<typeof logInFormSchema>) {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create form data as expected by OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', values.email); 
      formData.append('password', values.password);
      
      const response = await fetch('http://127.0.0.1:8000/auth/token', {
        method: 'POST',
        body: formData, 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid email or password');
      }

      const data = await response.json();
      console.log('Login successful:', data);
      
      // Store authentication token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token.access_token);
        localStorage.setItem('refreshToken', data.token.refresh_token);
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
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
