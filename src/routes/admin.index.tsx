import { createFileRoute, Link } from "@tanstack/react-router";
import { readBackup, resolveConflict, useContentMeta, useDB } from "@/data/store";
import { PageHead } from "@/components/admin/kit";
import { buildExport, validateExport } from "@/data/export";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const db = useDB();
  const stats = [
    ["Total projects", db.projects.length, "/admin/projects"],
    ["Published", db.projects.filter((p) => p.published).length, "/admin/projects"],
    ["Featured", db.projects.filter((p) => p.featured).length, "/admin/projects"],
    ["Videos uploaded", db.videos.filter((v) => v.src).length, "/admin/media"],
    ["Categories", db.categories.length, "/admin/categories"],
  ] as const;
  const recent = [
    ...db.projects.map((p) => ({ id: p.id, kind: "Project", name: p.title, at: p.updatedAt, sample: p.sample })),
    ...db.videos.map((v) => ({ id: v.id, kind: "Video", name: v.title, at: v.updatedAt, sample: v.sample })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);
  return (
    <>
      <PageHead title="Dashboard" desc="Content overview. Visitor and enquiry analytics will appear here once tracking is connected — no numbers are invented." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map(([l, v, to]) => (
          <Link key={l} to={to} className="rounded-lg border border-ivory/10 p-5 hover:border-gold/50">
            <p className="text-xs uppercase tracking-wider text-grey">{l}</p>
            <p className="font-display mt-2 text-5xl">{v}</p>
          </Link>
        ))}
      </div>
      <h2 className="font-display mb-4 mt-12 text-3xl">Recent content</h2>
      <ul className="divide-y divide-ivory/10 rounded-lg border border-ivory/10">
        {recent.map((r) => (
          <li key={r.kind + r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <span><span className="label-mono mr-3 text-gold">{r.kind}</span>{r.name}</span>
            <span className="flex items-center gap-3 text-xs text-grey">
              {r.sample && <span className="rounded-full border border-coral/40 px-2 py-0.5 text-coral">Sample</span>}
              {new Date(r.at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
      <DataSafety />
    </>
  );
}

const show = (v: unknown) => {
  if (v === undefined) return "— (not present)";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 140 ? s.slice(0, 140) + "…" : s || "(empty)";
};

function DataSafety() {
  const m = useContentMeta();
  const db = useDB();
  const report = validateExport(buildExport(db, m.conflicts));
  const exportAll = () => {
    const file = buildExport(db, m.conflicts);
    const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `scaleflow-export-${file.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const download = (key: string) => {
    const raw = readBackup(key);
    if (!raw) return;
    const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = key.replace(/[:.]/g, "-") + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="mt-12">
      <h2 className="font-display mb-2 text-3xl">Data safety</h2>
      <p className="mb-6 max-w-2xl text-sm text-grey">Edits are saved in this browser only. Site updates are merged in without replacing your edits; where both changed the same thing, your version is kept and listed below for you to decide.</p>
      {m.storageWarning && <p className="mb-4 rounded-lg border border-coral/40 p-4 text-sm text-coral">{m.storageWarning}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-ivory/10 p-5">
          <p className="text-xs uppercase tracking-wider text-grey">Recovered earlier edits</p>
          <p className="mt-2 text-sm">{m.recovered.length ? `Merged from ${m.recovered.length} earlier save${m.recovered.length > 1 ? "s" : ""} in this browser (${m.recovered.join(", ")}).` : "No earlier saved edits were found in this browser."}</p>
        </div>
        <div className="rounded-lg border border-ivory/10 p-5">
          <p className="text-xs uppercase tracking-wider text-grey">Backups ({m.backups.length})</p>
          {m.backups.length === 0 ? (
            <p className="mt-2 text-sm">None yet — one is taken automatically before any merge or reset.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {m.backups.slice(-5).reverse().map((b) => (
                <li key={b.key} className="flex items-center justify-between gap-3">
                  <span>{new Date(b.at).toLocaleString()} · {Math.round(b.size / 1024)} KB</span>
                  <button onClick={() => download(b.key)} className="text-gold hover:underline">Download</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-ivory/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-grey">Export for Hostinger import</p>
            <p className="mt-1 text-sm">{report.counts.projects} projects · {report.counts.featured} featured · {report.counts.categories} categories · {report.counts.packages} packages — {report.ok ? "ready to import" : `${report.errors.length} problem(s) to fix first`}</p>
          </div>
          <button onClick={exportAll} className="rounded-full border border-gold px-4 py-2 text-sm text-gold hover:bg-gold hover:text-midnight">Export all data</button>
        </div>
        {[...report.errors.map((e) => ["error", e] as const), ...report.warnings.map((w) => ["warn", w] as const)].slice(0, 8).map(([k, t]) => (
          <p key={t} className={k === "error" ? "mt-2 text-xs text-coral" : "mt-2 text-xs text-grey"}>{t}</p>
        ))}
      </div>
      <h3 className="font-display mb-3 mt-8 text-2xl">Needs your decision ({m.conflicts.length})</h3>
      {m.conflicts.length === 0 ? (
        <p className="text-sm text-grey">No conflicts. Nothing was overwritten.</p>
      ) : (
        <ul className="divide-y divide-ivory/10 rounded-lg border border-ivory/10">
          {m.conflicts.map((c) => (
            <li key={c.key} className="grid gap-2 px-4 py-4 text-sm md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p><span className="label-mono mr-2 text-gold">{c.collection}</span>{c.label} — <span className="text-ivory/70">{c.field === "(record)" ? (c.reason === "removed-by-update" ? "removed in the site update, but you had edited it" : "you deleted it, but the site update changed it") : c.field}</span></p>
                {c.field !== "(record)" && (
                  <p className="mt-1 break-all text-xs text-grey">Yours (in use): {show(c.mine)}<br />Update: {show(c.theirs)}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => resolveConflict(c.key, "mine")} className="rounded-full border border-ivory/20 px-3 py-1.5 text-xs hover:border-gold">Keep mine</button>
                <button onClick={() => confirm("Replace your version with the updated one?") && resolveConflict(c.key, "theirs")} className="rounded-full border border-ivory/20 px-3 py-1.5 text-xs hover:border-gold">Use update</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
