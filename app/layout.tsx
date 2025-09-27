import type { Metadata } from "next";
import "./globals.css";
// Używamy lokalnej czcionki Sofia Pro zdefiniowanej w globals.css
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";

import { cn } from "@/lib/utils";

const fontSans = { variable: "--font-sans" } as const;

export const metadata: Metadata = {
  title: "CarePulse - Psycholog Wołomin i Warszawa",
  description:
    "Specjalistyczna Poradnia Psychologiczna CarePulse w Wołominie i Warszawie. Profesjonalna pomoc psychologiczna, terapia, diagnozy i wsparcie. Umów się na wizytę już dziś.",
  icons: {
    icon: "/assets/icons/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={cn("min-h-screen font-sans antialiased bg-background", fontSans.variable)}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
