import IndianFlag from "./IndianFlag";

const badges = ["PMP certified", "NetSuite Certified Dev Professional", "6+ yrs in the field"];

export default function Hero() {
  return (
    <section className="max-w-[1080px] mx-auto px-6 pt-[76px] pb-12 animate-[sjfade_0.7s_ease_both]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-[21px] rounded-[2px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.18)]">
          <IndianFlag className="w-full h-full" />
        </div>
        <span className="font-mono font-medium text-[12.5px] tracking-wide text-label">
          Surat, India&nbsp;&nbsp;→&nbsp;&nbsp;Toronto, Canada
        </span>
      </div>

      <h1 className="m-0 font-serif font-normal text-[clamp(40px,7vw,68px)] leading-[1.03] tracking-[-0.015em] text-ink">
        Shrey Jariwala
      </h1>

      <p className="mt-[26px] font-serif text-[clamp(24px,3.4vw,34px)] leading-[1.28] font-normal max-w-[20ch] text-ink-2">
        A curious systems person who{" "}
        <em className="not-italic italic text-blue">can't leave a manual process alone.</em>
      </p>

      <p className="mt-[26px] text-[16.5px] leading-[1.62] max-w-[56ch] text-ink-mute">
        Business analyst &amp; NetSuite admin by title. By instinct: find the
        seam, reverse-engineer the API nobody documented, build the tool
        nobody asked for, automate the annoying part. The throughline isn't
        the tool — it's the reflex.
      </p>

      <div className="flex flex-wrap gap-2.5 mt-[30px] font-mono text-[11.5px]">
        {badges.map((b) => (
          <span
            key={b}
            className="px-[11px] py-1.5 border border-line rounded-full text-label bg-card"
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}
