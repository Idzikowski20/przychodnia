"use server";

import { ID, Query } from "node-appwrite";
import crypto from "crypto";

import { messaging, users } from "../appwrite.config";
import { parseStringify } from "../utils";

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

// Request OTP code via SMS for existing user identified by phone number
export const requestLoginCode = async (phone: string) => {
  try {
    const list = await users.list([Query.equal("phone", [phone])]);
    const user = list.total > 0 ? list.users[0] : null;

    if (!user) {
      return parseStringify({ ok: false, error: "Użytkownik o podanym numerze nie istnieje." });
    }

    const code = generateSixDigitCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minut

    await users.updatePrefs(user.$id, {
      loginCodeHash: hashCode(code),
      loginCodeExpiresAt: expiresAt,
    } as any);

    // Wyślij SMS przez Appwrite Messaging (adresat po userId)
    await messaging.createSms(
      ID.unique(),
      `Twój kod logowania do CarePulse: ${code}. Kod wygaśnie za 5 minut.`,
      [],
      [user.$id]
    );

    return parseStringify({ ok: true, userId: user.$id });
  } catch (error) {
    console.error("An error occurred while requesting login code:", error);
    return parseStringify({ ok: false, error: "Nie udało się wysłać kodu. Spróbuj ponownie." });
  }
};

// Verify OTP code and return userId if valid
export const verifyLoginCode = async (phone: string, code: string) => {
  try {
    const list = await users.list([Query.equal("phone", [phone])]);
    const user = list.total > 0 ? list.users[0] : null;

    if (!user) {
      return parseStringify({ ok: false, error: "Użytkownik nie istnieje." });
    }

    const prefs: any = await users.getPrefs(user.$id);
    const storedHash = prefs?.loginCodeHash as string | undefined;
    const expiresAt = Number(prefs?.loginCodeExpiresAt || 0);

    if (!storedHash || !expiresAt) {
      return parseStringify({ ok: false, error: "Brak aktywnego kodu. Wyślij nowy." });
    }

    if (Date.now() > expiresAt) {
      // Wyczyść przeterminowany kod
      await users.updatePrefs(user.$id, { loginCodeHash: "", loginCodeExpiresAt: 0 } as any);
      return parseStringify({ ok: false, error: "Kod wygasł. Wyślij nowy." });
    }

    if (hashCode(code) !== storedHash) {
      return parseStringify({ ok: false, error: "Nieprawidłowy kod." });
    }

    // Wyczyść kod po poprawnej weryfikacji
    await users.updatePrefs(user.$id, { loginCodeHash: "", loginCodeExpiresAt: 0 } as any);

    return parseStringify({ ok: true, userId: user.$id });
  } catch (error) {
    console.error("An error occurred while verifying login code:", error);
    return parseStringify({ ok: false, error: "Weryfikacja nie powiodła się." });
  }
};


