"use client";

import "react-datepicker/dist/react-datepicker.css";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentForm } from "./forms/AppointmentForm";

type ControlledAppointmentModalProps = {
  patientId: string;
  userId: string;
  appointment?: Appointment;
  type: "create" | "schedule" | "cancel" | "plan";
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ControlledAppointmentModal = ({
  patientId,
  userId,
  appointment,
  type,
  title,
  description,
  open,
  onOpenChange,
}: ControlledAppointmentModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          setOpen={(value) => onOpenChange(typeof value === 'function' ? value(open) : value)}
          isAdminModal={true}
        />
      </DialogContent>
    </Dialog>
  );
};
