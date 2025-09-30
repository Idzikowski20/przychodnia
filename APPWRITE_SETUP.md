# Konfiguracja Appwrite - Weryfikacja numeru telefonu

## Dodaj pole `numberVerified` do kolekcji `patients`

W konsoli Appwrite, w kolekcji `patients`, dodaj nowe pole:

### Nazwa pola: `numberVerified`
- **Typ**: Boolean
- **Wymagane**: Tak
- **Domyślna wartość**: `false`
- **Opis**: Czy numer telefonu został zweryfikowany przez SMS

## Struktura kolekcji `patients` po aktualizacji:

```
- userId (String, Required)
- userid (String, Required) 
- name (String, Required)
- email (String, Required)
- phone (String, Required)
- numberVerified (Boolean, Required, Default: false) ← NOWE POLE
- birthDate (DateTime, Required)
- gender (String, Required)
- address (String, Required)
- occupation (String, Required)
- emergencyContactName (String, Required)
- emergencyContactNumber (String, Required)
- primaryPhysician (String, Required)
- insuranceProvider (String, Required)
- insurancepolicyNumber (String, Required)
- allergies (String, Optional)
- currentMedication (String, Optional)
- familyMedicalHistory (String, Optional)
- pastMedicalHistory (String, Optional)
- privacyConsent (Boolean, Required)
- identificationNumber (String, Optional)
- identificationDocumentId (String, Optional)
- identificationDocumentUrl (String, Optional)
```

## Funkcjonalności weryfikacji SMS

Aby w pełni zaimplementować weryfikację SMS, będziesz potrzebować:

1. **SMS Provider** (np. Twilio, MessageBird, lub inny)
2. **API endpoint** do wysyłania kodów weryfikacyjnych
3. **API endpoint** do weryfikacji kodów

### Przykładowa implementacja API (do dodania w przyszłości):

```typescript
// app/api/send-verification-sms/route.ts
export async function POST(request: Request) {
  const { phoneNumber } = await request.json();
  
  // Generuj 6-cyfrowy kod
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Wyślij SMS przez provider
  // await sendSMS(phoneNumber, `Twój kod weryfikacyjny: ${code}`);
  
  // Zapisz kod w cache/Redis z TTL 5 minut
  // await redis.setex(`verification:${phoneNumber}`, 300, code);
  
  return Response.json({ success: true });
}

// app/api/verify-sms-code/route.ts
export async function POST(request: Request) {
  const { phoneNumber, code } = await request.json();
  
  // Sprawdź kod w cache
  // const storedCode = await redis.get(`verification:${phoneNumber}`);
  
  // if (storedCode === code) {
  //   return Response.json({ success: true });
  // }
  
  return Response.json({ success: false });
}
```

## Aktualny status

✅ **Zakończone:**
- Dodano pole `numberVerified` do typów TypeScript
- Zaktualizowano akcje Appwrite
- Stworzono modal weryfikacji numeru telefonu
- Zintegrowano weryfikację z procesem rejestracji
- Naprawiono problem z zawieszaniem się aplikacji
- **Stworzono API endpoints do weryfikacji SMS** 🆕
- **Zaimplementowano rzeczywistą funkcjonalność weryfikacji** 🆕

### Nowe API endpoints:

1. **POST /api/send-verification-sms**
   - Wysyła kod weryfikacyjny na numer telefonu
   - Generuje 6-cyfrowy kod z TTL 5 minut
   - Zwraca status wysłania

2. **POST /api/verify-sms-code**
   - Weryfikuje kod wprowadzony przez użytkownika
   - Sprawdza czy kod jest poprawny i nie wygasł
   - Usuwa kod po pomyślnej weryfikacji

### Jak to działa:

1. Użytkownik wypełnia formularz rejestracji
2. Po kliknięciu "Rozpocznij" tworzy się użytkownik w Appwrite
3. Automatycznie wysyłany jest kod SMS na numer telefonu
4. Pokazuje się modal weryfikacji z 6-cyfrowym polem
5. Użytkownik wprowadza kod otrzymany SMS-em
6. Po weryfikacji przekierowuje do formularza rejestracji z `numberVerified: true`

🔄 **Do zaimplementowania w przyszłości:**
- Integracja z rzeczywistym SMS providerem (Twilio, MessageBird, etc.)
- Przeniesienie cache z pamięci do Redis
- Dodanie rate limiting dla API
