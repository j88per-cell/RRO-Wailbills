# RRO Waybill Manager

A pre-game planning tool for [Railroads Online](https://railroads.online/) — load your save file, see what your industries are sitting on, and figure out what runs to make before you even fire up the locomotive.

## What it does

Railroads Online is a cooperative railroad sim set in the 1870s American West. Your industries produce and consume commodities — sawmills turn logs into lumber, smelters eat iron ore and spit out raw iron, ranches grow cattle that become meat. The problem: the game gives you no overview of what's piling up where. You end up riding around checking each industry by hand before deciding what train to run.

This tool fixes that. Drop in your `.sav` file and get:

- **Industry overview** — every industry on your map with its current stock (Available) and what it's waiting on (Needs)
- **Waybills** — create shipping orders from source to destination, or hit Auto-Generate to build a full run from everything that has stock ready to move
- **Train sizing** — quantities shown in *cars*, not raw units (6 logs per flatcar, 10 iron ore per hopper, etc.)
- **Run value** — estimated revenue for each waybill so you can prioritize the profitable runs first
- **Category filters** — filter by Wood, Iron, Coal, Oil, Gold, or Agriculture so you can plan one commodity chain at a time
- **Fulfillment tracking** — check off waybills as you complete runs; clear them when you're done

Designed to run on a second monitor while you play.

## How to use

1. Launch the app
2. Click **Load Save File** and pick your `.sav` from `%LocalAppData%\Railroads Online\Saved\SaveGames\` (Windows) or the equivalent on your OS
3. Browse your industries, create waybills manually or auto-generate a full session
4. Run your trains, check off waybills as you go

No account, no server, no data leaves your machine — the save file is parsed entirely in the browser.

## Tech

Vue 3 + Vite + Pinia + Tailwind CSS. Save file parsing via the [railroad.studio](https://railroad.studio/) GVAS parser.

## Development

```sh
npm install
npm run dev     # dev server with hot reload
npm run build   # production build
```
