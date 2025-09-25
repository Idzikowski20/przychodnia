"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

import BookingSystem from "@/components/BookingSystem";

interface BookingPageProps {
  userId: string;
  patientId: string;
  patientName?: string;
}

const BookingPage = ({ userId, patientId, patientName }: BookingPageProps) => {
  const router = useRouter();

  const handleBookingComplete = (appointmentId: string) => {
    // Redirect to success page
    router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointmentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="mb-12 h-10 w-fit"
          />

          <Suspense fallback={
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Ładowanie systemu rezerwacji...</p>
            </div>
          }>
            <BookingSystem
              userId={userId}
              patientId={patientId}
              patientName={patientName}
              onBookingComplete={handleBookingComplete}
            />
          </Suspense>

          <div className="text-14-regular mt-20 flex justify-between">
            <p className="justify-items-end text-gray-600 xl:text-left">
              © 2024 CarePulse
            </p>
            <a 
              href="/?admin=true"
              className="text-green-500"
            >
              Administrator
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
