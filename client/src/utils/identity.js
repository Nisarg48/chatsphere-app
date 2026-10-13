import { customAlphabet } from 'nanoid';

const IDENTITY_KEY = 'chatsphere_user_identity';
const generateID = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6);

/**
 * Get or create persistent user identity
 * @param {string} username - The base username (e.g., "Nisarg")
 * @returns {string} - The full identity (e.g., "Nisarg_(abc123)")
 */
export function getUserIdentity(username) {
    if (!username || !username.trim()) {
        console.warn('Username is required for identity generation');
        return username;
    }

    // Check if we have a stored identity for this username
    const storedIdentity = localStorage.getItem(IDENTITY_KEY);
    
    if (storedIdentity) {
        try {
            const parsed = JSON.parse(storedIdentity);
            // If the username matches, use the stored identity
            if (parsed.username === username) {
                return parsed.identity;
            }
        } catch (e) {
            console.error('Error parsing stored identity:', e);
        }
    }

    // Generate new identity
    const randomId = generateID();
    const identity = `${username}_(${randomId})`;

    // Store it
    localStorage.setItem(IDENTITY_KEY, JSON.stringify({
        username,
        identity,
        createdAt: new Date().toISOString()
    }));

    return identity;
}

/**
 * Clear stored user identity
 */
export function clearUserIdentity() {
    localStorage.removeItem(IDENTITY_KEY);
}

/**
 * Get current stored identity without username
 * @returns {object|null} - The stored identity object or null
 */
export function getStoredIdentity() {
    const stored = localStorage.getItem(IDENTITY_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return null;
        }
    }
    return null;
}
