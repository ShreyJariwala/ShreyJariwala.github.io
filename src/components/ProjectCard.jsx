export function DepthDots({ depth }) {
  const d = Math.max(0, Math.min(4, depth));
  return (
    <span className="text-[13px] tracking-[2px]">
      <span className="text-blue">{"●".repeat(d)}</span>
      <span className="text-depth-empty">{"○".repeat(4 - d)}</span>
    </span>
  );
}

export function FlagshipCard({ project, onOpen }) {
  return (
    <div
      onClick={onOpen}
      className="cursor-pointer grid grid-cols-1 sm:grid-cols-[minmax(0,320px)_1fr] bg-card border border-line-2 rounded-[14px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] mb-4 hover:border-blue hover:shadow-[0_14px_34px_-20px_rgba(63,95,176,0.4)] transition-[border-color,box-shadow]"
    >
      <div
        className="relative min-h-[160px] sm:min-h-[200px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg,#e7ebf7,#e7ebf7 9px,#eef0f7 9px,#eef0f7 18px)",
        }}
      >
        <span className="absolute top-3.5 left-3.5 font-mono text-[9.5px] font-semibold tracking-[0.08em] uppercase text-white bg-blue px-[9px] py-[5px] rounded-md">
          Flagship
        </span>
        <span className="absolute bottom-3.5 left-3.5 font-mono text-[11px] text-blue-text-2 bg-white/70 px-2 py-1 rounded-[5px]">
          {project.thumb}
        </span>
      </div>
      <div className="p-6 sm:px-7 sm:py-[26px]">
        <div className="flex items-baseline justify-between gap-3 font-mono text-[11px] text-label-faint">
          <span>{project.category}</span>
          <span>{project.dateLabel}</span>
        </div>
        <h3 className="mt-[11px] font-display font-semibold text-[25px] leading-[1.12] text-ink">
          {project.title}
        </h3>
        <p className="mt-[13px] text-[15.5px] leading-[1.6] max-w-[60ch] text-ink-soft">
          {project.hook}
        </p>
        <div className="flex flex-wrap gap-[22px] mt-5 pt-[18px] border-t border-line-3">
          <div className="min-w-0">
            <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-label-faint mb-1">
              Status
            </div>
            <div className="text-[13px] font-medium text-ink">{project.status}</div>
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-label-faint mb-1">
              With
            </div>
            <div className="text-[13px] text-ink-soft">{project.people}</div>
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-label-faint mb-1">
              Scope
            </div>
            <div className="text-[13px] text-ink-soft">{project.scope}</div>
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-label-faint mb-1">
              Depth
            </div>
            <DepthDots depth={project.depth} />
          </div>
          <span className="sm:ml-auto self-end text-[13px] font-medium text-blue">
            Read the story →
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProjectCard({ project, onOpen }) {
  const cardBg = project.tone === "fun" ? "bg-blue-tint" : "bg-card";
  return (
    <div
      onClick={onOpen}
      className={`cursor-pointer flex flex-col ${cardBg} border border-line-2 rounded-[14px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-blue transition-colors`}
    >
      <div
        className="relative h-[118px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg,#ece7dd,#ece7dd 9px,#f4f0e8 9px,#f4f0e8 18px)",
        }}
      >
        <span className="absolute top-3 left-3 font-mono text-[9px] font-medium tracking-[0.06em] uppercase text-label bg-white/[0.78] border border-line px-2 py-1 rounded-full">
          {project.status}
        </span>
        <span className="absolute bottom-3 left-3 font-mono text-[10.5px] text-label-mute bg-white/70 px-[7px] py-[3px] rounded-[5px]">
          {project.thumb}
        </span>
      </div>
      <div className="px-5 pt-[18px] pb-5 flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-2.5 font-mono text-[10.5px] text-label-faint">
          <span>{project.category}</span>
          <span>{project.dateLabel}</span>
        </div>
        <h3 className="mt-[9px] font-display font-semibold text-lg leading-[1.16] text-ink">
          {project.title}
        </h3>
        <p className="mt-[9px] text-[13.5px] leading-[1.56] text-label flex-1">
          {project.hook}
        </p>
        <div className="flex items-end justify-between gap-3 mt-4 pt-[14px] border-t border-line-3">
          <div>
            <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-label-faint mb-[3px]">
              With
            </div>
            <div className="text-xs text-ink-soft max-w-[22ch]">{project.people}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-label-faint mb-[3px]">
              Depth
            </div>
            <DepthDots depth={project.depth} />
          </div>
        </div>
      </div>
    </div>
  );
}
