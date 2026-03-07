import React from 'react';
import useSWR from 'swr';
import { Box, Skeleton, Typography } from '@mui/material';

export default function TextClueCard({ link }: { link: string }) {
    const { data, error } = useSWR(link, () => fetch(link).then(res => res.text()));

    if (error) return null;
    if (!data) return (
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="75%" />
            <Skeleton variant="text" width="85%" />
        </Box>
    );

    const paragraphs = data
        .split('\n')
        .filter(line => !line.includes('AI language') && !line.includes('language model'))
        .filter((line, i) => i !== 0 || line.length > 1);

    return (
        <Box sx={{ p: 2.5 }}>
            {paragraphs.map((line, i) =>
                line.trim().length === 0
                    ? <Box key={i} sx={{ height: '0.75em' }} />
                    : <Typography key={i} variant="body1" sx={{ lineHeight: 1.75 }}>{line}</Typography>
            )}
        </Box>
    );
}
