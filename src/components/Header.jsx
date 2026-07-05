const links = [
  { href: "#work", label: "Work" },
  { href: "#toolbelt", label: "Toolbelt" },
  { href: "#curious", label: "Curious" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-paper/[0.82] border-b border-line">
      <div className="max-w-[1080px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        <a
          href="#top"
          className="no-underline text-ink font-mono font-semibold text-[13px] tracking-wide flex items-center gap-2"
        >
          <span className="inline-flex w-6 h-6 items-center justify-center bg-ink text-paper rounded-md text-[11px]">
            SJ
          </span>
          Shrey Jariwala
        </a>
        <nav className="flex items-center gap-1 font-mono text-xs">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="no-underline text-label px-2.5 py-1.5 rounded-lg hover:text-ink hover:bg-line-3 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="no-underline text-paper bg-blue px-3.5 py-1.5 rounded-lg font-medium hover:bg-blue-dark transition-colors"
          >
            Say hi
          </a>
        </nav>
      </div>
    </header>
  );
}
