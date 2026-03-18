export const AREA_VALUES = [
  "Frontend",
  "Backend",
  "Fullstack",
  "UI/UX",
  "Mobile",
  "Other",
] as const;

export type Area = (typeof AREA_VALUES)[number];
