const clueTypeNames: { [key: string] : string} = {
    "painting" : "Painting",
    "blog": "Travel Blog",
    "description": "Description",
    "food": "Popular Dish",
    "landmark": "Landmark",
    "poem": "Poem",
    "song": "Song",
    "haiku": "Haiku",
    "fact": "Random Fact"
}

export function getClueTypeName(clueType: string): string {
    const name = clueTypeNames[clueType];
    if (name) {
        return name;
    } else {
        return clueType;
    }
}