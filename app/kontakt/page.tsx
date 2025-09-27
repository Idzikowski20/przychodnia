import Image from "next/image";
import Link from "next/link";

const Kontakt = () => {
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
              <Link href="/oferta" className="text-gray-700 hover:text-green-600 transition-colors">
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
              <Link href="/kontakt" className="text-green-600 font-medium">
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
              Kontakt
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Skontaktuj się z nami - jesteśmy tu, aby Ci pomóc
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Wyślij wiadomość
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Imię *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nazwisko *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Temat *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Wybierz temat</option>
                    <option value="konsultacja">Konsultacja psychologiczna</option>
                    <option value="terapia">Terapia indywidualna</option>
                    <option value="terapia-par">Terapia par</option>
                    <option value="terapia-rodzinna">Terapia rodzinna</option>
                    <option value="diagnoza">Diagnoza psychologiczna</option>
                    <option value="warsztaty">Warsztaty grupowe</option>
                    <option value="inne">Inne</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Wiadomość *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Opisz swój problem lub pytanie..."
                  ></textarea>
                </div>
                
                <div className="flex items-start">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                    Wyrażam zgodę na przetwarzanie moich danych osobowych w celu odpowiedzi na zapytanie zgodnie z polityką prywatności. *
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Wyślij wiadomość
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Informacje kontaktowe
              </h2>
              
              <div className="space-y-8">
                {/* Wołomin Office */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Poradnia w Wołominie
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-gray-900 font-medium">ul. Miła 3</p>
                        <p className="text-gray-600">05-200 Wołomin</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="text-gray-900 font-medium">501 775 717</p>
                        <p className="text-gray-900 font-medium">721 642 466</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-900">recepcja@carepulse.pl</p>
                    </div>
                  </div>
                </div>

                {/* Warsaw Office */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Poradnia w Warszawie
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-gray-900 font-medium">ul. Mochtyńska 65</p>
                        <p className="text-gray-600">03-289 Warszawa</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-gray-900 font-medium">725 396 700</p>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-900">bialoleka@carepulse.pl</p>
                    </div>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="bg-green-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Godziny pracy
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Poniedziałek - Piątek:</span>
                      <span className="font-medium">8:00 - 20:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sobota:</span>
                      <span className="font-medium">9:00 - 15:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Niedziela:</span>
                      <span className="font-medium">Nieczynne</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Jak do nas trafić
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Wołomin - ul. Miła 3
              </h3>
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <span className="text-gray-500">Mapa do Wołomina</span>
              </div>
              <p className="text-gray-600 mt-4">
                Poradnia znajduje się w centrum Wołomina, w pobliżu dworca kolejowego. 
                Dostępny parking dla klientów.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Warszawa - ul. Mochtyńska 65
              </h3>
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <span className="text-gray-500">Mapa do Warszawy</span>
              </div>
              <p className="text-gray-600 mt-4">
                Poradnia znajduje się w dzielnicy Białołęka, w pobliżu stacji metra. 
                Łatwy dojazd komunikacją publiczną.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Masz pytania? Skontaktuj się z nami!
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Jesteśmy tu, aby odpowiedzieć na wszystkie Twoje pytania i pomóc Ci umówić się na pierwszą konsultację.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Umów wizytę
            </Link>
            <button className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Zadzwoń teraz
            </button>
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

export default Kontakt;
