const groups = [
  {
    title: "Enterprise systems fluency",
    items: ["NetSuite · SuiteScript", "SuiteTalk", "Suitelets", "UKG Ready", "Power BI", "Azure DevOps", "SharePoint", "Microsoft Entra ID"],
  },
  {
    title: "Building things nobody assigned",
    items: ["Google Apps Script", "JavaScript", "Node.js", "Power Query M"],
  },
  {
    title: "Reverse-engineering & automation",
    items: ["Network traffic inspection", "API discovery", "iOS Shortcuts", "Scriptable"],
  },
  {
    title: "Data & reporting",
    items: ["Star schema", "RLS", "Deployment pipelines", "EVM / project controls"],
  },
];

export default function Toolbelt() {
  return (
    <section id="toolbelt" className="max-w-[1080px] mx-auto px-6 pt-14 pb-5 scroll-mt-[70px]">
      <div className="border-t border-line pt-[22px] mb-2">
        <h2 className="m-0 font-mono font-semibold text-xs tracking-[0.14em] uppercase text-label-mute">
          How I think · the toolbelt
        </h2>
      </div>
      <p className="m-0 mb-[26px] font-serif text-[21px] leading-[1.4] max-w-[44ch] text-ink-2">
        Grouped by what they let me do — not by how many logos I can fit on a
        page.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map((g) => (
          <div key={g.title} className="bg-card border border-line-2 rounded-[14px] p-[22px]">
            <h3 className="m-0 mb-3 font-display font-semibold text-base text-ink">{g.title}</h3>
            <div className="flex flex-wrap gap-[7px]">
              {g.items.map((item) => (
                <span
                  key={item}
                  className="font-mono text-[11.5px] text-label bg-paper border border-line-2 px-[10px] py-[5px] rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
