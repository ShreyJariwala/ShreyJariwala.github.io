export default function Footer() {
  return (
    <footer className="max-w-[1080px] mx-auto px-6 pb-16">
      <div className="pt-[26px] border-t border-line flex flex-wrap items-end gap-10">
        <div className="flex flex-col gap-2.5">
          <img src="/images/Canada_wordmark.svg" alt="Canada" className="h-6 w-auto block" />
          <span className="font-mono text-[11px] tracking-[0.02em] text-label-mute">
            Made in Toronto
          </span>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <img
            src="/images/emblem_india.png"
            alt="State Emblem of India"
            className="h-[54px] w-auto block"
          />
          <span className="font-mono text-[11px] tracking-[0.02em] text-label-mute">
            Rooted in Surat
          </span>
        </div>
        <span className="ml-auto self-end font-mono text-[11px] text-label-faint">
          © 2026 Shrey Jariwala
        </span>
      </div>
    </footer>
  );
}
