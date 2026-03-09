import { Box, Button, Chip, CircularProgress, Divider, Paper, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMultiplayerContext } from '@/src/MultiplayerContext';

function randomRoomId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function MultiplayerSetup() {
    const { join, isConnecting } = useMultiplayerContext();
    const router = useRouter();
    const [name, setName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!name.trim()) { setError('Enter your name'); return; }
        join(randomRoomId(), name.trim());
    };

    const handleJoin = () => {
        if (!name.trim()) { setError('Enter your name'); return; }
        const code = joinCode.trim().toUpperCase();
        if (code.length < 4) { setError('Enter a valid room code'); return; }
        join(code, name.trim());
    };

    return (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, maxWidth: 420, mx: 'auto', width: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Multiplayer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Play with friends on the same network — or anywhere with internet.
            </Typography>

            <TextField
                label="Your name"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                fullWidth
                size="small"
                inputProps={{ maxLength: 20 }}
                sx={{ mb: 2 }}
                error={!!error && !name.trim()}
                helperText={!name.trim() && error ? error : ''}
            />

            <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCreate}
                disabled={isConnecting}
                sx={{ borderRadius: 2, py: 1.2, fontWeight: 600, mb: 2 }}
            >
                {isConnecting ? <CircularProgress size={22} color="inherit" /> : 'Create Room'}
            </Button>

            <Divider sx={{ my: 2 }}>
                <Chip label="or join existing" size="small" />
            </Divider>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    label="Room code"
                    value={joinCode}
                    onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    size="small"
                    inputProps={{ maxLength: 8, style: { letterSpacing: '0.15em', fontFamily: 'monospace' } }}
                    sx={{ flex: 1 }}
                    error={!!error && !!name.trim()}
                    helperText={name.trim() && error ? error : ''}
                />
                <Button
                    variant="outlined"
                    onClick={handleJoin}
                    disabled={isConnecting}
                    sx={{ borderRadius: 2, fontWeight: 600, flexShrink: 0 }}
                >
                    Join
                </Button>
            </Box>

            <Button
                variant="text" size="small" fullWidth
                onClick={() => router.push('/')}
                sx={{ mt: 2, color: 'text.disabled' }}
            >
                Back to main menu
            </Button>
        </Paper>
    );
}
