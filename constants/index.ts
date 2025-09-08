export const GenderOptions = ["Mężczyzna", "Kobieta", "Inny"];

export const InsuranceProviders = [
  "NFZ",
  "PZU Zdrowie",
  "Lux Med",
  "Medicover",
  "Enel Med",
  "Polmed",
  "Compensa",
  "Allianz",
  "Generali",
  "Warta",
  "Inne"
];

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "Mężczyzna" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};

export const Doctors = [
  {
    image: "/assets/images/sylwia.jpg",
    name: "Sylwia Klejnowska",
  }
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  accepted: "/assets/icons/check-circle.svg",
  completed: "/assets/icons/check-circle.svg",
  awaiting: "/assets/icons/pending.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};
