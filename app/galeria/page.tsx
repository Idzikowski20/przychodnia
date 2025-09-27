import Image from "next/image";
import Link from "next/link";

const Galeria = () => {
  const galleryImages = [
    {
      src: "/assets/images/appointment-img.png",
      alt: "Gabinet terapeutyczny",
      title: "Gabinet terapeutyczny"
    },
    {
      src: "/assets/images/appointments-bg.png",
      alt: "Sala konsultacyjna",
      title: "Sala konsultacyjna"
    },
    {
      src: "/assets/images/cancelled-bg.png",
      alt: "Recepcja",
      title: "Recepcja"
    },
    {
      src: "/assets/images/pending-bg.png",
      alt: "Sala warsztatowa",
      title: "Sala warsztatowa"
    },
    {
      src: "/assets/images/onboarding-img.png",
      alt: "Hol główny",
      title: "Hol główny"
    },
    {
      src: "/assets/images/register-img.png",
      alt: "Sala diagnostyczna",
      title: "Sala diagnostyczna"
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
              <Link href="/zespol" className="text-gray-700 hover:text-green-600 transition-colors">
                Zespół
              </Link>
              <Link href="/galeria" className="text-green-600 font-medium">
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
              Galeria
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Zobacz nasze przestrzenie - miejsca, gdzie odbywają się konsultacje i terapie
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="aspect-w-16 aspect-h-12">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {image.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Przestrzeń zaprojektowana z myślą o komforcie i bezpieczeństwie naszych klientów.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Nasze przestrzenie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Komfort i bezpieczeństwo
              </h3>
              <p className="text-gray-600 mb-6">
                Wszystkie nasze gabinety zostały zaprojektowane z myślą o komforcie i bezpieczeństwie naszych klientów. 
                Stwarzamy przytulną i intymną atmosferę, która sprzyja otwartej rozmowie i procesowi terapeutycznemu.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Przytulne i komfortowe gabinety</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Dyskretne wejście i recepcja</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Dostępność dla osób z niepełnosprawnościami</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Parking dla klientów</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Różnorodne przestrzenie
              </h3>
              <p className="text-gray-600 mb-6">
                Oferujemy różnorodne przestrzenie dostosowane do różnych form terapii i konsultacji. 
                Każda sala została wyposażona w odpowiedni sprzęt i meble, które wspierają proces terapeutyczny.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Gabinet do terapii indywidualnej</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Sala do terapii par i rodzin</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Sala warsztatowa dla grup</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Sala diagnostyczna</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Odwiedź nas w Wołominie lub Warszawie
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Umów się na wizytę i zobacz nasze przestrzenie na własne oczy. Jesteśmy tu, aby Ci pomóc.
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

export default Galeria;
