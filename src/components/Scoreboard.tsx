import React from 'react';
import { Box, Button, Chip, Container, Divider, Paper, Typography } from '@mui/material';
import { useGameContext } from '@/src/GameContext';
import { useRouter } from 'next/router';
import { getDisplayString } from '@/src/utils';
import Shareable from '@/src/components/Shareable';

function getRoundResult(score: number, guess: string, correctTitle: string, mapMode: boolean) {
    const missed = guess === '';
    if (missed) return { label: 'Missed', color: '#ef5350' as const, emoji: '❌' };
    if (guess === correctTitle) return { label: 'Correct', color: '#66bb6a' as const, emoji: '✅' };
    if (mapMode && score > 700) return { label: 'Close', color: '#ffa726' as const, emoji: '🟡' };
    if (mapMode && score > 0) return { label: 'Far', color: '#ef5350' as const, emoji: '🟠' };
    return { label: 'Wrong', color: '#ef5350' as const, emoji: '❌' };
}

export default function Scoreboard() {
    const { gameState, quitGame } = useGameContext();
    const board = gameState?.scoreboard;
    const mapMode = gameState?.answerType === 'map';
    const router = useRouter();

    if (!board || !gameState) return <div />;

    const handlePlayAgain = () => {
        quitGame();
        router.push('/');
    };

    const row = board.playerRows[0];
    const maxScore = gameState.numRounds * 1000;

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            {/* Summary */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center', borderRadius: 3, position: 'relative' }}>
                <Button
                    variant="outlined"
                    onClick={handlePlayAgain}
                    sx={{ position: 'absolute', top: 12, right: 12 }}
                >
                    Play Again
                </Button>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Game Over
                </Typography>
                <Typography variant="h2" fontWeight="bold" color="primary">
                    {row.totalScore}
                    <Typography component="span" variant="h5" color="text.secondary">
                        {' '}/ {maxScore}
                    </Typography>
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                    {row.correctGuesses} / {gameState.numRounds} correct
                </Typography>
            </Paper>

            {/* Round list */}
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {board.roundTitles.map((title, i) => {
                    const score = row.roundScores[i];
                    const guess = row.roundGuesses[i];
                    const result = getRoundResult(score, guess, title, mapMode);
                    const wrongGuess = guess !== '' && guess !== title;

                    return (
                        <React.Fragment key={i}>
                            {i > 0 && <Divider />}
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.5, gap: 1.5 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24 }}>
                                    {i + 1}
                                </Typography>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="body1" fontWeight="medium" noWrap>
                                        {getDisplayString(title, 'geo', true)}
                                    </Typography>
                                    {wrongGuess && (
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            You guessed: {getDisplayString(guess, 'geo', false)}
                                        </Typography>
                                    )}
                                </Box>
                                <Chip
                                    label={result.emoji + ' ' + result.label}
                                    size="small"
                                    sx={{ bgcolor: result.color + '22', color: result.color, fontWeight: 'bold', border: `1px solid ${result.color}44` }}
                                />
                                <Typography variant="body1" fontWeight="bold" sx={{ minWidth: 48, textAlign: 'right' }}>
                                    +{score}
                                </Typography>
                            </Box>
                        </React.Fragment>
                    );
                })}
            </Paper>

            <Box sx={{ mt: 3 }}>
                <Shareable />
            </Box>
        </Container>
    );
}
