"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Calendar, ChevronDown } from "lucide-react"
import { useState } from "react"

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  visit: {
    patient: string
    doctor: string
  }
}

export function RescheduleModal({ isOpen, onClose, visit }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState("15/09/2025")
  const [selectedTime, setSelectedTime] = useState("12:30")
  const [reason, setReason] = useState("")
  const [preferences, setPreferences] = useState("")

  const handleReschedule = () => {
    // Handle reschedule logic here
    console.log("Rescheduling visit:", { selectedDate, selectedTime, reason, preferences })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-semibold">Przełóż Wizytę</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-gray-600">Proszę ustawić konkretną datę i godzinę wizyty.</p>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Lekarz</label>
            <div className="relative">
              <div className="flex items-center p-3 bg-gray-50 rounded-xl border">
                <img
                  src="/placeholder.svg?height=32&width=32"
                  alt="Dr. Sylwia Klejnowska"
                  className="w-8 h-8 rounded-full mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Sylwia Klejnowska</div>
                  <div className="text-sm text-gray-500">Psycholog</div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data i godzina</label>
            <div className="relative">
              <Input
                value={`${selectedDate} - ${selectedTime}`}
                readOnly
                className="pl-10 rounded-xl bg-gray-50 border-gray-200"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Powód</label>
            <Textarea
              placeholder="Witam"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl border-gray-200 resize-none"
              rows={3}
            />
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Preferencje</label>
            <Textarea
              placeholder="Preferuję popołudniowe wizyty, jeśli to możliwe"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="rounded-xl border-gray-200 resize-none"
              rows={3}
            />
          </div>

          {/* Action Button */}
          <Button
            onClick={handleReschedule}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3"
          >
            Przełóż wizytę
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
