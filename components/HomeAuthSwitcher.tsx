"use client";

import { useState } from "react";
import { PatientForm } from "./forms/PatientForm";
import { LoginForm } from "./forms/LoginForm";

export const HomeAuthSwitcher = () => {
  const [active, setActive] = useState<"register" | "login">("register");

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

      {active === "register" ? <PatientForm /> : <LoginForm />}
    </div>
  );
};

export default HomeAuthSwitcher;


