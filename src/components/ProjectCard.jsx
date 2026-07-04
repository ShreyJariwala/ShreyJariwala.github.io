const vibeLabel = {
  flagship: "at work",
  tool: "at work",
  civic: "for the city",
  personal: "for fun",
  spec: "on paper",
};

export default function ProjectCard({ project, onOpen, featured }) {
  return (
    <button
      onClick={() => onOpen(project)}
      className={`group text-left w-full rounded-2xl border border-line bg-white/60 hover:bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 p-6 sm:p-8 ${
        featured ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-xs uppercase tracking-widest text-rust font-medium">
          {vibeLabel[project.vibe]}
        </span>
        <span
          aria-hidden="true"
          className="text-ink-soft/40 group-hover:text-rust group-hover:translate-x-1 transition-all"
        >
          →
        </span>
      </div>

      <h3 className="font-serif text-2xl sm:text-3xl mt-3 text-ink leading-snug">
        {project.title}
      </h3>

      <p className="mt-3 text-ink-soft leading-relaxed">{project.tagline}</p>
    </button>
  );
}
