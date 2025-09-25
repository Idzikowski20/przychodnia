"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BookingSystem from "@/components/BookingSystem";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
  patientName?: string;
  onBookingComplete?: (appointmentId: string) => void;
  onAppointmentCancelled?: () => void;
}

const BookingModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  patientId, 
  patientName,
  onBookingComplete,
  onAppointmentCancelled
}: BookingModalProps) => {
  const [isBookingComplete, setIsBookingComplete] = useState(false);

  const handleBookingComplete = (appointmentId: string) => {
    setIsBookingComplete(true);
    if (onBookingComplete) {
      onBookingComplete(appointmentId);
    }
    
    // Zamknij modal po 2 sekundach
    setTimeout(() => {
      setIsBookingComplete(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Umów wizytę</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogTitle>
        </DialogHeader>
        
        {isBookingComplete ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Wizyta została umówiona!
            </h3>
            <p className="text-gray-600">
              Otrzymasz potwierdzenie na email i SMS.
            </p>
          </div>
        ) : (
          <div className="p-4">
            <BookingSystem
              userId={userId}
              patientId={patientId}
              patientName={patientName}
              onBookingComplete={handleBookingComplete}
              onAppointmentCancelled={onAppointmentCancelled}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
