import { useState } from "react";
import { projects } from "../data/projects";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";

export default function ProjectGrid() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="work" className="px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl text-ink">
          What I've been building
        </h2>
        <p className="mt-3 text-ink-soft max-w-xl leading-relaxed">
          Some of this paid the bills. Some of it just scratched an itch.
          Tap a card for the full story.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={setSelected}
              featured={project.vibe === "flagship"}
            />
          ))}
        </div>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
