import { Box, Button, Container, Link, Paper, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import MatchPicker from '@/src/components/MatchPicker';
import NextLink from 'next/link';

type TextItem = { kind: 'text'; label: string; accent: string; italic: boolean; lines: string[] };
type ImageItem = { kind: 'image'; label: string; accent: string; src: string };
type PreviewItem = TextItem | ImageItem;

const POOL_1: PreviewItem[] = [
    { kind: 'text', label: 'Haiku', accent: '#8b5cf6', italic: true, lines: ['Orange sun sets low,', 'Sipping mint tea in the souk,', 'Spice markets aglow.'] },
    { kind: 'image', label: 'Painting', accent: '#a855f7', src: '/promo_images/painting1-1857910-Kyoto-Japan.png' },
    { kind: 'text', label: 'Haiku', accent: '#8b5cf6', italic: true, lines: ['Motorbikes speed by,', 'The smell of pho fills the air,', 'A city awakes.'] },
    { kind: 'image', label: 'Painting', accent: '#a855f7', src: '/promo_images/painting1-611717-Tbilisi-Georgia.png' },
    { kind: 'text', label: 'Haiku', accent: '#8b5cf6', italic: true, lines: ['City of leather,', 'Tanneries by the riverbank,', 'A heartbeat strong.'] },
    { kind: 'image', label: 'Painting', accent: '#a855f7', src: '/promo_images/painting1-281184-Jerusalem-Israel.png' },
    { kind: 'text', label: 'Poem', accent: '#6366f1', italic: true, lines: ['Golden bridge spans the bay,', 'Fog creeping in day by day,', 'Cable cars and ocean breeze,', 'A city of dreams.'] },
];

const POOL_2: PreviewItem[] = [
    { kind: 'text', label: 'Travel Blog', accent: '#0891b2', italic: false, lines: ["As I walked through the bustling streets, I couldn't help but feel captivated by the city's rich cultural heritage. Labyrinthine alleys wind between grand mosques and a bazaar scene that goes on long into the night."] },
    { kind: 'image', label: 'Painting', accent: '#a855f7', src: '/promo_images/painting1-113646-Tabriz-Iran.png' },
    { kind: 'text', label: 'Travel Blog', accent: '#0891b2', italic: false, lines: ['Steeped in history and located on the Horn of Africa, this city has been an important center of trade for centuries. A place rich in tradition, character, and a surprising beauty that catches every visitor off guard.'] },
    { kind: 'image', label: 'Painting', accent: '#a855f7', src: '/promo_images/painting1-3181928-Bologna-Italy.png' },
    { kind: 'text', label: 'Travel Blog', accent: '#0891b2', italic: false, lines: ['The city boasts a unique mix of architectural styles — from medieval fortress walls to ornate Art Nouveau buildings — nestled in picturesque mountain valleys, blending old-world charm with modern sophistication.'] },
    { kind: 'image', label: 'Painting', accent: '#a855f7', src: '/promo_images/painting1-2803138-Antwerpen-Belgium.png' },
    { kind: 'text', label: 'Description', accent: '#0284c7', italic: false, lines: ['A historic city known for its ancient ruins and iconic landmarks. A bustling metropolis and one of the largest cities on its continent, where marble temples stand just above the modern streets.'] },
];

const POOL_3: PreviewItem[] = [
    { kind: 'text', label: 'Fun Fact', accent: '#f59e0b', italic: false, lines: ['This city has over 2,000 public parks and gardens, making it one of the greenest urban centres in the world.'] },
    { kind: 'image', label: 'Painting', accent: '#a855f7', src: '/promo_images/painting1-360995-Giza-Egypt.png' },
    { kind: 'text', label: 'Fun Fact', accent: '#f59e0b', italic: false, lines: ['Home to the world\'s largest man-made forest — covering 78,000 acres with over 3 million trees planted within the city limits.'] },
    { kind: 'image', label: 'Painting', accent: '#a855f7', src: '/promo_images/painting1-6325494-Québec_City-Canada.png' },
    { kind: 'text', label: 'Local Cuisine', accent: '#16a34a', italic: false, lines: ['One of the most beloved local dishes is a slow-cooked meat stew simmered in a flavorful broth with a blend of spices — then served in the same earthenware pot it was cooked in.'] },
    { kind: 'image', label: 'Painting', accent: '#a855f7', src: '/promo_images/painting1-71137-Sanaa-Yemen.png' },
    { kind: 'text', label: 'Fun Fact', accent: '#f59e0b', italic: false, lines: ['This city sits at one of the highest elevations of any capital in the world — over 6,000 feet above sea level — yet remains one of the most densely populated on the continent.'] },
];

type Phase = 'idle' | 'init' | 'slide';

function ItemContent({ item }: { item: PreviewItem }) {
    if (item.kind === 'image') {
        return (
            <Box
                component="img"
                src={item.src}
                alt={item.label}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
        );
    }
    return (
        <>
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: item.accent, flexShrink: 0 }} />
                <Typography variant="caption" sx={{
                    color: item.accent, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.62rem',
                }}>
                    {item.label}
                </Typography>
            </Box>
            <Box sx={{ px: 2, pt: 0.5, pb: 2 }}>
                {item.lines.map((line, i) => (
                    <Typography key={i} variant="body2" sx={{
                        lineHeight: 1.85,
                        fontStyle: item.italic ? 'italic' : 'normal',
                        fontSize: '0.88rem',
                        color: 'text.secondary',
                    }}>
                        {line}
                    </Typography>
                ))}
            </Box>
        </>
    );
}

const EASING = '0.55s cubic-bezier(0.4,0,0.2,1)';

function CyclingPreviewCard({ items, initialDelay = 0 }: { items: PreviewItem[]; initialDelay?: number }) {
    const [curr, setCurr] = useState(0);
    const [next, setNext] = useState<number | null>(null);
    const [phase, setPhase] = useState<Phase>('idle');
    const isFirst = useRef(true);

    // Randomise starting card after hydration
    useEffect(() => {
        setCurr(Math.floor(Math.random() * items.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Trigger transition cycle
    useEffect(() => {
        if (phase !== 'idle') return;
        const delay = isFirst.current ? initialDelay : 5000;
        isFirst.current = false;

        const t = setTimeout(() => {
            const nextIdx = (curr + 1) % items.length;
            setNext(nextIdx);
            setPhase('init');
            // Two rAF to ensure next item is painted offscreen before we slide
            requestAnimationFrame(() => requestAnimationFrame(() => setPhase('slide')));
        }, delay);

        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curr, phase]);

    // Finalise after slide completes
    useEffect(() => {
        if (phase !== 'slide') return;
        const t = setTimeout(() => {
            if (next !== null) setCurr(next);
            setNext(null);
            setPhase('idle');
        }, 600);
        return () => clearTimeout(t);
    }, [phase, next]);

    const accent = items[curr].kind === 'image' ? '#a855f7' : (items[curr] as TextItem).accent;

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '1 / 1',
                borderLeft: `4px solid ${accent}`,
                transition: `border-color ${EASING}`,
            }}
        >
            {/* Current item — slides out upward */}
            <Box sx={{
                transform: phase === 'slide' ? 'translateY(-110%)' : 'translateY(0)',
                transition: phase === 'slide' ? `transform ${EASING}` : 'none',
            }}>
                <ItemContent item={items[curr]} />
            </Box>

            {/* Next item — slides in from below */}
            {next !== null && (
                <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    transform: phase === 'slide' ? 'translateY(0)' : 'translateY(110%)',
                    transition: phase === 'slide' ? `transform ${EASING}` : 'none',
                }}>
                    <ItemContent item={items[next]} />
                </Box>
            )}
        </Paper>
    );
}

export default function Home() {
    return (
        <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            <Container maxWidth="md" sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                py: 6,
                gap: 5,
            }}>

                {/* Hero */}
                <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                        <img width="72" src="./icon.svg" alt="Touring Test" />
                        <Typography variant="h2" fontWeight="bold" component="h1" letterSpacing="-1px">
                            Touring Test
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}>
                        Each round you get clues — a poem, a travel blog, a painting — all AI-generated.
                        Your job: figure out which city they describe.
                    </Typography>
                </Box>

                {/* Cycling preview cards */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 2,
                    alignItems: 'start',
                }}>
                    <CyclingPreviewCard items={POOL_1} initialDelay={800} />
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <CyclingPreviewCard items={POOL_2} initialDelay={2500} />
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <CyclingPreviewCard items={POOL_3} initialDelay={1500} />
                    </Box>
                </Box>

                {/* Settings */}
                <Box sx={{ maxWidth: 500, mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <MatchPicker />
                    <Button
                        component={NextLink}
                        href="/multiplayer"
                        variant="outlined"
                        size="large"
                        fullWidth
                        sx={{ borderRadius: 2, py: 1.2, fontWeight: 600 }}
                    >
                        Multiplayer — play with friends
                    </Button>
                </Box>

                {/* Footer */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.disabled" display="block" sx={{ lineHeight: 1.9 }}>
                        Content is AI-generated and does not represent the views of the developers.
                    </Typography>
                    <Typography variant="caption" color="text.disabled" display="block">
                        <Link href="https://forms.gle/pRzengd38bAUTUm1A" color="inherit" underline="hover">Report content</Link>
                        {' · '}
                        <Link href="https://forms.gle/YVkdQ7p16r48XJcP8" color="inherit" underline="hover">Send feedback</Link>
                    </Typography>
                    <Typography variant="caption" color="text.disabled" display="block">
                        Project by <Link href="https://mur.ad" color="inherit" underline="hover">mur.ad</Link>
                    </Typography>
                </Box>

            </Container>
        </Box>
    );
}
