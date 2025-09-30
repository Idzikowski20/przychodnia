'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerificationSuccess: (userId?: string) => void;
  userData?: any;
}

const PhoneVerificationModal = ({ 
  isOpen, 
  onClose, 
  phoneNumber, 
  onVerificationSuccess,
  userData
}: PhoneVerificationModalProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState('');

  // Timer dla ponownego wysłania kodu
  useEffect(() => {
    if (timeLeft > 0 && isOpen) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isOpen]);

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(60);
      setVerificationCode('');
      setError('');
    }
  }, [isOpen]);

  const handleCodeChange = (value: string) => {
    // Tylko cyfry i maksymalnie 6 znaków
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(numericValue);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setError('Kod weryfikacyjny musi mieć 6 cyfr');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-sms-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          code: verificationCode,
          userData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onVerificationSuccess(data.userId);
      } else {
        setError(data.error || 'Nieprawidłowy kod weryfikacyjny');
      }
    } catch (error) {
      console.error('Błąd podczas weryfikacji:', error);
      setError('Wystąpił błąd podczas weryfikacji. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/send-verification-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTimeLeft(60);
        setVerificationCode('');
      } else {
        setError(data.error || 'Nie udało się ponownie wysłać kodu');
      }
    } catch (error) {
      console.error('Błąd podczas ponownego wysłania kodu:', error);
      setError('Nie udało się ponownie wysłać kodu. Spróbuj ponownie.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Weryfikacja numeru telefonu
          </h2>
          <p className="text-gray-600">
            Wprowadź 6-cyfrowy kod, który wysłaliśmy na numer:
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {phoneNumber}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kod weryfikacyjny
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
              autoComplete="one-time-code"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={verificationCode.length !== 6 || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Weryfikuję...' : 'Zweryfikuj numer'}
          </button>
        </form>

        {/* Resend code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Nie otrzymałeś kodu?
          </p>
          <button
            onClick={handleResendCode}
            disabled={timeLeft > 0 || isResending}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isResending ? 'Wysyłam...' : timeLeft > 0 ? `Wyślij ponownie za ${timeLeft}s` : 'Wyślij ponownie'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PhoneVerificationModal;
