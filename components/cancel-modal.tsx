"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { useState } from "react"

// Funkcja do odtwarzania dźwięku przycisku
const playButtonSound = () => {
  const audio = new Audio("/assets/sounds/button.mp3");
  audio.play().catch((error) => {
    console.error("Błąd odtwarzania dźwięku przycisku:", error);
  });
};

interface CancelModalProps {
  isOpen: boolean
  onClose: () => void
  visit: {
    patient: string
  }
}

export function CancelModal({ isOpen, onClose, visit }: CancelModalProps) {
  const [reason, setReason] = useState("")

  const handleCancel = () => {
    // Handle cancel logic here
    console.log("Cancelling visit:", { reason })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-semibold">Anuluj Wizytę</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-gray-600">Czy na pewno chcesz anulować swoją wizytę?</p>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Powód anulowania</label>
            <Textarea
              placeholder="Pilne spotkanie"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl border-gray-200 resize-none"
              rows={4}
            />
          </div>

          {/* Action Button */}
          <Button onClick={() => {
            playButtonSound();
            handleCancel();
          }} className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3">
            Anuluj wizytę
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
