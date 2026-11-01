import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { resetDemo, update, useDB } from "@/data/store";
import type { Settings as S } from "@/data/types";
import { aBtn, aBtnGhost, AField, aInput, PageHead, UploadButton } from "@/components/admin/kit";
import { normalizePhone } from "@/lib/quote";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

function Settings() {
  const db = useDB();
  const [s, setS] = useState<S>(db.settings);
  useEffect(() => setS(db.settings), [db.settings]);
  const f = (k: keyof S) => ({ value: s[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value }) });
  const save = () => {
    const digits = normalizePhone(s.whatsapp);
    if (digits.length < 10) { toast.error("WhatsApp number needs a country code, e.g. 91…"); return; }
    update((d) => ({ ...d, settings: { ...s, whatsapp: digits } }));
    toast.success("Settings saved");
  };
  return (
    <>
      <PageHead title="Website settings" action={<button onClick={save} className={aBtn}>Save changes</button>} />
      <div className="grid max-w-3xl gap-6 md:grid-cols-2">
        <AField label="WhatsApp number" hint="Include country code. Used by every WhatsApp button."><input className={aInput} inputMode="tel" {...f("whatsapp")} /></AField>
        <AField label="Brand name"><input className={aInput} {...f("brandName")} /></AField>
        <AField label="Contact email (optional)"><input className={aInput} type="email" {...f("email")} /></AField>
        <AField label="Location"><input className={aInput} {...f("location")} /></AField>
        <AField label="Homepage headline" className="md:col-span-2"><input className={aInput} {...f("heroHeadline")} /></AField>
        <AField label="Homepage supporting text" className="md:col-span-2"><textarea rows={2} className={aInput} {...f("heroSub")} /></AField>
        <AField label="Showreel video URL" className="md:col-span-2" hint="Paste a hosted MP4/WebM URL, or upload one for this session.">
          <div className="flex flex-wrap gap-2">
            <input className={aInput + " flex-1"} {...f("showreelUrl")} placeholder="https://…/showreel.mp4" />
            <UploadButton accept="video/mp4,video/webm" onDone={(ms) => ms[0] && setS({ ...s, showreelUrl: ms[0].url })} />
          </div>
        </AField>
        <AField label="SEO title" className="md:col-span-2"><input className={aInput} {...f("seoTitle")} /></AField>
        <AField label="SEO description" className="md:col-span-2"><textarea rows={2} className={aInput} {...f("seoDescription")} /></AField>
      </div>
      <div className="mt-8 max-w-3xl rounded-xl border border-ivory/10 bg-card p-5">
        <p className="font-semibold text-ivory">Brand Identity &amp; Logo Assets</p>
        <p className="mt-1 text-sm text-ivory/60">Active vector-rendered &amp; high-DPI brand marks.</p>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="rounded-lg border border-ivory/10 bg-midnight p-3 text-center">
            <img src="/brand/scaleflow-mark-dark.png" alt="ScaleFlow Emblem" className="mx-auto h-10 w-auto object-contain" />
            <p className="label-mono mt-2 text-[9px] text-gold">Emblem Mark</p>
          </div>
          <div className="rounded-lg border border-ivory/10 bg-midnight p-3 text-center">
            <img src="/brand/scaleflow-horizontal-full-dark.png" alt="ScaleFlow Full Horizontal" className="mx-auto h-10 w-auto object-contain" />
            <p className="label-mono mt-2 text-[9px] text-gold">Horizontal Lockup</p>
          </div>
          <div className="rounded-lg border border-ivory/10 bg-midnight p-3 text-center">
            <img src="/favicon.png" alt="App Icon" className="mx-auto h-10 w-10 rounded-md object-contain" />
            <p className="label-mono mt-2 text-[9px] text-gold">Favicon / App Icon</p>
          </div>
        </div>
      </div>
      <p className="mt-6 max-w-3xl text-xs text-grey">Featured projects are chosen with the “Featured” switch on the Projects page. SEO fields are stored now and will be applied to page metadata once the backend serves them.</p>
      <div className="mt-12 max-w-3xl rounded-lg border border-coral/30 p-5">
        <p className="font-semibold">Reset demo data</p>
        <p className="mt-1 text-sm text-ivory/60">Restore all sample content and remove changes saved in this browser.</p>
        <button onClick={() => confirm("Reset all demo data?") && (resetDemo(), toast.success("Demo data reset"))} className={aBtnGhost + " mt-4 text-coral"}>Reset everything</button>
      </div>
    </>
  );
}
