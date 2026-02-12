function kpi(label, value, tone = 'neutral') {
  return `<article class="kpi-card ${tone}"><p>${label}</p><strong>${value}</strong></article>`;
}

function badge(text, tone = 'neutral') {
  return `<span class="badge ${tone}">${text}</span>`;
}

export function dashboardTemplate(state) {
  const credentialCount = state.credentials.length;
  const linksCount = state.driveLinks.length;
  const tableCount = state.tables.length;
  const warnings = state.tables.filter((table) => table.health === 'warning').length;

  const selectedTable = state.tables.find((table) => table.id === state.ui.selectedTableId) ?? state.tables[0];

  return `
    <header class="topbar">
      <div>
        <h1>DriveDB Console</h1>
        <p>Enterprise manager for Google Drive datasets and XLSX-backed tables.</p>
      </div>
      <div class="topbar-actions">
        ${badge(state.profile.environment, 'accent')}
        ${badge(state.profile.region, 'accent-soft')}
      </div>
    </header>

    <section class="kpi-grid">
      ${kpi('Credential Profiles', credentialCount)}
      ${kpi('Drive Links', linksCount)}
      ${kpi('Tables', tableCount, tableCount ? 'good' : 'neutral')}
      ${kpi('Integrity Warnings', warnings, warnings ? 'warn' : 'good')}
    </section>

    <section class="layout-grid">
      <article class="panel">
        <h2>Credentials Vault</h2>
        <form id="credential-form" class="stacked-form">
          <label>Profile Name <input name="name" required placeholder="Production SA" /></label>
          <label>Client Email <input name="clientEmail" type="email" required placeholder="sa@project.iam.gserviceaccount.com" /></label>
          <label>Private Key <textarea name="privateKey" rows="3" required></textarea></label>
          <label>Master Passphrase <input name="masterKey" type="password" required placeholder="used for in-browser encryption" /></label>
          <button type="submit">Save credential</button>
        </form>
        <ul class="list">
          ${state.credentials
            .map(
              (cred) => `<li>
              <div><strong>${cred.name}</strong><p>${cred.clientEmail}</p></div>
              ${badge('Encrypted', 'good')}
            </li>`
            )
            .join('') || '<li class="empty">No credentials configured yet.</li>'}
        </ul>
      </article>

      <article class="panel">
        <h2>Drive Link Registry</h2>
        <form id="link-form" class="stacked-form">
          <label>Connection Name <input name="name" required placeholder="Quarterly reporting" /></label>
          <label>Drive/Sheet URL <input name="url" required placeholder="https://docs.google.com/spreadsheets/d/..." /></label>
          <label>Credential
            <select name="credentialId" required>
              <option value="">Select credential</option>
              ${state.credentials.map((cred) => `<option value="${cred.id}">${cred.name}</option>`).join('')}
            </select>
          </label>
          <button type="submit">Register link</button>
        </form>
        <ul class="list">
          ${state.driveLinks
            .map(
              (link) => `<li>
                <div><strong>${link.name}</strong><p>${link.spreadsheetId}</p></div>
                <div class="row-actions">
                  <button data-scan-link="${link.id}">Scan tables</button>
                </div>
              </li>`
            )
            .join('') || '<li class="empty">No links added.</li>'}
        </ul>
      </article>

      <article class="panel wide">
        <h2>Table Catalog & Query Studio</h2>
        <div class="table-grid">
          <ul class="list tables">
            ${state.tables
              .map(
                (table) => `<li class="table-row ${table.id === selectedTable?.id ? 'active' : ''}">
                    <button data-table-id="${table.id}">
                      <div><strong>${table.name}</strong><p>${table.source} • ${table.rowCount.toLocaleString()} rows</p></div>
                      ${badge(table.health, table.health === 'healthy' ? 'good' : 'warn')}
                    </button>
                  </li>`
              )
              .join('') || '<li class="empty">No tables discovered yet.</li>'}
          </ul>
          <div class="query-area">
            ${selectedTable ? `<h3>${selectedTable.name}</h3><p>${selectedTable.columns.join(' • ')}</p>` : '<h3>Select a table</h3>'}
            <form id="query-form" class="stacked-form">
              <textarea name="query" rows="6">${state.ui.queryText}</textarea>
              <button type="submit" ${selectedTable ? '' : 'disabled'}>Build execution plan</button>
            </form>
            <pre id="query-plan" class="plan-output">${state.ui.queryPlan ?? 'No execution plan yet.'}</pre>
          </div>
        </div>
      </article>

      <article class="panel wide">
        <h2>Audit Activity</h2>
        <ul class="list activity">
          ${state.activity
            .slice(0, 8)
            .map((entry) => `<li><time>${new Date(entry.at).toLocaleString()}</time><p>${entry.message}</p></li>`)
            .join('') || '<li class="empty">Activity will appear here.</li>'}
        </ul>
      </article>
    </section>
  `;
}
