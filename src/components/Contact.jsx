import { useState } from "react";
import ContactCardQR from "./ContactCardQR";
import { LINKEDIN_URL, GITHUB_URL, UPWORK_URL } from "../lib/links";

// Sign up at https://formspree.io (free), create a form, and drop its ID in here.
const FORMSPREE_ID = "YOUR_FORM_ID";
const FORM_ENDPOINT = `https://formspree.io/f/${FORMSPREE_ID}`;

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (FORMSPREE_ID === "YOUR_FORM_ID") {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const form = e.target;
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="max-w-[1080px] mx-auto px-6 pt-14 pb-[90px] scroll-mt-[70px]">
      <div className="border-t border-line pt-[22px] mb-5">
        <h2 className="m-0 font-mono font-semibold text-xs tracking-[0.14em] uppercase text-label-mute">
          Let's talk
        </h2>
      </div>

      <p className="m-0 mb-1 font-serif text-[clamp(26px,4vw,40px)] leading-[1.14] max-w-[22ch] text-ink">
        Solving a similarly weird integration problem?
      </p>
      <p className="mt-[14px] mb-7 text-base leading-[1.6] max-w-[52ch] text-ink-mute">
        I like the ones that don't have a clean answer yet. Reach out —
        worst case, we compare notes on a bug.
      </p>

      <div className="flex flex-wrap gap-3">
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline inline-flex items-center gap-[9px] bg-blue text-paper px-5 py-[13px] rounded-[11px] font-medium text-[14.5px] hover:bg-blue-dark transition-colors"
        >
          LinkedIn <span className="font-mono text-[11px] opacity-70">↗</span>
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline inline-flex items-center gap-[9px] bg-card border border-line-2 text-ink px-5 py-[13px] rounded-[11px] font-medium text-[14.5px] hover:border-ink transition-colors"
        >
          GitHub <span className="font-mono text-[11px] text-label-mute">↗</span>
        </a>
        <a
          href={UPWORK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline inline-flex items-center gap-[9px] bg-card border border-line-2 text-ink px-5 py-[13px] rounded-[11px] font-medium text-[14.5px] hover:border-ink transition-colors"
        >
          Upwork <span className="font-mono text-[11px] text-label-mute">↗</span>
        </a>
      </div>

      <ContactCardQR />

      <div className="mt-8 text-left bg-card border border-line-2 rounded-2xl p-6 sm:p-8">
        <p className="text-sm text-ink-mute mb-6">
          Prefer not to use LinkedIn? Leave your email or phone number below
          and what you're reaching out about — I'll get back to you directly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="_gotcha" className="hidden" tabIndex="-1" autoComplete="off" />

          <div>
            <label htmlFor="name" className="block text-sm text-ink-mute mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-line-2 bg-paper px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-blue/40"
            />
          </div>

          <div>
            <label htmlFor="contact" className="block text-sm text-ink-mute mb-1">
              Email or phone number
            </label>
            <input
              id="contact"
              name="contact"
              type="text"
              required
              placeholder="you@example.com or +1 555 123 4567"
              className="w-full rounded-lg border border-line-2 bg-paper px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-blue/40"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm text-ink-mute mb-1">
              What's up?
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full rounded-lg border border-line-2 bg-paper px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-blue/40 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue text-paper px-5 py-2.5 rounded-full font-medium hover:bg-blue-dark transition-colors disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send it over"}
          </button>

          {status === "sent" && (
            <p className="text-sm text-blue-text">Got it — I'll be in touch soon.</p>
          )}
          {status === "error" && (
            <p className="text-sm text-ink-soft">
              Something didn't go through. LinkedIn's the reliable backup
              for now.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
