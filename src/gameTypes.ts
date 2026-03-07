export interface GameState {
    gameType: string;
    answerType: string;
    roundTime: number;
    numRounds: number;
    players: Player[];
    thisPlayerID: string;
    currentRound: CurrentRound;
    currentRoundNum: number;
    complete: boolean;
    scoreboard: Scoreboard;
}

export interface CurrentRound {
    startTime: number;
    answer_options: AnswerOption[];
    clues: Clue[];
    submission: Submission;
    playerGuesses: Map<string, string>;
    correctAnswer: CorrectAnswer;
    correctCity: City;
}

export interface AnswerOption {
    identifier: string;
    display: string;
}

export interface Clue {
    clueClass: string;
    clueType: string;
    link: string;
}

export interface CorrectAnswer {
    answer: string;
    answerId: string;
}

export interface Submission {
    answer: string;
    timestamp: number;
    guessResult: string;
    score: number;
}

export interface Player {
    id: string;
    name: string;
    score: number;
}

export interface Scoreboard {
    playerRows: PlayerRow[];
    roundTitles: string[];
}

export interface PlayerRow {
    playerId: string;
    playerName: string;
    totalScore: number;
    correctGuesses: number;
    roundScores: number[];
    roundGuesses: string[];
}

export interface City {
    geonameId: string;
    displayName: string;
    latitude: number;
    longitude: number;
}

export interface ClueData {
    answer_id: string;
    answer_name: string;
    answer_name2: string;
    clue_class: string;
    clue_type: string;
    location: string;
}

export interface AnswerResult {
    guessResult: string;
    score: number;
    correctAnswer: string;
}
