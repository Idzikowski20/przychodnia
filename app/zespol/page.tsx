import Image from "next/image";
import Link from "next/link";

const Zespol = () => {
  const teamMembers = [
    {
      name: "Monika Chrapińska-Krupa",
      position: "Psycholog, Psychoterapeuta",
      specialization: "Terapia indywidualna, terapia par, diagnozy psychologiczne",
      experience: "15 lat doświadczenia",
      description: "Założycielka poradni, dyrektor poradni i autorka bloga. Psycholog i psychoterapeutka z wieloletnim doświadczeniem. Znana ekspertka w dziedzinie psychologii, występowała w wielu programach telewizyjnych.",
      image: "/assets/images/dr-cameron.png"
    },
    {
      name: "Dr Anna Kowalska",
      position: "Psycholog kliniczny",
      specialization: "Terapia dzieci i młodzieży, diagnozy rozwojowe",
      experience: "12 lat doświadczenia",
      description: "Specjalistka w zakresie psychologii dziecięcej i młodzieżowej. Prowadzi terapię indywidualną oraz grupową dla dzieci z różnymi trudnościami rozwojowymi.",
      image: "/assets/images/dr-cruz.png"
    },
    {
      name: "Michał Nowak",
      position: "Psychoterapeuta",
      specialization: "Terapia uzależnień, terapia rodzinna",
      experience: "10 lat doświadczenia",
      description: "Specjalista w zakresie terapii uzależnień i terapii rodzinnej. Pracuje z osobami uzależnionymi oraz ich rodzinami, pomagając w procesie zdrowienia.",
      image: "/assets/images/dr-green.png"
    },
    {
      name: "Katarzyna Wiśniewska",
      position: "Psycholog, Trener TUS",
      specialization: "Trening Umiejętności Społecznych, warsztaty grupowe",
      experience: "8 lat doświadczenia",
      description: "Certyfikowana trenerka TUS z wieloletnim doświadczeniem w pracy z dziećmi i młodzieżą. Prowadzi warsztaty grupowe rozwijające umiejętności społeczne.",
      image: "/assets/images/dr-lee.png"
    },
    {
      name: "Dr Tomasz Kowalczyk",
      position: "Psycholog, Neuropsycholog",
      specialization: "Diagnozy neuropsychologiczne, ADOS-2",
      experience: "14 lat doświadczenia",
      description: "Specjalista w zakresie neuropsychologii i diagnoz psychologicznych. Prowadzi kompleksowe badania neuropsychologiczne oraz diagnozy autyzmu.",
      image: "/assets/images/dr-livingston.png"
    },
    {
      name: "Magdalena Zielińska",
      position: "Psycholog, Psychoterapeuta",
      specialization: "Terapia traumy, EMDR",
      experience: "11 lat doświadczenia",
      description: "Specjalistka w zakresie terapii traumy i terapii EMDR. Pracuje z osobami, które doświadczyły traumatycznych wydarzeń, pomagając w procesie powrotu do zdrowia.",
      image: "/assets/images/dr-peter.png"
    }
  ];

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
              <Link href="/zespol" className="text-green-600 font-medium">
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
              Nasz Zespół
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Poznaj doświadczonych specjalistów, którzy pomogą Ci w osiągnięciu lepszego samopoczucia
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                    {member.name}
                  </h3>
                  <p className="text-green-600 font-medium text-center mb-2">
                    {member.position}
                  </p>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {member.experience}
                  </p>
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Specjalizacja:</h4>
                    <p className="text-sm text-gray-600">{member.specialization}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Dlaczego warto wybrać nasz zespół?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Doświadczenie</h3>
              <p className="text-gray-600 text-sm">
                Nasi specjaliści mają wieloletnie doświadczenie w pracy z różnymi problemami psychologicznymi.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ciągłe szkolenia</h3>
              <p className="text-gray-600 text-sm">
                Regularnie podnosimy swoje kwalifikacje, uczestnicząc w szkoleniach i konferencjach.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Indywidualne podejście</h3>
              <p className="text-gray-600 text-sm">
                Każdy klient jest dla nas wyjątkowy i dostosowujemy terapię do jego indywidualnych potrzeb.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Poufność</h3>
              <p className="text-gray-600 text-sm">
                Zapewniamy pełną dyskrecję i bezpieczną przestrzeń dla naszych klientów.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Wybierz specjalistę dla siebie
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Skontaktuj się z nami, a pomożemy Ci wybrać odpowiedniego specjalistę i umówić się na pierwszą konsultację.
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

export default Zespol;
