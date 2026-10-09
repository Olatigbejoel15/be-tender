// A tiny component that draws the Be Tender logo as inline SVG.
// It uses the site's CSS colour variables, so it switches automatically between the Light and Navy themes.
// No "use client" needed: it has no state, so it can render on the server.

type LogoProps = {
  variant?: "full" | "mark"; // "full" = leaves + name, "mark" = leaves only
  className?: string; // size it from outside, e.g. "h-9 w-auto"
};

export default function Logo({ variant = "full", className = "" }: LogoProps) {
  const full = variant === "full";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      // viewBox = the drawing area. The mark alone is a tighter box than the full logo.
      viewBox={full ? "-4 -4 378.2 108" : "6 10 88 86"}
      role="img"
      aria-label="Be Tender"
      className={className}
    >
      {/* Left leaf: the accent colour (orange in Light, blue in Navy) */}
      <path d="M50 92 C16 84 10 44 20 14 C52 18 66 56 50 92Z" style={{ fill: "var(--accent)" }} />
      {/* Right leaf: the ink colour (dark in Light, pale in Navy) */}
      <path d="M50 92 C84 84 90 44 80 14 C48 18 34 56 50 92Z" style={{ fill: "var(--ink)" }} />

      {/* The "BE TENDER" lettering, drawn as outlines so it never depends on a font */}
      {full && (
        <path
          transform="translate(124,62)"
          style={{ fill: "var(--ink)" }}
          d="M23.64 -7.26Q23.64 -3.91 21.3 -1.96Q18.96 0 14.78 0H2.36V-26.68H14.36Q18.43 -26.68 20.73 -24.81Q23.03 -22.95 23.03 -19.76Q23.03 -17.4 21.79 -15.85Q20.56 -14.29 18.51 -13.68Q20.82 -13.19 22.23 -11.38Q23.64 -9.58 23.64 -7.26ZM8.85 -15.88H13.11Q14.71 -15.88 15.56 -16.59Q16.42 -17.29 16.42 -18.66Q16.42 -20.03 15.56 -20.75Q14.71 -21.47 13.11 -21.47H8.85ZM17.06 -8.13Q17.06 -9.54 16.13 -10.34Q15.2 -11.13 13.57 -11.13H8.85V-5.24H13.64Q15.28 -5.24 16.17 -5.98Q17.06 -6.73 17.06 -8.13Z M39.9 -21.47V-16.07H48.6V-11.06H39.9V-5.21H49.74V0H33.4V-26.68H49.74V-21.47Z M93.2 -26.68V-21.47H86.13V0H79.64V-21.47H72.57V-26.68Z M108.97 -21.47V-16.07H117.67V-11.06H108.97V-5.21H118.81V0H102.47V-26.68H118.81V-21.47Z M152.89 0H146.39L135.53 -16.45V0H129.03V-26.68H135.53L146.39 -10.15V-26.68H152.89Z M187.58 -13.34Q187.58 -9.42 185.85 -6.38Q184.12 -3.34 180.95 -1.67Q177.78 0 173.6 0H163.6V-26.68H173.6Q177.82 -26.68 180.97 -25Q184.12 -23.33 185.85 -20.31Q187.58 -17.29 187.58 -13.34ZM180.97 -13.34Q180.97 -17.02 178.92 -19.08Q176.87 -21.13 173.18 -21.13H170.1V-5.62H173.18Q176.87 -5.62 178.92 -7.64Q180.97 -9.65 180.97 -13.34Z M203.73 -21.47V-16.07H212.43V-11.06H203.73V-5.21H213.57V0H197.23V-26.68H213.57V-21.47Z M237.39 0 231.84 -10.07H230.29V0H223.79V-26.68H234.69Q237.85 -26.68 240.07 -25.57Q242.29 -24.47 243.4 -22.55Q244.5 -20.63 244.5 -18.28Q244.5 -15.62 243 -13.53Q241.5 -11.44 238.57 -10.56L244.73 0ZM230.29 -14.67H234.31Q236.1 -14.67 236.99 -15.54Q237.89 -16.42 237.89 -18.01Q237.89 -19.53 236.99 -20.41Q236.1 -21.28 234.31 -21.28H230.29Z"
        />
      )}
    </svg>
  );
}