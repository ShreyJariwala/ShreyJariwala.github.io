import { useEffect, useState } from "react";

export default function ProjectModal({ project, onClose }) {
  const [showNerdy, setShowNerdy] = useState(false);

  useEffect(() => {
    setShowNerdy(false);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-paper w-full sm:max-w-2xl max-h-[90svh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-line shadow-2xl p-6 sm:p-10 animate-[modal-in_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-3xl sm:text-4xl text-ink leading-tight">
            {project.title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-paper-dim hover:text-ink transition-colors text-xl"
          >
            ×
          </button>
        </div>

        <p className="mt-3 font-serif italic text-lg text-rust-dark">
          {project.tagline}
        </p>

        <div className="mt-6 space-y-4 text-ink-soft leading-relaxed">
          {project.story.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {project.links?.github && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-rust hover:text-rust-dark transition-colors"
          >
            View on GitHub ↗
          </a>
        )}

        <div className="mt-8 border-t border-line pt-5">
          <button
            onClick={() => setShowNerdy((v) => !v)}
            className="text-sm font-medium text-ink-soft hover:text-rust transition-colors flex items-center gap-2"
          >
            <span className={`transition-transform ${showNerdy ? "rotate-90" : ""}`}>
              ›
            </span>
            {showNerdy ? "Hide the nerdy details" : "Show the nerdy details"}
          </button>

          {showNerdy && (
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              {project.nerdyDetails.map((d, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-rust">·</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
