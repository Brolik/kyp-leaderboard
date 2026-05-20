# KYP Sports Results Widget

A self-contained JavaScript leaderboard widget for sports results. Drop in a single `<script>` tag and it renders a filterable, searchable leaderboard driven by a Google Apps Script API.

## Features

- Leaderboard ranked by points, with gold / silver / bronze medal counts
- Filter by gender (Mens / Womens / Mixed) and event (Singles / Doubles)
- Player name search with prev/next navigation
- Click any player name to open a modal showing their individual results
- `localStorage` cache with a configurable TTL; Service Worker adds a network-level cache layer
- Skeleton loading state while data fetches, graceful error fallback

## Quick start

Add a container element and the script tag to your page:

```html
<div id="results-widget"></div>

<script
  src="dist/sports-results-widget.js"
  data-api-url="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
  data-api-key="YOUR_API_KEY"
  data-target="#results-widget"
  data-cache-days="1"
></script>
```

The widget auto-initialises on `DOMContentLoaded` (or immediately if the DOM is already ready).

## Script tag attributes

| Attribute | Required | Default | Description |
|---|---|---|---|
| `data-api-url` | Yes | — | Google Apps Script exec URL |
| `data-api-key` | Yes | — | API key sent as `?api_key=` |
| `data-target` | No | `#sports-widget` | CSS selector for the container element |
| `data-cache-days` | No | `1` | How long to cache the API response in localStorage |

## Programmatic init

You can also initialise the widget from JavaScript:

```js
SportsWidget.init({
  apiUrl:       "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  apiKey:       "YOUR_API_KEY",
  target:       "#results-widget",
  cacheMinutes: 10,
});
```

## Development

Install dependencies once:

```bash
npm install
```

| Command | Description |
|---|---|
| `npm run build` | One-off production build |
| `npm run dev` | Watch `src/` and rebuild on every change |

### Build output

```
dist/
  sports-results-widget.js   ← all-in-one bundle (JS + CSS + HTML template)
  sports-results-widget.css  ← standalone stylesheet (optional separate load)
```

The build script (`build.js`) compiles `src/styles.scss` with Sass, collapses `src/template.html` to a single line, then injects both into `src/widget.js` by replacing `"__STYLES__"` and `"__TEMPLATE__"` placeholders before writing the final bundle to `dist/`.

### Source layout

```
src/
  widget.js      ← core widget logic
  template.html  ← HTML skeleton (injected at build time)
  styles.scss    ← widget styles (compiled and injected at build time)
```

## API shape

The widget expects the API to return a JSON object with at least these keys:

```json
{
  "_meta": { "generated_at": "<ISO timestamp>" },
  "config": {
    "event_types": [
      { "event_level": "national", "gold_points": 10, "silver_points": 7, "bronze_points": 5 }
    ]
  },
  "players": [
    { "uuid": "abc123", "name": "Jane Smith", "state": "NSW", "home_club": "City SC" }
  ],
  "results": [
    {
      "event_name": "Nationals 2025",
      "event_type": "national",
      "event_gender": "Womens",
      "event": "singles",
      "result_skill": "Open",
      "gold_medal":   { "uuid": "abc123", "name": "Jane Smith" },
      "silver_medal": { "uuid": "def456", "name": "Alex Lee" },
      "bronze_medal": null
    }
  ]
}
```

Medal fields (`gold_medal`, `silver_medal`, `bronze_medal`) may be a single player object, an array of player objects, or `null`.
