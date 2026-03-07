import { Clue } from '@/src/gameTypes';
import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import ImageClueCard from '@/src/components/ImageClueCard';
import TextClueCard from '@/src/components/TextClueCard';

const CLUE_META: Record<string, { label: string; accent: string; italic?: boolean }> = {
    painting:    { label: 'Painting',       accent: '#a855f7' },
    poem:        { label: 'Poem',           accent: '#6366f1', italic: true },
    haiku:       { label: 'Haiku',          accent: '#8b5cf6', italic: true },
    song:        { label: 'Song',           accent: '#ec4899', italic: true },
    blog:        { label: 'Travel Blog',    accent: '#0891b2' },
    description: { label: 'Description',   accent: '#0284c7' },
    funfact:     { label: 'Fun Fact',       accent: '#f59e0b' },
    food:        { label: 'Local Cuisine',  accent: '#16a34a' },
};

const DEFAULT_META = { label: 'Clue', accent: '#64748b', italic: false };

type ClueCardProps = { clue: Clue | null }

export default function ClueCard({ clue }: ClueCardProps) {
    if (!clue) return null;

    const meta = CLUE_META[clue.clueType] ?? { ...DEFAULT_META, label: clue.clueType };
    const isImage = clue.clueClass === 'image';

    if (isImage) {
        return (
            <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ position: 'relative' }}>
                    <ImageClueCard link={clue.link} />
                    {/* Label badge overlaid on bottom of image */}
                    <Box sx={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
                        px: 1.5, py: 1.5, display: 'flex', alignItems: 'flex-end',
                    }}>
                        <Typography variant="caption" sx={{
                            color: 'white', fontWeight: 600, letterSpacing: '0.08em',
                            textTransform: 'uppercase', fontSize: '0.65rem',
                        }}>
                            {meta.label}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper elevation={0} variant="outlined" sx={{
            borderRadius: 2,
            overflow: 'hidden',
            borderLeft: `4px solid ${meta.accent}`,
        }}>
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: meta.accent, flexShrink: 0 }} />
                <Typography variant="caption" sx={{
                    color: meta.accent, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.65rem',
                }}>
                    {meta.label}
                </Typography>
            </Box>
            <TextClueCard link={clue.link} italic={meta.italic} />
        </Paper>
    );
}
