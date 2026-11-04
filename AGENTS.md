# Print Studio

- Use Swiss German spelling in all current UI text, documentation and replies: write ss instead of the German sharp-s (U+00DF), e.g. Endmass, Masse, Massstab and Grösse.

- Keep `index.html` and `HTML Script/print-mockup generator V14.html` identical. V13 is the original archive and must not be overwritten with V14.
- Preserve the full original image and its aspect ratio. Preview and Photoshop output must use `getPrintLayout()` as the single source for dimensions.
- Manual scaling must stay within the uncut maximum. Frame style is preview-only and must not change print geometry.
- Save originals and settings together in user-selected local .printstudio files. New recent-file storage (IndexedDB) contains only file handles, thumbnails and metadata; retain legacy V14.9 browser snapshots for explicit recovery. Do not auto-save on exports or room generation. Preserve original bytes for downloaded JSX; never send artwork to the mockup API. Room photos stay local and are used only for manual print placement. Do not send room photos to the API. The mockup API generates virtual rooms only; object removal and AI placement suggestions are not offered. Never persist photos, prompts containing photos, or image bytes on the server or in source control. No photo tracking.
- Use the app-ui-foundation and Flider UI system workflow for UI changes; the current contract is in `docs/UI-CONTRACT.md`.
- Run `npm test` and `npm run build` before release. Check native Photoshop for changes to embedded-image decoding or placement.
- Only `dist/index.html` and `dist/version.json` are public static files; the mockup API and its imported server modules run as private server code. Local photo folders and downloaded/generated personal JSX files must never be published. API secrets stay in server environment variables. Paid mockup calls require an access code and durable atomic quota; fail closed if either is unavailable.
- Repository: `MrM-creates/Mockup-Generator`, production branch `main`. Existing Vercel project: `mockup-generator`, canonical URL `https://mockup-generator-sable.vercel.app/`.
- A release is explicitly requested by the user; update version metadata, changelog, and archive together. Do not force-push shared history.
