import React, { useMemo, useState } from "react";

const FAQ_DATA = [
  {
    category: "Allgemein",
    items: [
      {
        q: "Was ist diese Plattform?",
        a: "Unsere Plattform bietet eine digitale Identität für Haustiere, basierend auf Blockchain-Technologie. Jedes Haustier erhält einen einzigartigen Token, in dem wichtige Lebens-, Gesundheits- und Zuchtdaten sicher gespeichert werden.",
      },
      {
        q: "Warum Blockchain für Haustiere?",
        a: "Blockchain sorgt für Fälschungssicherheit, Transparenz und Nachvollziehbarkeit. Einmal gespeicherte Daten können nicht heimlich manipuliert oder gelöscht werden – ideal für Vertrauen bei Zucht, Verkauf und medizinischer Betreuung.",
      },
    ],
  },
  {
    category: "Token & NFT",
    items: [
      {
        q: "Was ist ein Haustier-Token?",
        a: "Ein Haustier-Token ist eine digitale, eindeutige Identität deines Haustiers. Er repräsentiert dein Tier auf der Blockchain und enthält alle relevanten Informationen.",
      },
      {
        q: "Welche Daten sind im Token gespeichert?",
        a: "Der Token kann u. a. enthalten: Geburtsdatum, Krankheiten & Behandlungen, Impfungen, Bilder & Dokumente, Schwangerschaften & Geburten sowie eine Historie von Änderungen.",
      },
      {
        q: "Ist mein Haustier ein NFT?",
        a: "Technisch ja – aber nicht im spekulativen Sinne. Der Token dient nicht dem Handel, sondern der sicheren Dokumentation und Identifikation.",
      },
    ],
  },
  {
    category: "Sicherheit & Datenschutz",
    items: [
      {
        q: "Sind meine Daten sicher?",
        a: "Ja. Sensible Inhalte können verschlüsselt oder nur für berechtigte Personen sichtbar gemacht werden. Die Blockchain sorgt für hohe Integrität der Historie.",
      },
      {
        q: "Wer kann die Daten sehen?",
        a: "Du bestimmst, wer Zugriff hat (z. B. Besitzer, Tierarzt, Züchter, Käufer).",
      },
      {
        q: "Können Daten geändert werden?",
        a: "Ja. Daten können aktualisiert werden – Änderungen bleiben nachvollziehbar dokumentiert (Audit-Historie).",
      },
    ],
  },
  {
    category: "Zucht",
    items: [
      {
        q: "Kann ich Schwangerschaften eintragen?",
        a: "Ja. Schwangerschaften können inklusive Zeitraum, Elterntieren und Zusatzinfos eingetragen werden.",
      },
      {
        q: "Wie werden Geburten dokumentiert?",
        a: "Geburten können erfasst werden (Datum, Anzahl, Notizen) und – wenn vorhanden – mit Tokens der Nachkommen verknüpft werden.",
      },
    ],
  },
  {
    category: "Verkauf & Besitz",
    items: [
      {
        q: "Was passiert beim Verkauf eines Tieres?",
        a: "Der Token kann sicher an den neuen Besitzer übertragen werden – inklusive kompletter Historie für Transparenz.",
      },
      {
        q: "Kann man Daten nach dem Verkauf löschen?",
        a: "Die Historie bleibt erhalten, um Manipulationen zu vermeiden. Sichtbarkeit/Permissions können jedoch geregelt werden.",
      },
    ],
  },
  {
    category: "Kosten & Nutzung",
    items: [
      {
        q: "Was kostet das Minten eines Tokens?",
        a: "Die Kosten hängen von der verwendeten Blockchain ab. Die Gebühren werden transparent vor dem Minten angezeigt.",
      },
      {
        q: "Brauche ich Krypto-Kenntnisse?",
        a: "Nein. Die Plattform ist so aufgebaut, dass sie auch ohne Blockchain-Vorkenntnisse einfach genutzt werden kann.",
      },
    ],
  },
];

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="milky-glass rounded-2xl shadow backdrop-blur-xl border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold">{q}</span>
        <span
          className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden px-5 pb-4 text-white/80 leading-relaxed">
          {a}
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState(null); // {catIndex}-{itemIndex}

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_DATA;

    return FAQ_DATA.map((cat) => {
      const items = cat.items.filter(
        (it) =>
          it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)
      );
      return { ...cat, items };
    }).filter((cat) => cat.items.length > 0);
  }, [query]);

  return (
    <div className="pt-20 px-4 max-w-4xl mx-auto">
      <div className="milky-glass rounded-3xl shadow backdrop-blur-xl border border-white/10 p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold">FAQ</h1>
        <p className="text-white/70 mt-2">
          Antworten auf die häufigsten Fragen zu Token, Gesundheit, Zucht und Besitz.
        </p>

        <div className="mt-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Suchen… (z.B. "Impfungen", "Verkauf", "Kosten")'
            className="w-full rounded-2xl px-4 py-3 milky-glass border border-white/10 outline-none focus:border-white/20 text-slate-900 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {filtered.length === 0 ? (
          <div className="milky-glass rounded-2xl shadow backdrop-blur-xl border border-white/10 p-5 text-white/80">
            Keine Treffer. Versuch’s mit einem anderen Begriff.
          </div>
        ) : (
          filtered.map((cat, ci) => (
            <section key={cat.category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{cat.category}</h2>
                <span className="text-sm text-white/50">
                  {cat.items.length} {cat.items.length === 1 ? "Frage" : "Fragen"}
                </span>
              </div>

              <div className="space-y-3">
                {cat.items.map((it, ii) => {
                  const key = `${cat.category}-${ci}-${ii}`;
                  const open = openKey === key;
                  return (
                    <FaqItem
                      key={key}
                      q={it.q}
                      a={it.a}
                      open={open}
                      onToggle={() => setOpenKey(open ? null : key)}
                    />
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
