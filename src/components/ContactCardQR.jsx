import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { buildVCard, FULL_NAME } from "../lib/vcard";

function downloadVCard() {
  const blob = new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Shrey-Jariwala.vcf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ContactCardQR() {
  const [qrSvg, setQrSvg] = useState(null);

  useEffect(() => {
    QRCode.toString(buildVCard(), {
      type: "svg",
      margin: 4,
      color: { dark: "#000000", light: "#FFFFFF" },
    }).then(setQrSvg);
  }, []);

  return (
    <div className="mt-8 bg-card border border-line-2 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-left">
      <div className="shrink-0 bg-white p-3 rounded-xl border border-line-2 w-36 h-36 flex items-center justify-center">
        {/* qrSvg is always generated locally from a hardcoded constant, never remote/user content */}
        {qrSvg && (
          <div
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        )}
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h3 className="font-display font-semibold text-lg text-ink">Save my contact</h3>
        <p className="mt-1 text-sm text-ink-mute leading-relaxed">
          Scan with your phone's camera to add {FULL_NAME} straight to your
          contacts — or tap below to save it on this device.
        </p>
        <button
          type="button"
          onClick={downloadVCard}
          className="mt-4 inline-flex items-center justify-center gap-2 bg-blue text-paper px-5 py-2.5 rounded-full font-medium hover:bg-blue-dark transition-colors"
        >
          Save my contact ↓
        </button>
      </div>
    </div>
  );
}
