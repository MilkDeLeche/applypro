import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { TrustedBy } from './sections/TrustedBy';
import { ProductSuite } from './sections/ProductSuite';
import { Manifesto } from './sections/Manifesto';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';

function App() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main>
        <Hero />
        <TrustedBy />
        <ProductSuite />
        <Manifesto />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
