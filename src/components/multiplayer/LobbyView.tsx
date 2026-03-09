import { Box, Button, Chip, CircularProgress, Divider, Paper, Slider, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMultiplayerContext } from '@/src/MultiplayerContext';

function PlayerDot({ connected }: { connected: boolean }) {
    return (
        <Box
            sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: connected ? 'success.main' : 'text.disabled',
                flexShrink: 0,
            }}
        />
    );
}

export default function LobbyView() {
    const { mpState, roomId, startGame, disconnect } = useMultiplayerContext();
    const router = useRouter();
    const [roundTime, setRoundTime] = useState(30);
    const [numRounds, setNumRounds] = useState(5);
    const [isStarting, setIsStarting] = useState(false);

    if (!mpState) return null;

    const isHost = mpState.myId === mpState.hostId;
    const players = mpState.players;

    const handleStart = () => {
        setIsStarting(true);
        startGame(roundTime, numRounds);
    };

    return (
        <Box sx={{ maxWidth: 480, mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Room code */}
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Room code — share with friends
                </Typography>
                <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{ letterSpacing: '0.15em', fontFamily: 'monospace', color: 'primary.main' }}
                >
                    {roomId}
                </Typography>
            </Paper>

            {/* Player list */}
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5 }}>
                    Players ({players.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {players.map(p => (
                        <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PlayerDot connected={p.connected} />
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                {p.name}
                            </Typography>
                            {p.id === mpState.hostId && (
                                <Chip label="host" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                            )}
                        </Box>
                    ))}
                    {players.length === 0 && (
                        <Typography variant="body2" color="text.disabled">
                            Waiting for players to join…
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* Settings (host only) */}
            {isHost && (
                <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 2 }}>
                        Game settings
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">Round time</Typography>
                                <Typography variant="body2" color="text.secondary">{roundTime}s</Typography>
                            </Box>
                            <Slider
                                size="small" min={15} max={90} step={5}
                                value={roundTime} onChange={(_, v) => setRoundTime(v as number)}
                                marks={[{ value: 15, label: '15s' }, { value: 90, label: '90s' }]}
                            />
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">Rounds</Typography>
                                <Typography variant="body2" color="text.secondary">{numRounds}</Typography>
                            </Box>
                            <Slider
                                size="small" min={3} max={20} step={1}
                                value={numRounds} onChange={(_, v) => setNumRounds(v as number)}
                                marks={[{ value: 3, label: '3' }, { value: 20, label: '20' }]}
                            />
                        </Box>
                    </Box>

                    <Button
                        variant="contained" size="large" fullWidth
                        onClick={handleStart}
                        disabled={isStarting || players.length < 1}
                        sx={{ borderRadius: 2, py: 1.2, fontWeight: 600 }}
                    >
                        {isStarting
                            ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />Loading game…</>
                            : 'Start Game'}
                    </Button>
                </Paper>
            )}

            {!isHost && (
                <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, textAlign: 'center' }}>
                    <CircularProgress size={20} sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        Waiting for the host to start the game…
                    </Typography>
                </Paper>
            )}

            <Divider />

            <Button variant="text" size="small" color="inherit"
                onClick={() => { disconnect(); router.push('/'); }}
                sx={{ color: 'text.disabled', alignSelf: 'center' }}>
                Leave room
            </Button>
        </Box>
    );
}
