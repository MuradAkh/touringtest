import { Box, Container, Typography } from '@mui/material';
import FlipCard from '@/src/components/FlipCard';
import React, { useEffect } from 'react';
import MatchPicker from '@/src/components/MatchPicker';

export default function Home() {
    const [cards, setCards] = React.useState<JSX.Element[]>([]);

    useEffect(() => {
        const aspectRatio = window.innerWidth / window.innerHeight;
        const numberOfCards = Math.min(Math.floor(aspectRatio * 2.8), 4);
        const newCards: JSX.Element[] = [];
        for (let i = 0; i < numberOfCards; i++) {
            newCards.push(<FlipCard key={i} />);
        }
        setCards(newCards);
    }, []);

    return (
        <Container maxWidth="lg">
            <Box
                sx={{
                    my: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h1" component="h1" gutterBottom>
                    Touring<img width="100" src="./icon.png" alt="icon" />Test
                </Typography>
                <Typography variant="h4" component="h1" gutterBottom>
                    Guess the city based on literature and art created using generative AI.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    {cards}
                </Box>
                <MatchPicker />
                <hr />
                <Typography variant="body2" sx={{ color: 'gray' }}>
                    The content in this game is AI-generated and does not represent the views of the developers.
                </Typography>
                <Typography variant="body2" sx={{ color: 'gray' }}>
                    If you believe that some of the content is offensive, inappropriate, factually incorrect, or
                    otherwise lacking in quality please report it{' '}
                    <a href="https://forms.gle/pRzengd38bAUTUm1A">here</a>.
                </Typography>
                <Typography variant="body2" sx={{ color: 'gray' }}>
                    If you have general feedback, questions, or suggestions, please submit them{' '}
                    <a href="https://forms.gle/YVkdQ7p16r48XJcP8">here</a>.
                </Typography>
            </Box>
        </Container>
    );
}
