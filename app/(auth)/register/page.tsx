"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CircleCheck, AlertCircle } from "lucide-react";

import { registerUser } from "@/app/actions/auth";
import { registerSchema } from "@/app/actions/schemas";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setServerError(null);

    const result = await registerUser(data);

    if (result.success) {
      setSuccess(true);
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (messages?.length) {
          setError(field as keyof RegisterForm, { message: messages[0] });
        }
      }
      return;
    }

    if (result.error) {
      setServerError(result.error);
    }
  }

  if (success) {
    return (
      <div className="grid gap-6 text-center">
        <div className="flex justify-center">
          <CircleCheck className="text-primary h-12 w-12" />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Account creato</h1>
          <p className="text-muted-foreground">Registrazione completata. Ora puoi accedere.</p>
        </div>
        <Link
          href="/login"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors"
        >
          Vai al login
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Crea il tuo account</h1>
        <p className="text-muted-foreground text-sm">Inserisci i tuoi dati per iniziare.</p>
      </div>

      {serverError && (
        <div className="bg-destructive/10 border-l-destructive flex items-start gap-3 border-l-4 p-4">
          <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-destructive text-sm font-medium">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" className="h-10" {...register("name")} />
          {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </div>

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
          {isSubmitting ? "Registrazione..." : "Registrati"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">oppure</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-10 w-full"
        disabled={googleLoading}
        onClick={async () => {
          setGoogleLoading(true);
          setServerError(null);
          const { error } = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
          });
          if (error) {
            setServerError("Errore durante la registrazione con Google. Riprova.");
            setGoogleLoading(false);
          }
        }}
      >
        {googleLoading ? "Reindirizzamento..." : "Registrati con Google"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Hai già un account?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
        >
          Accedi
        </Link>
      </p>
    </div>
  );
}
