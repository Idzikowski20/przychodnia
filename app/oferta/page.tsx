import Image from "next/image";
import Link from "next/link";

const Oferta = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/assets/icons/logo-full.svg"
                  height={60}
                  width={200}
                  alt="CarePulse"
                  className="h-12 w-auto"
                />
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/oferta" className="text-green-600 font-medium">
                Oferta
              </Link>
              <Link href="/o-nas" className="text-gray-700 hover:text-green-600 transition-colors">
                O nas
              </Link>
              <Link href="/zespol" className="text-gray-700 hover:text-green-600 transition-colors">
                Zespół
              </Link>
              <Link href="/galeria" className="text-gray-700 hover:text-green-600 transition-colors">
                Galeria
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-green-600 transition-colors">
                Blog
              </Link>
              <Link href="/kontakt" className="text-gray-700 hover:text-green-600 transition-colors">
                Kontakt
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Umów wizytę
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Nasza Oferta
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kompleksowa pomoc psychologiczna dostosowana do Twoich potrzeb
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Konsultacje psychologiczne */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Konsultacje psychologiczne</h3>
              <p className="text-gray-600 mb-6">
                Pierwsze spotkanie, podczas którego poznajemy się i wspólnie ustalamy dalszy plan działania.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 50 minut</li>
                <li>• Indywidualne podejście</li>
                <li>• Bezpłatna konsultacja telefoniczna</li>
              </ul>
            </div>

            {/* Terapia indywidualna */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Terapia indywidualna</h3>
              <p className="text-gray-600 mb-6">
                Regularne spotkania terapeutyczne dostosowane do Twoich potrzeb i celów.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 50 minut</li>
                <li>• Raz w tygodniu</li>
                <li>• Różne nurty terapeutyczne</li>
              </ul>
            </div>

            {/* Terapia par */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Terapia par</h3>
              <p className="text-gray-600 mb-6">
                Wsparcie dla par w kryzysie, pomagamy odbudować relację i komunikację.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 80 minut</li>
                <li>• Raz w tygodniu</li>
                <li>• Praca nad komunikacją</li>
              </ul>
            </div>

            {/* Terapia rodzinna */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Terapia rodzinna</h3>
              <p className="text-gray-600 mb-6">
                Pomagamy rodzinom w rozwiązywaniu konfliktów i budowaniu zdrowych relacji.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 80 minut</li>
                <li>• Raz w tygodniu</li>
                <li>• Praca z całym systemem</li>
              </ul>
            </div>

            {/* Diagnozy psychologiczne */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Diagnozy psychologiczne</h3>
              <p className="text-gray-600 mb-6">
                Kompleksowe badania psychologiczne z wykorzystaniem standaryzowanych testów.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• ADOS-2 (autyzm)</li>
                <li>• Testy inteligencji</li>
                <li>• Diagnozy osobowości</li>
              </ul>
            </div>

            {/* Warsztaty grupowe */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Warsztaty grupowe</h3>
              <p className="text-gray-600 mb-6">
                Zajęcia grupowe rozwijające umiejętności społeczne i radzenie sobie ze stresem.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• TUS (Trening Umiejętności Społecznych)</li>
                <li>• Grupy wsparcia</li>
                <li>• Warsztaty dla rodziców</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Znajdź rozwiązanie dla swoich problemów
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Skontaktuj się z nami, aby umówić się na pierwszą konsultację i rozpocząć drogę do lepszego samopoczucia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Umów wizytę
            </Link>
            <Link
              href="/kontakt"
              className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Skontaktuj się z nami
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/assets/icons/logo-full.svg"
                height={60}
                width={200}
                alt="CarePulse"
                className="h-12 w-auto mb-4"
              />
              <p className="text-gray-400">
                Specjalistyczna Poradnia Psychologiczna
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Skontaktuj się z nami</h4>
              <div className="space-y-2">
                <Link href="/login" className="block text-gray-400 hover:text-white transition-colors">
                  Umów wizytę
                </Link>
                <button className="block text-gray-400 hover:text-white transition-colors">
                  Zadzwoń
                </button>
                <Link href="/kontakt" className="block text-gray-400 hover:text-white transition-colors">
                  Wyślij wiadomość
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Menu</h4>
              <div className="space-y-2">
                <Link href="/oferta" className="block text-gray-400 hover:text-white transition-colors">Oferta</Link>
                <Link href="/o-nas" className="block text-gray-400 hover:text-white transition-colors">O nas</Link>
                <Link href="/zespol" className="block text-gray-400 hover:text-white transition-colors">Zespół</Link>
                <Link href="/galeria" className="block text-gray-400 hover:text-white transition-colors">Galeria</Link>
                <Link href="/blog" className="block text-gray-400 hover:text-white transition-colors">Blog</Link>
                <Link href="/kontakt" className="block text-gray-400 hover:text-white transition-colors">Kontakt</Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Nasze poradnie</h4>
              <div className="space-y-2 text-gray-400">
                <p>Poradnia w Wołominie</p>
                <p>ul. Miła 3</p>
                <p>05-200 Wołomin</p>
                <p>501 775 717</p>
                <p>721 642 466</p>
                <p>recepcja@carepulse.pl</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CarePulse. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Oferta;
