// Global object for fast access to storage.
window.STO = new Proxy({}, {
    get(_, property) {
        const value = get(property);
        if (value === null) console.info(`STO Proxy: The key '${property}' does not exist in the storage or is not a valid JSON.`);
        return value;
    },
    set() {
        throw new Error(`STO Proxy: Storage data cannot be modified that way.`);
    }
});

/**
 * Get a key or setting from the storage.
 * @param {string} key The name of the key or setting (in snake case).
 * @returns {any|null} `null` if the setting does not exist or is not a valid JSON.
 */
export function get(key)
{
    let value;

    try {
        value = JSON.parse(localStorage.getItem(key));
    } catch (error) {
        value = null;
        console.warn(`The key '${key}' is not a valid JSON.`);
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
        console.debugType('create_key', key, value);
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
