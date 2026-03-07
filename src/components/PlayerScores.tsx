import { Container, Paper, Typography } from '@mui/material';
import React from 'react';
import { useGameContext } from '@/src/GameContext';

export default function PlayerScores() {
    const { gameState } = useGameContext();

    const scoreCards = gameState?.players
        .slice()
        .sort((a, b) => b.score - a.score)
        .map(player => (
            <Typography variant="h5" key={player.id} sx={{ paddingX: '1vh' }}>
                {player.name + ': '} <strong>{player.score}</strong>
            </Typography>
        ));

    return (
        <Paper sx={{ borderRadius: 0, marginBottom: '3vh' }}>
            <Container sx={{ padding: '1vh', display: 'flex', flexWrap: 'wrap', flexDirection: 'column' }}>
                {scoreCards}
            </Container>
        </Paper>
    );
}
