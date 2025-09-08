"use client";

import { useState } from "react";
import { CalendarDaysIcon, UsersIcon, HomeIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { CreditCardIcon, SettingsIcon, UserIcon } from "lucide-react";

type AdminNavigationProps = {
  activeSection: "appointments" | "patients" | "specialists" | "office" | "payments" | "settings";
  onSectionChange: (section: "appointments" | "patients" | "specialists" | "office" | "payments" | "settings") => void;
  onLogout?: () => void;
};

export const AdminNavigation = ({ activeSection, onSectionChange, onLogout }: AdminNavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleSectionChange = (sectionId: typeof activeSection) => {
    onSectionChange(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-1 bg-white/5 p-1 rounded-lg border border-white/10">
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

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-end w-full">
        {/* Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-200"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Side Menu */}
          <div className="absolute right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-md border-l border-white/10 shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <img 
                    src="/assets/icons/logo-icon.svg" 
                    alt="Logo" 
                    className="w-8 h-8"
                  />
                  <span className="text-white font-semibold text-lg">Panel Admina</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all duration-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
                
                {/* Separator */}
                <div className="border-t border-white/10 my-4"></div>
                
                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Wyloguj</span>
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
