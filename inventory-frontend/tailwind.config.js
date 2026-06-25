/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ClickHouse color system
        clickhouse: {
          // Primary brand
          yellow: '#faff69',
          'yellow-active': '#e6eb52',
          'yellow-disabled': '#3a3a1f',
          
          // Canvas & Surfaces
          canvas: '#0a0a0a',
          'surface-soft': '#121212',
          'surface-card': '#1a1a1a',
          'surface-elevated': '#242424',
          
          // Text
          ink: '#ffffff',
          body: '#cccccc',
          'body-strong': '#e6e6e6',
          muted: '#888888',
          'muted-soft': '#5a5a5a',
          
          // Borders
          hairline: '#2a2a2a',
          'hairline-strong': '#3a3a3a',
          
          // Semantic
          emerald: '#22c55e',
          rose: '#ef4444',
          blue: '#3b82f6',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        }
      },
      backgroundColor: {
        'ch-canvas': '#0a0a0a',
        'ch-surface': '#1a1a1a',
      },
      textColor: {
        'ch-primary': '#ffffff',
        'ch-secondary': '#cccccc',
        'ch-muted': '#888888',
        'ch-yellow': '#faff69',
      },
      borderColor: {
        'ch-hairline': '#2a2a2a',
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'section': '96px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      },
      fontSize: {
        'display-xl': ['72px', { fontWeight: '700', lineHeight: '1.05', letterSpacing: '-2.5px' }],
        'display-lg': ['56px', { fontWeight: '700', lineHeight: '1.1', letterSpacing: '-2px' }],
        'display-md': ['40px', { fontWeight: '700', lineHeight: '1.15', letterSpacing: '-1.5px' }],
        'display-sm': ['32px', { fontWeight: '700', lineHeight: '1.2', letterSpacing: '-1px' }],
        'title-lg': ['24px', { fontWeight: '700', lineHeight: '1.3', letterSpacing: '-0.3px' }],
        'title-md': ['18px', { fontWeight: '600', lineHeight: '1.4' }],
        'title-sm': ['16px', { fontWeight: '600', lineHeight: '1.4' }],
        'stat-display': ['56px', { fontWeight: '700', lineHeight: '1.0', letterSpacing: '-1.5px' }],
        'body-md': ['16px', { fontWeight: '400', lineHeight: '1.55' }],
        'body-sm': ['14px', { fontWeight: '400', lineHeight: '1.55' }],
        'caption': ['13px', { fontWeight: '500', lineHeight: '1.4' }],
        'caption-uppercase': ['12px', { fontWeight: '600', lineHeight: '1.4', letterSpacing: '1.5px' }],
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'ch-sm': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'ch-md': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'ch-lg': '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}