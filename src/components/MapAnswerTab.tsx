import { Button, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useGameContext } from '@/src/GameContext';
import { getDisplayString } from '@/src/utils';
import dynamic from 'next/dynamic';
import { City } from '@/src/gameTypes';

export default function MapAnswerTab() {
    const { gameState, submitMapAnswer, waitingForNextRound } = useGameContext();

    const correctAnswer = gameState?.currentRound?.correctAnswer.answer;
    const currentAnswer = gameState?.currentRound?.submission.answer;
    const answeredCorrectly = correctAnswer !== '' && correctAnswer === currentAnswer;
    const cannotAnswer = correctAnswer !== null && correctAnswer !== '';

    const [selectedMarker, setSelectedMarker] = useState<City | null>(null);

    useEffect(() => {
        setSelectedMarker(null);
    }, [gameState?.currentRoundNum]);

    const handleSubmit = () => {
        if (cannotAnswer || !gameState || !selectedMarker) return;

        submitMapAnswer(
            selectedMarker.displayName,
            selectedMarker.latitude,
            selectedMarker.longitude
        );
    };

    const Map = React.useMemo(
        () =>
            dynamic(() => import('./Map'), {
                loading: () => <p>A map is loading</p>,
                ssr: false,
            }),
        []
    );

    return (
        <Paper
            sx={{
                borderRadius: { xs: 0, md: 2 },
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
            }}
        >
            <Map
                selectedMarker={selectedMarker}
                guessedCorrectly={answeredCorrectly}
                setSelectedMarker={setSelectedMarker}
                correctAnswer={correctAnswer ? correctAnswer : null}
            />
            <Button
                sx={{ m: 1.5 }}
                variant="contained"
                onClick={handleSubmit}
                disabled={cannotAnswer || selectedMarker === null || waitingForNextRound}
            >
                {selectedMarker
                    ? <>Guess: &nbsp;{getDisplayString(selectedMarker.displayName, gameState?.gameType as string, true)}</>
                    : 'Select a city on the map'}
            </Button>
        </Paper>
    );
}
