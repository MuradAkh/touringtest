import {
    Box,
    Button,
    Container,
    Input,
    InputAdornment,
    Slider,
    Typography,
} from '@mui/material';
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
        <Box maxWidth="lg">
            <Box display="flex" justifyContent="center" alignItems="center">
                <Typography variant="h2" component="h2" gutterBottom>
                    Play now
                </Typography>
            </Box>
            <Box sx={{ flexDirection: 'row', borderRadius: 1, display: 'flex', padding: '2vh' }}>
                <Container>
                    <Typography variant="body1">Round duration</Typography>
                    <Input
                        value={roundDuration}
                        margin="dense"
                        onChange={e => setRoundDuration(parseInt(e.target.value))}
                        endAdornment={<InputAdornment position="end">seconds</InputAdornment>}
                        inputProps={{ step: 5, min: 15, max: 90, type: 'number' }}
                    />
                    <Slider
                        size="medium"
                        defaultValue={30}
                        max={90}
                        min={15}
                        step={5}
                        value={roundDuration}
                        onChange={(_, v) => setRoundDuration(v as number)}
                        valueLabelDisplay="auto"
                    />
                </Container>
                <Container>
                    <Typography variant="body1">Rounds per game</Typography>
                    <Input
                        value={rounds}
                        margin="dense"
                        onChange={e => setRounds(parseInt(e.target.value))}
                        endAdornment={<InputAdornment position="end">rounds</InputAdornment>}
                        inputProps={{ step: 1, max: 30, min: 5, type: 'number' }}
                    />
                    <Slider
                        size="medium"
                        defaultValue={5}
                        max={30}
                        min={5}
                        value={rounds}
                        onChange={(_, v) => setRounds(v as number)}
                        valueLabelDisplay="auto"
                    />
                </Container>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: '2vh' }}>
                <Button variant="outlined" onClick={handleStart} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Start Game'}
                </Button>
            </Box>
        </Box>
    );
}
