"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { DoctorForm } from "./forms/DoctorForm";

type AddDoctorModalProps = {
  onDoctorAdded?: () => void;
};

export const AddDoctorModal = ({ onDoctorAdded }: AddDoctorModalProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onDoctorAdded?.();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center gap-2 text-white/70 hover:text-white transition-colors size-full">
          <div className="size-12 border-2 border-dashed border-white/30 rounded-full flex items-center justify-center">
            <span className="text-2xl">+</span>
          </div>
          <span className="text-sm">Dodaj specjalistę</span>
        </button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle>Dodaj nowego specjalistę</DialogTitle>
          <DialogDescription>
            Wypełnij poniższe informacje, aby dodać nowego doktora do systemu.
          </DialogDescription>
        </DialogHeader>
        
        <DoctorForm onSuccess={handleSuccess} onCancel={handleCancel} isAdminModal={true} />
      </DialogContent>
    </Dialog>
  );
};
