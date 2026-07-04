const threads = [
  "Working through software engineering fundamentals properly — the parts I skipped by learning on the job.",
  "Reading into data architecture: less \"how do I build a dashboard\" and more \"how should the data be shaped before it gets anywhere near one.\"",
  "Testing the waters on freelance/consulting work, mostly to see what it's like to own a project end to end.",
  "Still haven't found a good way to keep Power Query from breaking when someone renames a column upstream. Working on it.",
];

export default function CurrentlyCurious() {
  return (
    <section className="px-6 sm:px-10 lg:px-16 py-20 sm:py-24">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl text-ink">
          Currently curious about
        </h2>
        <p className="mt-3 text-ink-soft leading-relaxed">
          Nothing here is finished. That's kind of the point.
        </p>

        <ul className="mt-8 space-y-5">
          {threads.map((t, i) => (
            <li key={i} className="flex gap-3 text-ink-soft leading-relaxed">
              <span className="text-rust font-serif italic shrink-0">{i + 1}.</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
