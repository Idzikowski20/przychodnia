"use client";

import { useState, useEffect } from "react";
import { PatientForm } from "./forms/PatientForm";
import { LoginForm } from "./forms/LoginForm";
import LoggedInUser from "./LoggedInUser";

export const HomeAuthSwitcher = () => {
  const [active, setActive] = useState<"register" | "login">("register");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneForRegistration, setPhoneForRegistration] = useState<string>("");

  useEffect(() => {
    // Sprawdź czy użytkownik jest zalogowany
    const checkLoginStatus = () => {
      const storedUserId = localStorage.getItem("loggedInUserId");
      setIsLoggedIn(!!storedUserId);
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  const handleSwitchToRegister = (phone: string) => {
    setPhoneForRegistration(phone);
    setActive("register");
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex-1 space-y-6">
          <section className="mb-12 space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Ładowanie...</h1>
          </section>
        </div>
      </div>
    );
  }

  // Jeśli użytkownik jest zalogowany, pokaż komponent LoggedInUser
  if (isLoggedIn) {
    return <LoggedInUser />;
  }

  // Jeśli użytkownik nie jest zalogowany, pokaż formularze logowania/rejestracji
  return (
    <div className="w-full">
      <div className="mb-8 flex justify-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200 shadow-md">
          <button
            onClick={() => setActive("register")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              active === "register"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Rejestracja
          </button>
          <button
            onClick={() => setActive("login")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              active === "login"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Logowanie
          </button>
        </div>
      </div>

      {active === "register" ? (
        <PatientForm initialPhone={phoneForRegistration} />
      ) : (
        <LoginForm onSwitchToRegister={handleSwitchToRegister} />
      )}
    </div>
  );
};

export default HomeAuthSwitcher;


