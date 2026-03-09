import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// --- Types ---

export interface MultiplayerPlayer {
    id: string;
    name: string;
    score: number;
    connected: boolean;
}

export interface MultiplayerGuess {
    answer: string;
    score: number;
    guessResult: string;
}

export interface MultiplayerScoreboard {
    roundTitles: string[];
    playerRows: Array<{
        playerId: string;
        playerName: string;
        totalScore: number;
        correctGuesses: number;
        roundScores: number[];
        roundGuesses: string[];
    }>;
}

export interface MultiplayerClue {
    clueClass: string;
    clueType: string;
    link: string;
}

export interface MultiplayerState {
    phase: 'lobby' | 'playing' | 'round_summary' | 'game_over';
    myId: string;
    hostId: string;
    players: MultiplayerPlayer[];
    currentRoundNum: number;
    numRounds: number;
    roundTime: number;
    roundStartTime: number;
    clues: MultiplayerClue[];
    // only in round_summary / game_over:
    correctAnswer?: string;
    guesses?: Record<string, MultiplayerGuess>;
    scoreboard?: MultiplayerScoreboard;
}

interface MultiplayerContextValue {
    mpState: MultiplayerState | null;
    isConnected: boolean;
    isConnecting: boolean;
    timeRemaining: number;
    roomId: string | null;
    hasSubmitted: boolean;
    join: (roomId: string, name: string) => void;
    startGame: (roundTime: number, numRounds: number) => void;
    submitMapAnswer: (answer: string, latitude: number, longitude: number) => void;
    nextRound: () => void;
    returnToLobby: () => void;
    disconnect: () => void;
}

// --- Context ---

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null);

export function useMultiplayerContext() {
    return useContext(MultiplayerContext)!;
}

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? '127.0.0.1:1999';

export function MultiplayerContextProvider({ children }: { children: React.ReactNode }) {
    const [mpState, setMpState] = useState<MultiplayerState | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const currentRoundNumRef = useRef<number>(0);
    const wsRef = useRef<WebSocket | null>(null);
    const mpStateRef = useRef<MultiplayerState | null>(null);

    useEffect(() => { mpStateRef.current = mpState; }, [mpState]);

    // Reset hasSubmitted when a new round starts
    useEffect(() => {
        if (mpState?.currentRoundNum && mpState.currentRoundNum !== currentRoundNumRef.current) {
            currentRoundNumRef.current = mpState.currentRoundNum;
            setHasSubmitted(false);
        }
    }, [mpState?.currentRoundNum]);

    // Local timer — derived from roundStartTime broadcast by server
    useEffect(() => {
        if (!mpState || mpState.phase !== 'playing') {
            setTimeRemaining(0);
            return;
        }
        const interval = setInterval(() => {
            const s = mpStateRef.current;
            if (!s || s.phase !== 'playing') return;
            const left = (s.roundStartTime + s.roundTime) - (Date.now() / 1000);
            setTimeRemaining(Math.max(0, left));
        }, 200);
        return () => clearInterval(interval);
    }, [mpState?.phase, mpState?.currentRoundNum]); // eslint-disable-line react-hooks/exhaustive-deps

    const send = useCallback((msg: object) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        }
    }, []);

    const join = useCallback((id: string, name: string) => {
        wsRef.current?.close();
        setIsConnecting(true);
        setIsConnected(false);
        setRoomId(id);

        const isLocal = PARTYKIT_HOST.startsWith('localhost') || PARTYKIT_HOST.startsWith('127');
        const protocol = isLocal ? 'ws' : 'wss';
        const ws = new WebSocket(`${protocol}://${PARTYKIT_HOST}/party/${id}`);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnecting(false);
            setIsConnected(true);
            ws.send(JSON.stringify({ type: 'join', name }));
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data as string) as { type: string; state: MultiplayerState };
            if (msg.type === 'state' && msg.state) {
                setMpState(msg.state);
            }
        };

        ws.onerror = () => {
            setIsConnecting(false);
        };

        ws.onclose = () => {
            setIsConnected(false);
            setIsConnecting(false);
        };
    }, []);

    const disconnect = useCallback(() => {
        wsRef.current?.close();
        wsRef.current = null;
        setMpState(null);
        setIsConnected(false);
        setIsConnecting(false);
        setRoomId(null);
    }, []);

    const startGame = useCallback((roundTime: number, numRounds: number) => {
        send({ type: 'start_game', roundTime, numRounds });
    }, [send]);

    const submitMapAnswer = useCallback((answer: string, latitude: number, longitude: number) => {
        send({ type: 'submit_map_answer', answer, latitude, longitude });
        setHasSubmitted(true);
    }, [send]);

    const nextRound = useCallback(() => {
        send({ type: 'next_round' });
    }, [send]);

    const returnToLobby = useCallback(() => {
        send({ type: 'return_to_lobby' });
    }, [send]);

    return (
        <MultiplayerContext.Provider value={{
            mpState, isConnected, isConnecting, timeRemaining, roomId, hasSubmitted,
            join, startGame, submitMapAnswer, nextRound, returnToLobby, disconnect,
        }}>
            {children}
        </MultiplayerContext.Provider>
    );
}
