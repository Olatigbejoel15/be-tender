// The shape of one lookbook tile
export type Look = {
  src: string;   // path inside public/
  alt: string;   // description for screen readers
  label: string; // small caption shown on the photo
  span: string;  // Tailwind classes that decide how big the tile is in the grid
};

export const looks: Look[] = [
  // Tile 1: big. Full width on phones, 2 columns x 2 rows on tablets and up.
  { src: "/lookbook/look-1.jpg", alt: "Athlete in Be Tender training set", label: "The Core Set", span: "col-span-2 md:row-span-2" },
  // Tiles 2 to 5: small, 1 column x 1 row each
  { src: "/lookbook/look-2.jpg", alt: "Woman in sports bra and leggings", label: "Studio Days", span: "" },
  { src: "/lookbook/look-3.jpg", alt: "Man in training tee", label: "Heavy Lifts", span: "" },
  { src: "/lookbook/look-4.jpg", alt: "Gym session in training shorts", label: "Cardio Hour", span: "" },
  { src: "/lookbook/look-5.jpg", alt: "Stretching after a workout", label: "Cool Down", span: "" },
];