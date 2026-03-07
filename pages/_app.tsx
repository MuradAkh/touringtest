import * as React from 'react';
import { useEffect } from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../src/createEmotionCache';
import { GameContextProvider } from '@/src/GameContext';
import { getDesignTokens, getThemedComponents } from '@/src/theme';
import { deepmerge } from '@mui/utils';
import '@/styles/globals.css';
import * as ga from '../lib/ga';
import { DM_Sans, Playfair_Display } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap', weight: ['400', '500', '700'] });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-heading', weight: ['700'], display: 'swap' });

const designTokens = getDesignTokens('light');
let newTheme = createTheme(designTokens);
newTheme = deepmerge(newTheme, getThemedComponents(newTheme));

const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
    const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
    const router = props.router;

    useEffect(() => {
        const handleRouteChange = (url: any) => { ga.pageview(url); };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => { router.events.off('routeChangeComplete', handleRouteChange); };
    }, [router.events]);

    return (
        <CacheProvider value={emotionCache}>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <title>Touring Test - Guess the city from AI generated literature & art</title>
                <meta
                    name="description"
                    content="Touring Test is a geography quiz game with high quality content created by generative AI. Guess the city based on paintings, poems, travel blogs, description of food, and more!"
                />
            </Head>
            <div className={`${dmSans.variable} ${playfair.variable}`}>
                <ThemeProvider theme={newTheme}>
                    <CssBaseline />
                    <GameContextProvider>
                        <Component {...pageProps} />
                    </GameContextProvider>
                </ThemeProvider>
            </div>
        </CacheProvider>
    );
}
