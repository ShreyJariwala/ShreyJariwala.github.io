import IndianFlag from "./IndianFlag";

export default function Footer() {
  return (
    <footer className="px-6 sm:px-10 lg:px-16 py-10 border-t border-line">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-soft">
        <p className="flex items-center gap-2">
          <IndianFlag className="w-4 h-auto rounded-[2px]" />
          Shrey Jariwala — built out of curiosity, mostly.
        </p>
        <div className="flex items-center gap-5">
          <a
            href="https://www.linkedin.com/in/shrey-jariwala-pmp%C2%AE-98b236206"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-rust transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/ShreyJariwala/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-rust transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
