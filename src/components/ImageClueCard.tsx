import React from 'react';
import { Box } from '@mui/material';

export default function ImageClueCard({ link }: { link: string }) {
    return (
        <Box
            component="img"
            src={link}
            alt=""
            sx={{
                display: 'block',
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
            }}
        />
    );
}
