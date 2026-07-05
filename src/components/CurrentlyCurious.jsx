export default function CurrentlyCurious() {
  return (
    <section id="curious" className="max-w-[1080px] mx-auto px-6 pt-14 pb-5 scroll-mt-[70px]">
      <div className="border-t border-line pt-[22px] mb-5">
        <h2 className="m-0 font-mono font-semibold text-xs tracking-[0.14em] uppercase text-label-mute">
          Currently curious about
        </h2>
      </div>
      <div className="bg-blue-tint border border-blue-tint-border rounded-2xl px-[30px] py-8">
        <p className="m-0 font-serif text-[clamp(21px,3vw,27px)] leading-[1.36] max-w-[40ch] text-blue-text">
          Right now I'm nose-deep in the fundamentals of software
          engineering, teaching myself how good data architecture actually
          holds up under load, and figuring out freelance consulting one
          project at a time.
        </p>
        <p className="mt-[18px] mb-0 text-[15px] leading-[1.62] max-w-[56ch] text-blue-text-2">
          None of it is finished — which is sort of the point. The next
          line on this list is always a question I haven't answered yet.
        </p>
      </div>
    </section>
  );
}
