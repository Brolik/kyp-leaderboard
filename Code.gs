// ============================================================
// CONFIGURATION — edit these before deploying
// ============================================================
const CONFIG = {
  API_KEY: "",           // change this
  ALLOWED_ORIGINS: [],                                       // file:// origins],
  SHEET_NAMES: {
    results:           "results",
    players:           "players",
    venues:            "venues",
    config_skill:      "config_skill_level",
    config_event:      "config_event_types",
    config_state:      "config_state",
  },
};

// ============================================================
// ENTRY POINTS
// ============================================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const origin = (e && e.parameter && e.parameter.origin)
    ? e.parameter.origin
    : "";

  // CORS preflight / headers
  const headers = buildCorsHeaders(origin);

  // Validate API key
  const apiKey = (e && e.parameter && e.parameter.api_key) || "";
  if (apiKey !== CONFIG.API_KEY) {
    return jsonResponse({ error: "Unauthorized" }, 401, headers);
  }

  // Validate origin
  if (!isOriginAllowed(origin)) {
    return jsonResponse({ error: "Forbidden origin" }, 403, headers);
  }

  const action = (e && e.parameter && e.parameter.action) || "all";

  try {
    let data;
    switch (action) {
      case "all":        data = getAllData();        break;
      case "results":    data = getResultsData();   break;
      case "config":     data = getConfigData();    break;
      case "players":    data = getPlayersData();   break;
      default:           data = { error: "Unknown action" };
    }
    return jsonResponse(data, 200, headers);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500, headers);
  }
}

// ============================================================
// SECURITY HELPERS
// ============================================================

function isOriginAllowed(origin) {
  if (!origin) return false;
  return CONFIG.ALLOWED_ORIGINS.some(allowed => {
    // exact match or wildcard subdomain support
    if (allowed === origin) return true;
    if (allowed.startsWith("*.")) {
      const base = allowed.slice(2);
      return origin.endsWith("." + base) || origin === base;
    }
    return false;
  });
}

function buildCorsHeaders(origin) {
  const allowedOrigin = isOriginAllowed(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin":  allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type":                 "application/json",
    "Cache-Control":                "no-store",
  };
}

function jsonResponse(data, code, extraHeaders) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ============================================================
// DATA READERS — sheet → array of objects
// ============================================================

function sheetToObjects(sheetName) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);

  const data    = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g, "_"));
  const rows    = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Skip completely empty rows
    if (row.every(cell => cell === "" || cell === null || cell === undefined)) continue;

    const obj = {};
    headers.forEach((h, idx) => {
      let val = row[idx];
      // Normalise Google Sheets Date objects
      if (val instanceof Date) val = val.toISOString();
      // Normalise empty
      if (val === "" || val === null || val === undefined) val = null;
      obj[h] = val;
    });
    rows.push(obj);
  }
  return rows;
}

// ============================================================
// API DATA BUILDERS
// ============================================================

function getConfigData() {
  return {
    skill_levels:  sheetToObjects(CONFIG.SHEET_NAMES.config_skill),
    event_types:   sheetToObjects(CONFIG.SHEET_NAMES.config_event),
    states:        sheetToObjects(CONFIG.SHEET_NAMES.config_state),
    venues:        sheetToObjects(CONFIG.SHEET_NAMES.venues),
  };
}

function getPlayersData() {
  return sheetToObjects(CONFIG.SHEET_NAMES.players);
}

/**
 * Results with gold/silver/bronze player objects joined from players table.
 *
 * Each medal column stores a UUID reference to a player row.
 * Returns nested objects:
 *   { event_name, gold_medal: { uuid, name, state, ... }, ... }
 */
function getResultsData() {
  const results = sheetToObjects(CONFIG.SHEET_NAMES.results);
  const players = sheetToObjects(CONFIG.SHEET_NAMES.players);

  // Build UUID → player lookup
  const playerMap = {};
  players.forEach(p => { if (p.uuid) playerMap[p.uuid] = p; });

  // Fallback: display-string → player for entries stored before UUID was appended to dropdowns
  const playerDisplayMap = {};
  players.forEach(p => {
    if (!p.name) return;
    const duprPart  = p.dupr_id ? ` [${p.dupr_id}]` : "";
    const statePart = p.state   ? ` - ${p.state}`    : "";
    playerDisplayMap[`${p.name}${statePart}${duprPart}`.toLowerCase()] = p;
  });

  const MEDAL_COLS = ["gold_medal", "silver_medal", "bronze_medal"];

  return results.map(row => {
    const enriched = Object.assign({}, row);
    MEDAL_COLS.forEach(col => {
      const raw = row[col]; // may be a single UUID or comma-separated UUIDs
      if (!raw) {
        enriched[col] = null;
        return;
      }
      // Support multi-select: "uuid1,uuid2"
      // Also handle dropdown display format: "Name - State [dupr_id] — uuid"
      const uuids = String(raw).split(",").map(s => {
        const trimmed = s.trim();
        const dashIdx = trimmed.lastIndexOf("—");
        if (dashIdx !== -1) return trimmed.slice(dashIdx + 1).trim();
        return trimmed;
      }).filter(Boolean);
      const resolved = uuids.map(uid =>
        playerMap[uid]
        || playerDisplayMap[uid.toLowerCase()]
        || { uuid: uid, name: null, state: null, dupr_id: null }
      );
      enriched[col] = resolved.length === 1 ? resolved[0] : resolved;
    });
    return enriched;
  });
}

function getAllData() {
  return {
    results: getResultsData(),
    players: getPlayersData(),
    config:  getConfigData(),
    _meta: {
      generated_at: new Date().toISOString(),
      version:      1,
    },
  };
}

// ============================================================
// CUSTOM SHEET FORMULAS
// ============================================================

/**
 * =PLAYER_UUID(watch_cell)
 *
 * Returns a stable UUID the first time the watched cell becomes non-empty.
 * IMPORTANT: This formula alone cannot be truly immutable from within a
 * custom function (Apps Script recalculates on open). Use the onEdit trigger
 * below (writeStableUUID) for production-grade immutability.
 *
 * Usage: =PLAYER_UUID(B2)   → place in column A of the players sheet
 */
function PLAYER_UUID(watchValue) {
  if (watchValue === "" || watchValue === null || watchValue === undefined) return "";
  return generateUUID_();
}

/**
 * =DATE_CREATED(watch_cell)
 *
 * Returns the current datetime the first time the watched cell becomes
 * non-empty. Same immutability caveat — use the onEdit trigger below for
 * production-grade behaviour.
 *
 * Usage: =DATE_CREATED(B2)   → place in column E of the players sheet
 */
function DATE_CREATED(watchValue) {
  if (watchValue === "" || watchValue === null || watchValue === undefined) return "";
  return new Date().toISOString();
}

// ============================================================
// STABLE UUID + DATE via onEdit trigger (RECOMMENDED)
//
// Because custom functions re-evaluate on sheet load/recalc, they cannot
// truly lock in a value. The pattern below uses an installable onEdit
// trigger to write a raw value (not a formula) into the UUID and
// date_created columns the moment a player name is first entered.
//
// Setup:
//   1. Delete =PLAYER_UUID() and =DATE_CREATED() formulas from the sheet.
//   2. Leave UUID (col A) and date_created (col E) cells EMPTY.
//   3. Run installTriggers() once from the Apps Script editor.
//   4. The trigger fires on every edit and fills A/E automatically.
// ============================================================

function installTriggers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Remove duplicates first
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("onEditHandler")
    .forSpreadsheet(ss)
    .onEdit()
    .create();
  Logger.log("Trigger installed.");
}

function onEditHandler(e) {
  if (!e || !e.range) return;

  const sheet     = e.range.getSheet();
  const sheetName = sheet.getName();
  const col       = e.range.getColumn();
  const row       = e.range.getRow();

  if (row <= 1) return; // header row — ignore

  const colMap = getHeaderColumnMap_(sheet);

  // ── Players sheet: watch the "name" column ──
  if (sheetName === CONFIG.SHEET_NAMES.players) {
    const nameCol = colMap["name"];
    if (!nameCol || col !== nameCol) return;

    const nameVal = sheet.getRange(row, nameCol).getValue();
    if (!nameVal || nameVal === "") return; // name cleared — do nothing

    // uuid: only write if currently empty
    const uuidCol = colMap["uuid"];
    if (uuidCol) {
      const uuidCell = sheet.getRange(row, uuidCol);
      if (!uuidCell.getValue()) uuidCell.setValue(generateUUID_());
    }

    // date_created: only write if currently empty
    const dateCol = colMap["date_created"];
    if (dateCol) {
      const dateCell = sheet.getRange(row, dateCol);
      if (!dateCell.getValue()) dateCell.setValue(new Date().toISOString());
    }

    // Refresh the PlayerList named range so medal dropdowns stay current
    refreshPlayerDropdownRange(true);
  }

  // ── Results sheet: watch the "event_name" column ──
  if (sheetName === CONFIG.SHEET_NAMES.results) {
    const nameCol = colMap["event_name"];
    if (!nameCol || col !== nameCol) return;

    const nameVal = sheet.getRange(row, nameCol).getValue();
    if (!nameVal || nameVal === "") return;

    const uuidCol = colMap["uuid"];
    if (uuidCol) {
      const uuidCell = sheet.getRange(row, uuidCol);
      if (!uuidCell.getValue()) uuidCell.setValue(generateUUID_());
    }
  }
}

// Returns { normalised_header_name: columnNumber (1-indexed) } for the given sheet.
// Uses the same normalisation as sheetToObjects so column names are consistent.
function getHeaderColumnMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headers.forEach((h, i) => {
    const key = String(h).trim().toLowerCase().replace(/\s+/g, "_");
    if (key) map[key] = i + 1;
  });
  return map;
}

// ============================================================
// UUID GENERATOR (RFC 4122 v4)
// ============================================================

function generateUUID_() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================
// MULTI-SELECT PLAYER HELPER
//
// In the results sheet, gold/silver/bronze columns use data validation
// dropdowns that show player names. But because two players can share a
// name, the dropdown stores UUIDs instead of names.
//
// Use =PLAYER_DROPDOWN_LIST() as the source range for data validation
// on those cells — it returns a 1-column list of "Name (uuid)" strings.
// The API layer strips the UUID back out for the join.
//
// Alternatively, store raw UUIDs directly (comma-separated for multi) and
// use a sidebar/dialog for the picker UI (see sidebar approach below).
// ============================================================

function PLAYER_DROPDOWN_LIST() {
  // Returns a 2D array suitable for a named range used in data validation
  const players = sheetToObjects(CONFIG.SHEET_NAMES.players);
  return players
    .filter(p => p.uuid && p.name)
    .map(p => {
      const duprPart = p.dupr_id ? ` [${p.dupr_id}]` : "";
      const statePart = p.state ? ` - ${p.state}` : "";
      return [`${p.name}${statePart}${duprPart} — ${p.uuid}`];
    });
}

/**
 * Refresh the named range "PlayerList" used by result medal dropdowns.
 * Run this manually or schedule it after bulk player imports.
 */
function refreshPlayerDropdownRange(silent) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const list   = PLAYER_DROPDOWN_LIST();
  let   target = ss.getSheetByName("_dropdowns");
  if (!target) {
    target = ss.insertSheet("_dropdowns");
    target.hideSheet();
  }
  target.clearContents();
  if (list.length > 0) {
    target.getRange(1, 1, list.length, 1).setValues(list);
  }
  // Update named range
  const namedRanges = ss.getNamedRanges();
  const existing    = namedRanges.find(nr => nr.getName() === "PlayerList");
  const newRange    = target.getRange(1, 1, Math.max(list.length, 1), 1);
  if (existing) {
    existing.setRange(newRange);
  } else {
    ss.setNamedRange("PlayerList", newRange);
  }
  if (!silent) {
    try {
      SpreadsheetApp.getUi().alert("PlayerList updated with " + list.length + " entries.");
    } catch (_) {
      Logger.log("PlayerList updated with " + list.length + " entries.");
    }
  }
}