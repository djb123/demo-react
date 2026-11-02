# If This, Then That — Cards for Leaders

A React app for exploring the 52-card leadership deck from Complete Leadership Academy. Built with TanStack Router, Tailwind CSS 4, DaisyUI 5, and Lucide icons.

## Run locally

```sh
npm install
npm run dev
```

Open the URL printed by Vite. The app has no backend or account requirement.

```sh
npm run build
npm test
```

## Using the deck

- Browse Situation (15), Conversation (10), Context (15), and Reflection (12) cards.
- Search across both sides of all 52 cards, including questions and model names.
- Open a card and switch between the prompt and guidance. Situation recommendations link directly to the corresponding conversation cards.
- Use the category shortcuts in a card to continue to context or reflection.
- Select cards with the plus button. The current session groups selected cards by perspective, with a name and notes.
- Sessions persist in `localStorage` in the current browser. They do not sync across devices or provide an archive of previous sessions.
- Export selected cards and notes as Markdown before starting a new session. Reset requires confirmation.
- The “How it works” guide adapts page 2 and includes the linked walkthrough from page 3.

The category, search query, and open card are URL parameters, so cards can be bookmarked and browser navigation works. Session content stays out of URLs.

## Content

The editable card data lives in four JSON files in [src/data](./src/data). Each card includes a stable ID, deck-order number, category, title, front/back sections, related card IDs, and the source PDF page. Display typography, whitespace, model arrows, and obvious spelling/OCR errors have been normalized. The text was extracted using OCR and reviewed, with visual checks of sample source pages; it is not a certified verbatim transcription.

Card content is attributed to **Complete Leadership Academy**. The repository’s software license does not grant additional rights to the original deck. The source PDF and intermediate images are ignored by Git and are not bundled into the app.

## Extraction tooling

The app runs entirely from the checked-in JSON; PDF/OCR tools are development dependencies only. To reproduce the initial import, place your source PDF at `leadership-cards-source.pdf` in the repository root, then run:

```sh
node scripts/render-pdf.mjs
node scripts/extract-cards.mjs
node scripts/build-card-data.mjs
node --test scripts/validate-cards.test.mjs
```

Rendering and OCR intermediates are stored in `.card-extraction/`. On the first OCR run, Tesseract downloads its English model. The importer is specific to this deck’s two-rows-by-two-sides layout, with fronts to the left of backs, on pages 4–29. Re-running the generator overwrites the JSON files; review changes before replacing later manual corrections.
