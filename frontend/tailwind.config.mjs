/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-primary': 'linear-gradient(to right, #4ade80, #22c55e)',
  			'gradient-secondary': 'linear-gradient(to right, #f0fdf4, #dcfce7)',
  		},
  		colors: {
  			background: '#ffffff',
  			foreground: '#1a1a1a',
  			card: {
  				DEFAULT: '#ffffff',
  				foreground: '#1a1a1a'
  			},
  			popover: {
  				DEFAULT: '#ffffff',
  				foreground: '#1a1a1a'
  			},
  			primary: {
  				DEFAULT: '#22c55e',
  				foreground: '#ffffff'
  			},
  			secondary: {
  				DEFAULT: '#4ade80',
  				foreground: '#1a1a1a'
  			},
  			muted: {
  				DEFAULT: '#f0fdf4',
  				foreground: '#1a1a1a'
  			},
  			accent: {
  				DEFAULT: '#86efac',
  				foreground: '#1a1a1a'
  			},
  			destructive: {
  				DEFAULT: '#ef4444',
  				foreground: '#ffffff'
  			},
  			border: '#e5e7eb',
  			input: '#f9fafb',
  			ring: '#22c55e',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: '1rem',
  			md: '0.75rem',
  			sm: '0.5rem'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
