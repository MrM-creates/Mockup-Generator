# Print Studio

- Keep `index.html` and `HTML Script/print-mockup generator V14.html` identical. V13 is the original archive and must not be overwritten with V14.
- Preserve the full original image and its aspect ratio. Preview and Photoshop output must use `getPrintLayout()` as the single source for dimensions.
- Manual scaling must stay within the uncut maximum. Frame style is preview-only and must not change print geometry.
- Uploaded images stay in browser memory. The original bytes are embedded only in the user's downloaded JSX. Do not add image uploads, photo tracking, or image bytes to source control.
- Use the app-ui-foundation and Flider UI system workflow for UI changes; the current contract is in `docs/UI-CONTRACT.md`.
- Run `npm test` and `npm run build` before release. Check native Photoshop for changes to embedded-image decoding or placement.
- Only `dist/index.html` and `dist/version.json` are deployed. Local photo folders and downloaded/generated personal JSX files must never be published.
- Repository: `MrM-creates/Mockup-Generator`, production branch `main`. Existing Vercel project: `mockup-generator`, canonical URL `https://mockup-generator-sable.vercel.app/`.
- A release is explicitly requested by the user; update version metadata, changelog, and archive together. Do not force-push shared history.
