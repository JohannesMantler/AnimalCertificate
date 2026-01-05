import React, { useMemo, useState } from "react";

const FAQ_DATA = [
  {
    category: "General",
    items: [
      {
        q: "What is this platform?",
        a: "Our platform provides a digital identity for pets based on blockchain technology. Each pet receives a unique token in which important life, health, and breeding data are securely stored.",
      },
      {
        q: "Why blockchain for pets?",
        a: "Blockchain ensures tamper resistance, transparency, and traceability. Once stored, data cannot be secretly altered or deleted — ideal for trust in breeding, sales, and veterinary care.",
      },
    ],
  },
  {
    category: "Token & NFT",
    items: [
      {
        q: "What is a pet token?",
        a: "A pet token is a digital, unique identity for your pet. It represents your animal on the blockchain and contains all relevant information.",
      },
      {
        q: "What data is stored in the token?",
        a: "The token can include, among other things: date of birth, illnesses & treatments, vaccinations, images & documents, pregnancies & births, as well as a full change history.",
      },
      {
        q: "Is my pet an NFT?",
        a: "Technically yes — but not in a speculative sense. The token is not intended for trading, but for secure documentation and identification.",
      },
    ],
  },
  {
    category: "Security & Privacy",
    items: [
      {
        q: "Is my data secure?",
        a: "Yes. Sensitive content can be encrypted or made visible only to authorized parties. The blockchain ensures a high level of data integrity.",
      },
      {
        q: "Who can see the data?",
        a: "You decide who has access (e.g., owner, veterinarian, breeder, buyer).",
      },
      {
        q: "Can data be changed?",
        a: "Yes. Data can be updated — all changes remain transparently documented in an audit history.",
      },
    ],
  },
  {
    category: "Breeding",
    items: [
      {
        q: "Can I record pregnancies?",
        a: "Yes. Pregnancies can be recorded including time period, parent animals, and additional information.",
      },
      {
        q: "How are births documented?",
        a: "Births can be recorded (date, number of offspring, notes) and — if available — linked to the tokens of the offspring.",
      },
    ],
  },
  {
    category: "Sales & Ownership",
    items: [
      {
        q: "What happens when an animal is sold?",
        a: "The token can be securely transferred to the new owner — including the complete history for full transparency.",
      },
      {
        q: "Can data be deleted after a sale?",
        a: "The historical record remains intact to prevent manipulation. Visibility and permissions can still be managed.",
      },
    ],
  },
  {
    category: "Costs & Usage",
    items: [
      {
        q: "How much does minting a token cost?",
        a: "The cost depends on the blockchain used. Fees are displayed transparently before minting.",
      },
      {
        q: "Do I need crypto knowledge?",
        a: "No. The platform is designed to be easy to use even without prior blockchain experience.",
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
          Answers to the most frequently asked questions about tokens, health, breeding, and ownership.
        </p>

        <div className="mt-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search… (e.g. "vaccinations", "sale", "costs")'
            className="w-full rounded-2xl px-4 py-3 milky-glass border border-white/10 outline-none focus:border-white/20 text-slate-900 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {filtered.length === 0 ? (
          <div className="milky-glass rounded-2xl shadow backdrop-blur-xl border border-white/10 p-5 text-white/80">
            No results found. Try using a different term.
          </div>
        ) : (
          filtered.map((cat, ci) => (
            <section key={cat.category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{cat.category}</h2>
                <span className="text-sm text-white/50">
                  {cat.items.length} {cat.items.length === 1 ? "Question" : "Questions"}
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
