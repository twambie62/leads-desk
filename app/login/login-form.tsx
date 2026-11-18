"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">Your email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="mt-2  h-10 shadow-none "
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative mt-2">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••••"
            className="pr-10 h-10 "
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full mt-12 h-10.5">
        {isPending ? "Signing in..." : "Sign In"}
      </Button>

      <div className="rounded-md border border-dashed bg-muted/40 px-4 py-3 text-sm">
        <p className="font-medium text-foreground">Demo admin account</p>
        <p className="mt-1 text-muted-foreground">
          Email: <span className="font-mono text-foreground select-all">admin@leadsdesk.com</span>
        </p>
        <p className="text-muted-foreground">
          Password: <span className="font-mono text-foreground select-all">Admin@2026</span>
        </p>

        <p className="mt-3 font-medium text-foreground">Demo agent account</p>
        <p className="mt-1 text-muted-foreground">
          Email: <span className="font-mono text-foreground select-all">agent1@leadsdesk.com</span>
        </p>
        <p className="text-muted-foreground">
          Password: <span className="font-mono text-foreground select-all">Agent@2026</span>
        </p>
      </div>
    </form>
  );
}