import { createTheme, ThemeOptions, Theme } from '@mui/material/styles';

export const getDesignTokens = (_mode: 'light' | 'dark'): ThemeOptions => ({
    palette: {
        mode: 'light',
        primary: {
            main: '#2d7a70',
            light: '#52a89e',
            dark: '#1e5a52',
            contrastText: '#fff',
        },
        background: {
            default: '#f6f2ec',
            paper: '#ffffff',
        },
        text: {
            primary: '#1c1814',
            secondary: '#705d50',
        },
        divider: '#e8dfd5',
        success: {
            main: '#2e7d52',
            light: '#4caf76',
            dark: '#1b5e38',
        },
        warning: {
            main: '#c87c12',
            light: '#e8a030',
            dark: '#9a5e0a',
        },
        error: {
            main: '#c0392b',
            light: '#e05242',
            dark: '#922b21',
        },
    },
    shape: {
        borderRadius: 8,
    },
    spacing: 8,
    typography: {
        fontFamily: 'var(--font-body), system-ui, -apple-system, sans-serif',
        h1: {
            fontFamily: 'var(--font-heading), Georgia, serif',
            fontWeight: 700,
            lineHeight: 1.15,
        },
        h2: {
            fontFamily: 'var(--font-heading), Georgia, serif',
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h3: {
            fontFamily: 'var(--font-heading), Georgia, serif',
            fontWeight: 700,
            lineHeight: 1.25,
        },
        h4: {
            fontWeight: 700,
            lineHeight: 1.3,
        },
        h5: {
            fontWeight: 600,
            lineHeight: 1.35,
        },
        h6: {
            fontWeight: 600,
            lineHeight: 1.4,
        },
        button: {
            textTransform: 'none' as const,
            fontWeight: 600,
            letterSpacing: '0.01em',
        },
        body1: {
            lineHeight: 1.6,
        },
        body2: {
            lineHeight: 1.55,
        },
        caption: {
            lineHeight: 1.5,
            display: 'inline-block',
        },
    },
});

export function getThemedComponents(theme: Theme) {
    return {
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: theme.palette.background.default,
                    },
                },
            },
            MuiButtonBase: {
                defaultProps: { disableTouchRipple: false },
            },
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                    },
                    containedPrimary: {
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    },
                    sizeLarge: {
                        padding: '10px 24px',
                        fontSize: '1rem',
                        fontWeight: 600,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                    outlined: {
                        borderColor: theme.palette.divider,
                    },
                    elevation1: {
                        boxShadow: '0 1px 4px 0 rgba(60,40,20,0.07)',
                    },
                    elevation2: {
                        boxShadow: '0 2px 8px 0 rgba(60,40,20,0.09)',
                    },
                    elevation3: {
                        boxShadow: '0 4px 16px 0 rgba(60,40,20,0.10)',
                    },
                },
            },
            MuiDivider: {
                styleOverrides: {
                    root: { borderColor: theme.palette.divider },
                },
            },
            MuiLinearProgress: {
                styleOverrides: {
                    root: { borderRadius: 0 },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: { fontWeight: 600 },
                },
            },
            MuiTab: {
                defaultProps: { disableTouchRipple: true },
                styleOverrides: {
                    root: {
                        fontWeight: 600,
                        textTransform: 'none',
                        letterSpacing: '0.01em',
                    },
                },
            },
            MuiTabs: {
                styleOverrides: {
                    indicator: {
                        backgroundColor: theme.palette.primary.main,
                        height: 3,
                    },
                },
            },
            MuiSlider: {
                styleOverrides: {
                    markLabel: {
                        fontSize: '0.72rem',
                        color: theme.palette.text.secondary,
                    },
                },
            },
        },
    };
}

export default getDesignTokens;
