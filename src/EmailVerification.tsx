import { useParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export function EmailVerification() {
  const { email } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen bg-background flex justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle>Check your emails</CardTitle>
          <CardDescription>
            We've sent you a one time verification code to
            <span className="font-bold"> {email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => setCode(value)}
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </CardContent>
      </Card>
    </div>
  );
}
