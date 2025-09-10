import clsx from "clsx";
import Image from "next/image";

import { StatusIcon } from "@/constants";

const getStatusDisplay = (status: string) => {
  switch (status) {
    case "scheduled":
      return "przełożona";
    case "accepted":
      return "potwierdzona";
    case "completed":
      return "odbyta";
    case "awaiting":
    case "pending":
      return "oczekująca";
    case "cancelled":
      return "anulowana";
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "text-green-500";
    case "accepted":
      return "text-blue-500";
    case "completed":
      return "text-green-200";
    case "awaiting":
    case "pending":
      return "text-yellow-500";
    case "cancelled":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

const getStatusBgColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "bg-green-600";
    case "accepted":
      return "bg-blue-600";
    case "completed":
      return "bg-green-900";
    case "awaiting":
    case "pending":
      return "bg-yellow-700";
    case "cancelled":
      return "bg-red-600";
    default:
      return "bg-gray-600";
  }
};

const getStatusGlowColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "shadow-green-500/10 margin-1 shadow-lg";
    case "accepted":
      return "shadow-blue-500/10 margin-1 shadow-lg";
    case "completed":
      return "shadow-green-500/10 margin-1 shadow-lg";
    case "awaiting":
    case "pending":
      return "shadow-yellow-500/10 margin-1 shadow-lg";
    case "cancelled":
      return "shadow-red-500/10 margin-1 shadow-lg";
    default:
      return "shadow-gray-500/10 margin-1 shadow-lg";
  }
};

export const StatusBadge = ({ status }: { status: Status | string }) => {
  // Backward compatibility: obsługa zarówno array jak i string
  let statuses: string[];
  
  if (Array.isArray(status)) {
    statuses = status;
  } else {
    // Jeśli to string, podziel po przecinku lub użyj jako pojedynczy status
    statuses = status.includes(',') ? status.split(',').map(s => s.trim()) : [status];
  }
  
  // Jeśli array jest pusty, traktuj jako "awaiting"
  if (statuses.length === 0) {
    statuses = ["awaiting"];
  }
  
  // Jeśli wizyta ma status "completed", pokaż tylko ten status
  if (statuses.includes("completed")) {
    statuses = ["completed"];
  }
  
  // Jeśli mamy więcej niż jeden status, wyświetl wszystkie
  if (statuses.length > 1) {
    return (
      <div className="flex flex-wrap gap-2">
        {statuses.map((singleStatus, index) => (
          <div
            key={index}
            className={clsx("status-badge", getStatusBgColor(singleStatus), getStatusGlowColor(singleStatus))}
          >
            <Image
              src={StatusIcon[singleStatus as keyof typeof StatusIcon]}
              alt="status"
              width={24}
              height={24}
              className="h-fit w-3 brightness-0 invert"
            />
            <p className="text-12-semibold capitalize text-white">
              {getStatusDisplay(singleStatus)}
            </p>
          </div>
        ))}
      </div>
    );
  }

  // Pojedynczy status
  const singleStatus = statuses[0] || "awaiting";
  return (
    <div className={clsx("status-badge", getStatusBgColor(singleStatus), getStatusGlowColor(singleStatus))}>
      <Image
        src={StatusIcon[singleStatus as keyof typeof StatusIcon] || "/assets/icons/pending.svg"}
        alt="status"
        width={24}
        height={24}
        className="h-fit w-3 brightness-0 invert"
      />
      <p className="text-12-semibold capitalize text-white">
        {getStatusDisplay(singleStatus)}
      </p>
    </div>
  );
};
