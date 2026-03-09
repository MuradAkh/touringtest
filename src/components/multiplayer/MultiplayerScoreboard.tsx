import React from 'react';
import { Box, Button, Chip, Container, Divider, Paper, Typography } from '@mui/material';
import { useMultiplayerContext } from '@/src/MultiplayerContext';
import { getDisplayString } from '@/src/utils';

function getRoundResult(guess: string, title: string, score: number) {
    if (!guess) return { label: 'Missed', color: '#9e9e9e', emoji: String.fromCodePoint(0x274C) };
    if (guess === title) return { label: 'Correct', color: '#66bb6a', emoji: String.fromCodePoint(0x2705) };
    if (score > 700) return { label: 'Country', color: '#ffa726', emoji: String.fromCodePoint(0x1F7E1) };
    return { label: 'Wrong', color: '#ef5350', emoji: String.fromCodePoint(0x274C) };
}

export default function MultiplayerScoreboard() {
    const { mpState, disconnect, returnToLobby } = useMultiplayerContext();
    if (!mpState?.scoreboard) return null;

    const isHost = mpState.myId === mpState.hostId;

    const { scoreboard } = mpState;
    const maxScore = mpState.numRounds * 1000;
    const sortedRows = [...scoreboard.playerRows].sort((a, b) => b.totalScore - a.totalScore);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>

            {/* Final standings */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h4" fontWeight="bold">Game Over</Typography>
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 1.5, mb: 3 }}>
                    {isHost ? (
                        <Button variant="contained" onClick={returnToLobby}>
                            Play Again
                        </Button>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                            Waiting for host to start a new game…
                        </Typography>
                    )}
                    <Button variant="outlined" onClick={disconnect}>
                        Leave
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {sortedRows.map((row, i) => (
                        <Box key={row.playerId} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1, borderRadius: 2,
                            bgcolor: row.playerId === mpState.myId ? 'primary.main' + '18' : 'transparent',
                        }}>
                            <Typography sx={{ minWidth: 32, fontSize: '1.3rem' }}>
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                            </Typography>
                            <Typography variant="body1" fontWeight={row.playerId === mpState.myId ? 'bold' : 'normal'} sx={{ flexGrow: 1, textAlign: 'left' }}>
                                {row.playerName}
                                {row.playerId === mpState.myId && (
                                    <Typography component="span" variant="caption" color="text.secondary"> (you)</Typography>
                                )}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                {row.totalScore}
                                <Typography component="span" variant="caption" color="text.secondary">
                                    {' '}/ {maxScore}
                                </Typography>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
                                {row.correctGuesses} / {mpState.numRounds} correct
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>

            {/* Round-by-round for all players */}
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {scoreboard.roundTitles.map((title, roundIdx) => (
                    <React.Fragment key={roundIdx}>
                        {roundIdx > 0 && <Divider />}

                        {/* City header */}
                        <Box sx={{ px: 2.5, py: 1.25, bgcolor: 'background.default', display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24 }}>
                                {roundIdx + 1}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {getDisplayString(title, 'geo', true)}
                            </Typography>
                        </Box>

                        {/* Each player's result for this round */}
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {sortedRows.map(row => {
                                const score = row.roundScores[roundIdx];
                                const guess = row.roundGuesses[roundIdx];
                                const result = getRoundResult(guess, title, score);
                                return (
                                    <Box key={row.playerId} sx={{
                                        display: 'flex', alignItems: 'center',
                                        px: 2.5, py: 1, gap: 1.5,
                                        bgcolor: row.playerId === mpState.myId ? 'primary.main' + '08' : 'transparent',
                                    }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={row.playerId === mpState.myId ? 'bold' : 'normal'}
                                            sx={{ minWidth: 100, flexShrink: 0 }}
                                            noWrap
                                        >
                                            {row.playerName}
                                        </Typography>

                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            {guess && (
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {getDisplayString(guess, 'geo', true)}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Chip
                                            label={result.emoji + ' ' + result.label}
                                            size="small"
                                            sx={{
                                                bgcolor: result.color + '22',
                                                color: result.color,
                                                fontWeight: 'bold',
                                                border: `1px solid ${result.color}44`,
                                                flexShrink: 0,
                                            }}
                                        />
                                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 48, textAlign: 'right', flexShrink: 0 }}>
                                            +{score}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </React.Fragment>
                ))}
            </Paper>

        </Container>
    );
}
