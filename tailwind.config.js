/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  		radix: {
  			mintDefault: '#25d0ab',
  			mintLighter: '#95f3d9'
  		},
  		coolors: {
  			orange: '#eaac8b',
  			red: '#e56b6f',
  			lessred: '#415a77',
  			purple: '#6d597a',
  			blue: '#355070'
  		},
  		coolersPastel: {
  			forest: '#4a5759',
  			bathtub: '#b0c4b1',
  			offGreen: '#dedbd2',
  			creme: '#f7e1d7',
  			pink: '#edafb8'
  		},
  		base: {
  			'50': '#F2F0E5',
  			'100': '#E6E4D9',
  			'150': '#DAD8CE',
  			'200': '#CECDC3',
  			'300': '#B7B5AC',
  			'500': '#878580',
  			'600': '#6F6E69',
  			'700': '#AC3B61',
  			'800': '#403E3C',
  			'850': '#343331',
  			'900': '#282726',
  			'950': '#1C1B1A',
  			black: '#100F0F',
  			paper: '#FFFCF0'
  		},
  		red: {
  			DEFAULT: '#AF3029',
  			light: '#D14D41'
  		},
  		orange: {
  			DEFAULT: '#BC5215',
  			light: '#DA702C'
  		},
  		yellow: {
  			DEFAULT: '#AD8301',
  			light: '#D0A215'
  		},
  		green: {
  			DEFAULT: '#66800B',
  			light: '#879A39'
  		},
  		cyan: {
  			DEFAULT: '#24837B',
  			light: '#3AA99F'
  		},
  		blue: {
  			DEFAULT: '#205EA6',
  			light: '#4385BE'
  		},
  		purple: {
  			DEFAULT: '#5E409D',
  			light: '#8B7EC8'
  		},
  		magenta: {
  			DEFAULT: '#A02F6F',
  			light: '#CE5D97'
  		}
  	}
  	}
  },
  plugins: [],
};
