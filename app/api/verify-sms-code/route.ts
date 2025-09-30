import { NextRequest, NextResponse } from 'next/server';
import { ID, Query } from 'node-appwrite';
import crypto from 'crypto';
import { users } from '@/lib/appwrite.config';
import { createUser } from '@/lib/actions/patient.actions';

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code, userData } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Numer telefonu i kod są wymagane' },
        { status: 400 }
      );
    }

    // Sprawdź kod weryfikacyjny
    const tempUserId = `temp_${phoneNumber.replace(/\D/g, '')}`;
    
    try {
      const prefs: any = await users.getPrefs(tempUserId);
      const storedHash = prefs?.verificationCodeHash as string | undefined;
      const expiresAt = Number(prefs?.verificationCodeExpiresAt || 0);

      if (!storedHash || !expiresAt) {
        return NextResponse.json(
          { error: 'Brak aktywnego kodu. Wyślij nowy.' },
          { status: 400 }
        );
      }

      if (Date.now() > expiresAt) {
        // Wyczyść przeterminowany kod
        await users.updatePrefs(tempUserId, { 
          verificationCodeHash: "", 
          verificationCodeExpiresAt: 0 
        } as any);
        return NextResponse.json(
          { error: 'Kod wygasł. Wyślij nowy.' },
          { status: 400 }
        );
      }

      if (hashCode(code) !== storedHash) {
        return NextResponse.json(
          { error: 'Nieprawidłowy kod weryfikacyjny' },
          { status: 400 }
        );
      }

      // Kod jest poprawny - wyczyść go
      await users.updatePrefs(tempUserId, { 
        verificationCodeHash: "", 
        verificationCodeExpiresAt: 0 
      } as any);

      // Sprawdź czy użytkownik już istnieje (może się zarejestrował między czasem)
      const existingUsers = await users.list([Query.equal("phone", [phoneNumber])]);
      const existingUser = existingUsers.total > 0 ? existingUsers.users[0] : null;

      if (existingUser) {
        // Użytkownik już istnieje - zwróć jego ID
        return NextResponse.json({ 
          success: true,
          message: 'Numer telefonu został zweryfikowany',
          userId: existingUser.$id,
          userExists: true
        });
      } else if (userData) {
        // Utwórz nowego użytkownika
        const newUser = await createUser({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        });

        if (newUser) {
          return NextResponse.json({ 
            success: true,
            message: 'Numer telefonu został zweryfikowany i użytkownik został utworzony',
            userId: newUser.$id,
            userExists: false
          });
        } else {
          return NextResponse.json(
            { error: 'Nie udało się utworzyć użytkownika' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json({ 
          success: true,
          message: 'Numer telefonu został zweryfikowany'
        });
      }

    } catch (error) {
      console.error('Błąd weryfikacji kodu:', error);
      return NextResponse.json(
        { error: 'Błąd podczas weryfikacji kodu' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Błąd API verify-sms-code:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}
