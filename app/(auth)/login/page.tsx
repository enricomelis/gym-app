"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { loginUser } from "@/app/actions/auth";
import { loginSchema } from "@/app/actions/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setServerError(null);

    const result = await loginUser(data);

    if (result.success) {
      router.refresh();
      router.push("/dashboard");
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (messages?.length) {
          setError(field as keyof LoginForm, { message: messages[0] });
        }
      }
      return;
    }

    if (result.error) {
      setServerError(result.error);
    }
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Accedi al tuo account</h1>
        <p className="text-muted-foreground text-sm">
          Inserisci le tue credenziali per continuare.
        </p>
      </div>

      {serverError && (
        <div className="bg-destructive/10 border-l-destructive flex items-start gap-3 border-l-4 p-4">
          <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-destructive text-sm font-medium">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="h-10" {...register("email")} />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" className="h-10" {...register("password")} />
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Accesso..." : "Accedi"}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Non hai un account?{" "}
        <Link
          href="/register"
          className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
        >
          Registrati
        </Link>
      </p>
    </div>
  );
}
