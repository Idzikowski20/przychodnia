"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Form } from "@/components/ui/form";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { requestLoginCode, verifyLoginCode } from "@/lib/actions/auth.actions";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LoginSchema = z.object({
  phone: z
    .string()
    .refine((phone) => /^\+\d{10,15}$/.test(phone), "Nieprawidłowy numer telefonu"),
});

export const LoginForm = ({ onSwitchToRegister, phoneForRegistration }: { 
  onSwitchToRegister?: (phone: string) => void;
  phoneForRegistration?: string;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showUserNotFoundDialog, setShowUserNotFoundDialog] = useState(false);
  const [phoneToRegister, setPhoneToRegister] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { phone: "" },
  });

  const handleRequestCode = async (values: z.infer<typeof LoginSchema>) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await requestLoginCode(values.phone);
      if (res?.ok) {
        setOtpRequested(true);
      } else if (res?.needsRegistration && res?.userId) {
        // Użytkownik istnieje ale nie ma kompletnego profilu - przekieruj do rejestracji
        setIsNavigating(true);
        router.push(`/patients/${res.userId}/register`);
      } else if (res?.userNotFound) {
        // Użytkownik nie istnieje - pokaż popup
        setPhoneToRegister(values.phone);
        setShowUserNotFoundDialog(true);
      } else {
        setError(res?.error || "Nie udało się wysłać kodu.");
      }
    } catch (e) {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    }
    setIsLoading(false);
  };

  const handleGoToRegister = () => {
    setShowUserNotFoundDialog(false);
    if (onSwitchToRegister) {
      onSwitchToRegister(phoneToRegister);
    }
  };

  const handleCloseDialog = () => {
    setShowUserNotFoundDialog(false);
    setPhoneToRegister("");
  };

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    if (!otpRequested) return handleRequestCode(values);
    if (code.length !== 6) {
      setError("Wpisz 6-cyfrowy kod.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await verifyLoginCode(values.phone, code);
      if (res?.ok && res?.userId) {
        // Zapisz userId w localStorage aby pamiętać że użytkownik jest zalogowany
        localStorage.setItem("loggedInUserId", res.userId);
        setIsNavigating(true);
        router.push(`/patients/${res.userId}/dashboard`);
      } else if (res?.needsRegistration && res?.userId) {
        // Użytkownik istnieje ale nie ma kompletnego profilu - przekieruj do rejestracji
        setIsNavigating(true);
        router.push(`/patients/${res.userId}/register`);
      } else {
        setError(res?.error || "Nieprawidłowy kod.");
      }
    } catch (e) {
      setError("Weryfikacja nie powiodła się.");
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        <section className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{otpRequested ? "Podaj kod" : "Logowanie"}</h1>
          <p className="text-gray-600">
            {otpRequested
              ? "Wpisz 6‑cyfrowy kod wysłany SMS‑em."
              : "Zaloguj się numerem telefonu. Wyślemy kod SMS."}
          </p>
        </section>

        <CustomFormField
          fieldType={FormFieldType.PHONE_INPUT}
          control={form.control}
          name="phone"
          label="Numer telefonu"
          placeholder="+48 123 456 789"
        />

        {otpRequested && (
          <div>
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup className="shad-otp">
                <InputOTPSlot className="shad-otp-slot" index={0} />
                <InputOTPSlot className="shad-otp-slot" index={1} />
                <InputOTPSlot className="shad-otp-slot" index={2} />
                <InputOTPSlot className="shad-otp-slot" index={3} />
                <InputOTPSlot className="shad-otp-slot" index={4} />
                <InputOTPSlot className="shad-otp-slot" index={5} />
              </InputOTPGroup>
            </InputOTP>
            {error && <p className="shad-error text-14-regular mt-4">{error}</p>}
          </div>
        )}

        <SubmitButton isLoading={isLoading || isNavigating}>
          {isNavigating ? "Przekierowywanie..." : otpRequested ? "Zaloguj" : "Wyślij kod"}
        </SubmitButton>
      </form>

      {/* Popup dla użytkownika który nie istnieje */}
      <AlertDialog open={showUserNotFoundDialog} onOpenChange={setShowUserNotFoundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konto nie istnieje</AlertDialogTitle>
            <AlertDialogDescription>
              Nie znaleziono konta z numerem telefonu <strong>{phoneToRegister}</strong>.
              <br />
              <br />
              Czy chcesz się zarejestrować z tym numerem telefonu?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseDialog} className="bg-gray-500 hover:bg-gray-600">
              Anuluj
            </AlertDialogAction>
            <AlertDialogAction onClick={handleGoToRegister} className="bg-green-500 hover:bg-green-600">
              Zarejestruj się
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
};

export default LoginForm;


