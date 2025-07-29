/**
 * Get a key or setting from the storage.
 * @param {string} key The name of the key or setting (in snake case).
 * @returns {any|null}
 */
export function get(key)
{
    let value;

    try {
        value = JSON.parse(localStorage.getItem(key));
    } catch (error) {
        value = null;
        console.warn(`The key '${key}' was not a valid JSON.`);
    }

    return value;
}

/**
 * Set a key or setting in the storage.
 * @param {string} key The name of the key or setting (in snake case).
 * @param {any} value The value to set.
 */
export function set(key, value)
{
    localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Set a key or setting in the storage only if it does not exist yet.
 * @param {string} key The name of the key or setting (in snake case).
 * @param {any} value The value to set.
 * @returns {boolean} Whether the key has been set.
 */
export function setOnce(key, value)
{
    if (get(key) === null) {
        set(key, value);
        return true;
    }
    else {
        return false;
    }
}

/**
 * Remove a key or setting from the storage.
 * @param {string} key The name of the key or setting (in snake case).
 */
export function remove(key)
{
    localStorage.removeItem(key);
}

/**
 * Get all the keys from the storage.
 * @returns {Array<string>}
 */
export function getKeys()
{
    return Object.keys(localStorage);
}
