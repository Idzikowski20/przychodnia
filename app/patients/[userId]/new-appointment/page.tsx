import { redirect } from "next/navigation";

import BookingPage from "@/components/BookingPage";
import { getPatient } from "@/lib/actions/patient.actions";

const Appointment = async ({ params: { userId } }: SearchParamProps) => {
  const patient = await getPatient(userId);

  // Jeśli pacjent nie istnieje, przekieruj do rejestracji
  if (!patient) {
    redirect(`/patients/${userId}/register`);
  }

  return (
    <BookingPage
      userId={userId}
      patientId={patient.$id}
      patientName={patient.name}
    />
  );
};

export default Appointment;
