import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { byOrder, moveItem, uid, update, useDB } from "@/data/store";
import { inCategory } from "@/data/portfolio-utils";
import { aBtn, aInput, OrderButtons, PageHead, slugify, Toggle } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/categories")({ component: Categories });

function Categories() {
  const db = useDB();
  const [name, setName] = useState("");
  const cats = [...db.categories].sort(byOrder);
  const set = (id: string, patch: Partial<(typeof cats)[number]>) => update((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const add = () => {
    if (!name.trim()) return;
    update((d) => ({ ...d, categories: [...d.categories, { id: uid(), name: name.trim(), slug: slugify(name), enabled: true, order: d.categories.length + 1 }] }));
    setName("");
    toast.success("Category added");
  };
  return (
    <>
      <PageHead title="Categories" desc="These power the portfolio and video filters. Disabled categories are hidden from public filters." />
      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="mb-6 flex gap-2">
        <input className={aInput + " max-w-xs"} placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} aria-label="New category name" />
        <button className={aBtn}><Plus className="h-4 w-4" /> Add</button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-ivory/10">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-grey">
            <tr><th className="p-3">Order</th><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Projects</th><th className="p-3">Visible</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-ivory/10">
            {cats.map((c, i) => {
              const count = db.projects.filter((p) => inCategory(p, c.id)).length;
              return (
                <tr key={c.id}>
                  <td className="p-3"><OrderButtons first={i === 0} last={i === cats.length - 1} onMove={(dir) => update((d) => ({ ...d, categories: moveItem(d.categories, c.id, dir) }))} /></td>
                  <td className="p-3"><input className={aInput} value={c.name} onChange={(e) => set(c.id, { name: e.target.value })} aria-label="Category name" /></td>
                  <td className="p-3"><input className={aInput} value={c.slug} onChange={(e) => set(c.id, { slug: slugify(e.target.value) })} aria-label="Category slug" /></td>
                  <td className="p-3 text-grey">{count}</td>
                  <td className="p-3"><Toggle label="Visible in filters" checked={c.enabled} onChange={(v) => set(c.id, { enabled: v })} /></td>
                  <td className="p-3 text-right">
                    <button
                      disabled={count > 0}
                      title={count > 0 ? "Reassign its projects first" : "Delete"}
                      onClick={() => confirm(`Delete “${c.name}”?`) && update((d) => ({ ...d, categories: d.categories.filter((x) => x.id !== c.id) }))}
                      className="rounded p-2 text-coral hover:bg-charcoal disabled:opacity-25"
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-grey">Assign projects to categories from the Projects page.</p>
    </>
  );
}
