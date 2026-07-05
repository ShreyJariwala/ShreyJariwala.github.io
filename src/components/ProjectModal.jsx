import { useEffect, useState } from "react";
import { DepthDots } from "./ProjectCard";

const sections = [
  { key: "problem", label: "The annoying thing" },
  { key: "insight", label: "What I noticed" },
  { key: "built", label: "What I built" },
  { key: "changed", label: "What changed" },
];

export default function ProjectModal({ project, onClose }) {
  const [nerdyOpen, setNerdyOpen] = useState(false);

  useEffect(() => {
    if (!project) return;
    setNerdyOpen(false);
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[rgba(28,24,17,0.52)] backdrop-blur-[5px] flex items-start justify-center px-[18px] py-[5vh] overflow-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[700px] bg-paper rounded-[18px] overflow-hidden shadow-[0_40px_90px_-30px_rgba(0,0,0,0.55)] animate-[sjpop_0.3s_ease_both]"
      >
        <div
          className="relative h-[150px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg,#e7ebf7,#e7ebf7 10px,#eef0f7 10px,#eef0f7 20px)",
          }}
        >
          <span className="absolute bottom-4 left-[22px] font-mono text-[11px] text-blue-text-2 bg-white/70 px-[9px] py-1 rounded-md">
            {project.thumb}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-[34px] h-[34px] rounded-[9px] border-none bg-white/85 hover:bg-white text-ink text-lg cursor-pointer flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-7 pt-7 pb-[34px] max-h-[64vh] overflow-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="font-mono text-[10.5px] text-white bg-blue px-2.5 py-[5px] rounded-full">
              {project.status}
            </span>
            <span className="font-mono text-[10.5px] text-label bg-line-3 px-2.5 py-[5px] rounded-full">
              {project.category}
            </span>
            <span className="font-mono text-[10.5px] text-label bg-line-3 px-2.5 py-[5px] rounded-full">
              {project.dateLabel}
            </span>
          </div>

          <h2 className="m-0 font-display font-bold text-[28px] leading-[1.1] tracking-[-0.01em] text-ink">
            {project.title}
          </h2>

          <div className="flex flex-wrap gap-[26px] my-5 py-4 border-t border-b border-line">
            <div>
              <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-label-faint mb-1">
                With
              </div>
              <div className="text-[13.5px] text-ink-2 max-w-[26ch]">{project.people}</div>
            </div>
            <div>
              <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-label-faint mb-1">
                Scope
              </div>
              <div className="text-[13.5px] text-ink-2">{project.scope}</div>
            </div>
            <div>
              <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-label-faint mb-1">
                Depth
              </div>
              <DepthDots depth={project.depth} />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {sections.map((s) => (
              <div key={s.key}>
                <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-blue mb-[7px]">
                  {s.label}
                </div>
                <p className="m-0 text-[15.5px] leading-[1.64] text-ink-2">{project[s.key]}</p>
              </div>
            ))}
          </div>

          <div className="mt-[26px] border-t border-line pt-[18px]">
            <button
              type="button"
              onClick={() => setNerdyOpen((v) => !v)}
              className="font-sans font-medium text-[13px] text-blue bg-transparent border-none p-0 cursor-pointer inline-flex items-center gap-[7px]"
            >
              {nerdyOpen ? "hide the nerdy details ↗" : "the nerdy details ↘"}
            </button>
            {nerdyOpen && (
              <div className="mt-4 bg-card border border-line-2 rounded-xl px-5 py-[18px] animate-[sjfade_0.3s_ease_both]">
                <p className="m-0 mb-[14px] font-mono text-[12.5px] leading-[1.7] text-ink-soft">
                  {project.nerdy}
                </p>
                <div className="flex flex-wrap gap-[7px]">
                  {project.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[11px] text-blue-text bg-blue-tint border border-blue-tint-border px-2.5 py-[5px] rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
