import React from "react";
import { useSelector } from "react-redux";
import { useContractRead } from "wagmi";
import AnimalCertificateABI from "../abis/AnimalCertificate.json";
import { Link } from "react-router-dom";

const Feature = ({ title, text }) => (
  <div className="milky-glass rounded-2xl border border-white/10 p-5 shadow backdrop-blur-xl">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 text-white/75 leading-relaxed">{text}</p>
  </div>
);

const Home = () => {
  const contractAddress = useSelector((state) => state.contract.address);

  const contract_supply = useContractRead({
    abi: AnimalCertificateABI,
    address: contractAddress,
    functionName: "totalSupply",
    watch: true,
  });

  const supplyText = (() => {
    if (contract_supply.isSuccess) return Number(contract_supply.data);
    if (contract_supply.isLoading) return "…";
    return "—";
  })();

  return (
    <main className="pt-24 px-4">
      <section className="mx-auto max-w-6xl">
        <div className="milky-glass rounded-3xl border border-white/10 shadow backdrop-blur-xl p-7 md:p-10">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                Animal Certificate
              </h1>
              <p className="mt-3 text-lg md:text-xl text-white/70 leading-relaxed">
                Your pet’s digital identity — built for trust, transparency, and long-term proof. 🐾
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <div className="milky-glass rounded-2xl border border-white/10 px-4 py-3 text-white/80">
                <span className="text-white font-semibold">{supplyText}</span>{" "}
                pets certified so far
              </div>

              <div className="flex gap-3">
                <Link
                  to="/animals"
                  className="rounded-2xl px-5 py-3 font-semibold text-white milky-glass border border-white/10 hover:border-white/20 transition"
                >
                  Browse Certificates
                </Link>
              </div>
            </div>

            {contract_supply.isError && (
              <div className="text-sm text-red-300">
                {contract_supply.error?.toString?.() || "Contract read error"}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl mt-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="milky-glass rounded-3xl border border-white/10 shadow backdrop-blur-xl p-7 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Why blockchain makes sense for pet data
            </h2>
            <p className="mt-4 text-white/75 leading-relaxed">
              Pet records matter for years — ownership changes, vets change, breeders
              document lineage, and buyers want proof. A blockchain-backed certificate
              creates a tamper-resistant timeline of key events, so trust doesn’t depend
              on one platform, one person, or one database.
            </p>

            <div className="mt-6 space-y-3 text-white/75 leading-relaxed">
              <p>
                <span className="text-white font-semibold">Immutable history:</span>{" "}
                Updates are possible, but past entries remain auditable. That makes
                silent edits and “lost paperwork” far harder.
              </p>
              <p>
                <span className="text-white font-semibold">Portable ownership:</span>{" "}
                The certificate can be transferred with the pet — providing continuity
                across owners and jurisdictions.
              </p>
              <p>
                <span className="text-white font-semibold">Verifiable trust:</span>{" "}
                Vaccinations, treatments, and breeding events can be proven as recorded
                at a specific time — useful for sales, insurance, and veterinary care.
              </p>
              <p>
                <span className="text-white font-semibold">Controlled access:</span>{" "}
                You can keep sensitive details private while still proving that a record
                exists and was not altered.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/faq"
                className="rounded-2xl px-5 py-3 font-semibold text-white milky-glass border border-white/10 hover:border-white/20 transition"
              >
                Read the FAQ
              </Link>
            </div>
          </div>

          {/* FEATURES */}
          <div className="grid gap-4">
            <Feature
              title="Tamper-resistant medical timeline"
              text="Keep vaccinations, treatments, and documents in one place with an auditable change history."
            />
            <Feature
              title="Breeding & lineage proof"
              text="Document pregnancies, births, and parent relationships to increase transparency in breeding."
            />
            <Feature
              title="Faster handovers"
              text="When ownership changes, the certificate can move with the pet — no messy paperwork."
            />
            <Feature
              title="Privacy by design"
              text="Share only what’s needed with vets, breeders, or buyers — while preserving verifiable integrity."
            />
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="mx-auto max-w-6xl mt-10 pb-16">
        <div className="milky-glass rounded-3xl border border-white/10 shadow backdrop-blur-xl p-7 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              Ready to create your pet’s certificate?
            </h3>
            <p className="mt-2 text-white/70">
              Mint a token once, then keep records organized for the long run.
            </p>
          </div>
          <div className="flex gap-3">
          <Link
              to="/animals/new"
              className="rounded-2xl px-5 py-3 font-semibold text-slate-900 bg-white hover:bg-white/90 transition"
            >
                Mint a Token
          </Link>
            <Link
              to="/animals"
              className="rounded-2xl px-5 py-3 font-semibold text-white milky-glass border border-white/10 hover:border-white/20 transition"
            >
              View Certificates
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
