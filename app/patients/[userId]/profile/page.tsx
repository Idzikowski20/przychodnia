"use client";

import "react-phone-number-input/style.css";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getPatient, updatePatient } from "@/lib/actions/patient.actions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectItem } from "@/components/ui/select";
import { GenderOptions, InsuranceProviders } from "@/constants";
import { getDoctors } from "@/lib/actions/doctor.actions";
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
import SubmitButton from "@/components/SubmitButton";
import { Doctor } from "@/types/appwrite.types";

const ProfileSchema = z.object({
  name: z.string().min(1, "Imię i nazwisko jest wymagane"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().min(3, "Numer telefonu jest wymagany"),
  birthDate: z.coerce.date(),
  gender: z.string().min(1, "Płeć jest wymagana"),
  address: z.string().optional(),
  occupation: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  primaryPhysician: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
});

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;
  const [patientDocId, setPatientDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      birthDate: new Date(),
      gender: "",
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
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      
      try {
        const [patient, doctorsData] = await Promise.all([
          getPatient(userId),
          getDoctors()
        ]);
        
        setDoctors(doctorsData);
        
        if (patient) {
          setPatientDocId(patient.$id);
          form.reset({
            name: patient.name || "",
            email: patient.email || "",
            phone: patient.phone || "",
            birthDate: patient.birthDate ? new Date(patient.birthDate) : new Date(),
            gender: patient.gender || "",
            address: patient.address || "",
            occupation: patient.occupation || "",
            emergencyContactName: patient.emergencyContactName || "",
            emergencyContactNumber: patient.emergencyContactNumber || "",
            primaryPhysician: patient.primaryPhysician || "",
            insuranceProvider: patient.insuranceProvider || "",
            insurancePolicyNumber: patient.insurancePolicyNumber || "",
            allergies: patient.allergies || "",
            currentMedication: patient.currentMedication || "",
            familyMedicalHistory: patient.familyMedicalHistory || "",
            pastMedicalHistory: patient.pastMedicalHistory || "",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [userId, form]);

  const onSubmit = async (values: z.infer<typeof ProfileSchema>) => {
    if (!patientDocId) return;
    
    setIsSubmitting(true);
    try {
      await updatePatient(patientDocId, {
        ...values,
        birthDate: new Date(values.birthDate),
      });
      
      // Przekieruj z powrotem do dashboard
      router.push(`/patients/${userId}/dashboard`);
    } catch (error) {
      console.error("Error updating patient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-gray-500">Ładowanie...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="mb-12 h-10 w-fit"
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1">
              <section className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">Profil 👤</h1>
                <p className="text-gray-600">Zarządzaj swoimi danymi osobowymi i medycznymi.</p>
              </section>

              <section className="space-y-6">
                <div className="mb-9 space-y-1">
                  <h2 className="text-2xl font-semibold text-gray-900">Dane osobowe</h2>
                </div>

                {/* NAME */}
                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  control={form.control}
                  name="name"
                  placeholder="John Doe"
                  iconSrc="/assets/icons/user.svg"
                  iconAlt="user"
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
                  />

                  <CustomFormField
                    fieldType={FormFieldType.PHONE_INPUT}
                    control={form.control}
                    name="phone"
                    label="Numer telefonu"
                    placeholder="+48 123 456 789"
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
                  />

                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="occupation"
                    label="Zawód"
                    placeholder="Inżynier oprogramowania"
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
                  />

                  <CustomFormField
                    fieldType={FormFieldType.PHONE_INPUT}
                    control={form.control}
                    name="emergencyContactNumber"
                    label="Numer telefonu kontaktu awaryjnego"
                    placeholder="+48 123 456 789"
                  />
                </div>
              </section>

              <section className="space-y-6">
                <div className="mb-9 space-y-1">
                  <h2 className="text-2xl font-semibold text-gray-900">Informacje medyczne</h2>
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
                            className="rounded-full border border-gray-300"
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
                  />

                  <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="currentMedication"
                    label="Aktualnie przyjmowane leki"
                    placeholder="Ibuprofen 200mg, Lewotyroksyna 50mcg"
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
                  />

                  <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="pastMedicalHistory"
                    label="Przebyte choroby"
                    placeholder="Wycięcie wyrostka w 2015, rozpoznanie astmy w dzieciństwie"
                  />
                </div>
              </section>

              <SubmitButton isLoading={isSubmitting}>Zapisz zmiany</SubmitButton>
            </form>
          </Form>

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
}


