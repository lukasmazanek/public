// Bratislavská 27 — Web Dashboard
// Vanilla JS + sql.js + Web Crypto API

const ITERATIONS = 100000;
const DB_URL = "bratislavska.db.enc?v=" + Date.now();

let db = null;

// ─── Crypto ──────────────────────────────────────────────

async function decryptDb(encryptedBuf, password) {
  const data = new Uint8Array(encryptedBuf);
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const ciphertext = data.slice(28);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new Uint8Array(decrypted);
}

// ─── DB helpers ──────────────────────────────────────────

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  const cols = stmt.getColumnNames();
  while (stmt.step()) {
    const row = {};
    const values = stmt.get();
    cols.forEach((c, i) => (row[c] = values[i]));
    rows.push(row);
  }
  stmt.free();
  return { cols, rows };
}

function scalar(sql) {
  const r = query(sql);
  return r.rows.length ? Object.values(r.rows[0])[0] : null;
}

// ─── Formatting ──────────────────────────────────────────

function fmtMoney(v) {
  if (v == null) return "—";
  const n = Number(v);
  const prefix = n > 0 ? "+" : "";
  return prefix + n.toLocaleString("cs-CZ");
}

function fmtStatus(status) {
  const map = {
    paid: '<span class="status-paid">✅</span>',
    partial: '<span class="status-partial">🟨</span>',
    underpaid: '<span class="status-partial">🟨</span>',
    unpaid: '<span class="status-unpaid">❌</span>',
  };
  return map[status] || "—";
}

function fmtPct(v) {
  if (v == null) return "—";
  return Math.round(v) + "%";
}

// ─── Table renderer ──────────────────────────────────────

const COL_LABELS = {
  budova: "Bud.", name: "Jméno", tenant_id: "ID", unit_id: "Jednotka",
  typ: "Typ", rent_czk: "Nájem", services_czk: "Služby",
  total_monthly_czk: "Celkem", deposit_czk: "Kauce",
  start_date: "Od", end_date: "Do", duration: "Doba",
  month: "Měsíc", expected_czk: "Předpis", received_czk: "Přijato",
  allocated_received_czk: "Přijato", delta_czk: "Rozdíl", status: "Stav",
  stav: "Stav", space_number: "Místo", contract_label: "Smlouva",
  contract_code: "Smlouva",
  label: "Účet", account: "Číslo účtu", owner: "Vlastník",
  total_czk: "Celkem", tenant_count: "Nájemců",
  share: "Podíl", note: "Pozn.", prefix: "Prefix",
  monthly_czk: "Měsíčně", paid: "Plac.", partial: "Část.",
  unpaid: "Nepl.", balance_czk: "Bilance", pct: "%",
  expected_monthly_czk: "Předpis",
  amount_czk: "Částka", date: "Datum",
  dluh_czk: "Dluh", mesicu: "Měsíců", od: "Data od",
  contract_type: "Typ smlouvy", notice_period: "Výpovědní lhůta",
  source: "Zdroj", floor: "Patro", purpose: "Účel",
  total_area_m2: "Plocha m²", tracking_mode: "Sledování",
  due_day: "Splatnost", due_type: "Typ splatnosti", includes: "Zahrnuje",
};

function renderTable(result, opts = {}) {
  const { numCols = [], clickCol = null, hrefFn = null, statusCol = null, pctCol = null, moneyDeltaCol = null, hideCols = [], linkCols = {} } = opts;
  const visibleCols = result.cols.filter((c) => !hideCols.includes(c));
  let html = "<table><thead><tr>";
  visibleCols.forEach((c) => {
    const cls = numCols.includes(c) ? ' class="num"' : "";
    html += `<th${cls}>${COL_LABELS[c] || c}</th>`;
  });
  html += "</tr></thead><tbody>";

  const sumCols = opts.sumCols || [];
  const sums = {};
  sumCols.forEach((c) => (sums[c] = 0));

  result.rows.forEach((row) => {
    const href = hrefFn ? hrefFn(row) : null;
    html += href ? `<tr data-href="${href}">` : "<tr>";
    visibleCols.forEach((c) => {
      const cls = numCols.includes(c) ? ' class="num"' : "";
      let val = row[c];
      if (sumCols.includes(c) && val != null) sums[c] += Number(val);
      if (c === statusCol) val = fmtStatus(val);
      else if (c === pctCol) val = fmtPct(val);
      else if (numCols.includes(c) && c === moneyDeltaCol) val = fmtMoney(val);
      else if (numCols.includes(c) && val != null) val = Number(val).toLocaleString("cs-CZ");
      else if (val == null) val = "—";
      if (c === clickCol && href) {
        val = `<a href="${href}">${val}</a>`;
      } else if (linkCols[c]) {
        const lhref = linkCols[c](row);
        if (lhref) val = lhref.startsWith('#') ? `<a href="${lhref}">${val}</a>` : `<a href="${lhref}" target="_blank">${val}</a>`;
      }
      html += `<td${cls}>${val}</td>`;
    });
    html += "</tr>";
  });
  if (sumCols.length) {
    html += "<tr style='font-weight:bold'>";
    visibleCols.forEach((c) => {
      const cls = numCols.includes(c) ? ' class="num"' : "";
      if (sumCols.includes(c)) {
        html += `<td${cls}>${Number(sums[c]).toLocaleString("cs-CZ")}</td>`;
      } else if (c === visibleCols[0]) {
        html += `<td>Σ</td>`;
      } else {
        html += `<td></td>`;
      }
    });
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

// ─── Views ───────────────────────────────────────────────

function getCurrentMonth() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function monthAdd(month, delta) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function monthNav(month, baseHash) {
  const prev = monthAdd(month, -1);
  const next = monthAdd(month, 1);
  return `<div class="month-nav">
    <button onclick="location.hash='${baseHash}/${prev}'">◀</button>
    <span>${month}</span>
    <button onclick="location.hash='${baseHash}/${next}'">▶</button>
  </div>`;
}

// --- Platby ---

function viewPlatby(month) {
  month = month || getCurrentMonth();
  // Same SELECT as platby.py skill
  const status = query(
    `SELECT unit_id, tenant_id, name, stav, month, expected_czk, received_czk, delta_czk, status
     FROM v_payment_status
     WHERE month = ?
     ORDER BY unit_id, month DESC`,
    [month]
  );

  let html = "<h2>Platby</h2>";
  html += monthNav(month, "#/platby");
  html += renderTable(status, {
    numCols: ["expected_czk", "received_czk", "delta_czk"],
    sumCols: ["expected_czk", "received_czk", "delta_czk"],
    moneyDeltaCol: "delta_czk",
    statusCol: "status",
    clickCol: "name",
    hrefFn: (row) => row.tenant_id ? `#/platby/tenant/${row.tenant_id}` : null,
    hideCols: ["tenant_id"],
  });

  // Stats — same as platby.py
  const stats = query(
    `SELECT total_transactions AS total, incoming, matched,
            first_date AS 'from', last_date AS 'to', tenants_matched AS tenants
     FROM v_platby_stats`
  );
  if (stats.rows.length) {
    const s = stats.rows[0];
    html += `<p><small>${s.total} transakcí, ${s.matched} přiřazených, ${s.tenants} nájemců (${s.from} – ${s.to})</small></p>`;
  }
  return html;
}

function viewPlatbyTenant(tenantId) {
  // Same SELECT as platby.py skill for individual tenant
  const status = query(
    `SELECT unit_id, name, stav, month, expected_czk, received_czk, delta_czk, status
     FROM v_payment_status
     WHERE tenant_id = ?
     ORDER BY unit_id, month DESC`,
    [tenantId]
  );

  const name = status.rows.length ? status.rows[0].name : tenantId;
  let html = `<h2>Platby — <a href="#/tenant/${tenantId}">${name}</a></h2>`;
  html += renderTable(status, {
    numCols: ["expected_czk", "received_czk", "delta_czk"],
    sumCols: ["expected_czk", "received_czk", "delta_czk"],
    moneyDeltaCol: "delta_czk",
    statusCol: "status",
    linkCols: { name: () => `#/tenant/${tenantId}` },
  });

  // Discipline — same as platby.py
  const disc = query(
    `SELECT unit_id, name, stav, expected_monthly_czk AS monthly_czk,
            paid_months AS paid, partial_months AS partial,
            unpaid_months AS unpaid, balance_czk, paid_pct AS pct
     FROM v_payment_discipline
     WHERE tenant_id = ?`,
    [tenantId]
  );
  if (disc.rows.length) {
    html += "<h3>Platební disciplína</h3>";
    html += renderTable(disc, {
      numCols: ["monthly_czk", "paid", "partial", "unpaid", "balance_czk"],
      moneyDeltaCol: "balance_czk",
      pctCol: "pct",
      linkCols: { name: () => `#/tenant/${tenantId}` },
    });
  }
  return html;
}

// --- Tenant detail ---

function viewTenant(tenantId) {
  const t = query("SELECT * FROM v_tenant_detail WHERE tenant_id = ?", [tenantId]);
  if (!t.rows.length) return "<p>Nájemce nenalezen.</p>";
  const tenant = t.rows[0];

  let html = `<h2>${tenant.name}</h2>`;

  // Contact info
  const info = [];
  if (tenant.address) info.push(["Adresa", tenant.address]);
  if (tenant.phone) info.push(["Telefon", tenant.phone]);
  if (tenant.email) info.push(["E-mail", tenant.email]);
  if (tenant.ico) info.push(["IČO", tenant.ico]);
  if (tenant.bank_account) info.push(["Účet", tenant.bank_account]);
  if (tenant.status) info.push(["Stav", tenant.status]);
  if (tenant.note) info.push(["Pozn.", tenant.note]);
  if (info.length) {
    html += `<div style="display:inline-grid;grid-template-columns:auto 1fr;gap:0.2rem 1em;font-size:0.85rem;margin-bottom:1rem">`;
    info.forEach(([k, v]) => { html += `<span style="color:var(--pico-muted-color)">${k}</span><span>${v}</span>`; });
    html += `</div>`;
  }

  // Contracts + Payments + Splits (merged by label)
  const contracts = query(
    "SELECT * FROM v_tenant_contracts WHERE tenant_id = ?", [tenantId]
  );
  const payments = query(
    "SELECT * FROM v_tenant_payments WHERE tenant_id = ?", [tenantId]
  );
  const splits = query(
    "SELECT * FROM v_tenant_splits WHERE tenant_id = ?", [tenantId]
  );
  const payByLabel = {};
  payments.rows.forEach((p) => { payByLabel[p.label] = p; });
  const splitsByLabel = {};
  splits.rows.forEach((s) => { (splitsByLabel[s.label] = splitsByLabel[s.label] || []).push(s); });

  if (contracts.rows.length) {
    html += "<h3>Smlouvy</h3>";
    contracts.rows.forEach((c) => {
      const rows = [];
      if (c.contract_type) rows.push(["Typ", c.contract_type]);
      rows.push(["Od", c.start_date || "—"]);
      if (c.end_date) rows.push(["Do", c.end_date]);
      if (c.duration) rows.push(["Doba", c.duration]);
      if (c.notice_period) rows.push(["Výpověď", c.notice_period]);
      // Payment info for this contract
      const p = payByLabel[c.label];
      if (p) {
        const freq = p.payment_frequency || "monthly";
        const mult = freq === "semi-annual" ? 6 : freq === "annual" ? 12 : 1;
        const freqLabel = freq === "semi-annual" ? "pololetně" : freq === "annual" ? "ročně" : "měsíčně";
        const fmt = (v) => v != null ? Number(v * mult).toLocaleString("cs-CZ") + " Kč" : "—";
        rows.push(["Nájem", fmt(p.rent_czk)]);
        if (p.services_czk) rows.push(["Služby", fmt(p.services_czk)]);
        rows.push(["Celkem", fmt(p.total_monthly_czk)]);
        if (freq !== "monthly") rows.push(["Frekvence", freqLabel]);
        if (p.due_day) rows.push(["Splatnost", `${p.due_day}. den`]);
      }
      // Payment splits for this contract
      const cSplits = splitsByLabel[c.label] || [];
      if (cSplits.length) {
        const splitParts = cSplits.map((s) => {
          const amt = Number(s.amount_czk).toLocaleString("cs-CZ") + " Kč";
          return `${s.owner} ${amt}` + (s.includes ? ` (${s.includes})` : "") + ` → ${s.account}`;
        });
        rows.push(["Platby na", splitParts.join("<br>")]);
      }
      if (c.source) {
        const src = c.drive_id
          ? `<a href="https://drive.google.com/file/d/${c.drive_id}/view" target="_blank">${c.source}</a>`
          : c.source;
        rows.push(["Smlouva", src]);
      }
      html += `<div style="display:grid;grid-template-columns:auto 1fr;gap:0.2rem 1em;font-size:0.85rem;margin-bottom:1rem">`;
      rows.forEach(([k, v]) => { html += `<span style="color:var(--pico-muted-color)">${k}</span><span>${v}</span>`; });
      html += `</div>`;
    });
  }

  // Premises
  const premises = query(
    "SELECT * FROM v_tenant_premises WHERE tenant_id = ?", [tenantId]
  );
  if (premises.rows.length) {
    html += "<h3>Prostory</h3>";
    html += renderTable(premises, { numCols: ["total_area_m2"], hideCols: ["tenant_id"] });
  }

  html += `<p><a href="#/platby/tenant/${tenantId}">Zobrazit platby →</a></p>`;
  return html;
}

// --- Dluhy (debtors) ---

function viewDluhy() {
  const debtors = query(
    `SELECT t.name, pm.tenant_id,
       ABS(SUM(pm.allocated_received_czk - pm.expected_czk)) AS dluh_czk,
       COUNT(DISTINCT pm.month) AS mesicu,
       MIN(pm.month) AS od
     FROM v_payment_monthly pm
     JOIN tenants t ON t.id = pm.tenant_id
     WHERE pm.stav = 'AKTIVNÍ' AND pm.month < strftime('%Y-%m', 'now')
     GROUP BY pm.tenant_id
     HAVING SUM(pm.allocated_received_czk - pm.expected_czk) < 0
     ORDER BY SUM(pm.allocated_received_czk - pm.expected_czk)`
  );
  let html = "<h2>Dlužníci</h2>";
  html += renderTable(debtors, {
    numCols: ["dluh_czk", "mesicu"],
    sumCols: ["dluh_czk"],
    clickCol: "name",
    hrefFn: (row) => `#/platby/tenant/${row.tenant_id}`,
    hideCols: ["tenant_id"],
  });
  return html;
}

// --- Income ---

function viewIncome() {
  // Same SELECT as income.py skill
  const smlouvy = query(
    `SELECT budova, name, tenant_id, typ, rent_czk, services_czk, total_monthly_czk
     FROM v_smlouvy`
  );
  const byAccount = query(
    `SELECT label, account, owner, total_czk, tenant_count
     FROM v_income_by_account`
  );
  const owners = query("SELECT name, share, note FROM owners ORDER BY name");

  let html = "<h2>Měsíční příjmy</h2>";
  html += renderTable(smlouvy, {
    numCols: ["rent_czk", "services_czk", "total_monthly_czk"],
    sumCols: ["rent_czk", "services_czk", "total_monthly_czk"],
    clickCol: "name",
    hrefFn: (row) => row.tenant_id ? `#/platby/tenant/${row.tenant_id}` : null,
    hideCols: ["tenant_id"],
  });
  if (byAccount.rows.length) {
    html += "<h3>Podle účtu</h3>";
    html += renderTable(byAccount, {
      numCols: ["total_czk", "tenant_count"],
      sumCols: ["total_czk"],
    });
  }
  if (owners.rows.length) {
    html += "<h3>Spoluvlastníci</h3>";
    html += renderTable(owners);
  }

  const prefixes = query("SELECT prefix, name FROM unit_prefixes ORDER BY prefix");
  if (prefixes.rows.length) {
    html += "<h3>Označení prostor</h3>";
    html += renderTable(prefixes);
  }

  return html;
}

// --- Smlouvy ---

function viewSmlouvy() {
  // Same SELECT as smlouvy.py skill
  const data = query(
    `SELECT budova, name, tenant_id, unit_id, typ, rent_czk, services_czk,
            total_monthly_czk, deposit_czk, start_date, end_date, duration
     FROM v_smlouvy`
  );
  let html = "<h2>Aktivní smlouvy</h2>";
  html += renderTable(data, {
    numCols: ["rent_czk", "services_czk", "total_monthly_czk", "deposit_czk"],
    sumCols: ["rent_czk", "services_czk", "total_monthly_czk"],
    clickCol: "name",
    hrefFn: (row) => row.tenant_id ? `#/platby/tenant/${row.tenant_id}` : null,
    hideCols: ["tenant_id"],
  });
  return html;
}

// --- Parking ---

function viewParking() {
  const data = query(
    `SELECT space_number, name, tenant_id, contract_code, drive_id, rent_czk
     FROM v_parking_map`
  );
  let html = "<h2>Parkovací místa</h2>";
  html += renderTable(data, {
    numCols: ["rent_czk"],
    sumCols: ["rent_czk"],
    clickCol: "name",
    hrefFn: (row) => row.tenant_id ? `#/platby/tenant/${row.tenant_id}` : null,
    hideCols: ["tenant_id", "drive_id"],
    linkCols: {
      contract_code: (row) => {
        if (!row.drive_id) return null;
        return `https://drive.google.com/file/d/${row.drive_id}/view`;
      },
    },
  });
  return html;
}

// --- TODO ---

function viewTodo() {
  const ending = query("SELECT * FROM v_contracts_ending");
  const unmatched = query("SELECT * FROM v_unmatched_transactions LIMIT 20");

  let html = "<h2>TODO</h2>";

  html += "<h3>Smlouvy s blížícím se koncem</h3>";
  if (ending.rows.length) {
    html += renderTable(ending, {
      clickCol: "name",
      hrefFn: (row) => row.tenant_id ? `#/platby/tenant/${row.tenant_id}` : null,
    });
  } else {
    html += "<p>Žádné smlouvy s blížícím se koncem.</p>";
  }

  if (unmatched.rows.length) {
    html += "<h3>Nepřiřazené transakce</h3>";
    html += renderTable(unmatched, {
      numCols: ["amount"],
    });
  }
  return html;
}

function viewUnmatched() {
  const unmatched = query("SELECT * FROM v_unmatched_transactions");
  let html = "<h2>Nepřiřazené transakce</h2>";
  if (unmatched.rows.length) {
    html += renderTable(unmatched, {
      numCols: ["amount"],
    });
  } else {
    html += "<p>Žádné nepřiřazené transakce.</p>";
  }
  return html;
}

// --- Home ---

function viewHome() {
  const income = query(
    "SELECT SUM(total_monthly_czk) as total_monthly FROM v_smlouvy"
  );
  const stats = query("SELECT * FROM v_platby_stats");
  const ending = query("SELECT name, end_date AS do, duration AS doba, tenant_id FROM v_contracts_ending LIMIT 5");

  // Current month payment stats
  const curMonth = getCurrentMonth();
  const monthStats = query(
    `SELECT
       SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
       SUM(CASE WHEN status IN ('partial','underpaid') THEN 1 ELSE 0 END) AS partial,
       SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid
     FROM v_payment_status WHERE month = ? AND stav = 'AKTIVNÍ'`,
    [curMonth]
  );

  // Free parking spaces (47 total)
  const parkingOccupied = scalar("SELECT COUNT(DISTINCT space_number) FROM v_parking_map");
  const parkingFree = 47 - (parkingOccupied || 0);

  // Total debt (net balance across all tenants with negative balance, excluding current month)
  const debtBase = "FROM v_payment_monthly pm JOIN tenants t ON t.id = pm.tenant_id " +
    "WHERE pm.stav = 'AKTIVNÍ' AND pm.month < strftime('%Y-%m', 'now') " +
    "GROUP BY pm.tenant_id HAVING SUM(pm.allocated_received_czk - pm.expected_czk) < 0";
  const totalDebt = scalar(
    "SELECT ABS(SUM(bal)) FROM (SELECT SUM(pm.allocated_received_czk - pm.expected_czk) AS bal " + debtBase + ")"
  ) || 0;

  // Biggest debtor (excluding current month)
  const topDebtor = query(
    "SELECT t.name, pm.tenant_id, ABS(SUM(pm.allocated_received_czk - pm.expected_czk)) AS debt " +
    debtBase + " ORDER BY SUM(pm.allocated_received_czk - pm.expected_czk) LIMIT 1"
  );

  // Second biggest debtor (excluding current month)
  const secondDebtor = query(
    "SELECT t.name, pm.tenant_id, ABS(SUM(pm.allocated_received_czk - pm.expected_czk)) AS debt " +
    debtBase + " ORDER BY SUM(pm.allocated_received_czk - pm.expected_czk) LIMIT 1 OFFSET 1"
  );

  // Longest unpaid streak
  const longestUnpaid = query(
    "SELECT name, tenant_id, COUNT(*) AS months FROM v_payment_status " +
    "WHERE stav = 'AKTIVNÍ' AND status = 'unpaid' GROUP BY tenant_id ORDER BY months DESC LIMIT 1"
  );

  // Active contracts count
  const activeContracts = scalar(
    "SELECT COUNT(*) FROM contracts c JOIN tenants t ON t.id = c.tenant_id " +
    "WHERE c.is_current = 1 AND t.status = 'AKTIVNÍ'"
  ) || 0;

  // Contracts needing attention
  const todoCount = scalar(
    "SELECT COUNT(*) FROM contracts c JOIN tenants t ON t.id = c.tenant_id " +
    "WHERE c.is_current = 1 AND t.status = 'AKTIVNÍ' " +
    "AND (c.end_date < date('now') OR c.status = 'draft' OR c.signing_status = 'unsigned')"
  );

  let html = "<h2>Přehled</h2>";

  if (income.rows.length) {
    const r = income.rows[0];
    const ms = monthStats.rows.length ? monthStats.rows[0] : {};
    html += `<div class="grid">
      <article><h3>${Number(r.total_monthly).toLocaleString("cs-CZ")} Kč</h3><p><a href="#/income">Měsíční příjem</a></p></article>
      <article><h3 class="status-unpaid">${Number(totalDebt).toLocaleString("cs-CZ")} Kč</h3><p><a href="#/dluhy">Dlužná částka</a></p></article>
      <article><h3><span class="status-paid">${ms.paid || 0}</span> / <span class="status-partial">${ms.partial || 0}</span> / <span class="status-unpaid">${ms.unpaid || 0}</span></h3><p><a href="#/platby/${curMonth}">Platby</a><br>${curMonth}</p></article>
      <article><h3>${parkingFree} volných</h3><p><a href="#/parking">Parking</a> (${parkingOccupied}/47)</p></article>
      <article><h3>${activeContracts}</h3><p><a href="#/smlouvy">Aktivních smluv</a></p></article>
      <article><h3>${todoCount || 0}</h3><p><a href="#/todo">Úkolů k řešení</a></p></article>
    </div>
    <div class="grid">
      ${topDebtor.rows.length ? `<article><h3 class="status-unpaid">${Number(topDebtor.rows[0].debt).toLocaleString("cs-CZ")} Kč</h3><p>Největší dlužník: <a href="#/platby/tenant/${topDebtor.rows[0].tenant_id}">${topDebtor.rows[0].name}</a></p></article>` : ''}
      ${secondDebtor.rows.length ? `<article><h3 class="status-unpaid">${Number(secondDebtor.rows[0].debt).toLocaleString("cs-CZ")} Kč</h3><p>2. dlužník: <a href="#/platby/tenant/${secondDebtor.rows[0].tenant_id}">${secondDebtor.rows[0].name}</a></p></article>` : ''}
      ${longestUnpaid.rows.length ? `<article><h3 class="status-unpaid">${longestUnpaid.rows[0].months} měsíců</h3><p>Nejdelší neplacení: <a href="#/platby/tenant/${longestUnpaid.rows[0].tenant_id}">${longestUnpaid.rows[0].name}</a></p></article>` : ''}
    </div>`;
  }

  const recent = query("SELECT * FROM v_recent_payments LIMIT 5");
  if (stats.rows.length) {
    const s = stats.rows[0];
    html += `<div class="grid">
      <article><h3>${scalar("SELECT COUNT(*) FROM v_unmatched_transactions") || 0}</h3><p><a href="#/unmatched">Nepřiřazených transakcí</a></p></article>
      <article><h3>${s.tenants_matched}</h3><p>Nájemců s platbami</p></article>
      <article><h3>${s.last_imported ? s.last_imported.replace('T', ' ').slice(0, 16) : s.last_date}</h3><p>Poslední zpracování</p></article>
    </div>`;
  }
  if (recent.rows.length || ending.rows.length) {
    html += `<div class="grid" style="grid-template-columns:1fr 1fr">`;
    if (recent.rows.length) {
      html += `<article style="text-align:left"><h3>Poslední platby</h3><div style="display:inline-grid;grid-template-columns:auto auto auto;gap:0 1em;font-size:0.85rem">` +
        recent.rows.map(r =>
          `<span style="white-space:nowrap">${r.date}</span><span><a href="#/platby/tenant/${r.tenant_id}">${r.name}</a></span><span style="white-space:nowrap;font-variant-numeric:tabular-nums;text-align:left">${Number(r.amount_czk).toLocaleString("cs-CZ")} Kč</span>`
        ).join('') + `</div></article>`;
    }
    if (ending.rows.length) {
      html += `<article style="text-align:left"><h3>Smlouvy s blížícím se koncem</h3><div style="display:inline-grid;grid-template-columns:max-content max-content auto;gap:0 1em;font-size:0.85rem">` +
        ending.rows.map(r =>
          `<span style="white-space:nowrap">${r.do}</span><span style="white-space:nowrap"><a href="#/platby/tenant/${r.tenant_id}">${r.name}</a></span><span>${r.doba}</span>`
        ).join('') + `</div></article>`;
    }
    html += `</div>`;
  }

  return html;
}

// ─── Router ──────────────────────────────────────────────

function route() {
  if (!db) return;

  const hash = location.hash || "#/";
  const content = document.getElementById("content");

  // Update active nav link
  document.querySelectorAll("nav a[data-nav]").forEach((a) => {
    a.classList.toggle("active", hash.startsWith(a.getAttribute("href")));
  });

  try {
    let html;
    if (hash === "#/" || hash === "#" || hash === "") {
      html = viewHome();
    } else if (hash.match(/^#\/tenant\/(.+)$/)) {
      html = viewTenant(RegExp.$1);
    } else if (hash.match(/^#\/platby\/tenant\/(.+)$/)) {
      html = viewPlatbyTenant(RegExp.$1);
    } else if (hash.match(/^#\/platby\/(\d{4}-\d{2})$/)) {
      html = viewPlatby(RegExp.$1);
    } else if (hash === "#/platby") {
      html = viewPlatby();
    } else if (hash === "#/dluhy") {
      html = viewDluhy();
    } else if (hash === "#/income") {
      html = viewIncome();
    } else if (hash === "#/smlouvy") {
      html = viewSmlouvy();
    } else if (hash === "#/parking") {
      html = viewParking();
    } else if (hash === "#/todo") {
      html = viewTodo();
    } else if (hash === "#/unmatched") {
      html = viewUnmatched();
    } else {
      html = "<p>Stránka nenalezena.</p>";
    }
    content.innerHTML = html;

    // Bind clickable rows
    content.querySelectorAll("tr[data-href]").forEach((tr) => {
      tr.addEventListener("click", (e) => {
        if (e.target.tagName === "A") return;
        location.hash = tr.dataset.href;
      });
    });
  } catch (err) {
    content.innerHTML = `<article><h3>Chyba</h3><pre>${err.message}</pre></article>`;
  }
}

// ─── Init ────────────────────────────────────────────────

async function init(password) {
  const resp = await fetch(DB_URL);
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);

  const encBuf = await resp.arrayBuffer();
  const dbBytes = await decryptDb(encBuf, password);

  const SQL = await initSqlJs({
    locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/${file}`,
  });

  db = new SQL.Database(dbBytes);

  // Show content, hide login
  document.getElementById("login-screen").hidden = true;
  document.getElementById("content").hidden = false;

  // DB info in footer
  const lastDate = scalar("SELECT MAX(date) FROM bank_transactions");
  document.getElementById("db-info").textContent = `Data k ${lastDate || "?"}`;

  // Save password in session
  sessionStorage.setItem("dbpass", password);

  // Route
  route();
}

// ─── Theme ───────────────────────────────────────────────

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const toggle = document.getElementById("theme-toggle");
  if (toggle) toggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

// ─── Boot ────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Theme: restore from localStorage or detect system preference
  const saved_theme = localStorage.getItem("theme");
  if (saved_theme) {
    applyTheme(saved_theme);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }

  // Theme toggle button
  document.getElementById("theme-toggle").addEventListener("click", (e) => {
    e.preventDefault();
    toggleTheme();
  });

  // Login form
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pw = document.getElementById("password").value;
    const errEl = document.getElementById("login-error");
    errEl.hidden = true;
    try {
      await init(pw);
    } catch (err) {
      console.error(err);
      errEl.hidden = false;
    }
  });

  // Auto-login from session
  const saved = sessionStorage.getItem("dbpass");
  if (saved) {
    init(saved).catch(() => {
      sessionStorage.removeItem("dbpass");
    });
  }

  // Hash change routing
  window.addEventListener("hashchange", route);
});
