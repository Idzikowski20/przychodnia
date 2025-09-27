import Image from "next/image";
import Link from "next/link";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
          <Image
            src="/assets/icons/logo-full.svg"
                height={60}
                width={200}
                alt="CarePulse"
                className="h-12 w-auto"
              />
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
              <button className="text-green-600 hover:text-green-700 transition-colors">
                Zadzwoń
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"></div>
        
        {/* White curved shape */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full transform translate-x-48 translate-y-48"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div className="text-white">
              <h1 className="text-2xl md:text-3xl font-medium mb-4">
                Psycholog Wołomin i Warszawa
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                Specjalistyczna<br />
                Poradnia<br />
                Psychologiczna
              </h2>
            </div>
            
            {/* Right side - Buttons */}
            <div className="flex flex-col space-y-4">
              <button className="bg-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-600 transition-colors w-full max-w-xs">
                Zadzwoń
              </button>
              <Link
                href="/login"
                className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors w-full max-w-xs text-center"
              >
                Umów wizytę
              </Link>
              <Link
                href="/kontakt"
                className="bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors w-full max-w-xs text-center"
              >
                Wyślij wiadomość
              </Link>
            </div>
          </div>
          
          {/* Bottom text */}
          <div className="relative z-10 mt-16 text-center lg:text-left">
            <p className="text-xl text-gray-800 max-w-2xl">
              CarePulse to <strong className="text-purple-600">inwestycja</strong> w siebie i swoją przyszłość. Umów się na konsultację.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <Link href="/testy" className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Badania i testy psychologiczne</h3>
              <p className="text-gray-600">
                Dokładna diagnoza to pierwszy krok do skutecznej terapii. Zyskaj jasność i pewność co do dalszych działań.
              </p>
            </Link>

            {/* Service 2 */}
            <Link href="/warsztaty" className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Warsztaty i zajęcia grupowe</h3>
              <p className="text-gray-600">
                Poznaj nowych ludzi i poczuj wsparcie grupy. Zapisz się na warsztaty i zajęcia, które pomogą Ci radzić sobie z trudnościami.
              </p>
            </Link>

            {/* Service 3 */}
            <Link href="/oferta" className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Oferta</h3>
              <p className="text-gray-600">
                Znajdź rozwiązanie dla swoich problemów. Poznaj naszą ofertę i rozpocznij drogę do lepszego samopoczucia.
              </p>
            </Link>

            {/* Service 4 */}
            <Link href="/zespol" className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Zespół</h3>
              <p className="text-gray-600">
                Powierz swoje zdrowie psychiczne doświadczonym specjalistom. Poznaj nasz zespół i wybierz terapeutę dla siebie.
              </p>
            </Link>

            {/* Service 5 */}
            <Link href="/media" className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">My w mediach</h3>
              <p className="text-gray-600">
                Jesteśmy uznanymi ekspertami w dziedzinie psychologii. Sprawdź nasze wystąpienia w mediach i przekonaj się sam.
              </p>
            </Link>

            {/* Service 6 */}
            <Link href="/online" className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-teal-200 transition-colors">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Psycholog online</h3>
              <p className="text-gray-600">
                Oszczędź czas i energię. Uzyskaj profesjonalne wsparcie psychologiczne z dowolnego miejsca, online.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            CarePulse to specjaliści, którym możesz zaufać.
          </h3>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Nowości w naszej poradni
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/szkolenia" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Szkolenia dla psychologów</h3>
                <p className="text-sm text-gray-600">NOWOŚCI w ofercie szkoleń!</p>
              </div>
            </Link>

            <Link href="/dziecko-w-rozwodzie" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dziecko w rozwodzie</h3>
                <p className="text-sm text-gray-600">Szkolenie dla specjalistów</p>
              </div>
            </Link>

            <Link href="/kurs-tus" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Certyfikowany Kurs Trenera TUS</h3>
                <p className="text-sm text-gray-600">Zdobądź kompetencje trenera</p>
              </div>
            </Link>

            <Link href="/ados-2" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Badanie ADOS-2</h3>
                <p className="text-sm text-gray-600">Złoty standard diagnozy autyzmu</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Przewodnik dla pacjenta
          </h2>
          <h3 className="text-xl font-semibold text-gray-800 text-center mb-8">
            Najnowsze publikacje
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>Najnowszy wpis</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Objawy autyzmu u dorosłych: Gdy puzzle zaczynają pasować
                </h4>
                <div className="text-sm text-gray-600 mb-4">
                  <p><strong>Autor:</strong> Monika Chrapińska-Krupa</p>
                  <p><strong>Opublikowano:</strong> 16.09.2025</p>
                  <p><strong>Kategorie:</strong> <Link href="/blog/dorosly" className="text-green-600 hover:text-green-700">Dorosły</Link></p>
                </div>
                <p className="text-gray-700 mb-4">
                  Główne objawy autyzmu u dorosłych można podzielić na trzy kluczowe obszary, które wpływają na codzienne funkcjonowanie, relacje i odbiór świata...
                </p>
                <Link href="/objawy-autyzmu" className="text-green-600 hover:text-green-700 font-medium">
                  Czytaj więcej →
                </Link>
              </div>
            </article>

            <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Detoks alkoholowy: Co dzieje się z ciałem i psychiką?
                </h4>
                <div className="text-sm text-gray-600 mb-4">
                  <p><strong>Autor:</strong> Monika Chrapińska-Krupa</p>
                  <p><strong>Opublikowano:</strong> 10.09.2025</p>
                  <p><strong>Kategorie:</strong> 
                    <Link href="/blog/dorosly" className="text-green-600 hover:text-green-700 ml-1">Dorosły</Link>, 
                    <Link href="/blog/uzaleznienia" className="text-green-600 hover:text-green-700 ml-1">Uzależnienia</Link>
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  Detoks alkoholowy, nazywany też odtruciem alkoholowym, to naturalny proces, w którym organizm oczyszcza się z toksyn po nagłym odstawieniu alkoholu...
                </p>
                <Link href="/detoks-alkoholowy" className="text-green-600 hover:text-green-700 font-medium">
                  Czytaj więcej →
                </Link>
              </div>
            </article>
          </div>

          <div className="text-center mt-8">
            <Link href="/blog" className="text-green-600 hover:text-green-700 font-medium">
              Zobacz wszystkie artykuły →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Dlaczego my?
          </h2>
          <h3 className="text-xl text-gray-700 text-center mb-16">
            Stawiamy na <strong>holistyczne</strong> i <strong>kompleksowe</strong> podejście do zdrowia psychicznego oferując:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Konsultacje</h4>
              <p className="text-gray-600">Poznajmy się i wspólnie zdecydujmy, jak możemy Ci pomóc.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Diagnozy i testy</h4>
              <p className="text-gray-600">Zyskaj pewność, że terapia będzie skuteczna: przeprowadzimy rzetelną diagnozę i wspólnie zaplanujemy Twoją terapię.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Terapie</h4>
              <p className="text-gray-600">Odkryj najlepszą dla Ciebie formę terapii: indywidualną lub grupową, z wykorzystaniem różnorodnych technik.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Indywidualne podejście</h4>
              <p className="text-gray-600">Twoje potrzeby są najważniejsze, terapia będzie dla Ciebie.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Wsparcie i edukacja</h4>
              <p className="text-gray-600">Otrzymasz od nas wsparcie i materiały, które pomogą Ci lepiej zrozumieć siebie i radzić sobie z emocjami.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Budowanie Twojej niezależności</h4>
              <p className="text-gray-600">Naszym celem jest nie tylko pomoc w rozwiązaniu problemów, ale także wzmocnienie Twojej niezależności i umiejętności radzenia sobie w przyszłości.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Opinie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">4,8/5</div>
              <div className="text-gray-600 mb-2">Liczba ocen 211</div>
              <div className="text-sm text-gray-500">Lokalizacja Wołomin</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">4,9/5</div>
              <div className="text-gray-600 mb-2">Liczba ocen 1400</div>
              <div className="text-sm text-gray-500">Lokalizacja Warszawa i Wołomin</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">4,8/5</div>
              <div className="text-gray-600 mb-2">Liczba ocen 43</div>
              <div className="text-sm text-gray-500">Lokalizacja Warszawa</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">5/5</div>
              <div className="text-gray-600 mb-2">Liczba ocen 36</div>
              <div className="text-sm text-gray-500">Lokalizacja Warszawa i Wołomin</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Potrzebujesz pomocy psychologa? Jesteś we właściwym miejscu!
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Czujesz się ostatnio przytłoczony/a, zestresowany/a, a może masz wrażenie, że utknąłeś/aś w miejscu? 
            Szukasz wsparcia i pomocy w poradzeniu sobie z trudnymi emocjami?
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

export default Home;
