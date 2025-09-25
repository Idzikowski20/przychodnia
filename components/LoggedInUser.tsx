"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/actions/patient.actions";

export const LoggedInUser = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        // Sprawdź czy w localStorage jest userId
        const storedUserId = localStorage.getItem("loggedInUserId");
        if (storedUserId) {
          const userData = await getUser(storedUserId);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking logged in user:", error);
        // Jeśli błąd, wyczyść localStorage
        localStorage.removeItem("loggedInUserId");
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUserId");
    setUser(null);
    // Odśwież stronę aby pokazać formularz logowania
    window.location.reload();
  };

  const handleGoToDashboard = () => {
    if (user?.$id) {
      router.push(`/patients/${user.$id}/dashboard`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6">
        <section className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Ładowanie...</h1>
        </section>
      </div>
    );
  }

  if (!user) {
    return null; // Nie pokazuj nic jeśli użytkownik nie jest zalogowany
  }

  return (
    <div className="flex-1 space-y-6">
      <section className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Witaj z powrotem, {user.name}! 👋
        </h1>
        <p className="text-gray-600">
          Co chcesz dzisiaj wykonać?
        </p>
      </section>

      <div className="space-y-4">
        <button
          onClick={handleGoToDashboard}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Przejdź do Panelu
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Wyloguj się
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Zalogowany jako:</strong> {user.name}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Telefon:</strong> {user.phone}
        </p>
      </div>
    </div>
  );
};

export default LoggedInUser;
