import { useState } from "react";

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
    <section id="contact" className="px-6 sm:px-10 lg:px-16 py-20 sm:py-28 bg-paper-dim/60">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-ink">Let's talk</h2>
        <p className="mt-3 text-ink-soft leading-relaxed max-w-md mx-auto">
          If you're wrestling with a similarly weird integration, or just want
          to compare notes on a stuck project — reach out.
        </p>

        <div className="mt-8 flex justify-center">
          <a
            href="https://www.linkedin.com/in/shrey-jariwala-pmp%C2%AE-98b236206"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 rounded-full font-medium hover:bg-rust-dark transition-colors"
          >
            Connect on LinkedIn ↗
          </a>
        </div>

        <div className="mt-12 text-left bg-white border border-line rounded-2xl p-6 sm:p-8">
          <p className="text-sm text-ink-soft mb-6">
            Prefer not to use LinkedIn? Leave your email or phone number below
            and what you're reaching out about — I'll get back to you directly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="_gotcha" className="hidden" tabIndex="-1" autoComplete="off" />

            <div>
              <label htmlFor="name" className="block text-sm text-ink-soft mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-rust/40"
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm text-ink-soft mb-1">
                Email or phone number
              </label>
              <input
                id="contact"
                name="contact"
                type="text"
                required
                placeholder="you@example.com or +1 555 123 4567"
                className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-rust/40"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm text-ink-soft mb-1">
                What's up?
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-rust/40 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rust text-paper px-5 py-2.5 rounded-full font-medium hover:bg-rust-dark transition-colors disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send it over"}
            </button>

            {status === "sent" && (
              <p className="text-sm text-green-flag">
                Got it — I'll be in touch soon.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-rust-dark">
                Something didn't go through. LinkedIn's the reliable backup
                for now.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
