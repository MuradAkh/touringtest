import { Box, Button, Paper, Slider, Typography } from '@mui/material';
import React from 'react';
import { useGameContext } from '@/src/GameContext';
import { useRouter } from 'next/router';

export default function MatchPicker() {
    const [roundDuration, setRoundDuration] = React.useState(30);
    const [rounds, setRounds] = React.useState(5);
    const { startGame, isLoading } = useGameContext();
    const router = useRouter();

    const handleStart = () => {
        startGame('map', roundDuration, rounds)
            .then(() => router.push('/play'))
            .catch(console.error);
    };

    return (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Round time */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">Round time</Typography>
                        <Typography variant="body2" color="text.secondary">{roundDuration}s</Typography>
                    </Box>
                    <Slider
                        size="small"
                        min={15} max={90} step={5}
                        value={roundDuration}
                        onChange={(_, v) => setRoundDuration(v as number)}
                        marks={[
                            { value: 15, label: '15s' },
                            { value: 90, label: '90s' },
                        ]}
                    />
                </Box>

                {/* Rounds */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">Rounds</Typography>
                        <Typography variant="body2" color="text.secondary">{rounds}</Typography>
                    </Box>
                    <Slider
                        size="small"
                        min={5} max={30} step={1}
                        value={rounds}
                        onChange={(_, v) => setRounds(v as number)}
                        marks={[
                            { value: 5, label: '5' },
                            { value: 30, label: '30' },
                        ]}
                    />
                </Box>
            </Box>

            <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleStart}
                disabled={isLoading}
                sx={{ borderRadius: 2, py: 1.2, fontWeight: 600 }}
            >
                {isLoading ? 'Loading…' : 'Start Game'}
            </Button>
        </Paper>
    );
}
