"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentForm } from "./forms/AppointmentForm";

import "react-datepicker/dist/react-datepicker.css";

export const AppointmentModal = ({
  patientId,
  userId,
  appointment,
  type,
  title,
  description,
  isAdminModal = false,
  trigger,
  onUpdated,
}: {
  patientId: string;
  userId: string;
  appointment?: Appointment;
  type: "create" | "schedule" | "cancel" | "plan";
  title: string;
  description: string;
  isAdminModal?: boolean;
  trigger?: React.ReactNode;
  onUpdated?: (payload: { id: string; status?: string[]; isCompleted?: boolean }) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className={`capitalize ${(type === "schedule" || type === "plan" || type === "create") && "text-green-500"} ${type === "cancel" && "text-red-500"}`}
          >
            {type === "schedule" ? "potwierdź" : 
             type === "plan" ? "przełóż" : 
             type === "create" ? "umów ponownie" : "anuluj"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize">
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          userId={userId}
          patientId={patientId}
          type={type}
          appointment={appointment}
          setOpen={setOpen}
          isAdminModal={isAdminModal}
          onUpdated={onUpdated}
        />
      </DialogContent>
    </Dialog>
  );
};
