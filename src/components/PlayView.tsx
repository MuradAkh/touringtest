import { Box, Button, LinearProgress, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/router';
import { useGameContext } from '@/src/GameContext';
import React, { useEffect, useState } from 'react';
import { GameState } from '@/src/gameTypes';
import Clues from '@/src/components/Clues';
import Scoreboard from '@/src/components/Scoreboard';
import MapAnswerTab from '@/src/components/MapAnswerTab';
import RoundSummary from '@/src/components/RoundSummary';

function timerProgress(gameState: GameState, timeRemaining: number) {
    return Math.max(0, Math.min(100, (timeRemaining / gameState.roundTime) * 100));
}

function timerColor(progress: number): 'success' | 'warning' | 'error' {
    if (progress > 50) return 'success';
    if (progress > 20) return 'warning';
    return 'error';
}

export default function PlayView() {
    const router = useRouter();
    const { gameState, quitGame, waitingForNextRound, timeRemaining } = useGameContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (!gameState) router.push('/');
    }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-switch to result tab when round ends on mobile
    useEffect(() => {
        if (waitingForNextRound && isMobile) setActiveTab(1);
    }, [waitingForNextRound, isMobile]);

    // Reset to clues tab on new round
    useEffect(() => {
        setActiveTab(0);
    }, [gameState?.currentRoundNum]);

    if (!gameState) return null;
    if (gameState.complete) return <Scoreboard />;

    const progress = timerProgress(gameState, timeRemaining);
    const rightPanel = waitingForNextRound ? <RoundSummary /> : <MapAnswerTab />;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', bgcolor: 'background.default' }}>

            {/* Header — full width */}
            <Paper elevation={1} sx={{ borderRadius: 0, zIndex: 10, flexShrink: 0 }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center',
                    px: { xs: 2, md: 3 }, py: 1,
                    maxWidth: 1100, mx: 'auto', width: '100%',
                }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Round {gameState.currentRoundNum}
                        <Typography component="span" variant="caption" color="text.secondary">
                            {' '}/ {gameState.numRounds}
                        </Typography>
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" fontWeight="medium" sx={{ mr: 2 }}>
                        {gameState.players[0]?.score ?? 0} pts
                    </Typography>
                    <Button
                        variant="text" size="small"
                        sx={{ color: 'text.secondary', minWidth: 0 }}
                        onClick={() => { quitGame(); router.push('/'); }}
                    >
                        Quit
                    </Button>
                </Box>
                {!waitingForNextRound && (
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={timerColor(progress)}
                        sx={{ height: 3 }}
                    />
                )}
            </Paper>

            {/* Mobile: tab bar */}
            {isMobile && (
                <Paper elevation={0} sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                        <Tab label="Clues" />
                        <Tab label={waitingForNextRound ? 'Result' : 'Map'} />
                    </Tabs>
                </Paper>
            )}

            {/* Content */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                {isMobile ? (
                    /* Both panels always mounted so Leaflet always has real dimensions.
                       Inactive panel is hidden via opacity + pointerEvents, not display:none. */
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        {/* Clues tab */}
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            opacity: activeTab === 0 ? 1 : 0,
                            pointerEvents: activeTab === 0 ? 'auto' : 'none',
                            overflowY: 'auto', p: 1.5,
                        }}>
                            <Clues gameState={gameState} />
                        </Box>
                        {/* Map / Result tab */}
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            opacity: activeTab === 1 ? 1 : 0,
                            pointerEvents: activeTab === 1 ? 'auto' : 'none',
                            display: 'flex', flexDirection: 'column',
                        }}>
                            {rightPanel}
                        </Box>
                    </Box>
                ) : (
                    /* Desktop: side by side */
                    <Box sx={{
                        width: '100%',
                        maxWidth: 1100,
                        display: 'flex',
                        flexDirection: 'row',
                        p: 2,
                        gap: 2,
                        height: '100%',
                        overflow: 'hidden',
                    }}>
                        {/* Clues column */}
                        <Box sx={{
                            flex: '0 0 420px',
                            overflowY: 'auto',
                            minWidth: 0,
                            pr: 0.5,
                        }}>
                            <Clues gameState={gameState} />
                        </Box>

                        {/* Answer / Result panel */}
                        <Box sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: 0,
                        }}>
                            {rightPanel}
                        </Box>
                    </Box>
                )}
            </Box>

        </Box>
    );
}
