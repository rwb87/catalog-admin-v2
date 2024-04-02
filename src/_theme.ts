import { defineStyleConfig, extendTheme } from '@chakra-ui/react';
// import type { StyleFunctionProps } from '@chakra-ui/styled-system';
// const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys);

const textBlackColor = '#121212';
const textWhiteColor = '#dadada';

export const themeColors = {
	transparent: "transparent",
	black: "#000",
	white: "#fff",
	'text-black': textBlackColor,
	'text-white': textWhiteColor,
	primary: {
		main: "#337357",
		light: "#d6e3dd",
		dark: "#0a1711",
		50: "#e8f8f9",
		100: "#d6e3dd",
		200: "#adc7bc",
		300: "#85ab9a",
		400: "#5c8f79",
		500: "#337357",
		600: "#295c46",
		700: "#1f4534",
		800: "#142e23",
		900: "#0a1711"
	},
	gray: {
		main: "#14181e",
		light: "#dadfe4",
		dark: "#040506",
		50: "#f7f8fa",
		100: "#dadfe4",
		200: "#a1a3a5",
		300: "#727478",
		400: "#43464b",
		500: "#14181e",
		600: "#101318",
		700: "#0c0e12",
		800: "#080a0c",
		900: "#040506"
	},
};

export const breakpoints = {
	'base': '0px',
	'xs': '360px',
	'st': '375px',
	'sm': '480px',
	'md': '768px',
	'lg': '1024px',
	'xl': '1280px',
	'2xl': '1536px',
	'3xl': '1920px',
	'2k': '2560px',
	'4k': '3840px',
	'8k': '7680px',
}

const theme = extendTheme({
	breakpoints,
	config: {
		initialColorMode: 'light',
		useSystemColorMode: false,
	},
	fonts: {
		body: "Poppins, sans-serif",
		heading: "Poppins, serif",
		mono: "Poppins, monospace",
	},
	colors: {
		base: '#FFFFFF',
		link: '#44ffb2',
		breadCrumb: '#B1C7DF',
		...themeColors,
	},
	styles: {
		global: () => ({
			html: {
				fontFamily: `'Inter' !important`,
			},
			body: {
				bg: '#fcfcfc',
			},
			h1: {
				fontSize: '48px',
			},
			h2: {
				fontSize: '36px',
			},
			textarea: {
				color: textBlackColor,
				borderRadius: 'md',
				_placeholder: {
					color: 'gray.200',
				},
				_focusVisible: {
					borderColor: `${themeColors.primary[400]} !important`,
					boxShadow: `0 0 0 1px ${themeColors.primary[400]} !important`
				},
				fontWeight: 600,
			},
			input: {
				color: textBlackColor,
				fontWeight: 600,
				borderRadius: 'md',
				_placeholder: {
					color: 'gray.200',
				},
				_focusVisible: {
					borderColor: `${themeColors.primary[400]} !important`,
					boxShadow: `0 0 0 1px ${themeColors.primary[400]} !important`
				},
			},
			select: {
				color: textBlackColor,
				fontWeight: 600,
				cursor: 'pointer',
				borderRadius: 'md',
				_placeholder: {
					color: 'gray.200',
				},
				_focusVisible: {
					borderColor: `${themeColors.primary[400]} !important`,
					boxShadow: `0 0 0 1px ${themeColors.primary[400]} !important`
				},
			},
			th: {
				fontSize: '14px !important',
				fontWeight: 'bold !important',
			}
		}),
	},
	components: {
		Tooltip: defineStyleConfig({
			baseStyle: {
				backgroundColor: 'gray.dark',
				color: 'text-white',
			}
		})
	},
});

export default theme;