"use client";

import { useState } from "react";
import { CalendarDaysIcon, UsersIcon, HomeIcon } from "@heroicons/react/24/outline";
import { CreditCardIcon, SettingsIcon, UserIcon } from "lucide-react";

type AdminNavigationProps = {
  activeSection: "appointments" | "patients" | "specialists" | "office" | "payments" | "settings";
  onSectionChange: (section: "appointments" | "patients" | "specialists" | "office" | "payments" | "settings") => void;
};

export const AdminNavigation = ({ activeSection, onSectionChange }: AdminNavigationProps) => {
  const sections = [
    {
      id: "appointments" as const,
      label: "Wizyty",
      icon: CalendarDaysIcon,
    },
    {
      id: "patients" as const,
      label: "Pacjenci",
      icon: UsersIcon,
    },
    {
      id: "specialists" as const,
      label: "Specjaliści",
      icon: UserIcon,
    },
    {
      id: "office" as const,
      label: "Biuro",
      icon: HomeIcon,
    },
    {
      id: "payments" as const,
      label: "Płatności",
      icon: CreditCardIcon,
    },
    {
      id: "settings" as const,
      label: "Ustawienia",
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="flex space-x-1 bg-white/5 p-1 rounded-lg border border-white/10">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        
        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
              isActive
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">{section.label}</span>
          </button>
        );
      })}
    </div>
  );
};
