import Image from "next/image";
import Link from "next/link";

const Blog = () => {
  const blogPosts = [
    {
      title: "Objawy autyzmu u dorosłych: Gdy puzzle zaczynają pasować",
      excerpt: "Główne objawy autyzmu u dorosłych można podzielić na trzy kluczowe obszary, które wpływają na codzienne funkcjonowanie, relacje i odbiór świata...",
      author: "Monika Chrapińska-Krupa",
      date: "16.09.2025",
      category: "Dorosły",
      image: "/assets/images/appointment-img.png",
      slug: "objawy-autyzmu-u-doroslych"
    },
    {
      title: "Detoks alkoholowy: Co dzieje się z ciałem i psychiką?",
      excerpt: "Detoks alkoholowy, nazywany też odtruciem alkoholowym, to naturalny proces, w którym organizm oczyszcza się z toksyn po nagłym odstawieniu alkoholu...",
      author: "Monika Chrapińska-Krupa",
      date: "10.09.2025",
      category: "Uzależnienia",
      image: "/assets/images/appointments-bg.png",
      slug: "detoks-alkoholowy"
    },
    {
      title: "Jak radzić sobie ze stresem w pracy?",
      excerpt: "Stres w pracy to powszechny problem, który może prowadzić do wypalenia zawodowego i problemów zdrowotnych. Oto kilka skutecznych strategii...",
      author: "Dr Anna Kowalska",
      date: "05.09.2025",
      category: "Stres",
      image: "/assets/images/cancelled-bg.png",
      slug: "stres-w-pracy"
    },
    {
      title: "Terapia par: Kiedy warto się zdecydować?",
      excerpt: "Terapia par to forma pomocy psychologicznej skierowana do par doświadczających trudności w relacji. Kiedy warto rozważyć taką formę wsparcia?",
      author: "Michał Nowak",
      date: "01.09.2025",
      category: "Relacje",
      image: "/assets/images/pending-bg.png",
      slug: "terapia-par"
    },
    {
      title: "Depresja u młodzieży: Jak rozpoznać i pomóc?",
      excerpt: "Depresja u młodzieży to poważny problem, który wymaga szybkiej interwencji. Jak rozpoznać objawy i jak pomóc nastolatkowi?",
      author: "Katarzyna Wiśniewska",
      date: "28.08.2025",
      category: "Młodzież",
      image: "/assets/images/onboarding-img.png",
      slug: "depresja-u-mlodziezy"
    },
    {
      title: "ADHD u dorosłych: Wyzwania i możliwości",
      excerpt: "ADHD nie kończy się w dzieciństwie. Wiele osób dorosłych żyje z niezdiagnozowanym ADHD, co może wpływać na ich codzienne funkcjonowanie...",
      author: "Dr Tomasz Kowalczyk",
      date: "25.08.2025",
      category: "ADHD",
      image: "/assets/images/register-img.png",
      slug: "adhd-u-doroslych"
    }
  ];

  const categories = [
    "Wszystkie",
    "Dorosły",
    "Młodzież",
    "Dzieci",
    "Relacje",
    "Stres",
    "Depresja",
    "Lęk",
    "Uzależnienia",
    "ADHD",
    "Autyzm"
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
              <Link href="/galeria" className="text-gray-700 hover:text-green-600 transition-colors">
                Galeria
              </Link>
              <Link href="/blog" className="text-green-600 font-medium">
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
              Blog Psychologiczny
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Artykuły, porady i cenne wskazówki od naszych specjalistów
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === "Wszystkie"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-w-16 aspect-h-9">
                <Image
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Najnowszy wpis
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h2>
                <div className="text-sm text-gray-600 mb-4">
                  <p><strong>Autor:</strong> {blogPosts[0].author}</p>
                  <p><strong>Opublikowano:</strong> {blogPosts[0].date}</p>
                  <p><strong>Kategoria:</strong> {blogPosts[0].category}</p>
                </div>
                <p className="text-gray-700 mb-6">
                  {blogPosts[0].excerpt}
                </p>
                <Link
                  href={`/blog/${blogPosts[0].slug}`}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  Czytaj więcej →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Wszystkie artykuły
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, index) => (
              <article key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {post.author}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      Czytaj więcej →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Zapisz się do naszego newslettera
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Otrzymuj najnowsze artykuły i porady psychologiczne prosto na swoją skrzynkę e-mail.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Twój adres e-mail"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Zapisz się
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

export default Blog;
