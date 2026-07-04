import Hero from "./components/Hero";
import ProjectGrid from "./components/ProjectGrid";
import Toolbelt from "./components/Toolbelt";
import CurrentlyCurious from "./components/CurrentlyCurious";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ProjectGrid />
      <Toolbelt />
      <CurrentlyCurious />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
