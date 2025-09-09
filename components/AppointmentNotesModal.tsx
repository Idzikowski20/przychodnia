"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { updateAppointment } from "@/lib/actions/appointment.actions";
import { Appointment } from "@/types/appwrite.types";

const notesSchema = z.object({
  notes: z.string().min(1, "Notatka nie może być pusta"),
});

type NotesFormData = z.infer<typeof notesSchema>;

export const AppointmentNotesModal = ({
  appointment,
}: {
  appointment: Appointment;
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const hasExistingNote = appointment.adminNotes && appointment.adminNotes.trim().length > 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NotesFormData>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: appointment.adminNotes || "",
    },
  });

  const onSubmit = async (data: NotesFormData) => {
    setIsSubmitting(true);
    try {
      await updateAppointment({
        appointmentId: appointment.$id,
        adminNotes: data.notes,
      });
      setOpen(false);
      setIsEditing(false);
      reset();
    } catch (error) {
      console.error("Błąd podczas zapisywania notatki:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="px-3 py-1.5 text-yellow-500 hover:text-yellow-400 rounded-lg transition-colors font-medium text-sm"
        >
          Notatka
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle>
            {hasExistingNote && !isEditing ? "Notatka do wizyty" : "Dodaj notatkę do wizyty"}
          </DialogTitle>
          <DialogDescription>
            {hasExistingNote && !isEditing 
              ? "Przeglądaj istniejącą notatkę dotyczącą wizyty."
              : "Dodaj notatkę dotyczącą przebiegu wizyty lub zaleceń dla pacjenta."
            }
          </DialogDescription>
        </DialogHeader>

        {hasExistingNote && !isEditing ? (
          // Tryb przeglądania istniejącej notatki
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notatka</label>
              <div className="min-h-[120px] p-3 text-yellow-500 whitespace-pre-wrap">
                {appointment.adminNotes}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Zamknij
              </Button>
              <Button
                type="button"
                onClick={handleEdit}
              >
                Edytuj notatkę
              </Button>
            </div>
          </div>
        ) : (
          // Tryb dodawania/edycji notatki
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notatka
              </label>
              <Textarea
                id="notes"
                placeholder="Wprowadź notatkę dotyczącą wizyty..."
                className="min-h-[120px]"
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="destructive"
                onClick={hasExistingNote ? handleCancel : () => setOpen(false)}
                disabled={isSubmitting}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Zapisywanie..." : hasExistingNote ? "Zapisz zmiany" : "Zapisz notatkę"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
