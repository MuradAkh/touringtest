import React, { useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { Box, Button, Chip, Divider, LinearProgress, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import dynamic from 'next/dynamic';
import { useMultiplayerContext, MultiplayerGuess } from '@/src/MultiplayerContext';
import { GameContext } from '@/src/GameContext';
import { GameState, Submission, AnswerResult } from '@/src/gameTypes';
import Clues from '@/src/components/Clues';
import { getDisplayString } from '@/src/utils';
import MultiplayerScoreboard from '@/src/components/multiplayer/MultiplayerScoreboard';

// --- Timer helpers (same as PlayView) ---

function timerProgress(roundTime: number, timeRemaining: number) {
    return Math.max(0, Math.min(100, (timeRemaining / roundTime) * 100));
}

function timerColor(progress: number): 'success' | 'warning' | 'error' {
    if (progress > 50) return 'success';
    if (progress > 20) return 'warning';
    return 'error';
}

// --- Round result chip ---

function getRoundResult(guessResult: string) {
    if (guessResult === 'correct') return { label: 'Correct', color: '#66bb6a', emoji: String.fromCodePoint(0x2705) };
    if (guessResult === 'partCorrect') return { label: 'Right country', color: '#ffa726', emoji: String.fromCodePoint(0x1F7E1) };
    if (guessResult === 'notGuessed') return { label: "Time's up", color: '#9e9e9e', emoji: String.fromCodePoint(0x23F3) };
    if (guessResult === '') return { label: 'No answer', color: '#9e9e9e', emoji: String.fromCodePoint(0x23F3) };
    return { label: 'Wrong', color: '#ef5350', emoji: String.fromCodePoint(0x274C) };
}

// --- Round summary (multiplayer version shows all players) ---

function MultiplayerRoundSummary() {
    const { mpState, nextRound } = useMultiplayerContext();
    if (!mpState || mpState.phase !== 'round_summary') return null;

    const isHost = mpState.myId === mpState.hostId;
    const isLastRound = mpState.currentRoundNum === mpState.numRounds;
    const guesses = mpState.guesses ?? {};
    const correctAnswer = mpState.correctAnswer ?? '';

    const myGuess = guesses[mpState.myId];
    const myResult = myGuess ? getRoundResult(myGuess.guessResult) : getRoundResult('');

    const sortedPlayers = [...mpState.players].sort((a, b) => b.score - a.score);

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                borderRadius: { xs: 0, md: 2 },
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 2, md: 3 },
                gap: 2,
                overflowY: 'auto',
            }}
        >
            {/* Your result */}
            <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize="2.5rem" lineHeight={1}>{myResult.emoji}</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: myResult.color }}>
                    {myResult.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>The answer was</Typography>
                <Typography variant="h6" fontWeight="bold">
                    {getDisplayString(correctAnswer, 'geo', true)}
                </Typography>
                {myGuess && myGuess.guessResult !== 'correct' && myGuess.answer && (
                    <Typography variant="body2" color="text.secondary">
                        You guessed: {getDisplayString(myGuess.answer, 'geo', true)}
                    </Typography>
                )}
                <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                    +{myGuess?.score ?? 0}
                </Typography>
            </Box>

            <Divider />

            {/* All players this round */}
            <Box>
                <Typography variant="body2" fontWeight="medium" color="text.secondary" sx={{ mb: 1 }}>
                    Round scores
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {sortedPlayers.map(p => {
                        const g = guesses[p.id];
                        const res = g ? getRoundResult(g.guessResult) : getRoundResult('');
                        return (
                            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ flexGrow: 1 }}
                                    fontWeight={p.id === mpState.myId ? 'bold' : 'normal'}>
                                    {p.name}{p.id === mpState.myId ? ' (you)' : ''}
                                </Typography>
                                <Chip
                                    label={`${res.emoji} ${res.label}`}
                                    size="small"
                                    sx={{ bgcolor: res.color + '22', color: res.color, fontWeight: 'bold', border: `1px solid ${res.color}44`, height: 22, fontSize: '0.72rem' }}
                                />
                                <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 40, textAlign: 'right' }}>
                                    +{g?.score ?? 0}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Divider />

            {/* Standings */}
            <Box>
                <Typography variant="body2" fontWeight="medium" color="text.secondary" sx={{ mb: 1 }}>
                    Standings
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {sortedPlayers.map((p, i) => (
                        <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 20 }}>
                                {i + 1}.
                            </Typography>
                            <Typography variant="body2" sx={{ flexGrow: 1 }}
                                fontWeight={p.id === mpState.myId ? 'bold' : 'normal'}>
                                {p.name}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">{p.score} pts</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box sx={{ mt: 'auto' }}>
                {isHost ? (
                    <Button variant="contained" size="large" fullWidth sx={{ mt: 1, borderRadius: 2 }} onClick={nextRound}>
                        {isLastRound ? 'See Results' : 'Next Round →'}
                    </Button>
                ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Waiting for host to continue…
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}

// --- Map answer tab (multiplayer-aware via GameContext adapter) ---

const MapAnswerTab = dynamic(() => import('@/src/components/MapAnswerTab'), { ssr: false });

// --- Main play view ---

export default function MultiplayerPlayView() {
    const { mpState, timeRemaining, submitMapAnswer: ctxSubmitMapAnswer, disconnect, hasSubmitted } = useMultiplayerContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = useState(0);
    const [submittedAnswer, setSubmittedAnswer] = useState<string>('');

    // Auto-switch to result/waiting tab when player submits or round ends on mobile
    useEffect(() => {
        if ((hasSubmitted || mpState?.phase === 'round_summary') && isMobile) setActiveTab(1);
    }, [hasSubmitted, mpState?.phase, isMobile]);

    // Reset to clues tab on new round
    useEffect(() => {
        setActiveTab(0);
        setSubmittedAnswer('');
    }, [mpState?.currentRoundNum]);

    // All hooks must be called before any early return
    const myGuess = mpState?.guesses?.[mpState?.myId ?? ''];
    const isRoundOver = mpState?.phase === 'round_summary';

    const submitMapAnswer = useCallback((answer: string, lat: number, lon: number) => {
        setSubmittedAnswer(answer);
        ctxSubmitMapAnswer(answer, lat, lon);
    }, [ctxSubmitMapAnswer]);

    // Build a fake GameState so we can reuse the existing Clues and MapAnswerTab components
    const fakeGameState: GameState = useMemo(() => ({
        gameType: 'geo',
        answerType: 'map',
        roundTime: mpState?.roundTime ?? 30,
        numRounds: mpState?.numRounds ?? 5,
        players: (mpState?.players ?? []).map(p => ({ id: p.id, name: p.name, score: p.score })),
        thisPlayerID: mpState?.myId ?? '',
        currentRoundNum: mpState?.currentRoundNum ?? 0,
        complete: false,
        scoreboard: { playerRows: [], roundTitles: [] },
        currentRound: {
            startTime: mpState?.roundStartTime ?? 0,
            clues: mpState?.clues ?? [],
            answer_options: [],
            submission: myGuess
                ? { answer: myGuess.answer, timestamp: 0, guessResult: myGuess.guessResult, score: myGuess.score }
                : { answer: '', timestamp: 0, guessResult: '', score: 0 },
            playerGuesses: new Map(),
            correctAnswer: {
                answer: mpState?.correctAnswer ?? '',
                answerId: '',
            },
            correctCity: { geonameId: '', displayName: '', latitude: 0, longitude: 0 },
        },
    }), [mpState, myGuess]);

    // Fake GameContext for child components
    const fakeContext = useMemo(() => ({
        gameState: fakeGameState,
        startGame: async () => {},
        submitMapAnswer: (answer: string, lat: number, lon: number): AnswerResult => {
            submitMapAnswer(answer, lat, lon);
            return { guessResult: '', score: 0, correctAnswer: '' };
        },
        nextRound: () => {},
        quitGame: () => {},
        waitingForNextRound: hasSubmitted || !!isRoundOver,
        timeRemaining,
        isLoading: false,
    }), [fakeGameState, submitMapAnswer, hasSubmitted, isRoundOver, timeRemaining]);

    if (!mpState) return null;
    if (mpState.phase === 'game_over') return <MultiplayerScoreboard />;

    const progress = timerProgress(mpState.roundTime, timeRemaining);

    const rightPanel = isRoundOver ? <MultiplayerRoundSummary /> : hasSubmitted ? (
        <Paper variant="outlined" sx={{
            borderRadius: { xs: 0, md: 2 }, flexGrow: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 2, p: 3, textAlign: 'center',
        }}>
            <Typography fontSize="2.5rem" lineHeight={1}>{String.fromCodePoint(0x23F3)}</Typography>
            <Typography variant="h6" fontWeight="bold">Answer locked in!</Typography>
            <Typography variant="body2" color="text.secondary">
                You guessed: <strong>{getDisplayString(submittedAnswer, 'geo', true)}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Waiting for other players…
            </Typography>
        </Paper>
    ) : (
        <GameContext.Provider value={fakeContext}>
            <MapAnswerTab />
        </GameContext.Provider>
    );

    const sortedPlayers = [...mpState.players].sort((a, b) => b.score - a.score);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', bgcolor: 'background.default' }}>

            {/* Header */}
            <Paper elevation={1} sx={{ borderRadius: 0, zIndex: 10, flexShrink: 0 }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center',
                    px: { xs: 2, md: 3 }, py: 1,
                    maxWidth: 1200, mx: 'auto', width: '100%',
                    gap: 2,
                }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ flexShrink: 0 }}>
                        Round {mpState.currentRoundNum}
                        <Typography component="span" variant="caption" color="text.secondary">
                            {' '}/ {mpState.numRounds}
                        </Typography>
                    </Typography>

                    {/* Player scores inline — desktop */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {sortedPlayers.map(p => (
                            <Typography
                                key={p.id}
                                variant="body2"
                                fontWeight={p.id === mpState.myId ? 'bold' : 'normal'}
                                color={p.id === mpState.myId ? 'primary.main' : 'text.secondary'}
                            >
                                {p.name}: {p.score}
                            </Typography>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />
                    <Button
                        variant="text" size="small"
                        sx={{ color: 'text.secondary', minWidth: 0 }}
                        onClick={disconnect}
                    >
                        Leave
                    </Button>
                </Box>
                {!isRoundOver && (
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={timerColor(progress)}
                        sx={{ height: 3 }}
                    />
                )}
            </Paper>

            {/* Mobile tab bar */}
            {isMobile && (
                <Paper elevation={0} sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                        <Tab label="Clues" />
                        <Tab label={isRoundOver ? 'Result' : hasSubmitted ? 'Waiting' : 'Map'} />
                    </Tabs>
                </Paper>
            )}

            {/* Content */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
                {isMobile ? (
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            opacity: activeTab === 0 ? 1 : 0,
                            pointerEvents: activeTab === 0 ? 'auto' : 'none',
                            overflowY: 'auto', p: 1.5,
                        }}>
                            <Clues gameState={fakeGameState} />
                        </Box>
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            opacity: activeTab === 1 ? 1 : 0,
                            pointerEvents: activeTab === 1 ? 'auto' : 'none',
                            display: 'flex', flexDirection: 'column',
                        }}>
                            {rightPanel}
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{
                        width: '100%', maxWidth: 1200,
                        mx: 'auto',
                        display: 'flex', flexDirection: 'row',
                        p: 2, gap: 2, height: '100%', overflow: 'hidden',
                    }}>
                        {/* Clues */}
                        <Box sx={{ flex: '0 0 380px', overflowY: 'auto', minWidth: 0, pr: 0.5 }}>
                            <Clues gameState={fakeGameState} />
                        </Box>

                        {/* Map / Result */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            {rightPanel}
                        </Box>

                        {/* Player scores sidebar */}
                        <Box sx={{ flex: '0 0 160px', overflowY: 'auto' }}>
                            <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Scores
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                    {sortedPlayers.map((p, i) => (
                                        <Box key={p.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                                <Typography variant="caption" color="text.disabled">{i + 1}.</Typography>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={p.id === mpState.myId ? 'bold' : 'normal'}
                                                    color={p.id === mpState.myId ? 'primary.main' : 'text.primary'}
                                                    noWrap sx={{ flexGrow: 1 }}
                                                >
                                                    {p.name}
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                                color={p.id === mpState.myId ? 'primary.main' : 'text.secondary'}
                                                sx={{ pl: 2 }}
                                            >
                                                {p.score}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
