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
  var INJECTED_STYLES   = "__STYLES__";
  var INJECTED_TEMPLATE = "__TEMPLATE__";

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
      var dupr  = (p.dupr_id || (resolved && resolved.dupr_id)) || null;
      if (!acc[realUUID]) {
        acc[realUUID] = { uuid: realUUID, name: name, state: state, home_club: club,
                          dupr_id: dupr, points: 0, gold: 0, silver: 0, bronze: 0 };
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
        var nameSpan = el("span", { "class": "kyp-name-text" }, [row.name]);
        var btn = el("button", { "class": "kyp-name-btn" }, [nameSpan]);
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
      el("th", { "class": "kyp-th" },              ["Event Type"]),
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
        el("td", { "class": "kyp-td" },              [r.event_type]),
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