import { GameState, Scoreboard } from '@/src/gameTypes';
import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';
import { useGameContext } from '@/src/GameContext';

function getGuessEmoji(score: number, correct: boolean) {
    if (correct) return '🟢';
    if (score > 700) return '🟡';
    if (score > 0) return '🟠';
    return '🔴';
}

function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode.toUpperCase().split('').map(c => c.charCodeAt(0) + 127397);
    return String.fromCodePoint(...codePoints);
}

function buildShareText(scoreboard: Scoreboard, state: GameState): string {
    const row = scoreboard.playerRows[0];
    const emojis = scoreboard.roundTitles
        .map((title, i) => {
            const iso2 = title.split(':::')[1];
            return getFlagEmoji(iso2) + getGuessEmoji(row.roundScores[i], row.roundGuesses[i] === title);
        })
        .slice(0, 10)
        .join(' ');

    return [
        '#TouringTest',
        `Score: ${row.totalScore} / ${state.numRounds * 1000}`,
        emojis,
        window.location.origin,
    ].join('\n');
}

export default function Shareable() {
    const { gameState } = useGameContext();
    const board = gameState?.scoreboard;
    const [copied, setCopied] = React.useState(false);

    if (!gameState || !board) return null;

    const shareText = buildShareText(board, gameState);
    const row = board.playerRows[0];
    const emojis = board.roundTitles
        .map((title, i) => {
            const iso2 = title.split(':::')[1];
            return getFlagEmoji(iso2) + getGuessEmoji(row.roundScores[i], row.roundGuesses[i] === title);
        })
        .slice(0, 10)
        .join(' ');

    const handleCopy = () => {
        navigator.clipboard.writeText(shareText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const tweetUrl =
        'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);

    return (
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Share your result
            </Typography>
            <Box
                sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    p: 1.5,
                    mb: 2,
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8,
                }}
            >
                <div>#TouringTest</div>
                <div>Score: {row.totalScore} / {gameState.numRounds * 1000}</div>
                <div>{emojis}</div>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    href={tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Tweet
                </Button>
            </Box>
        </Paper>
    );
}
