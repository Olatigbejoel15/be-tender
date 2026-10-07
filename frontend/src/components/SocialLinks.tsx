// No "use client": it has no state or animation, so it can render on the server.

import type { IconType } from "react-icons"; // the TypeScript type of an icon component
import { FaInstagram, FaWhatsapp, FaTiktok, FaXTwitter, FaFacebookF, FaYoutube } from "react-icons/fa6";
import { site } from "@/data/site"; // your social links

// Connects each label in site.ts to its icon
const icons: Record<string, IconType> = {
  Instagram: FaInstagram,
  WhatsApp: FaWhatsapp,
  TikTok: FaTiktok,
  X: FaXTwitter,
  Facebook: FaFacebookF,
  YouTube: FaYoutube,
};

// className lets each page add its own spacing (like "mt-5")
export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {site.socials.map((s) => {
        const Icon = icons[s.label]; // find the icon for this label
        if (!Icon) return null; // unknown label: skip it instead of crashing

        return (
          <a
            key={s.label}
            href={s.href}
            target="_blank" // open in a new tab
            rel="noopener noreferrer" // security: the new tab can't control this one
            aria-label={s.label} // screen readers read this, since the link has only an icon
            title={s.label} // tooltip on hover
            // Round white button. On hover it turns orange and lifts slightly.
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-ink transition duration-300 hover:-translate-y-1 hover:border-accent hover:bg-accent hover:text-white"
          >
            <Icon size={18} />
          </a>
        );
      })}
    </div>
  );
}