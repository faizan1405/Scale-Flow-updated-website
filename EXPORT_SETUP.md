# Scale Flow — full source export

## Start the project
1. Extract this ZIP into a new folder.
2. Install Node.js 22 LTS (or newer supported LTS) and Bun.
3. Open a terminal in the extracted ScaleFlow_Source folder.
4. Run `bun install --frozen-lockfile` (internet required for the first install).
5. Run `bun run dev --host 127.0.0.1 --port 8080`.
6. Open http://127.0.0.1:8080.

Once dependencies are installed, the local website, project screenshots, fonts,
portfolio browsing, demo admin and quotation PDF work without internet.
WhatsApp, Google Maps and links to live client websites still require internet.
This is source code, not a prebuilt executable or an offline dependency installer.

## Included
- All app source, tests, configuration, lockfile and public files.
- Local copies of all screenshot assets referenced by current and legacy content.
- Local Space Grotesk, Manrope and JetBrains Mono font files.
- Hostinger MySQL schema and architecture rules.
- ASSET_MANIFEST.json lists bundled images and their byte sizes.

Image paths are preserved under public/__l5e/assets-v1 so existing source and
legacy merge data resolve locally. Only the exported root font stylesheet link
has been changed to /fonts/fonts.css; the running project is not modified.

## Checks and deployment
Run `bun run test` for automated tests. Run `bun run build` to generate a
production build. The current build target remains the existing Cloudflare /
Lovable configuration, NOT a completed Hostinger Node deployment.
No hosted backend is connected. hostinger/schema.sql is preparation only.

## Saved owner content
Admin edits are stored only in the browser where they were made. They are not
part of this source ZIP. Before moving, open Admin → Dashboard → Export all data
in that original browser and save the JSON separately. This export intentionally
does not read browser storage, credentials or private user data. A Hostinger
import is not implemented yet; keep that JSON safe for the future migration.

## Excluded intentionally
Git history, editor/workspace metadata, credentials, node_modules and generated
build output. Dependencies are restored using package.json and bun.lock.
