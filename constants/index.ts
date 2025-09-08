export const GenderOptions = ["male", "female", "others"];

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "male" as Gender,
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
