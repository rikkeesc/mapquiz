export type Status = "correct" | "wrong";

export type GameState = {
    queue: string[];                    // country codes yet to be asked
    current: string | null;             // the code being asked, null when done
    results: Record<string, Status>;    // outcome per country answered so far
}

export type Action =
    | {type: "guess"; cca3: string}
    | {type: "restart"; countries: string[]};

function shuffle<T>(input: T[]): T[] {
    const array = [...input];
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Swap elements
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

export function initialState(countries: string[]): GameState {
    const [current = null, ...queue] = shuffle(countries);
    return { queue, current, results: {} };
}

export function reducer(state:GameState, action:Action): GameState{
    switch(action.type) {
        case "guess": {
            const target = state.current;
            if (target === null) return state;

            const hit = (action.cca3 === target);
            const results = { ...state.results,
                [target]: state.results[target] ?? (hit ? "correct":"wrong"),
            };

            if (!hit) return {...state, results};

            const [current = null, ...queue] = state.queue;
            return {queue, current, results};
        }
        case "restart": {
            return initialState(action.countries);
        }
    }
}