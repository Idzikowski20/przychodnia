import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Doctors } from "@/constants";
import { getAppointment } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";

const RequestSuccess = async ({
  searchParams,
  params: { userId },
}: SearchParamProps) => {
  const appointmentId = (searchParams?.appointmentId as string) || "";
  const appointment = await getAppointment(appointmentId);

  const doctor = Doctors.find(
    (doctor) => doctor.name === appointment.primaryPhysician
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Image
              src="/assets/icons/logo-full.svg"
              height={1000}
              width={1000}
              alt="logo"
              className="mb-12 h-10 w-fit"
            />
          </Link>

          <div className="flex flex-col items-center text-center space-y-8">
            {/* Success Icon */}
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Twoja <span className="text-green-500">prośba o wizytę</span> została pomyślnie wysłana!
              </h1>
              <p className="text-xl text-gray-600">
                Skontaktujemy się z Tobą wkrótce w celu potwierdzenia.
              </p>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Szczegóły żądanej wizyty:
              </h3>
              
              <div className="flex items-center gap-3">
                <Image
                  src={doctor?.image!}
                  alt="doctor"
                  width={40}
                  height={40}
                  className="doctor-avatar border border-gray-200"
                />
                <div>
                  <p className="font-medium text-gray-900">Dr. {doctor?.name}</p>
                  <p className="text-sm text-gray-500">{doctor?.specialization}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/icons/calendar.svg"
                  height={20}
                  width={20}
                  alt="calendar"
                  className="text-gray-500"
                />
                <p className="text-gray-700">{formatDateTime(appointment.schedule).dateTime}</p>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
              asChild
            >
              <Link href={`/patients/${userId}/dashboard`}>
                Wróć do panelu
              </Link>
            </Button>
          </div>

          {/* Footer - Hidden for logged in users */}
          {/* Footer is only shown on login/registration pages */}
        </div>
      </div>
    </div>
  );
};

export default RequestSuccess;
