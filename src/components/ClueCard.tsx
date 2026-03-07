import { Clue } from '@/src/gameTypes';
import { Box, Chip, Paper } from '@mui/material';
import React from 'react';
import ImageClueCard from '@/src/components/ImageClueCard';
import TextClueCard from '@/src/components/TextClueCard';

const CLUE_TYPE_LABELS: Record<string, string> = {
    painting:    'Painting',
    blog:        'Travel Blog',
    poem:        'Poem',
    haiku:       'Haiku',
    description: 'Description',
    funfact:     'Fun Fact',
    food:        'Local Cuisine',
    song:        'Song',
};

type ClueCardProps = {
    clue: Clue | null
}

export default function ClueCard({ clue }: ClueCardProps) {
    if (!clue) return null;

    const label = CLUE_TYPE_LABELS[clue.clueType] ?? clue.clueType;
    const isImage = clue.clueClass === 'image';

    return (
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {isImage
                ? <ImageClueCard link={clue.link} />
                : (
                    <Box>
                        <Box sx={{ px: 2, pt: 1.5 }}>
                            <Chip label={label} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        </Box>
                        <TextClueCard link={clue.link} />
                    </Box>
                )
            }
            {isImage && (
                <Box sx={{ px: 2, py: 1 }}>
                    <Chip label={label} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                </Box>
            )}
        </Paper>
    );
}
