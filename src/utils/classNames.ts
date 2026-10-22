export const cn = (...v: Array<string | false | undefined | null>) =>
  v.filter(Boolean).join(" ");
export const priorityStyles = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-sky-100 text-sky-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-rose-100 text-rose-700",
} as const;
