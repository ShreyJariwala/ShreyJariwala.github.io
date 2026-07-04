import IndianFlag from "./IndianFlag";

export default function Hero() {
  return (
    <section className="relative min-h-[92svh] flex flex-col justify-center px-6 sm:px-10 lg:px-16 pt-24 pb-16">
      <div className="max-w-3xl">
        <p className="text-sm sm:text-base tracking-wide text-ink-soft mb-4 flex items-center gap-2">
          <IndianFlag className="w-5 h-auto rounded-[2px] shadow-sm" />
          Surat, India → Toronto, Canada
        </p>

        <h1 className="font-serif text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl text-ink font-semibold tracking-tight">
          Shrey Jariwala
        </h1>

        <p className="mt-6 font-serif italic text-xl sm:text-2xl text-ink-soft max-w-xl leading-snug">
          A curious systems person who can't leave a manual process alone.
        </p>

        <p className="mt-6 text-ink-soft max-w-xl leading-relaxed">
          By day: NetSuite, UKG Ready, Power BI. By instinct: find the seam,
          reverse-engineer the part nobody documented, build the tool nobody
          asked for. Below is what that's produced so far.
        </p>

        <div className="mt-10 flex items-center gap-4 flex-wrap">
          <a
            href="#work"
            className="inline-flex items-center gap-2 bg-rust text-paper px-5 py-3 rounded-full font-medium hover:bg-rust-dark transition-colors"
          >
            See what I've been building
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
