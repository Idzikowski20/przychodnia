import Image from "next/image";
import { redirect } from "next/navigation";

import { PatientDashboard } from "@/components/PatientDashboard";
import { getPatient } from "@/lib/actions/patient.actions";

const Dashboard = async ({ params: { userId } }: SearchParamProps) => {
  const patient = await getPatient(userId);

  // Jeśli pacjent nie istnieje, przekieruj do rejestracji
  if (!patient) {
    redirect(`/patients/${userId}/register`);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="mb-12 h-10 w-fit"
          />

          <PatientDashboard patient={patient} userId={userId} />

          <div className="text-14-regular mt-20 flex justify-between">
            <p className="justify-items-end text-gray-600 xl:text-left">
              © 2024 CarePulse
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
