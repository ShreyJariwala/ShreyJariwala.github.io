const groups = [
  {
    title: "Enterprise systems fluency",
    blurb: "The tools most of my day actually runs on.",
    items: ["NetSuite (SuiteScript, SuiteTalk, Suitelets)", "UKG Ready", "Power BI", "Azure DevOps", "SharePoint", "Microsoft Entra ID"],
  },
  {
    title: "Building things nobody assigned",
    blurb: "For when the annoying part needs its own tool.",
    items: ["Google Apps Script", "JavaScript / Node.js", "Power Query M"],
  },
  {
    title: "Reverse-engineering & automation",
    blurb: "For figuring out how the undocumented part works.",
    items: ["Network traffic inspection", "API discovery", "iOS Shortcuts", "Scriptable"],
  },
  {
    title: "Data & reporting",
    blurb: "For turning raw numbers into a decision.",
    items: ["Power BI (star schema, RLS, deployment pipelines)", "EVM & project controls"],
  },
];

export default function Toolbelt() {
  return (
    <section className="px-6 sm:px-10 lg:px-16 py-20 sm:py-24 bg-paper-dim/60">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl text-ink">How I think</h2>
        <p className="mt-3 text-ink-soft max-w-xl leading-relaxed">
          Less a resume, more a toolbox — grouped by what each thing actually
          lets me do.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="font-serif text-xl text-ink">{g.title}</h3>
              <p className="text-sm text-ink-soft mt-1 mb-3">{g.blurb}</p>
              <ul className="flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-ink-soft bg-white border border-line rounded-full px-3 py-1"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-ink-soft/80">
          Also: PMP certified, and an Oracle NetSuite Certified Development
          Professional — mostly relevant because it means the SuiteScript
          above isn't guesswork.
        </p>
      </div>
    </section>
  );
}
