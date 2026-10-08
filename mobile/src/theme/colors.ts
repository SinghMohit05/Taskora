export const colors = {
  // Base Canvas & Dark Executive Surfaces (Taskora Dark Theme)
  ink: '#FFFFFF', // High-contrast clean white primary text
  inkSecondary: '#CBD5E1', // Slate 300 - Secondary text
  paper: '#0B0E17', // Near-black / charcoal canvas matching web Taskora (#0B0E17)
  card: '#121622', // Executive dark card surface matching web Taskora (#121622)
  cardElevated: '#181D2E', // Elevated dark card / container
  ash: 'rgba(255, 255, 255, 0.08)', // Crisp, subtle borders matching web border-white/[0.06]
  ashStrong: 'rgba(255, 255, 255, 0.16)', // Active/focused borders
  muted: '#94A3B8', // Slate 400 - Secondary text & labels
  subtle: '#161B28', // Dark secondary container / inputs
  subtleHover: '#1E2536',

  // Brand / Luxe Accent (Taskora Royal SaaS Blue & Violet)
  primary: '#2563EB', // Blue 600 - Taskora interactive primary matching web
  primaryPressed: '#1D4ED8', // Blue 700 - Active state
  primaryTint: 'rgba(37, 99, 235, 0.15)', // Blue glow & badge background
  primaryBorder: 'rgba(37, 99, 235, 0.35)', // Blue border
  decorativeEmber: '#3B82F6', // Blue 500 - Active tabs & accents
  purpleAccent: '#8B5CF6', // Purple 500 - Secondary SaaS accent
  purpleTint: 'rgba(139, 92, 246, 0.15)',

  // Structural & Executive Shell (Obsidian)
  forge: '#0B0E17', // Deep executive obsidian header / background
  forgeElevated: '#0E121E', // Elevated dark tab bar / navigation matching web sidebar
  steel: '#38BDF8', // Sky 400 accent

  // Status Colors (WCAG AA Compliant on Dark Backgrounds)
  status: {
    pending: '#F59E0B', // Amber 500
    notStarted: '#94A3B8', // Slate 400
    inProgress: '#38BDF8', // Sky 400
    completed: '#10B981', // Emerald 500
  },

  // Priority Colors
  priority: {
    low: '#14B8A6', // Teal 400
    medium: '#F59E0B', // Amber 500
    high: '#EF4444', // Red 500
  },

  // Alerts & Critical
  crimson: '#EF4444',
  crimsonHover: '#DC2626',
  errorTint: 'rgba(239, 68, 68, 0.15)',

  // Functional
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.75)',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
