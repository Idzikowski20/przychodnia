"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { createUser } from "@/lib/actions/patient.actions";
import { UserFormValidation } from "@/lib/validation";

import "react-phone-number-input/style.css";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import PhoneVerificationModal from "../PhoneVerificationModal";

export const PatientForm = ({ initialPhone }: { initialPhone?: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userData, setUserData] = useState<z.infer<typeof UserFormValidation> | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [authMethod, setAuthMethod] = useState<'phone' | 'password'>('phone');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    digit: false,
    match: false
  });

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: initialPhone || "",
    },
  });

  // Walidacja hasła
  const validatePassword = (password: string, confirmPassword: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      digit: /\d/.test(password),
      match: password === confirmPassword && password.length > 0
    });
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePassword(value, confirmPassword);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    validatePassword(password, value);
  };

  const isPasswordValid = passwordValidation.length && passwordValidation.uppercase && passwordValidation.digit && passwordValidation.match;

  const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
    console.log('🚀 onSubmit wywołane!', { values, authMethod, isPasswordValid });
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (authMethod === 'password') {
        // Rejestracja z hasłem
        if (!isPasswordValid) {
          setErrorMessage('Hasło nie spełnia wymagań');
          return;
        }

        console.log('Rozpoczynam rejestrację z hasłem...', { name: values.name, email: values.email, phone: values.phone });

        const user = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: password,
        };

        try {
          const newUser = await createUser(user);
          console.log('Wynik createUser:', newUser);

          if (newUser && newUser.$id) {
            console.log('Użytkownik utworzony, przekierowuję...', newUser.$id);
            setIsNavigating(true);
            router.push(`/patients/${newUser.$id}/register?verified=true`);
          } else {
            console.error("createUser zwrócił null lub brak $id");
            setErrorMessage('Nie udało się utworzyć konta. Spróbuj ponownie.');
          }
        } catch (userError) {
          console.error("Błąd podczas tworzenia użytkownika:", userError);
          setErrorMessage('Błąd podczas tworzenia konta. Spróbuj ponownie.');
        }
      } else {
        // Rejestracja z numerem telefonu (SMS)
        const smsResponse = await fetch('/api/send-verification-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: values.phone,
          }),
        });

        const smsData = await smsResponse.json();

        if (smsResponse.ok && smsData.success) {
          setUserData(values);
          setShowVerificationModal(true);
        } else {
          if (smsData.userExists) {
            if (smsData.needsLogin) {
              setErrorMessage('Konto o podanym numerze telefonu już istnieje. Zaloguj się, aby kontynuować.');
            } else if (smsData.needsRegistration) {
              setUserData(values);
              setShowVerificationModal(true);
            }
          } else {
            setErrorMessage(smsData.error || 'Nie udało się wysłać kodu weryfikacyjnego');
          }
        }
      }
    } catch (error) {
      console.error("Błąd podczas rejestracji:", error);
      setErrorMessage('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = async (userId?: string) => {
    setShowVerificationModal(false);
    setIsNavigating(true);
    
    if (userId) {
      // Przekierowujemy do rejestracji z ID użytkownika
      router.push(`/patients/${userId}/register?verified=true`);
    } else if (userData) {
      // Przekierowujemy do rejestracji z numerem telefonu
      router.push(`/patients/${userData.phone}/register?verified=true`);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => {
          console.log('📝 Form submit event!', data);
          onSubmit(data);
        })} className="flex-1 space-y-4 max-w-md mx-auto">
          <section className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Cześć 👋</h1>
            <p className="text-gray-600 text-sm">Rozpocznij umawianie wizyt.</p>
          </section>

          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="name"
            label="Imię i nazwisko"
            placeholder="Jan Kowalski"
            iconSrc="/assets/icons/user.svg"
            iconAlt="user"
          />

          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Email"
            placeholder="jan.kowalski@gmail.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
          />

          {authMethod === 'phone' && (
            <CustomFormField
              fieldType={FormFieldType.PHONE_INPUT}
              control={form.control}
              name="phone"
              label="Numer telefonu"
              placeholder="+48 123 456 789"
            />
          )}

          {/* Przycisk tekstowy do przełączenia na hasło */}
          <div className="text-center py-2">
            <button
              type="button"
              onClick={() => setAuthMethod(authMethod === 'phone' ? 'password' : 'phone')}
              className="text-blue-600 hover:text-blue-700 text-xs font-medium underline"
            >
              {authMethod === 'phone' ? 'Ustaw hasło zamiast telefonu' : 'Wróć do numeru telefonu'}
            </button>
          </div>

          {/* Pola hasła - pokazują się tylko gdy wybrano hasło */}
          {authMethod === 'password' && (
            <div className="space-y-3">
              {/* Pole hasła */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasło
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Wprowadź hasło"
                  className="w-full h-11 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-900 placeholder:text-gray-500 shadow-sm focus:ring-0 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Pole potwierdzenia hasła */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Powtórz hasło
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  placeholder="Powtórz hasło"
                  className="w-full h-11 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-900 placeholder:text-gray-500 shadow-sm focus:ring-0 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Walidacja hasła - kompaktowa */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${passwordValidation.length ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {passwordValidation.length && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                    8+ znaków
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${passwordValidation.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {passwordValidation.uppercase && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    Duża litera
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${passwordValidation.digit ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {passwordValidation.digit && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`${passwordValidation.digit ? 'text-green-600' : 'text-gray-500'}`}>
                    Cyfra
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${passwordValidation.match ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {passwordValidation.match && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`${passwordValidation.match ? 'text-green-600' : 'text-gray-500'}`}>
                    Zgadzają się
                  </span>
                </div>
              </div>
            </div>
          )}

          <SubmitButton isLoading={isLoading || isNavigating}>
            {isNavigating ? "Przekierowywanie..." : "Rozpocznij"}
          </SubmitButton>

          {/* Wyświetlanie błędu */}
          {errorMessage && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs">{errorMessage}</p>
            </div>
          )}
        </form>
      </Form>

      {/* Modal weryfikacji numeru telefonu */}
      <PhoneVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        phoneNumber={userData?.phone || ""}
        onVerificationSuccess={handleVerificationSuccess}
        userData={userData}
      />
    </>
  );
};
