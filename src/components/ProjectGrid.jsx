import { useState } from "react";
import { projects } from "../data/projects";
import ProjectCard, { FlagshipCard } from "./ProjectCard";
import ProjectModal from "./ProjectModal";

export default function ProjectGrid() {
  const [openIndex, setOpenIndex] = useState(null);
  const flagship = projects[0];
  const rest = projects.slice(1);

  return (
    <section id="work" className="max-w-[1080px] mx-auto px-6 pt-9 pb-5 scroll-mt-[70px]">
      <div className="flex items-baseline justify-between border-t border-line pt-[22px] mb-6 gap-3 flex-wrap">
        <h2 className="m-0 font-mono font-semibold text-xs tracking-[0.14em] uppercase text-label-mute">
          What I've been building
        </h2>
        <span className="font-mono text-[11.5px] text-label-faint">
          {projects.length} experiments · click any to read the story
        </span>
      </div>

      <FlagshipCard project={flagship} onOpen={() => setOpenIndex(0)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rest.map((p, i) => (
          <ProjectCard key={p.id} project={p} onOpen={() => setOpenIndex(i + 1)} />
        ))}
      </div>

      <ProjectModal
        project={openIndex !== null ? projects[openIndex] : null}
        onClose={() => setOpenIndex(null)}
      />
    </section>
  );
}
