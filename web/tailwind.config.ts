import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base canvas & neutral surfaces matching reference
        ink: '#111315',
        inkSecondary: '#344054',
        paper: '#F2F4F7',
        card: '#FFFFFF',
        ash: '#E4E7EC',
        muted: '#667085',
        subtle: '#F8F9FA',
        subtleHover: '#ECEEF2',

        // Obsidian Monochrome Shell (Sidebar, Modals, Chrome)
        sidebar: '#111215',
        sidebarHover: '#1C1E22',
        sidebarActive: '#22252A',
        forge: '#111215',
        forgeElevated: '#181A1F',

        // Executive Cards
        darkCard: '#121316',
        silverCard: '#D9E2EC',

        // Brand / Monochrome Luxe Accents
        ember: {
          DEFAULT: '#111315',
          hover: '#27272A',
          active: '#09090B',
          tint: '#F4F5F7',
          tintBorder: '#E4E7EC',
          decorative: '#18181B',
        },

        steel: {
          DEFAULT: '#1E293B',
          hover: '#0F172A',
          tint: '#F1F5F9',
          tintBorder: '#CBD5E1',
        },

        // Status Colors (Refined & subtle)
        status: {
          gray: '#475467',
          grayTint: '#F2F4F7',
          blue: '#1D2939',
          blueTint: '#EAECF0',
          green: '#027A48',
          greenTint: '#ECFDF3',
          amber: '#B54708',
          amberTint: '#FFFAEB',
        },

        // Priority Colors
        priority: {
          teal: '#0E7090',
          tealTint: '#ECFEFF',
          gold: '#B54708',
          goldTint: '#FFFAEB',
          crimson: '#B42318',
          crimsonTint: '#FEF3F2',
        },

        crimson: '#D92D20',
        crimsonHover: '#B42318',
        crimsonTint: '#FEF3F2',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
        card: '20px',
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgba(16, 24, 40, 0.05), 0 1px 2px -1px rgba(16, 24, 40, 0.02)',
        card: '0 4px 20px -2px rgba(16, 24, 40, 0.04), 0 2px 6px -1px rgba(16, 24, 40, 0.02)',
        hover: '0 12px 30px -4px rgba(16, 24, 40, 0.08), 0 4px 10px -2px rgba(16, 24, 40, 0.03)',
        elevated: '0 24px 48px -12px rgba(16, 24, 40, 0.12)',
        darkGlow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.25)', opacity: '0.6' },
        },
        'grow-bar': {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
        'grow-bar': 'grow-bar 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
