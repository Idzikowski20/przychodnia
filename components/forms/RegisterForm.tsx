"use client";

import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectItem } from "@/components/ui/select";
import { GenderOptions, PatientFormDefaultValues, InsuranceProviders } from "@/constants";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { registerPatient } from "@/lib/actions/patient.actions";
import { PatientFormValidation } from "@/lib/validation";
import { Doctor } from "@/types/appwrite.types";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";

const RegisterForm = ({ user, isAdminModal = false }: { user: User; isAdminModal?: boolean }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsData = await getDoctors();
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });

  const onSubmit = async (values: z.infer<typeof PatientFormValidation>) => {
    setIsLoading(true);

    try {
      const patient = {
        userId: user.$id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        birthDate: new Date(values.birthDate),
        gender: values.gender,
        address: values.address,
        occupation: values.occupation,
        emergencyContactName: values.emergencyContactName,
        emergencyContactNumber: values.emergencyContactNumber,
        primaryPhysician: values.primaryPhysician,
        insuranceProvider: values.insuranceProvider,
        insurancePolicyNumber: values.insurancePolicyNumber,
        allergies: values.allergies,
        currentMedication: values.currentMedication,
        familyMedicalHistory: values.familyMedicalHistory,
        pastMedicalHistory: values.pastMedicalHistory,
        privacyConsent: values.privacyConsent,
      };

      const newPatient = await registerPatient(patient);

      if (newPatient) {
        router.push(`/patients/${user.$id}/new-appointment`);
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1"
      >
        <section className="space-y-4">
          <h1 className={`header ${isAdminModal ? 'text-white' : ''}`}>Witamy 👋</h1>
          <p className={isAdminModal ? 'text-white/70' : 'text-dark-700'}>Pozwól nam poznać Cię lepiej.</p>
        </section>

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className={`sub-header ${isAdminModal ? 'text-white' : ''}`}>Dane osobowe</h2>
          </div>

          {/* NAME */}

          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="name"
            placeholder="John Doe"
            iconSrc="/assets/icons/user.svg"
            iconAlt="user"
            isAdminModal={isAdminModal}
          />

          {/* EMAIL & PHONE */}
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="email"
              label="Adres email"
              placeholder="jan.kowalski@gmail.com"
              iconSrc="/assets/icons/email.svg"
              iconAlt="email"
              isAdminModal={isAdminModal}
          />

            <CustomFormField
              fieldType={FormFieldType.PHONE_INPUT}
              control={form.control}
              name="phone"
              label="Numer telefonu"
              placeholder="+48 123 456 789"
              isAdminModal={isAdminModal}
          />
          </div>

          {/* BirthDate & Gender */}
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="birthDate"
              label="Data urodzenia"
              dateFormat="dd/MM/yyyy"
              isAdminModal={isAdminModal}
          />

            <CustomFormField
              fieldType={FormFieldType.SKELETON}
              control={form.control}
              name="gender"
              label="Płeć"
              renderSkeleton={(field) => (
                <FormControl>
                  <RadioGroup
                    className="flex h-11 gap-6 xl:justify-between"
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    {GenderOptions.map((option, i) => (
                      <div key={option + i} className="radio-group">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
            isAdminModal={isAdminModal}
          />
          </div>

          {/* Address & Occupation */}
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="address"
              label="Adres"
              placeholder="ul. Przykładowa 14, 00-001 Warszawa"
            isAdminModal={isAdminModal}
          />

            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="occupation"
              label="Zawód"
              placeholder="Inżynier oprogramowania"
            isAdminModal={isAdminModal}
          />
          </div>

          {/* Emergency Contact Name & Emergency Contact Number */}
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="emergencyContactName"
              label="Imię i nazwisko kontaktu awaryjnego"
              placeholder="Imię i nazwisko opiekuna"
            isAdminModal={isAdminModal}
          />

            <CustomFormField
              fieldType={FormFieldType.PHONE_INPUT}
              control={form.control}
              name="emergencyContactNumber"
              label="Numer telefonu kontaktu awaryjnego"
              placeholder="+48 123 456 789"
            isAdminModal={isAdminModal}
          />
          </div>
        </section>

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className={`sub-header ${isAdminModal ? 'text-white' : ''}`}>Informacje medyczne</h2>
          </div>

          {/* PRIMARY CARE PHYSICIAN */}
          <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="primaryPhysician"
            label="Lekarz prowadzący"
            placeholder="Wybierz lekarza"
          >
            {doctors.map((doctor, i) => (
              <SelectItem key={doctor.$id + i} value={doctor.name}>
                <div className="flex cursor-pointer items-center gap-2">
                  {doctor.avatar ? (
                    <Image
                      src={doctor.avatar}
                      width={32}
                      height={32}
                      alt="doctor"
                      className="rounded-full border border-dark-500"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div>
                    <p>{doctor.name}</p>
                    <p className="text-xs text-gray-500">{doctor.specialization}</p>
                  </div>
                </div>
              </SelectItem>
            ))}
          </CustomFormField>

          {/* INSURANCE & POLICY NUMBER */}
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="insuranceProvider"
              label="Ubezpieczyciel"
              placeholder="Wybierz ubezpieczyciela"
            >
              {InsuranceProviders.map((provider, i) => (
                <SelectItem key={provider + i} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="insurancePolicyNumber"
              label="Numer polisy ubezpieczeniowej"
              placeholder="ABC123456789"
            isAdminModal={isAdminModal}
          />
          </div>

          {/* ALLERGY & CURRENT MEDICATIONS */}
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="allergies"
              label="Alergie (jeśli występują)"
              placeholder="Orzechy, Penicylina, Pyłki"
            isAdminModal={isAdminModal}
          />

            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="currentMedication"
              label="Aktualnie przyjmowane leki"
              placeholder="Ibuprofen 200mg, Lewotyroksyna 50mcg"
            isAdminModal={isAdminModal}
          />
          </div>

          {/* FAMILY MEDICATION & PAST MEDICATIONS */}
          <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="familyMedicalHistory"
              label="Historia medyczna rodziny (jeśli istotna)"
              placeholder="Matka miała raka mózgu, ojciec ma nadciśnienie"
            isAdminModal={isAdminModal}
          />

            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="pastMedicalHistory"
              label="Przebyte choroby"
              placeholder="Wycięcie wyrostka w 2015, rozpoznanie astmy w dzieciństwie"
            isAdminModal={isAdminModal}
          />
          </div>
        </section>


        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className={`sub-header ${isAdminModal ? 'text-white' : ''}`}>Zgody i prywatność</h2>
          </div>

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="treatmentConsent"
            label="Wyrażam zgodę na leczenie mojego stanu zdrowia."
          />

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="disclosureConsent"
            label="Wyrażam zgodę na wykorzystanie i ujawnienie moich informacji
            zdrowotnych w celach leczniczych."
          />

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="privacyConsent"
            label="Potwierdzam, że zapoznałem się z polityką prywatności
            i wyrażam na nią zgodę"
          />
        </section>

        <SubmitButton isLoading={isLoading}>Wyślij i kontynuuj</SubmitButton>
      </form>
    </Form>
  );
};

export default RegisterForm;
