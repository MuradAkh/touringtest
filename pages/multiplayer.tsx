import { Box, Container } from '@mui/material';
import React from 'react';
import { MultiplayerContextProvider, useMultiplayerContext } from '@/src/MultiplayerContext';
import MultiplayerSetup from '@/src/components/multiplayer/MultiplayerSetup';
import LobbyView from '@/src/components/multiplayer/LobbyView';
import MultiplayerPlayView from '@/src/components/multiplayer/MultiplayerPlayView';

function MultiplayerInner() {
    const { mpState, isConnected } = useMultiplayerContext();

    // Not connected yet — show setup form
    if (!isConnected || !mpState) {
        return (
            <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
                <Container maxWidth="sm" sx={{ py: 4 }}>
                    <MultiplayerSetup />
                </Container>
            </Box>
        );
    }

    // In lobby
    if (mpState.phase === 'lobby') {
        return (
            <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'flex-start', bgcolor: 'background.default' }}>
                <Container maxWidth="sm" sx={{ py: 4 }}>
                    <LobbyView />
                </Container>
            </Box>
        );
    }

    // Game in progress (playing, round_summary, game_over)
    return <MultiplayerPlayView />;
}

export default function MultiplayerPage() {
    return (
        <MultiplayerContextProvider>
            <MultiplayerInner />
        </MultiplayerContextProvider>
    );
}
