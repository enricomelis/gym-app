"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { isEditableTarget } from "@/lib/keyboard-shortcuts";
import { buttonVariants } from "@/components/ui/button-variants";

export function BackToExercisesButton() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      router.push("/esercizi");
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <Link href="/esercizi" className={buttonVariants({ variant: "outline" })}>
      <ArrowLeft className="size-4" />
      Torna a esercizi
    </Link>
  );
}
