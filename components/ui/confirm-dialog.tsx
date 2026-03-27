"use client";

import { Dialog } from "@base-ui/react/dialog";

import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive";
  isConfirming?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  confirmVariant = "default",
  isConfirming = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="bg-background fixed top-1/2 left-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border p-6 font-sans shadow-xl">
          <div className="grid gap-2">
            <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
            <Dialog.Description className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </Dialog.Description>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Dialog.Close
              render={
                <Button variant="outline" type="button" disabled={isConfirming}>
                  {cancelLabel}
                </Button>
              }
            />
            <Button
              type="button"
              variant={confirmVariant}
              disabled={isConfirming}
              onClick={onConfirm}
            >
              {isConfirming ? "Attendere..." : confirmLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
