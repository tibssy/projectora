const LIKED_ANIMATIONS_KEY = "projectora_liked_animations";

/**
 * Retrieves the set of liked animation IDs from localStorage.
 */
const getLikedIds = (): Set<string> => {
    const stored = localStorage.getItem(LIKED_ANIMATIONS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
};

/**
 * Checks if a specific animation ID has been liked.
 * @param id The animation ID to check.
 */
export const hasLikedAnimation = (id: string): boolean => {
    return getLikedIds().has(id);
};

/**
 * Adds an animation ID to the set of liked animations in localStorage.
 * @param id The animation ID to add.
 */
export const addLikedAnimation = (id: string): void => {
    const ids = getLikedIds();
    ids.add(id);
    localStorage.setItem(LIKED_ANIMATIONS_KEY, JSON.stringify(Array.from(ids)));
};
