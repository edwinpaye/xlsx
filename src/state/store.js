const STORAGE_KEY = 'drivedb-state-v1';

export const defaultState = {
  profile: {
    workspaceName: 'Primary Workspace',
    environment: 'Production',
    region: 'global',
  },
  credentials: [],
  driveLinks: [],
  tables: [],
  activity: [],
  ui: {
    selectedCredentialId: null,
    selectedLinkId: null,
    selectedTableId: null,
    queryText: 'SELECT * FROM Sales ORDER BY Date DESC LIMIT 50',
  },
};

export class Store {
  #state;
  #listeners;

  constructor(initial = defaultState) {
    this.#state = initial;
    this.#listeners = new Set();
  }

  getState() {
    return this.#state;
  }

  setState(updater) {
    const nextState = typeof updater === 'function' ? updater(this.#state) : updater;
    this.#state = structuredClone(nextState);
    this.#listeners.forEach((listener) => listener(this.#state));
    this.persist();
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    listener(this.#state);
    return () => this.#listeners.delete(listener);
  }

  persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#state));
  }

  static hydrate() {
    const payload = localStorage.getItem(STORAGE_KEY);
    if (!payload) {
      return structuredClone(defaultState);
    }

    try {
      const parsed = JSON.parse(payload);
      return {
        ...structuredClone(defaultState),
        ...parsed,
        profile: { ...defaultState.profile, ...(parsed.profile ?? {}) },
        ui: { ...defaultState.ui, ...(parsed.ui ?? {}) },
        credentials: parsed.credentials ?? [],
        driveLinks: parsed.driveLinks ?? [],
        tables: parsed.tables ?? [],
        activity: parsed.activity ?? [],
      };
    } catch {
      return structuredClone(defaultState);
    }
  }
}

export function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}
