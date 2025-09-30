import { NextRequest, NextResponse } from 'next/server';
import { ID, Query } from 'node-appwrite';
import crypto from 'crypto';
import { messaging, users } from '@/lib/appwrite.config';
import { getPatient } from '@/lib/actions/patient.actions';

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Numer telefonu jest wymagany' },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik już istnieje
    const existingUsers = await users.list([Query.equal("phone", [phoneNumber])]);
    const existingUser = existingUsers.total > 0 ? existingUsers.users[0] : null;

    if (existingUser) {
      // Sprawdź czy ma kompletny profil pacjenta
      const patient = await getPatient(existingUser.$id);
      
      if (patient) {
        return NextResponse.json({
          error: 'Konto o podanym numerze telefonu już istnieje. Zaloguj się, aby kontynuować.',
          userExists: true,
          needsLogin: true
        }, { status: 400 });
      } else {
        // Użytkownik istnieje ale nie ma kompletnego profilu - kontynuuj rejestrację
        return NextResponse.json({
          error: 'Konto o podanym numerze telefonu już istnieje, ale profil nie jest kompletny. Zostaniesz przekierowany do dokończenia rejestracji.',
          userExists: true,
          needsRegistration: true,
          userId: existingUser.$id
        }, { status: 400 });
      }
    }

    // Generuj kod weryfikacyjny
    const code = generateSixDigitCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minut

    // Zapisz kod w cache (używamy tymczasowego użytkownika do przechowywania kodu)
    // W rzeczywistej aplikacji użyj Redis lub innej bazy cache
    const tempUserId = `temp_${phoneNumber.replace(/\D/g, '')}`;
    
    try {
      // Próbuj zaktualizować prefs tymczasowego użytkownika
      await users.updatePrefs(tempUserId, {
        verificationCodeHash: hashCode(code),
        verificationCodeExpiresAt: expiresAt,
      } as any);
    } catch {
      // Jeśli użytkownik nie istnieje, utwórz go tymczasowo
      try {
        await users.create(
          tempUserId,
          `temp_${phoneNumber}@carepulse.temp`,
          phoneNumber,
          undefined,
          `Temp_${phoneNumber}`
        );
        
        await users.updatePrefs(tempUserId, {
          verificationCodeHash: hashCode(code),
          verificationCodeExpiresAt: expiresAt,
        } as any);
      } catch (error) {
        console.error('Błąd tworzenia tymczasowego użytkownika:', error);
      }
    }

    // Wyślij SMS przez Appwrite Messaging
    try {
      await messaging.createSms(
        ID.unique(),
        `Twój kod weryfikacyjny CarePulse: ${code}. Kod jest ważny przez 5 minut.`,
        [],
        [tempUserId]
      );
    } catch (smsError) {
      console.error('Błąd wysyłania SMS:', smsError);
      return NextResponse.json(
        { error: 'Nie udało się wysłać SMS. Spróbuj ponownie.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Kod weryfikacyjny został wysłany',
      tempUserId
    });

  } catch (error) {
    console.error('Błąd API send-verification-sms:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}
