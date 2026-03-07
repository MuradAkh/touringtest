import { Box } from '@mui/material';
import React from 'react';
import { GameState } from '@/src/gameTypes';
import ClueCard from '@/src/components/ClueCard';

type CluesProps = {
    gameState: GameState | null
}

export default function Clues({ gameState }: CluesProps) {
    const cards = gameState?.currentRound?.clues?.map((clue) => (
        <ClueCard key={clue.link} clue={clue} />
    ));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cards}
        </Box>
    );
}
