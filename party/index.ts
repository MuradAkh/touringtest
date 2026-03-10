import type * as Party from 'partykit/server';
import rawCities from '../public/data/cities.json';
import rawClues from '../public/data/clues.json';

const CLUE_BUCKET_URL = 'https://guessgameclues.murad.dev/';

// --- Types ---

interface PlayerInfo {
    name: string;
    score: number;
    connected: boolean;
}

interface Clue {
    clueClass: string;
    clueType: string;
    link: string;
}

interface City {
    geonameId: string;
    displayName: string;
    latitude: number;
    longitude: number;
}

interface ClueData {
    answer_id: string;
    clue_class: string;
    clue_type: string;
    location: string;
}

interface PlayerGuess {
    answer: string;
    score: number;
    guessResult: string;
}

interface RoundRecord {
    correctCity: City;
    clues: Clue[];
    guesses: Record<string, PlayerGuess>;
}

interface RoomState {
    phase: 'lobby' | 'playing' | 'round_summary' | 'game_over';
    hostId: string;
    players: Record<string, PlayerInfo>;
    rounds: RoundRecord[];
    currentRoundNum: number;
    roundTime: number;
    numRounds: number;
    roundStartTime: number;
}

// --- Scoring ---

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

// --- Data loading ---

function toClue(c: ClueData): Clue {
    return { clueClass: c.clue_class, clueType: c.clue_type, link: CLUE_BUCKET_URL + c.location };
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

function buildRounds(numRounds: number): RoundRecord[] {
    const cities: City[] = (rawCities as Record<string, unknown>[]).map(c => ({
        geonameId: String(c.geoname_id),
        displayName: c.name + ':::' + c.country_iso2,
        latitude: c.lat as number,
        longitude: c.lon as number,
    }));

    const cluesByCity: Record<string, ClueData[]> = {};
    for (const clue of rawClues as ClueData[]) {
        if (!cluesByCity[clue.answer_id]) cluesByCity[clue.answer_id] = [];
        cluesByCity[clue.answer_id].push(clue);
    }

    const cityMap: Record<string, City> = {};
    for (const city of cities) cityMap[city.geonameId] = city;

    const eligibleIds = Object.keys(cluesByCity).filter(id => cityMap[id]);
    const selected = [...eligibleIds].sort(() => Math.random() - 0.5).slice(0, numRounds);

    return selected.map(id => ({
        correctCity: cityMap[id],
        clues: pickClues(cluesByCity[id]),
        guesses: {},
    }));
}

// --- Server ---

export default class GameRoom implements Party.Server {
    private state: RoomState | null = null;

    constructor(readonly room: Party.Room) {}

    async onConnect(conn: Party.Connection) {
        if (!this.state) {
            this.state = {
                phase: 'lobby',
                hostId: conn.id,
                players: {},
                rounds: [],
                currentRoundNum: 0,
                roundTime: 30,
                numRounds: 5,
                roundStartTime: 0,
            };
        }
        conn.send(JSON.stringify({ type: 'state', state: this.buildClientState(conn.id) }));
    }

    async onMessage(message: string, sender: Party.Connection) {
        if (!this.state) return;
        const msg = JSON.parse(message) as { type: string; name?: string; roundTime?: number; numRounds?: number; answer?: string; latitude?: number; longitude?: number };

        switch (msg.type) {
            case 'join':
                this.handleJoin(sender.id, msg.name ?? 'Player');
                break;
            case 'start_game':
                if (sender.id === this.state.hostId) {
                    await this.startGame(msg.roundTime ?? 30, msg.numRounds ?? 5);
                }
                break;
            case 'submit_map_answer':
                if (msg.answer !== undefined && msg.latitude !== undefined && msg.longitude !== undefined) {
                    await this.submitAnswer(sender.id, msg.answer, msg.latitude, msg.longitude);
                }
                break;
            case 'next_round':
                if (sender.id === this.state.hostId && this.state.phase === 'round_summary') {
                    this.advanceRound();
                }
                break;
            case 'return_to_lobby':
                if (sender.id === this.state.hostId && this.state.phase === 'game_over') {
                    this.returnToLobby();
                }
                break;
        }
    }

    async onClose(conn: Party.Connection) {
        if (this.state?.players[conn.id]) {
            this.state.players[conn.id].connected = false;
            this.broadcast();
        }
    }

    async onAlarm() {
        if (this.state?.phase === 'playing') {
            this.revealRound();
        }
    }

    private handleJoin(id: string, name: string) {
        if (!this.state) return;
        if (this.state.players[id]) {
            this.state.players[id].connected = true;
            this.state.players[id].name = name;
        } else {
            this.state.players[id] = { name, score: 0, connected: true };
        }
        this.broadcast();
    }

    private async startGame(roundTime: number, numRounds: number) {
        if (!this.state) return;
        const rounds = buildRounds(numRounds);

        // Reset scores for new game
        for (const id of Object.keys(this.state.players)) {
            this.state.players[id].score = 0;
        }

        this.state.rounds = rounds;
        this.state.numRounds = numRounds;
        this.state.roundTime = roundTime;
        this.state.currentRoundNum = 1;
        this.state.phase = 'playing';
        this.state.roundStartTime = Date.now() / 1000;

        await this.room.storage.setAlarm(Date.now() + roundTime * 1000);
        this.broadcast();
    }

    private async submitAnswer(playerId: string, answer: string, latitude: number, longitude: number) {
        if (!this.state || this.state.phase !== 'playing') return;
        const round = this.state.rounds[this.state.currentRoundNum - 1];
        if (!round || round.guesses[playerId]) return;

        const city = round.correctCity;
        const isCorrect = answer === city.displayName;
        let score: number;
        let guessResult: string;

        if (isCorrect) {
            score = 1000;
            guessResult = 'correct';
        } else {
            score = distanceScore(city.latitude, city.longitude, latitude, longitude);
            const guessIso2 = answer.split(':::')[1];
            const correctIso2 = city.displayName.split(':::')[1];
            guessResult = guessIso2 === correctIso2 ? 'partCorrect' : 'incorrect';
        }

        round.guesses[playerId] = { answer, score, guessResult };
        this.state.players[playerId].score += score;

        // Reveal early if all connected players have guessed
        const connectedIds = Object.entries(this.state.players)
            .filter(([, p]) => p.connected)
            .map(([id]) => id);
        const allGuessed = connectedIds.every(id => round.guesses[id]);

        if (allGuessed) {
            await this.room.storage.deleteAlarm();
            this.revealRound();
        } else {
            this.broadcast();
        }
    }

    private revealRound() {
        if (!this.state) return;
        this.state.phase = 'round_summary';
        this.broadcast();
    }

    private advanceRound() {
        if (!this.state) return;
        const next = this.state.currentRoundNum + 1;
        if (next > this.state.numRounds) {
            this.state.phase = 'game_over';
        } else {
            this.state.currentRoundNum = next;
            this.state.phase = 'playing';
            this.state.roundStartTime = Date.now() / 1000;
            this.room.storage.setAlarm(Date.now() + this.state.roundTime * 1000);
        }
        this.broadcast();
    }

    private returnToLobby() {
        if (!this.state) return;
        for (const id of Object.keys(this.state.players)) {
            this.state.players[id].score = 0;
        }
        this.state.rounds = [];
        this.state.currentRoundNum = 0;
        this.state.phase = 'lobby';
        this.broadcast();
    }

    private buildClientState(connectionId: string) {
        if (!this.state) return null;
        const { phase, hostId, players, currentRoundNum, numRounds, roundTime, roundStartTime, rounds } = this.state;

        const playerList = Object.entries(players).map(([id, p]) => ({
            id, name: p.name, score: p.score, connected: p.connected,
        }));

        const round = currentRoundNum > 0 ? rounds[currentRoundNum - 1] : null;

        const base = {
            myId: connectionId,
            phase,
            hostId,
            players: playerList,
            currentRoundNum,
            numRounds,
            roundTime,
            roundStartTime,
            clues: round?.clues ?? [],
        };

        if (phase === 'round_summary' || phase === 'game_over') {
            return {
                ...base,
                correctAnswer: round?.correctCity.displayName ?? '',
                guesses: round?.guesses ?? {},
                scoreboard: phase === 'game_over' ? this.buildScoreboard() : undefined,
            };
        }

        return base;
    }

    private buildScoreboard() {
        if (!this.state) return null;
        const { players, rounds, numRounds } = this.state;
        const roundTitles = rounds.slice(0, numRounds).map(r => r.correctCity.displayName);
        const playerRows = Object.entries(players).map(([id, p]) => ({
            playerId: id,
            playerName: p.name,
            totalScore: p.score,
            correctGuesses: rounds.slice(0, numRounds).filter(r => r.guesses[id]?.guessResult === 'correct').length,
            roundScores: rounds.slice(0, numRounds).map(r => r.guesses[id]?.score ?? 0),
            roundGuesses: rounds.slice(0, numRounds).map(r => r.guesses[id]?.answer ?? ''),
        }));
        return { roundTitles, playerRows };
    }

    private broadcast() {
        for (const conn of this.room.getConnections()) {
            conn.send(JSON.stringify({ type: 'state', state: this.buildClientState(conn.id) }));
        }
    }
}
