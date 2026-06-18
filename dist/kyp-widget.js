/**
 * sports-widget/src/widget.js
 *
 * Core logic only. Styles and template are injected by the build script.
 * Do not reference __STYLES__ or __TEMPLATE__ directly here — the build
 * replaces those placeholders in the compiled output.
 */
(function (global) {
  "use strict";

  var CACHE_KEY     = "sports_widget_cache_v2";
  var CACHE_DEFAULT = 1;

  // ── Injected at build time ───────────────────────────────────────────────
  // build.js replaces these placeholders with compiled CSS / escaped HTML.
  var INJECTED_STYLES   = `.kyp-root{font-family:Hind,Arial,sans-serif;font-size:14px;color:var(--c-text, #111827);background:var(--c-bg, #fff);border-radius:25px;padding:16px;--c-accent: #1677bc;--c-bg: #fff;--c-bg2: #e3e3e3;--c-bg3: rgba(227, 227, 227, 0.3019607843);--c-border: #d0d8e1;--c-text: #111827;--c-muted: #000}.kyp-header{display:flex;align-items:center;margin-bottom:16px}.kyp-title-wrap{display:flex;align-items:center;gap:10px}.kyp-title{margin:0;color:var(--c-muted)}.kyp-cache-badge{font-size:11px;padding:2px 8px;border-radius:20px;background:#dbeafe;color:#1d4ed8;font-weight:500}.kyp-controls{display:flex;flex-direction:column;gap:12px;margin-bottom:16px;padding:16px 18px;background:var(--c-bg2);border-radius:10px;border:1px solid var(--c-border);overflow:hidden;position:relative}@media screen and (max-width: 380px){.kyp-controls{padding:10px}}.kyp-control-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;z-index:1}.kyp-control-label{font-size:14px;font-weight:600;color:var(--c-text);text-transform:uppercase;letter-spacing:.5px;min-width:52px}.kyp-control-decoration{position:absolute;right:-70px;top:-188px;z-index:0}@media screen and (max-width: 600px){.kyp-control-decoration{right:-200px;top:0}}.kyp-control-decoration svg{height:100%;opacity:.6;width:100%}.kyp-radio-group{display:flex;gap:6px;flex-wrap:wrap}.kyp-radio-input{position:absolute;opacity:0;width:0;height:0}.kyp-radio-input:checked+.kyp-radio-label{background:var(--c-accent);border-color:var(--c-accent);color:#fff}.kyp-radio-input:focus-visible+.kyp-radio-label{outline:2px solid var(--c-accent);outline-offset:2px}.kyp-radio-label{display:inline-block;padding:5px 14px;border-radius:20px;cursor:pointer;font-size:18px;font-family:"Teko Variablefont Wght",Verdana,sans-serif;font-weight:500;background:var(--c-bg);border:1.5px solid var(--c-border);color:var(--c-muted);letter-spacing:2px;line-height:normal;margin-bottom:0;text-transform:uppercase;transition:background .12s,color .12s,border-color .12s;user-select:none}.kyp-radio-label:hover{border-color:var(--c-accent);color:var(--c-accent)}@media screen and (max-width: 678px){.kyp-radio-label{font-size:16px}}@media screen and (max-width: 480px){.kyp-radio-label{font-size:14px}}.kyp-cat-label{font-size:13px;font-weight:600;color:var(--c-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:.4px}.kyp-table-wrap{position:relative;overflow-x:auto;border-radius:10px;border:1px solid var(--c-border)}.kyp-table{width:100%;border-collapse:collapse;font-size:13px}.kyp-th{padding:10px 12px;background:var(--c-bg2);color:var(--c-text);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--c-border);white-space:nowrap;text-align:left}.kyp-th.kyp-th-center{text-align:center}.kyp-th.kyp-th-state{min-width:64px}.kyp-tr{background:var(--c-bg)}.kyp-tr-alt{background:var(--c-bg3)}.kyp-tr:hover td,.kyp-tr-alt:hover td{background:#eff6ff}.kyp-td{padding:10px 12px;border-bottom:1px solid var(--c-border);vertical-align:middle}.kyp-td.kyp-td-center{text-align:center}.kyp-td.kyp-td-name{font-weight:600}.kyp-td.kyp-td-state{color:var(--c-muted);font-size:12px}.kyp-td.kyp-td-pts strong{color:var(--c-accent);font-weight:700;font-size:15px}.kyp-medal-zero{color:var(--c-border);font-size:16px}.kyp-rank{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:26px;border-radius:6px;font-size:12px;font-weight:700;background:var(--c-bg3);color:var(--c-muted);padding:0 6px}.kyp-rank.kyp-rank-1{background:#fef3c7;color:#92400e}.kyp-rank.kyp-rank-2{background:#f1f5f9;color:#475569}.kyp-rank.kyp-rank-3{background:#fdf2e6;color:#92400e}.kyp-medal-count{display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:600;padding:2px 8px;border-radius:20px}.kyp-medal-count.kyp-medal-gold{background:#fef3c7;color:#92400e}.kyp-medal-count.kyp-medal-silver{background:#f1f5f9;color:#374151}.kyp-medal-count.kyp-medal-bronze{background:#fdf2e6;color:#92400e}.kyp-overlay{position:absolute;inset:0;background:hsla(0,0%,100%,.65);border-radius:10px;display:flex;align-items:center;justify-content:center;z-index:10;backdrop-filter:blur(1px);-webkit-backdrop-filter:blur(1px)}.kyp-spinner{width:28px;height:28px;border-radius:50%;border:3px solid var(--c-border);border-top-color:var(--c-accent);animation:kyp-spin .7s linear infinite}@keyframes kyp-spin{to{transform:rotate(360deg)}}.kyp-empty-state{padding:48px 24px;text-align:center;color:var(--c-muted)}.kyp-empty-icon{font-size:40px;margin-bottom:10px}.kyp-skeleton{border-radius:6px;background:linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);background-size:200%;animation:kyp-shimmer 1.4s infinite}@keyframes kyp-shimmer{0%{background-position:200%}100%{background-position:-200%}}.kyp-error{padding:20px;background:#fff3f3;border-radius:8px;color:#991b1b}.kyp-meta{font-size:11px;color:var(--c-muted);margin-top:12px;text-align:right}@media(prefers-color-scheme: dark){.kyp-root{--c-accent: #e3e3e3;--c-bg: #0e152c;--c-bg2: #1e2a40;--c-bg3: #1e2a40;--c-border: #2d3a52;--c-text: #f1f5f9;--c-muted: #fff}.kyp-cache-badge{background:#1e3a6e;color:#93c5fd}.kyp-radio-label{background:var(--c-bg2)}.kyp-radio-input:checked+.kyp-radio-label{background:var(--c-accent);color:#0f172a}.kyp-tr:hover td,.kyp-tr-alt:hover td{background:#1e3258}.kyp-rank.kyp-rank-1{background:#451a03;color:#fbbf24}.kyp-rank.kyp-rank-2{background:#1e293b;color:#94a3b8}.kyp-rank.kyp-rank-3{background:#3b1f06;color:#d97706}.kyp-medal-count.kyp-medal-gold{background:#451a03;color:#fbbf24}.kyp-medal-count.kyp-medal-silver{background:#1e293b;color:#e2e8f0}.kyp-medal-count.kyp-medal-bronze{background:#3b1f06;color:#d97706}.kyp-overlay{background:rgba(17,24,39,.65)}.kyp-spinner{border-color:#2d3a52;border-top-color:var(--c-accent)}.kyp-skeleton{background:linear-gradient(90deg, #1a2235 25%, #1e2a40 50%, #1a2235 75%);background-size:200%}}.kyp-name-btn{background:none;border:none;padding:0;font:inherit;font-weight:600;color:var(--c-accent);cursor:pointer;text-decoration:underline;text-decoration-color:rgba(0,0,0,0);text-underline-offset:2px;transition:text-decoration-color .15s}.kyp-name-btn:hover{text-decoration-color:var(--c-accent)}.kyp-name-btn:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px;border-radius:2px}.kyp-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}.kyp-modal-backdrop[aria-hidden=true]{display:none}.kyp-modal{background:var(--c-bg);border-radius:12px;border:1px solid var(--c-border);width:max-content;max-width:calc(100vw - 50px);max-height:80vh;padding:25px;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.3)}@media screen and (max-width: 380px){.kyp-modal{padding:12px;max-width:calc(100vw - 36px)}}.kyp-modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 8px;border-bottom:1px solid var(--c-border);flex-shrink:0}@media screen and (max-width: 380px){.kyp-modal-header{padding-top:8px}}.kyp-modal-title{margin:0;font-size:16px;font-weight:700;color:var(--c-text)}.kyp-modal-close{background:none;border:none;font-size:22px;line-height:1;cursor:pointer;color:var(--c-muted);padding:4px 8px;border-radius:6px;transition:background .12s,color .12s}.kyp-modal-close:hover{background:var(--c-bg3);color:var(--c-text)}.kyp-modal-close:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px}.kyp-modal-wrapper{align-items:center;display:grid;gap:10px;grid-template-columns:30px 1fr}@media screen and (max-width: 380px){.kyp-modal-wrapper{grid-template-columns:1fr}}.kyp-modal-wrapper i svg{height:100%;width:100%}@media screen and (max-width: 380px){.kyp-modal-wrapper i svg{max-width:30px}}.kyp-modal-controls{padding:14px 6px;border-bottom:1px solid var(--c-border);flex-shrink:0}.kyp-modal-controls .kyp-radio-group{gap:6px}.kyp-modal-body{overflow-y:auto;padding:0}.kyp-modal-table{width:100%;border-collapse:collapse;font-size:13px}.kyp-modal-empty{text-align:center;color:var(--c-muted);padding:40px 24px}.kyp-modal-result{display:inline-flex;align-items:center;gap:5px;font-weight:600;padding:2px 8px;border-radius:20px;white-space:nowrap}.kyp-modal-result.kyp-modal-result-gold{background:#fef3c7;color:#92400e}.kyp-modal-result.kyp-modal-result-silver{background:#f1f5f9;color:#475569}.kyp-modal-result.kyp-modal-result-bronze{background:#fdf2e6;color:#92400e}@media(prefers-color-scheme: dark){.kyp-modal{box-shadow:0 20px 60px rgba(0,0,0,.6)}.kyp-modal-result.kyp-modal-result-gold{background:#451a03;color:#fbbf24}.kyp-modal-result.kyp-modal-result-silver{background:#1e293b;color:#94a3b8}.kyp-modal-result.kyp-modal-result-bronze{background:#3b1f06;color:#d97706}}.kyp-search-row{margin-top:4px;border-top:1px solid var(--c-accent);padding-top:12px}.kyp-search-input{flex:1;min-width:0;height:32px;padding:0 10px;border-radius:8px;border:1.5px solid var(--c-border);background:var(--c-bg);color:var(--c-text);font:inherit;font-size:13px;outline:none;transition:border-color .12s}.kyp-search-input::placeholder{color:var(--c-muted)}.kyp-search-input:focus{border-color:var(--c-accent)}.kyp-search-nav{display:flex;align-items:center;gap:4px;flex-shrink:0;white-space:nowrap}.kyp-search-count{font-size:12px;color:var(--c-muted);min-width:40px;text-align:center}.kyp-search-btn{background:var(--c-bg3);border:1.5px solid var(--c-border);border-radius:6px;width:26px;height:26px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--c-muted);font-size:13px;line-height:1;padding:0;transition:background .12s,color .12s,border-color .12s}.kyp-search-btn:hover{background:var(--c-accent);color:#fff;border-color:var(--c-accent)}.kyp-search-btn:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px}.kyp-tr-search-match.kyp-tr td,.kyp-tr-search-match.kyp-tr-alt td{background:#fefce8}.kyp-tr-search-current.kyp-tr td,.kyp-tr-search-current.kyp-tr-alt td{background:#fde047}.kyp-tr-search-current.kyp-tr:hover td,.kyp-tr-search-current.kyp-tr-alt:hover td{background:#facc15}@media(prefers-color-scheme: dark){.kyp-tr-search-match.kyp-tr td,.kyp-tr-search-match.kyp-tr-alt td{background:#1c1a0a}.kyp-tr-search-current.kyp-tr td,.kyp-tr-search-current.kyp-tr-alt td{background:#3b3008}.kyp-tr-search-current.kyp-tr:hover td,.kyp-tr-search-current.kyp-tr-alt:hover td{background:#4a3c0a}}@media(max-width: 480px){.kyp-td-state,.kyp-th-state{display:none}.kyp-control-row{gap:8px}}`;
  var INJECTED_TEMPLATE = `<div class="kyp-root"><div class="kyp-header"><div class="kyp-title-wrap" data-sw="title-wrap"><h2 class="kyp-title" data-sw="title">Leaderboard</h2></div></div><div class="kyp-controls"><div class="kyp-control-row" data-sw="gender-row"><span class="kyp-control-label">Gender</span></div><div class="kyp-control-row" data-sw="event-row"><span class="kyp-control-label">Event</span></div><div class="kyp-control-row kyp-search-row" data-sw="search-row"><span class="kyp-control-label">Search</span><input type="search" class="kyp-search-input" data-sw="search-input" placeholder="Find player…" autocomplete="off" spellcheck="false"><span class="kyp-search-nav" data-sw="search-nav" style="display:none"><button class="kyp-search-btn" data-sw="search-prev" aria-label="Previous match">&#8593;</button><span class="kyp-search-count" data-sw="search-count"></span><button class="kyp-search-btn" data-sw="search-next" aria-label="Next match">&#8595;</button></span></div><div class="kyp-control-decoration"><svg width="892" height="514" viewBox="0 0 892 514" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_54_91)"><path d="M891.994 298.076C820.713 285.793 773.643 273.69 737.643 200.982C603.138 212.05 474.887 185.775 352.217 125.395C433.892 192.028 529.832 249.394 713.658 249.529C743.043 298.211 772.608 305.14 819.453 325.116C846.364 322.597 871.339 315.443 891.994 298.076Z" fill="#414A58" fill-opacity="0.3"/><path d="M0 0C64.8903 157.159 180.946 283.183 457.337 311.618C385.202 290.337 317.746 258.662 255.106 216.369C361.126 248.449 460.577 273.915 542.162 281.518C327.601 221.813 142.291 132.593 0 0.044985V0Z" fill="#414A58" fill-opacity="0.3"/><path d="M59.1753 278.414C220.816 344.823 388.712 387.656 572.267 371.909C369.317 414.966 176.716 433.953 59.1753 278.414Z" fill="#414A58" fill-opacity="0.3"/><path d="M233.506 493.929C311.401 541.171 429.752 498.383 558.497 432.334L233.506 493.929Z" fill="#414A58" fill-opacity="0.3"/></g><defs><clipPath id="clip0_54_91"><rect width="891.994" height="513.948" fill="white"/></clipPath></defs></svg></div></div><div class="kyp-cat-label" data-sw="cat-label"></div><div class="kyp-table-wrap" data-sw="table-wrap"></div><p class="kyp-meta" data-sw="meta"></p><div class="kyp-modal-backdrop" data-sw="modal" aria-hidden="true" role="presentation"><div class="kyp-modal" role="dialog" aria-modal="true" aria-labelledby="kyp-modal-title"><div class="kyp-modal-header"><div class="kyp-modal-wrapper"><i><svg width="403" height="280" viewBox="0 0 403 280" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_54_97)"><path d="M402.043 225.998C405.328 179.61 397.858 140.332 382.918 108.117C375.178 107.712 365.143 101.818 356.908 92.0547C345.928 79.0069 342.328 63.9344 348.223 57.3205C317.983 26.0057 278.068 7.1538 236.083 0.80985C234.238 9.49341 220.018 15.5674 203.008 14.5776C187.932 13.6777 175.692 7.51376 172.497 0C128.352 5.4441 86.1421 24.6109 54.5069 57.4105C55.632 57.7704 56.6219 58.3553 57.522 59.0752C64.722 65.1042 61.212 81.1666 49.6469 94.8893C39.5669 106.857 26.6969 113.111 18.8218 110.502C4.60178 142.266 -2.46329 180.735 0.776719 226.043C59.187 153.92 64.587 175.651 23.3219 279.899L70.347 238.775L73.272 273.06L118.317 215.289C119.172 213.76 126.237 200.937 120.297 186.899C115.842 176.416 107.022 171.872 104.637 170.747C81.5971 158.104 66.477 140.737 76.242 108.567C67.332 112.391 59.727 120.805 53.697 135.023C42.5819 81.5265 68.367 65.3742 156.567 112.481C176.592 119.905 190.272 94.7543 201.433 56.6456C212.593 94.7543 226.273 119.86 246.298 112.481C334.453 65.3742 360.238 81.5265 349.168 135.023C343.138 120.85 335.533 112.391 326.623 108.567C336.388 140.737 321.268 158.104 298.228 170.747C295.843 171.872 286.978 176.416 282.568 186.899C276.628 200.937 283.648 213.76 284.548 215.289L329.593 273.06L332.518 238.775L379.543 279.899C338.278 175.606 343.678 153.875 402.088 226.043L402.043 225.998ZM140.682 68.6586C125.157 77.6121 108.777 78.287 104.052 70.1434C99.3722 61.9997 108.147 48.142 123.672 39.1885C139.197 30.235 155.577 29.5601 160.302 37.7038C164.982 45.8474 156.207 59.7051 140.682 68.6586ZM303.313 73.2478C298.633 81.3915 282.208 80.7166 266.683 71.7631C251.158 62.8096 242.383 48.9519 247.063 40.8082C251.743 32.6646 268.168 33.3395 283.693 42.293C299.218 51.2465 307.993 65.1042 303.313 73.2478Z" fill="#DC2329"/><path d="M225.688 164.672V164.762C207.868 132.457 189.372 128.543 169.797 167.281C151.617 200.846 156.927 238.91 174.927 178.53L198.418 265.995L221.908 178.53C240.403 240.529 245.353 198.911 225.643 164.627L225.688 164.672Z" fill="#DC2329"/><path d="M141.2 151.949C145.72 146.724 141.857 135.979 132.572 127.948C123.286 119.917 112.094 117.643 107.574 122.867C103.054 128.092 106.918 138.837 116.203 146.868C125.488 154.899 136.68 157.173 141.2 151.949Z" fill="#DC2329"/><path d="M283.457 145.592C291.489 136.308 293.764 125.118 288.538 120.599C283.313 116.08 272.566 119.942 264.534 129.226C256.502 138.51 254.227 149.7 259.452 154.219C264.677 158.738 275.425 154.876 283.457 145.592Z" fill="#DC2329"/></g><defs><clipPath id="clip0_54_97"><rect width="402.808" height="279.899" fill="white"/></clipPath></defs></svg></i><h3 class="kyp-modal-title" id="kyp-modal-title" data-sw="modal-title"></h3></div><button class="kyp-modal-close" data-sw="modal-close" aria-label="Close">&times;</button></div><div class="kyp-modal-controls" data-sw="modal-controls"></div><div class="kyp-modal-body" data-sw="modal-body"></div></div></div></div>`;

  // ── Service Worker ───────────────────────────────────────────────────────
  var SW_SOURCE = [
    'const CACHE_NAME="sports-widget-kyp-v2";',
    'const API_RE=/script\\.google\\.com.*exec/;',
    'self.addEventListener("install",()=>self.skipWaiting());',
    'self.addEventListener("activate",e=>{',
    '  e.waitUntil(caches.keys().then(ks=>',
    '    Promise.all(ks.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))',
    '  ).then(()=>self.clients.claim()));',
    '});',
    'self.addEventListener("fetch",e=>{',
    '  if(!API_RE.test(e.request.url))return;',
    '  e.respondWith(caches.open(CACHE_NAME).then(cache=>',
    '    cache.match(e.request).then(hit=>{',
    '      const fresh=fetch(e.request.clone())',
    '        .then(r=>{if(r.ok)cache.put(e.request,r.clone());return r;})',
    '        .catch(()=>hit);',
    '      return hit||fresh;',
    '    })',
    '  ));',
    '});',
  ].join("\n");

  // ── localStorage helpers ─────────────────────────────────────────────────
  var LS = {
    get: function (k) {
      try {
        var raw = localStorage.getItem(k);
        if (!raw) return null;
        var parsed = JSON.parse(raw);
        if (Date.now() > parsed.expiry) { localStorage.removeItem(k); return null; }
        return parsed.data;
      } catch (e) { return null; }
    },
    set: function (k, data, days) {
      try {
        localStorage.setItem(k, JSON.stringify({ data: data, expiry: Date.now() + days * 86400000 }));
      } catch (e) {}
    },
  };

  // ── SW registration ──────────────────────────────────────────────────────
  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    try {
      var url = URL.createObjectURL(new Blob([SW_SOURCE], { type: "application/javascript" }));
      navigator.serviceWorker.register(url, { scope: "/" }).catch(function () {});
    } catch (e) {}
  }

  // ── API fetch ────────────────────────────────────────────────────────────
  async function fetchData(apiUrl, apiKey) {
    var origin = location.origin || "null";
    var url = apiUrl
      + "?api_key=" + encodeURIComponent(apiKey)
      + "&action=all"
      + "&origin=" + encodeURIComponent(origin);
    var resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) throw new Error("API " + resp.status);
    return resp.json();
  }

  // ── UUID extraction ──────────────────────────────────────────────────────
  function extractUUID(raw) {
    if (!raw) return null;
    var dashIdx = raw.lastIndexOf("\u2014"); // em dash
    return dashIdx !== -1 ? raw.slice(dashIdx + 1).trim() : raw.trim();
  }

  // Normalise varied gender spellings ("Male","M","male") → "mens" / "womens"
  function normalizeGender(g) {
    var s = (g || "").trim().toLowerCase();
    if (s === "male"   || s === "m") return "mens";
    if (s === "female" || s === "f") return "womens";
    return s;
  }

  // ── Leaderboard computation ──────────────────────────────────────────────
  function buildLeaderboard(data, filterGender, filterEvent) {
    var results    = data.results    || [];
    var eventTypes = (data.config && data.config.event_types) || [];

    var pointsMap = {};
    eventTypes.forEach(function (et) {
      if (et.event_level) {
        pointsMap[et.event_level.trim().toLowerCase()] = {
          gold:   Number(et.gold_points)   || 0,
          silver: Number(et.silver_points) || 0,
          bronze: Number(et.bronze_points) || 0,
        };
      }
    });

    var acc = {};
    var playersByUUID = {};
    (data.players || []).forEach(function (p) { if (p.uuid) playersByUUID[p.uuid] = p; });

    function ensurePlayer(p) {
      if (!p || !p.uuid) return;
      var realUUID = extractUUID(p.uuid);
      if (!realUUID) return;
      var resolved = playersByUUID[realUUID];
      var name  = (p.name  || (resolved && resolved.name))      || "Unknown";
      var state = (p.state || (resolved && resolved.state))     || "\u2014";
      var club  = (p.home_club || (resolved && resolved.home_club)) || "\u2014";
      if (!acc[realUUID]) {
        acc[realUUID] = { uuid: realUUID, name: name, state: state, home_club: club,
                          points: 0, gold: 0, silver: 0, bronze: 0 };
      }
    }

    function award(medalVal, medalType, pts, genderFilter) {
      if (!medalVal) return;
      var players = Array.isArray(medalVal) ? medalVal : [medalVal];
      players.forEach(function (p) {
        if (!p || !p.uuid) return;
        var realUUID = extractUUID(p.uuid);
        if (!realUUID) return;
        if (genderFilter) {
          var resolved = playersByUUID[realUUID];
          var pg = normalizeGender(p.gender || (resolved && resolved.gender));
          if (pg !== genderFilter) return;
        }
        ensurePlayer(p);
        if (!acc[realUUID]) return;
        acc[realUUID].points     += pts;
        acc[realUUID][medalType] += 1;
      });
    }

    results.forEach(function (r) {
      var rGender = (r.event_gender || "").trim().toLowerCase();
      var rEvent  = (r.event        || "").trim().toLowerCase();
      var genderFilter = null;
      if (filterEvent.toLowerCase() === "mixed") {
        if (rGender !== "mixed") return;
        genderFilter = filterGender.toLowerCase(); // rank men vs men, women vs women
      } else {
        if (rGender !== filterGender.toLowerCase()) return;
        if (rEvent  !== filterEvent.toLowerCase())  return;
      }
      var skillKey = (r.event_type || "").trim().toLowerCase();
      var pts = pointsMap[skillKey] || { gold: 0, silver: 0, bronze: 0 };
      award(r.gold_medal,   "gold",   pts.gold,   genderFilter);
      award(r.silver_medal, "silver", pts.silver, genderFilter);
      award(r.bronze_medal, "bronze", pts.bronze, genderFilter);
    });

    return Object.values(acc).sort(function (a, b) {
      return (b.points - a.points) || (b.gold - a.gold) || (b.silver - a.silver) || (b.bronze - a.bronze);
    });
  }

  // ── Player results ───────────────────────────────────────────────────────
  function buildPlayerResults(data, playerUUID) {
    var results    = data.results    || [];
    var eventTypes = (data.config && data.config.event_types) || [];

    var pointsMap = {};
    eventTypes.forEach(function (et) {
      if (et.event_level) pointsMap[et.event_level.trim().toLowerCase()] = et;
    });

    var playerResults = [];
    var medalKeys = ["gold_medal", "silver_medal", "bronze_medal"];
    results.forEach(function (r) {
      medalKeys.forEach(function (medalKey) {
        var entries = r[medalKey];
        if (!entries) return;
        var arr = Array.isArray(entries) ? entries : [entries];
        arr.forEach(function (p) {
          if (!p || !p.uuid) return;
          if (extractUUID(p.uuid) !== playerUUID) return;
          var medal  = medalKey.replace("_medal", "");
          var etKey  = (r.event_type || "").trim().toLowerCase();
          var et     = pointsMap[etKey] || {};
          var pts    = Number(et[medal + "_points"]) || 0;
          var partner = null;
          for (var pi = 0; pi < arr.length; pi++) {
            var op = arr[pi];
            if (op && op.uuid && extractUUID(op.uuid) !== playerUUID) {
              partner = op.name || null;
              break;
            }
          }
          playerResults.push({
            event_name:   String(r.event_name   || "—"),
            event_type:   String(r.event_type   || "—"),
            result_skill: String(r.result_skill || "—"),
            event_gender: String(r.event_gender || "—"),
            event:        String(r.event        || "—"),
            event_venue:  String(r.event_venue  || "—"),
            home_club:    String(p.home_club     || "—"),
            medal:        medal,
            points:       pts,
            partner:      partner,
          });
        });
      });
    });
    return playerResults;
  }

  // ── DOM helpers ──────────────────────────────────────────────────────────
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    if (kids) kids.forEach(function (c) {
      if (c == null) return;
      n.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return n;
  }

  function qs(root, sel) { return root.querySelector("[data-sw=\"" + sel + "\"]"); }

  // ── Radio group ──────────────────────────────────────────────────────────
  function radioGroup(name, options, selected, onChange) {
    var wrap = el("div", { "class": "kyp-radio-group", "role": "group", "aria-label": name });
    options.forEach(function (opt) {
      var id  = "kyp-radio-" + name + "-" + opt.value;
      var inp = el("input", { type: "radio", name: name, id: id, value: opt.value, "class": "kyp-radio-input" });
      if (opt.value === selected) inp.checked = true;
      inp.addEventListener("change", function () { if (inp.checked) onChange(opt.value); });
      wrap.appendChild(inp);
      wrap.appendChild(el("label", { "for": id, "class": "kyp-radio-label" }, [opt.label]));
    });
    return wrap;
  }

  // ── Rank badge ───────────────────────────────────────────────────────────
  function rankBadge(rank) {
    var cls = "kyp-rank" + (rank === 1 ? " kyp-rank-1" : rank === 2 ? " kyp-rank-2" : rank === 3 ? " kyp-rank-3" : "");
    return el("td", { "class": "kyp-td kyp-td-center" }, [el("span", { "class": cls }, ["#" + rank])]);
  }

  // ── Medal cell ───────────────────────────────────────────────────────────
  function medalCell(count, type) {
    if (!count) return el("td", { "class": "kyp-td kyp-td-center kyp-medal-zero" }, ["\u2014"]);
    var icons = { gold: "🥇", silver: "🥈", bronze: "🥉" };
    return el("td", { "class": "kyp-td kyp-td-center" }, [
      el("span", { "class": "kyp-medal-count kyp-medal-" + type }, [icons[type] + " " + count]),
    ]);
  }

  // ── Leaderboard table ────────────────────────────────────────────────────
  function renderLeaderboard(rows, onNameClick) {
    if (!rows.length) {
      var empty = el("div", { "class": "kyp-empty-state" });
      empty.innerHTML = "<div class=\"kyp-empty-icon\">\uD83C\uDFC6</div><p>No results for this category yet.</p>";
      return empty;
    }
    var table = el("table", { "class": "kyp-table" });
    table.appendChild(el("thead", null, [el("tr", null, [
      el("th", { "class": "kyp-th kyp-th-center" }, ["Rank"]),
      el("th", { "class": "kyp-th" },              ["Name"]),
      el("th", { "class": "kyp-th kyp-th-state" },  ["State"]),
      el("th", { "class": "kyp-th kyp-th-center" }, ["Points"]),
      el("th", { "class": "kyp-th kyp-th-center" }, ["\uD83E\uDD47"]),
      el("th", { "class": "kyp-th kyp-th-center" }, ["\uD83E\uDD48"]),
      el("th", { "class": "kyp-th kyp-th-center" }, ["\uD83E\uDD49"]),
    ])]));
    var tbody = el("tbody");
    var displayRank = 1;
    rows.forEach(function (row, i) {
      if (i > 0) {
        var prev = rows[i - 1];
        if (!(row.points === prev.points && row.gold === prev.gold && row.silver === prev.silver && row.bronze === prev.bronze))
          displayRank = i + 1;
      }
      var ptsTd = el("td", { "class": "kyp-td kyp-td-center kyp-td-pts" });
      ptsTd.appendChild(el("strong", null, [String(row.points)]));
      var nameCell;
      if (onNameClick) {
        var btn = el("button", { "class": "kyp-name-btn" }, [row.name]);
        (function (uuid, name) {
          btn.addEventListener("click", function () { onNameClick(uuid, name); });
        }(row.uuid, row.name));
        nameCell = el("td", { "class": "kyp-td kyp-td-name" }, [btn]);
      } else {
        nameCell = el("td", { "class": "kyp-td kyp-td-name" }, [row.name]);
      }
      tbody.appendChild(el("tr", { "class": i % 2 === 0 ? "kyp-tr" : "kyp-tr kyp-tr-alt", "data-name": row.name }, [
        rankBadge(displayRank),
        nameCell,
        el("td", { "class": "kyp-td kyp-td-state" }, [row.state]),
        ptsTd,
        medalCell(row.gold,   "gold"),
        medalCell(row.silver, "silver"),
        medalCell(row.bronze, "bronze"),
      ]));
    });
    table.appendChild(tbody);
    return table;
  }

  // ── Player results modal table ────────────────────────────────────────────
  function renderPlayerResultsTable(playerResults) {
    if (!playerResults.length) {
      return el("p", { "class": "kyp-modal-empty" }, ["No results found."]);
    }
    var icons  = { gold: "🥇", silver: "🥈", bronze: "🥉" };
    var labels = { gold: "Gold", silver: "Silver", bronze: "Bronze" };
    var table  = el("table", { "class": "kyp-table kyp-modal-table" });
    var hasPartner = playerResults.some(function (r) { return r.partner; });
    table.appendChild(el("thead", null, [el("tr", null, [
      el("th", { "class": "kyp-th" },              ["Event Name"]),
      el("th", { "class": "kyp-th" },              ["Venue"]),
      el("th", { "class": "kyp-th" },              ["Home Club"]),
      el("th", { "class": "kyp-th" },              ["Event Type"]),
      el("th", { "class": "kyp-th kyp-th-center" }, ["Skill Level"]),
      el("th", { "class": "kyp-th" },              ["Gender / Event"]),
      hasPartner ? el("th", { "class": "kyp-th" }, ["Partner"]) : null,
      el("th", { "class": "kyp-th" },              ["Result"]),
    ])]));
    var tbody = el("tbody");
    playerResults.forEach(function (r, i) {
      var medal = r.medal;
      var badge = el("span", { "class": "kyp-modal-result kyp-modal-result-" + medal }, [
        icons[medal] + " " + labels[medal] + " — " + r.points + " pts",
      ]);
      tbody.appendChild(el("tr", { "class": i % 2 === 0 ? "kyp-tr" : "kyp-tr kyp-tr-alt" }, [
        el("td", { "class": "kyp-td" },              [r.event_name]),
        el("td", { "class": "kyp-td" },              [r.event_venue]),
        el("td", { "class": "kyp-td" },              [r.home_club]),
        el("td", { "class": "kyp-td" },              [r.event_type]),
        el("td", { "class": "kyp-td kyp-td-center" }, [r.result_skill]),
        el("td", { "class": "kyp-td" },              [r.event_gender + " / " + r.event]),
        hasPartner ? el("td", { "class": "kyp-td" }, [r.partner || "—"]) : null,
        el("td", { "class": "kyp-td" },              [badge]),
      ]));
    });
    table.appendChild(tbody);
    return table;
  }

  // ── Styles injection ─────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("kyp-styles")) return;
    var s = document.createElement("style");
    s.id = "kyp-styles";
    s.textContent = INJECTED_STYLES;
    document.head.appendChild(s);
  }

  // ── Widget render (returns refreshData handle) ───────────────────────────
  function renderWidget(container, data, fromCache) {
    container.innerHTML = "";

    // Stamp template into container
    var wrapper = document.createElement("div");
    wrapper.innerHTML = INJECTED_TEMPLATE;
    var root = wrapper.firstElementChild;
    container.appendChild(root);

    var selGender     = "mens";
    var selEvent      = "singles";
    var liveData      = data;
    var searchQuery   = "";
    var searchMatches = [];
    var searchIdx     = 0;

    // Cache badge
    if (fromCache) {
      qs(root, "title-wrap").appendChild(
        el("span", { "class": "kyp-cache-badge" }, ["cached"])
      );
    }

    // Radio groups
    qs(root, "gender-row").appendChild(radioGroup("gender", [
      { value: "mens",   label: "Mens"   },
      { value: "womens", label: "Womens" },
    ], selGender, function (v) { selGender = v; refresh(); }));

    qs(root, "event-row").appendChild(radioGroup("event", [
      { value: "singles", label: "Singles" },
      { value: "doubles", label: "Doubles" },
      { value: "mixed",   label: "Mixed"   },
    ], selEvent, function (v) { selEvent = v; refresh(); }));

    // Meta timestamp
    if (data._meta) {
      qs(root, "meta").textContent = "Last updated: " + new Date(data._meta.generated_at).toLocaleString();
    }

    var tableWrap = qs(root, "table-wrap");
    var catLabel  = qs(root, "cat-label");
    var titleWrap = qs(root, "title-wrap");
    var modal         = qs(root, "modal");
    var modalTitle    = qs(root, "modal-title");
    var modalControls = qs(root, "modal-controls");
    var modalBody     = qs(root, "modal-body");
    var searchInput   = qs(root, "search-input");
    var searchNav     = qs(root, "search-nav");
    var searchCount   = qs(root, "search-count");
    var searchPrev    = qs(root, "search-prev");
    var searchNext    = qs(root, "search-next");

    function openModal(uuid, name, allResults, initialEvent) {
      var selModalEvent = initialEvent || "singles";

      // Build header: "Name (State) #duprID - Home Club"
      var profile = (liveData.players || []).filter(function (p) { return p.uuid === uuid; })[0] || {};
      var header  = name;
      if (profile.state)     header += " (" + profile.state + ")";
      if (profile.dupr_id)   header += " #" + profile.dupr_id;
      if (profile.home_club) header += " - " + profile.home_club;
      modalTitle.textContent = header;

      // Event-type switcher
      modalControls.innerHTML = "";
      modalControls.appendChild(radioGroup("modal-event", [
        { value: "singles", label: "Singles" },
        { value: "doubles", label: "Doubles" },
        { value: "mixed",   label: "Mixed"   },
      ], selModalEvent, function (v) {
        selModalEvent = v;
        renderModalResults();
      }));

      function renderModalResults() {
        var filtered = allResults.filter(function (r) {
          return selModalEvent === "mixed"
            ? r.event_gender.toLowerCase() === "mixed"
            : r.event.toLowerCase()        === selModalEvent && r.event_gender.toLowerCase() !== "mixed";
        });
        modalBody.innerHTML = "";
        modalBody.appendChild(renderPlayerResultsTable(filtered));
      }

      renderModalResults();
      modal.setAttribute("aria-hidden", "false");
      document.addEventListener("keydown", onModalKey);
    }

    function closeModal() {
      modal.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", onModalKey);
    }

    function onModalKey(e) { if (e.key === "Escape") closeModal(); }

    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    qs(root, "modal-close").addEventListener("click", closeModal);

    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function refresh() {
      catLabel.textContent = cap(selGender) + " " + cap(selEvent);
      tableWrap.innerHTML  = "";
      tableWrap.appendChild(renderLeaderboard(
        buildLeaderboard(liveData, selGender, selEvent),
        function (uuid, name) { openModal(uuid, name, buildPlayerResults(liveData, uuid), selEvent); }
      ));
      if (searchQuery.trim()) applySearch();
    }

    refresh();

    function highlightCurrent() {
      searchMatches.forEach(function (r, i) {
        r.classList.toggle("kyp-tr-search-current", i === searchIdx);
      });
      if (searchMatches[searchIdx]) {
        searchMatches[searchIdx].scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    function updateSearchNav() {
      if (searchMatches.length > 1) {
        searchNav.style.display = "";
        searchCount.textContent = (searchIdx + 1) + " / " + searchMatches.length;
      } else {
        searchNav.style.display = "none";
        searchCount.textContent = "";
      }
    }

    function applySearch() {
      var rows = tableWrap.querySelectorAll("tr[data-name]");
      rows.forEach(function (r) {
        r.classList.remove("kyp-tr-search-match", "kyp-tr-search-current");
      });
      searchMatches = [];
      var q = searchQuery.trim().toLowerCase();
      if (q) {
        rows.forEach(function (r) {
          if (r.getAttribute("data-name").toLowerCase().indexOf(q) !== -1) {
            r.classList.add("kyp-tr-search-match");
            searchMatches.push(r);
          }
        });
      }
      if (searchMatches.length) {
        searchIdx = Math.min(searchIdx, searchMatches.length - 1);
        highlightCurrent();
      } else {
        searchIdx = 0;
      }
      updateSearchNav();
    }

    searchInput.addEventListener("input", function () {
      searchQuery = searchInput.value;
      searchIdx   = 0;
      applySearch();
    });
    searchPrev.addEventListener("click", function () {
      if (!searchMatches.length) return;
      searchIdx = (searchIdx - 1 + searchMatches.length) % searchMatches.length;
      highlightCurrent();
      updateSearchNav();
    });
    searchNext.addEventListener("click", function () {
      if (!searchMatches.length) return;
      searchIdx = (searchIdx + 1) % searchMatches.length;
      highlightCurrent();
      updateSearchNav();
    });

    // ── Public handle ───────────────────────────────────────────────────────
    function refreshData(newData) {
      var overlay = el("div", { "class": "kyp-overlay" }, [el("div", { "class": "kyp-spinner" })]);
      tableWrap.appendChild(overlay);
      setTimeout(function () {
        liveData = newData;
        var badge = titleWrap.querySelector(".kyp-cache-badge");
        if (badge) badge.parentNode.removeChild(badge);
        if (newData._meta) {
          qs(root, "meta").textContent = "Last updated: " + new Date(newData._meta.generated_at).toLocaleString();
        }
        refresh();
      }, 60);
    }

    return { refreshData: refreshData };
  }

  // ── Skeleton / error ─────────────────────────────────────────────────────
  function renderSkeleton(container) {
    container.innerHTML = [
      "<div class=\"kyp-root\">",
      "<div class=\"kyp-header\"><div class=\"kyp-skeleton\" style=\"width:140px;height:26px\"></div></div>",
      "<div class=\"kyp-controls\">",
      "<div class=\"kyp-skeleton\" style=\"height:36px;margin-bottom:8px\"></div>",
      "<div class=\"kyp-skeleton\" style=\"height:36px;margin-bottom:16px\"></div>",
      "</div>",
      [1,2,3,4,5].map(function () { return "<div class=\"kyp-skeleton\" style=\"height:44px;margin-bottom:6px\"></div>"; }).join(""),
      "</div>",
    ].join("");
  }

  function renderError(container, msg) {
    container.innerHTML = "<div class=\"kyp-root kyp-error\"><p>\u26A0 " + msg + "</p></div>";
  }

  // ── Core init ────────────────────────────────────────────────────────────
  async function init(opts) {
    opts = opts || {};
    var apiUrl       = opts.apiUrl       || "";
    var apiKey       = opts.apiKey       || "";
    var targetSel    = opts.target       || "#sports-widget";
    var cacheDays = opts.cacheDays || CACHE_DEFAULT;

    var container = document.querySelector(targetSel);
    if (!container) { console.warn("[SportsWidget] target not found:", targetSel); return; }

    injectStyles();
    registerSW();

    var cached = LS.get(CACHE_KEY);
    var handle = null;
    if (cached) handle = renderWidget(container, cached, true);
    else        renderSkeleton(container);

    try {
      var fresh = await fetchData(apiUrl, apiKey);
      LS.set(CACHE_KEY, fresh, cacheDays);
      if (handle) handle.refreshData(fresh);
      else        renderWidget(container, fresh, false);
    } catch (err) {
      if (!cached) renderError(container, "Could not load data. " + err.message);
      console.warn("[SportsWidget] fetch failed:", err);
    }
  }

  // ── Auto-init from script tag ────────────────────────────────────────────
  function autoInit() {
    var scripts = document.querySelectorAll("script[data-api-url]");
    var script  = document.currentScript || scripts[scripts.length - 1];
    if (!script) return;
    var apiUrl = script.getAttribute("data-api-url");
    var apiKey = script.getAttribute("data-api-key");
    var target = script.getAttribute("data-target") || "#sports-widget";
    var days   = parseInt(script.getAttribute("data-cache-days") || "1", 10);
    if (!apiUrl || !apiKey) return;
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", function () { init({ apiUrl: apiUrl, apiKey: apiKey, target: target, cacheDays: days }); });
    else
      init({ apiUrl: apiUrl, apiKey: apiKey, target: target, cacheDays: days });
  }

  global.SportsWidget = { init: init };
  autoInit();

})(typeof globalThis !== "undefined" ? globalThis : window);