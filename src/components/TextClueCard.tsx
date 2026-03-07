import React from 'react';
import useSWR from 'swr';
import { Box, Skeleton, Typography } from '@mui/material';

type Props = { link: string; italic?: boolean }

export default function TextClueCard({ link, italic }: Props) {
    const { data, error } = useSWR(link, () => fetch(link).then(res => res.text()));

    if (error) return null;
    if (!data) return (
        <Box sx={{ px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            <Skeleton variant="text" width="92%" />
            <Skeleton variant="text" width="78%" />
            <Skeleton variant="text" width="86%" />
            <Skeleton variant="text" width="70%" />
        </Box>
    );

    const lines = data
        .split('\n')
        .filter(line => !line.includes('AI language') && !line.includes('language model'))
        .filter((line, i) => i !== 0 || line.length > 1);

    return (
        <Box sx={{ px: 2, pt: 1, pb: 2 }}>
            {lines.map((line, i) =>
                line.trim().length === 0
                    ? <Box key={i} sx={{ height: '0.6em' }} />
                    : (
                        <Typography key={i} variant="body2" sx={{
                            lineHeight: 1.85,
                            fontStyle: italic ? 'italic' : 'normal',
                            fontSize: '0.92rem',
                            color: 'text.primary',
                        }}>
                            {line}
                        </Typography>
                    )
            )}
        </Box>
    );
}
