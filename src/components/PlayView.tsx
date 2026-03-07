import { Box, Button, LinearProgress, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useGameContext } from '@/src/GameContext';
import React, { useEffect } from 'react';
import { GameState } from '@/src/gameTypes';
import Clues from '@/src/components/Clues';
import Scoreboard from '@/src/components/Scoreboard';
import { ps } from '@/src/utils';
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

    useEffect(() => {
        if (!gameState) router.push('/');
    }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!gameState) return null;
    if (gameState.complete) return <Scoreboard />;

    const progress = timerProgress(gameState, timeRemaining);
    const rightPanel = waitingForNextRound ? <RoundSummary /> : <MapAnswerTab />;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ borderRadius: 0, zIndex: 10, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 1.5, gap: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 120 }}>
                        Round {gameState.currentRoundNum}
                        <Typography component="span" variant="body2" color="text.secondary">
                            {' '}/ {gameState.numRounds}
                        </Typography>
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    <Typography variant="body1" fontWeight="medium">
                        {gameState.players[0]?.score ?? 0} pts
                    </Typography>

                    <Button
                        variant="text"
                        color="inherit"
                        size="small"
                        sx={{ color: 'text.secondary' }}
                        onClick={() => { quitGame(); router.push('/'); }}
                    >
                        Quit
                    </Button>
                </Box>

                {/* Timer bar — hidden when round is over */}
                {!waitingForNextRound && (
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={timerColor(progress)}
                        sx={{ height: 4 }}
                    />
                )}
            </Paper>

            {/* Main content */}
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: ps('row', 'column'),
                overflow: 'hidden',
                p: 2,
                gap: 2,
            }}>
                {/* Clues */}
                <Box sx={{
                    flex: ps('0 0 440px', '1'),
                    overflowY: 'auto',
                    minWidth: 0,
                }}>
                    <Clues gameState={gameState} />
                </Box>

                {/* Answer / Result panel */}
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    minHeight: ps(0, '60vh'),
                }}>
                    {rightPanel}
                </Box>
            </Box>
        </Box>
    );
}
