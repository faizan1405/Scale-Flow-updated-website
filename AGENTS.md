<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- All content (projects, videos, categories, quote packages/features, settings, media) is read via `useDB()` and written via `update()` in `src/data/store.ts`; it is a localStorage demo repository so it can be swapped for the future Hostinger (Node + MySQL) API without touching pages.
- Never bump the storage key or wipe saved data to ship new defaults: the store keeps `{base, data, conflicts}` and three-way merges seed changes via `src/data/merge.ts` (stable ids, owner edits win, clashes listed for the owner). Old keys are read-only and a backup is taken before any merge/reset — so owner edits survive site updates.
- Never introduce Supabase/Firebase/Cloudinary or other external backends without the owner's approval — production target is Hostinger.
- Quote pricing and WhatsApp message/link building live only in `src/lib/quote.ts` (tested in `quote.test.ts`); UI must not re-implement price math.
- Project visuals without uploaded screenshots are coded (`SiteMock`) — no generated images.
- The homepage hero is a coded composition of real project screenshots (`HeroStack`), no WebGL; per-project glow colour comes from `Project.ambient` (falls back to `palette.accent`).
- The quotation PDF is built from `buildQuotation()` in `src/lib/quote.ts` (same data as the WhatsApp message) and rendered client-side by `src/lib/quote-pdf.ts` (jsPDF, preloaded so download + WhatsApp open run inside the click).
- Animations use GSAP (+ScrollTrigger) via `src/lib/motion.ts`; content must stay visible in SSR HTML and respect reduced motion.
- Production backend target is documented in `.lovable/plan/` (Hostinger Node + MySQL); `hostinger/schema.sql` is the schema of record and `src/data/export.ts` is the shared export/validation format the import will consume — keep them in sync with `src/data/types.ts`.
