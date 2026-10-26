import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { byOrder, moveItem, uid, update, useDB } from "@/data/store";
import type { QuoteFeature, QuotePackage } from "@/data/types";
import { aBtn, AField, aInput, OrderButtons, PageHead, Toggle } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/quotations")({ component: Quotations });

function PriceInput({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="number" min={0} step={500} className={aInput} disabled={value === null} value={value ?? ""} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} aria-label="Price in rupees" />
      <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-grey">
        <input type="checkbox" checked={value === null} onChange={(e) => onChange(e.target.checked ? null : 0)} /> Custom
      </label>
    </div>
  );
}

function Quotations() {
  const db = useDB();
  const pkgs = [...db.packages].sort(byOrder);
  const feats = [...db.features].sort(byOrder);
  const setP = (id: string, patch: Partial<QuotePackage>) => update((d) => ({ ...d, packages: d.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const setF = (id: string, patch: Partial<QuoteFeature>) => update((d) => ({ ...d, features: d.features.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  return (
    <>
      <PageHead title="Quotations" desc="Packages and add-ons used by the public quotation builder. Prices are in ₹. Mark “Custom” to show Custom Quote instead of a total." />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-3xl">Packages</h2>
        <button className={aBtn} onClick={() => update((d) => ({ ...d, packages: [...d.packages, { id: uid(), name: "New package", tagline: "", price: 0, includedFeatureIds: [], enabled: false, order: d.packages.length + 1 }] }))}><Plus className="h-4 w-4" /> Add package</button>
      </div>
      <ul className="space-y-3">
        {pkgs.map((p, i) => (
          <li key={p.id} className="rounded-lg border border-ivory/10 p-4">
            <div className="grid gap-3 md:grid-cols-[auto_1fr_1.5fr_1fr_auto] md:items-end">
              <OrderButtons first={i === 0} last={i === pkgs.length - 1} onMove={(dir) => update((d) => ({ ...d, packages: moveItem(d.packages, p.id, dir) }))} />
              <AField label="Name"><input className={aInput} value={p.name} onChange={(e) => setP(p.id, { name: e.target.value })} /></AField>
              <AField label="Tagline"><input className={aInput} value={p.tagline} onChange={(e) => setP(p.id, { tagline: e.target.value })} /></AField>
              <AField label="Starting price"><PriceInput value={p.price} onChange={(v) => setP(p.id, { price: v })} /></AField>
              <div className="flex items-center gap-3">
                <Toggle label="Enabled" checked={p.enabled} onChange={(v) => setP(p.id, { enabled: v })} />
                <button onClick={() => confirm(`Delete ${p.name}?`) && update((d) => ({ ...d, packages: d.packages.filter((x) => x.id !== p.id) }))} className="rounded p-1 text-coral hover:bg-charcoal" aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mb-2 mt-4 text-xs uppercase tracking-wider text-grey">Included features</p>
            <div className="flex flex-wrap gap-1.5">
              {feats.map((f) => {
                const on = p.includedFeatureIds.includes(f.id);
                return <button key={f.id} onClick={() => setP(p.id, { includedFeatureIds: toggle(p.includedFeatureIds, f.id) })} aria-pressed={on} className={cn("rounded-full border px-2.5 py-1 text-xs", on ? "border-gold bg-gold/15 text-gold" : "border-ivory/15 text-grey")}>{f.name}</button>;
              })}
            </div>
          </li>
        ))}
      </ul>

      <div className="mb-4 mt-14 flex items-center justify-between">
        <h2 className="font-display text-3xl">Features & add-ons</h2>
        <button className={aBtn} onClick={() => update((d) => ({ ...d, features: [...d.features, { id: uid(), name: "New feature", description: "", price: 0, availableFor: [], enabled: false, order: d.features.length + 1 }] }))}><Plus className="h-4 w-4" /> Add feature</button>
      </div>
      <ul className="space-y-3">
        {feats.map((f, i) => (
          <li key={f.id} className="rounded-lg border border-ivory/10 p-4">
            <div className="grid gap-3 md:grid-cols-[auto_1fr_1.5fr_1fr_auto] md:items-end">
              <OrderButtons first={i === 0} last={i === feats.length - 1} onMove={(dir) => update((d) => ({ ...d, features: moveItem(d.features, f.id, dir) }))} />
              <AField label="Name"><input className={aInput} value={f.name} onChange={(e) => setF(f.id, { name: e.target.value })} /></AField>
              <AField label="Description"><input className={aInput} value={f.description} onChange={(e) => setF(f.id, { description: e.target.value })} /></AField>
              <AField label="Price"><PriceInput value={f.price} onChange={(v) => setF(f.id, { price: v })} /></AField>
              <div className="flex items-center gap-3">
                <Toggle label="Enabled" checked={f.enabled} onChange={(v) => setF(f.id, { enabled: v })} />
                <button onClick={() => confirm(`Delete ${f.name}?`) && update((d) => ({ ...d, features: d.features.filter((x) => x.id !== f.id), packages: d.packages.map((p) => ({ ...p, includedFeatureIds: p.includedFeatureIds.filter((x) => x !== f.id) })) }))} className="rounded p-1 text-coral hover:bg-charcoal" aria-label={`Delete ${f.name}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mb-2 mt-4 text-xs uppercase tracking-wider text-grey">Available for {f.availableFor.length === 0 && "— all packages"}</p>
            <div className="flex flex-wrap gap-1.5">
              {pkgs.map((p) => {
                const on = f.availableFor.includes(p.id);
                return <button key={p.id} onClick={() => setF(f.id, { availableFor: toggle(f.availableFor, p.id) })} aria-pressed={on} className={cn("rounded-full border px-2.5 py-1 text-xs", on ? "border-gold bg-gold/15 text-gold" : "border-ivory/15 text-grey")}>{p.name}</button>;
              })}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
