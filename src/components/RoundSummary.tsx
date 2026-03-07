import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { useGameContext } from '@/src/GameContext';
import { getDisplayString } from '@/src/utils';

export default function RoundSummary() {
    const { gameState, nextRound } = useGameContext();
    if (!gameState) return null;

    const { currentRound, currentRoundNum, numRounds } = gameState;
    const { submission, correctAnswer } = currentRound;

    const isLastRound = currentRoundNum === numRounds;
    const missed = submission.guessResult === 'notGuessed';
    const correct = submission.guessResult === 'correct';
    const partCorrect = submission.guessResult === 'partCorrect';

    let resultEmoji = String.fromCodePoint(0x274C); // ❌
    let resultLabel = 'Wrong';
    let resultColor = '#ef5350';
    if (missed)      { resultEmoji = String.fromCodePoint(0x23F3); resultLabel = "Time's up"; resultColor = '#9e9e9e'; } // ⏱️
    else if (correct)     { resultEmoji = String.fromCodePoint(0x2705); resultLabel = 'Correct!';     resultColor = '#66bb6a'; } // ✅
    else if (partCorrect) { resultEmoji = String.fromCodePoint(0x1F7E1); resultLabel = 'Right country'; resultColor = '#ffa726'; } // 🟡

    const totalScore = gameState.players[0]?.score ?? 0;

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                borderRadius: { xs: 0, md: 2 },
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                p: { xs: 3, md: 4 },
                gap: 1,
            }}
        >
            <Typography fontSize="3rem" lineHeight={1}>{resultEmoji}</Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: resultColor }}>
                {resultLabel}
            </Typography>

            <Divider sx={{ width: '60%', my: 1 }} />

            <Typography variant="body2" color="text.secondary">The answer was</Typography>
            <Typography variant="h5" fontWeight="bold">
                {getDisplayString(correctAnswer.answer, 'geo', true)}
            </Typography>

            {!missed && !correct && submission.answer && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    You guessed: {getDisplayString(submission.answer, 'geo', true)}
                </Typography>
            )}

            <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    +{submission.score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Total: {totalScore} pts
                </Typography>
            </Box>

            <Button variant="contained" size="large" sx={{ mt: 1, minWidth: 180 }} onClick={nextRound}>
                {isLastRound ? 'See Results' : 'Next Round →'}
            </Button>
        </Paper>
    );
}
