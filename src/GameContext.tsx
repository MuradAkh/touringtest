import React, { useEffect, useRef, useState } from 'react';
import {
    AnswerOption,
    AnswerResult,
    City,
    Clue,
    ClueData,
    CurrentRound,
    GameState,
    PlayerRow,
    Scoreboard,
    Submission,
} from '@/src/gameTypes';

const CLUE_BUCKET_URL = 'https://guessgameclues.murad.dev/';
const PLAYER_ID = 'local';
const PLAYER_NAME = 'You';

// --- Scoring (mirrors backend exactly) ---

function basicScore(startTime: number, roundTime: number): number {
    const timeRemaining = (startTime + roundTime) - (Date.now() / 1000);
    let ratio = timeRemaining / roundTime;
    if (ratio > 0.8) ratio = 1;
    if (ratio < 0) ratio = 0;
    return Math.round(ratio * 1000);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceScore(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dist = haversineKm(lat1, lon1, lat2, lon2);
    return Math.max(0, Math.round(1000 * (1 - dist / 6000)));
}

// --- Data loading (cached after first load) ---

let cachedClues: ClueData[] | null = null;
let cachedCities: City[] | null = null;

async function loadGameData(): Promise<{ clues: ClueData[]; cities: City[] }> {
    if (!cachedClues || !cachedCities) {
        const [cluesRes, citiesRes] = await Promise.all([
            fetch('/data/clues.json'),
            fetch('/data/cities.json'),
        ]);
        cachedClues = await cluesRes.json();
        const rawCities = await citiesRes.json();
        // Convert from data format to City format
        cachedCities = rawCities.map((c: any) => ({
            geonameId: String(c.geoname_id),
            displayName: c.name + ':::' + c.country_iso2,
            latitude: c.lat,
            longitude: c.lon
        }));
    }
    return { clues: cachedClues!, cities: cachedCities! };
}

// --- Round helpers ---

function toClue(c: ClueData): Clue {
    return {
        clueClass: c.clue_class,
        clueType: c.clue_type,
        link: CLUE_BUCKET_URL + c.location,
    };
}

function pickClues(cityClues: ClueData[]): Clue[] {
    if (cityClues.length === 0) return [];
    if (cityClues.length === 1) return [toClue(cityClues[0])];
    const shuffled = [...cityClues].sort(() => Math.random() - 0.5);
    const seen = new Set<string>();
    const result: Clue[] = [];
    for (const c of shuffled) {
        if (!seen.has(c.location) && result.length < 2) {
            seen.add(c.location);
            result.push(toClue(c));
        }
    }
    return result;
}

function makeRound(city: City, clues: Clue[], answerOptions: AnswerOption[]): CurrentRound {
    return {
        startTime: Date.now() / 1000,
        clues,
        answer_options: answerOptions,
        submission: { answer: '', timestamp: 0, guessResult: '', score: 0 },
        playerGuesses: new Map(),
        correctAnswer: { answer: '', answerId: '' },
        correctCity: city,
    };
}

function buildScoreboard(
    completed: Array<{ answer: string; submission: Submission }>
): Scoreboard {
    const roundTitles = completed.map(r => r.answer);
    const totalScore = completed.reduce((s, r) => s + r.submission.score, 0);
    const correctGuesses = completed.filter(r => r.submission.guessResult === 'correct').length;
    const row: PlayerRow = {
        playerId: PLAYER_ID,
        playerName: PLAYER_NAME,
        totalScore,
        correctGuesses,
        roundScores: completed.map(r => r.submission.score),
        roundGuesses: completed.map(r => r.submission.answer),
    };
    return { roundTitles, playerRows: [row] };
}

// --- Context ---

interface PrebuiltRound {
    city: City;
    clues: Clue[];
    answerOptions: AnswerOption[];
}

export const GameContext = React.createContext({});

export const useGameContext = () =>
    React.useContext(GameContext) as {
        gameState: GameState | null;
        startGame: (answerType: string, roundTime: number, numRounds: number) => Promise<void>;
        submitMapAnswer: (answer: string, latitude: number, longitude: number) => AnswerResult;
        nextRound: () => void;
        quitGame: () => void;
        waitingForNextRound: boolean;
        timeRemaining: number;
        isLoading: boolean;
    };

export const GameContextProvider = ({ children }: any) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [waitingForNextRound, setWaitingForNextRound] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const gameStateRef = useRef<GameState | null>(null);
    const waitingRef = useRef(false);
    const prebuiltRoundsRef = useRef<PrebuiltRound[]>([]);
    const completedRoundsRef = useRef<Array<{ answer: string; submission: Submission }>>([]);

    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
    useEffect(() => { waitingRef.current = waitingForNextRound; }, [waitingForNextRound]);

    // Timer — only restarts when the round number changes
    useEffect(() => {
        if (!gameState || gameState.complete) return;

        const interval = setInterval(() => {
            const state = gameStateRef.current;
            if (!state || state.complete || waitingRef.current) return;

            const left = (state.currentRound.startTime + state.roundTime) - (Date.now() / 1000);
            setTimeRemaining(left);

            if (left <= 0 && state.currentRound.correctAnswer.answer === '') {
                // Time expired with no answer — record a miss and reveal
                const missedSubmission: Submission = {
                    answer: '',
                    timestamp: Date.now() / 1000,
                    guessResult: 'notGuessed',
                    score: 0,
                };
                completedRoundsRef.current.push({
                    answer: state.currentRound.correctCity.displayName,
                    submission: missedSubmission,
                });
                const revealed: GameState = {
                    ...state,
                    currentRound: {
                        ...state.currentRound,
                        submission: missedSubmission,
                        correctAnswer: {
                            answer: state.currentRound.correctCity.displayName,
                            answerId: state.currentRound.correctCity.geonameId,
                        },
                    },
                };
                gameStateRef.current = revealed;
                waitingRef.current = true;
                setGameState(revealed);
                setWaitingForNextRound(true);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [gameState?.currentRoundNum]); // eslint-disable-line react-hooks/exhaustive-deps

    function advanceToNextRound(state: GameState) {
        const nextNum = state.currentRoundNum + 1;
        if (nextNum > state.numRounds) {
            const scoreboard = buildScoreboard(completedRoundsRef.current);
            setGameState({ ...state, complete: true, scoreboard });
            setWaitingForNextRound(false);
            return;
        }
        const prebuilt = prebuiltRoundsRef.current[nextNum - 1];
        const newRound = makeRound(prebuilt.city, prebuilt.clues, prebuilt.answerOptions);
        setGameState({ ...state, currentRoundNum: nextNum, currentRound: newRound });
        setWaitingForNextRound(false);
        setTimeRemaining(state.roundTime);
    }

    const startGame = async (answerType: string, roundTime: number, numRounds: number) => {
        setIsLoading(true);
        try {
            const { clues, cities } = await loadGameData();

            const cluesByCity: Record<string, ClueData[]> = {};
            for (const clue of clues) {
                if (!cluesByCity[clue.answer_id]) cluesByCity[clue.answer_id] = [];
                cluesByCity[clue.answer_id].push(clue);
            }

            const cityMap: Record<string, City> = {};
            for (const city of cities) cityMap[city.geonameId] = city;

            const eligibleIds = Object.keys(cluesByCity).filter(id => cityMap[id]);
            const selected = [...eligibleIds]
                .sort(() => Math.random() - 0.5)
                .slice(0, numRounds);

            prebuiltRoundsRef.current = selected.map(id => ({
                city: cityMap[id],
                clues: pickClues(cluesByCity[id]),
                answerOptions: [],
            }));
            completedRoundsRef.current = [];

            const first = prebuiltRoundsRef.current[0];
            const firstRound = makeRound(first.city, first.clues, first.answerOptions);

            setGameState({
                gameType: 'geo',
                answerType,
                roundTime,
                numRounds,
                players: [{ id: PLAYER_ID, name: PLAYER_NAME, score: 0 }],
                thisPlayerID: PLAYER_ID,
                currentRound: firstRound,
                currentRoundNum: 1,
                complete: false,
                scoreboard: { playerRows: [], roundTitles: [] },
            });
            setWaitingForNextRound(false);
            setTimeRemaining(roundTime);
        } finally {
            setIsLoading(false);
        }
    };

    const submitAnswer = (answer: string): AnswerResult => {
        const state = gameStateRef.current!;
        const { currentRound, roundTime } = state;

        const isCorrect = answer === currentRound.correctCity.displayName;
        const score = isCorrect ? basicScore(currentRound.startTime, roundTime) : 0;
        const guessResult = isCorrect ? 'correct' : 'incorrect';

        const submission: Submission = {
            answer,
            timestamp: Date.now() / 1000,
            guessResult,
            score,
        };

        const players = state.players.map(p =>
            p.id === PLAYER_ID ? { ...p, score: p.score + score } : p
        );

        completedRoundsRef.current.push({
            answer: currentRound.correctCity.displayName,
            submission,
        });

        const updated: GameState = {
            ...state,
            players,
            currentRound: {
                ...currentRound,
                submission,
                correctAnswer: {
                    answer: currentRound.correctCity.displayName,
                    answerId: currentRound.correctCity.geonameId,
                },
            },
        };

        setGameState(updated);
        setWaitingForNextRound(true);

        return { guessResult, score, correctAnswer: currentRound.correctCity.displayName };
    };

    const submitMapAnswer = (answer: string, latitude: number, longitude: number): AnswerResult => {
        const state = gameStateRef.current!;
        const { currentRound } = state;

        const isCorrect = answer === currentRound.correctCity.displayName;
        let score: number;
        let guessResult: string;

        if (isCorrect) {
            score = 1000;
            guessResult = 'correct';
        } else {
            score = distanceScore(
                currentRound.correctCity.latitude,
                currentRound.correctCity.longitude,
                latitude,
                longitude
            );
            const guessIso2 = answer.split(':::')[1];
            const correctIso2 = currentRound.correctCity.displayName.split(':::')[1];
            guessResult = guessIso2 === correctIso2 ? 'partCorrect' : 'incorrect';
        }

        const submission: Submission = {
            answer,
            timestamp: Date.now() / 1000,
            guessResult,
            score,
        };

        const players = state.players.map(p =>
            p.id === PLAYER_ID ? { ...p, score: p.score + score } : p
        );

        completedRoundsRef.current.push({
            answer: currentRound.correctCity.displayName,
            submission,
        });

        const updated: GameState = {
            ...state,
            players,
            currentRound: {
                ...currentRound,
                submission,
                correctAnswer: {
                    answer: currentRound.correctCity.displayName,
                    answerId: currentRound.correctCity.geonameId,
                },
            },
        };

        setGameState(updated);
        setWaitingForNextRound(true);

        return { guessResult, score, correctAnswer: currentRound.correctCity.displayName };
    };

    const nextRound = () => {
        const state = gameStateRef.current;
        if (state) advanceToNextRound(state);
    };

    const quitGame = () => {
        prebuiltRoundsRef.current = [];
        completedRoundsRef.current = [];
        setGameState(null);
        setWaitingForNextRound(false);
        setTimeRemaining(0);
    };

    return (
        <GameContext.Provider
            value={{
                gameState,
                startGame,
                submitMapAnswer,
                nextRound,
                quitGame,
                waitingForNextRound,
                timeRemaining,
                isLoading,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
