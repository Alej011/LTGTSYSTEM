// Estilos de badge por significado. Usan los tokens del tema, así que funcionan en modo claro y oscuro.
export const TONE_CLASSES = {
  info: "border-info/25 bg-info/10 text-info",
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/10 text-warning",
  danger: "border-destructive/25 bg-destructive/10 text-destructive",
  primary: "border-primary/25 bg-primary/10 text-primary",
  neutral: "border-border bg-muted text-muted-foreground",
} as const

export type Tone = keyof typeof TONE_CLASSES
