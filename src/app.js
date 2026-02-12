import { dashboardTemplate } from './components/templates.js';
import { scanSpreadsheet, buildQueryPlan } from './services/driveGateway.js';
import { encryptSecret } from './services/credentialVault.js';
import { createId, Store } from './state/store.js';
import { getSpreadsheetId, isGoogleDriveUrl, required } from './utils/validators.js';

const app = document.querySelector('#app');
const store = new Store(Store.hydrate());

function audit(message) {
  store.setState((state) => ({
    ...state,
    activity: [{ at: new Date().toISOString(), message }, ...state.activity],
  }));
}

function bindEvents(state) {
  document.querySelector('#credential-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    if (![payload.name, payload.clientEmail, payload.privateKey, payload.masterKey].every(required)) {
      alert('Please complete all credential fields.');
      return;
    }

    const encryptedKey = await encryptSecret(String(payload.privateKey), String(payload.masterKey));
    store.setState((current) => ({
      ...current,
      credentials: [
        {
          id: createId('cred'),
          name: String(payload.name),
          clientEmail: String(payload.clientEmail),
          privateKey: encryptedKey,
          createdAt: new Date().toISOString(),
        },
        ...current.credentials,
      ],
    }));
    event.currentTarget.reset();
    audit(`Credential profile “${payload.name}” was added.`);
  });

  document.querySelector('#link-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    if (![payload.name, payload.url, payload.credentialId].every(required)) {
      alert('Please complete all link fields.');
      return;
    }

    if (!isGoogleDriveUrl(String(payload.url))) {
      alert('Link must point to Google Drive or Google Sheets.');
      return;
    }

    const spreadsheetId = getSpreadsheetId(String(payload.url));
    store.setState((current) => ({
      ...current,
      driveLinks: [
        {
          id: createId('link'),
          name: String(payload.name),
          url: String(payload.url),
          spreadsheetId: spreadsheetId ?? 'unknown',
          credentialId: String(payload.credentialId),
          createdAt: new Date().toISOString(),
        },
        ...current.driveLinks,
      ],
    }));
    event.currentTarget.reset();
    audit(`Drive link “${payload.name}” was registered.`);
  });

  document.querySelectorAll('[data-scan-link]').forEach((button) => {
    button.addEventListener('click', async () => {
      const linkId = button.getAttribute('data-scan-link');
      const link = state.driveLinks.find((item) => item.id === linkId);
      if (!link) return;

      button.disabled = true;
      button.textContent = 'Scanning...';
      const tables = await scanSpreadsheet({ linkName: link.name });
      store.setState((current) => ({
        ...current,
        tables: [...tables, ...current.tables.filter((table) => table.source !== link.name)],
      }));
      audit(`Scan completed for “${link.name}”. ${tables.length} tables synced.`);
    });
  });

  document.querySelectorAll('[data-table-id]').forEach((button) => {
    button.addEventListener('click', () => {
      store.setState((current) => ({
        ...current,
        ui: { ...current.ui, selectedTableId: button.getAttribute('data-table-id') },
      }));
    });
  });

  document.querySelector('#query-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = String(form.get('query') ?? '');
    const selected = state.tables.find((table) => table.id === state.ui.selectedTableId) ?? state.tables[0];
    if (!selected) return;

    const plan = buildQueryPlan(selected, query);
    store.setState((current) => ({
      ...current,
      ui: {
        ...current.ui,
        queryText: query,
        queryPlan: JSON.stringify(plan, null, 2),
      },
    }));
    audit(`Execution plan generated for table “${selected.name}”.`);
  });
}

store.subscribe((state) => {
  app.innerHTML = dashboardTemplate(state);
  bindEvents(state);
});
