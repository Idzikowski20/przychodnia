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
            className={`px-3 py-1.5 bg-transparent hover:bg-gray-100 text-black border border-gray-300 rounded-[0.25rem] text-sm capitalize`}
          >
            <div className="flex items-center gap-2">
              {type === "cancel" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7L5.29949 14.7868C5.41251 17.7252 5.46902 19.1944 6.40719 20.0972C7.34537 21 8.81543 21 11.7555 21H12.2433C15.1842 21 16.6547 21 17.5928 20.0972C18.531 19.1944 18.5875 17.7252 18.7006 14.7868L19 7" stroke="black" strokeWidth="1" strokeLinecap="round"/>
                  <path d="M20.4706 4.43329C18.6468 4.27371 17.735 4.19392 16.8229 4.13611C13.6109 3.93249 10.3891 3.93249 7.17707 4.13611C6.26506 4.19392 5.35318 4.27371 3.52942 4.43329" stroke="black" strokeWidth="1" strokeLinecap="round"/>
                  <path d="M13.7647 3.95212C13.7647 3.95212 13.3993 2.98339 11.6471 2.9834C9.8949 2.9834 9.52942 3.95211 9.52942 3.95211" stroke="black" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              )}
              {type === "schedule" ? "potwierdź" : 
               type === "plan" ? "przełóż" : 
               type === "create" ? "umów ponownie" : "anuluj"}
            </div>
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
