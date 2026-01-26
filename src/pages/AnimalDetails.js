import { Link, useParams } from "react-router-dom";
import EthAddress from "./bits/EthAddress";
import DeclareDeathButton from "./bits/DeclareDeathButton";
import ConfirmPregnancyButton from "./bits/ConfirmPregnancyButton";
import BirthButton from "./bits/BirthButton";
import contract_abi from "../abis/AnimalCertificate.json";
import * as AnimalMaps from "../constants";
import { useSelector } from "react-redux";
import { useAccount, useContractRead } from "wagmi";
import { useEffect, useRef, useState, useMemo } from "react";
import { prepareWriteContract, writeContract } from "wagmi/actions";
import { ANIMAL_DISEASES, ANIMAL_VACCINATIONS } from "../constants";
import { jsPDF } from "jspdf";

const AnimalDetails = () => {
  const { id } = useParams();
  const contract_address = useSelector((state) => state.contract.address);
  const account = useAccount();

  // Safe BigInt parsing
  const tokenId = useMemo(() => {
    try {
      if (id == null) return null;
      // Only allow digits to avoid BigInt("abc") crash
      if (!/^\d+$/.test(id)) return null;
      return BigInt(id);
    } catch {
      return null;
    }
  }, [id]);

  const canRead = !!contract_abi && !!contract_address && tokenId !== null;

  const single_read_animal = useContractRead({
    abi: contract_abi,
    address: contract_address,
    functionName: "getAnimal",
    args: canRead ? [tokenId] : undefined,
    watch: true,
    enabled: canRead,
  });

  const single_ownerOf_animal = useContractRead({
    abi: contract_abi,
    address: contract_address,
    functionName: "ownerOf",
    args: canRead ? [tokenId] : undefined,
    watch: true,
    enabled: canRead,
    });

  const normalizeAnimal = (a) => {
  if (!a) return null;

  if (typeof a === "object" && ("id" in a || "name" in a)) {
    return {
      id: a.id,
      mother: a.mother,
      father: a.father,
      matePartner: a.matePartner,
      pregnant: a.pregnant,
      species: a.species,
      name: a.name,
      gender: a.gender,
      diseases: a.diseases ?? [],
      vaccinations: a.vaccinations ?? [],
      dateOfBirth: a.dateOfBirth,
      dateOfDeath: a.dateOfDeath,
      furColor: a.furColor,
      imageHash: a.imageHash,
    };
  }

  // fallback if it comes as an array/tuple
  return {
    id: a[0],
    mother: a[1],
    father: a[2],
    matePartner: a[3],
    pregnant: a[4],
    species: a[5],
    name: a[6],
    gender: a[7],
    diseases: a[8] ?? [],
    vaccinations: a[9] ?? [],
    dateOfBirth: a[10],
    dateOfDeath: a[11],
    furColor: a[12],
    imageHash: a[13],
  };
};

  const rawAnimal = single_read_animal.data;
  const animal = normalizeAnimal(rawAnimal);
  const owner = single_ownerOf_animal.data;

  // ABI guard: abortPregnancy may not exist
  const hasAbortPregnancy = useMemo(() => {
    return Array.isArray(contract_abi) &&
      contract_abi.some((x) => x?.type === "function" && x?.name === "abortPregnancy");
  }, [contract_abi]);

  const abort_pregnancy = async (tid) => {
    if (!hasAbortPregnancy) {
      console.warn("abortPregnancy not found in ABI");
      return false;
    }
    try {
      const config = await prepareWriteContract({
        address: contract_address,
        abi: contract_abi,
        functionName: "abortPregnancy",
        args: [BigInt(tid)],
      });
      await writeContract(config);
      return true;
    } catch (error) {
      console.log(error?.message);
      return false;
    }
  };

  const add_Disease = async (tid, disease) => {
    try {
      const config = await prepareWriteContract({
        address: contract_address,
        abi: contract_abi,
        functionName: "addDisease",
        args: [BigInt(tid), Number(disease)],
      });
      await writeContract(config);
      return true;
    } catch (error) {
      console.log(error?.message);
      return false;
    }
  };

  const add_Vaccination = async (tid, vaccination) => {
    try {
      const config = await prepareWriteContract({
        address: contract_address,
        abi: contract_abi,
        functionName: "addVaccination",
        args: [BigInt(tid), Number(vaccination)],
      });
      await writeContract(config);
      return true;
    } catch (error) {
      console.log(error?.message);
      return false;
    }
  };

  const remove_Disease = async (tid, disease) => {
    try {
      const config = await prepareWriteContract({
        address: contract_address,
        abi: contract_abi,
        functionName: "removeDisease",
        args: [BigInt(tid), Number(disease)],
      });
      await writeContract(config);
      return true;
    } catch (error) {
      console.log(error?.message);
      return false;
    }
  };

  const remove_Vaccination = async (tid, vaccination) => {
    try {
      const config = await prepareWriteContract({
        address: contract_address,
        abi: contract_abi,
        functionName: "removeVaccination",
        args: [BigInt(tid), Number(vaccination)],
      });
      await writeContract(config);
      return true;
    } catch (error) {
      console.log(error?.message);
      return false;
    }
  };

  const downloadAnimalPdf = () => {
    if (!animal || !owner) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;
    let y = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Animal Certificate", pageWidth / 2, y, { align: "center" });
    y += 10;

    const cardTop = y;
    const cardHeight = 150;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, cardTop, pageWidth - marginX * 2, cardHeight, 3, 3);
    y += 12;

    const leftX = marginX + 8;
    const valueX = marginX + 45;

    const addLabelValue = (label, value) => {
      if (value === undefined || value === null) return;
      if (value === "") return;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(label, leftX, y);

      doc.setFont("helvetica", "normal");
      const wrapped = doc.splitTextToSize(String(value), pageWidth - valueX - marginX);
      doc.text(wrapped, valueX, y);
      y += Array.isArray(wrapped) ? 8 + (wrapped.length - 1) * 5 : 8;
    };

    const dob = new Date(Number(animal.dateOfBirth * 1000n));
    const dod =
      animal.dateOfDeath && animal.dateOfDeath > 0n
        ? new Date(Number(animal.dateOfDeath * 1000n))
        : null;

    const diseasesLabel =
      animal.diseases && animal.diseases.length > 0
        ? animal.diseases.map((d) => AnimalMaps.ANIMAL_DISEASES[Number(d)]).join(", ")
        : "No known diseases";

    const vaccinationsLabel =
      animal.vaccinations && animal.vaccinations.length > 0
        ? animal.vaccinations.map((v) => AnimalMaps.ANIMAL_VACCINATIONS[Number(v)]).join(", ")
        : "No known vaccinations";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Identity", leftX, y);
    y += 6;
    doc.setDrawColor(210, 210, 210);
    doc.line(leftX, y, pageWidth - marginX - 8, y);
    y += 6;

    addLabelValue("Passport ID:", String(animal.id));
    addLabelValue("Name:", animal.name);
    addLabelValue("Species:", AnimalMaps.ANIMAL_SPECIES[Number(animal.species)] ?? "Unknown");
    addLabelValue("Gender:", AnimalMaps.ANIMAL_GENDERS[Number(animal.gender)] ?? "Unknown");
    addLabelValue("Fur Color:", AnimalMaps.ANIMAL_COLORS[Number(animal.furColor)] ?? "Unknown");
    addLabelValue("Birthday:", dob.toLocaleDateString("de-AT"));
    addLabelValue("Owner:", String(owner));

    y += 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Health", leftX, y);
    y += 6;
    doc.setDrawColor(210, 210, 210);
    doc.line(leftX, y, pageWidth - marginX - 8, y);
    y += 6;

    addLabelValue("Diseases:", diseasesLabel);
    addLabelValue("Vaccinations:", vaccinationsLabel);
    addLabelValue("Pregnant:", animal.pregnant ? "Yes" : "No");
    addLabelValue("Alive:", animal.dateOfDeath > 0n ? "No" : "Yes");
    if (dod) addLabelValue("Date of Death:", dod.toLocaleDateString("de-AT"));

    y += 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Parents", leftX, y);
    y += 6;
    doc.setDrawColor(210, 210, 210);
    doc.line(leftX, y, pageWidth - marginX - 8, y);
    y += 6;

    addLabelValue("Mother:", String(animal.mother));
    addLabelValue("Father:", String(animal.father));

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("Generated by AnimalCertificate dApp", pageWidth / 2, 290, { align: "center" });

    doc.save(`animal_${animal.id}.pdf`);
  };

  const AbortPregnancyButton = () => {
    if (!hasAbortPregnancy) return null;

    const [isModalOpen, setModalOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const cancelButtonRef = useRef(null);

    useEffect(() => {
      if (isModalOpen) cancelButtonRef.current?.focus();
    }, [isModalOpen]);

    const handleConfirm = () => {
      setModalOpen(false);
      abort_pregnancy(animal.id).then((r) => setIsErrorOpen(r !== true));
    };

    return (
      <div>
        <button
          className="bg-red-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
          onClick={() => setModalOpen(true)}
        >
          Abort Pregnancy
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded">
              <p className="text-gray-800 mb-4">
                Are you sure you want to abort this pregnancy? This action cannot be reverted.
              </p>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 mt-4 rounded"
                onClick={handleConfirm}
              >
                Confirm
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 ml-2 mt-4 rounded"
                ref={cancelButtonRef}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isErrorOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-red-400 p-6 rounded">
              <p className="text-white mb-4">An error occurred!</p>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 ml-2 mt-4 rounded mx-auto"
                onClick={() => setIsErrorOpen(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AddDiseaseButton = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedDisease, setSelectedDisease] = useState(0);
    const cancelButtonRef = useRef(null);

    useEffect(() => {
      if (isModalOpen) cancelButtonRef.current?.focus();
    }, [isModalOpen]);

    const handleConfirm = () => {
      setModalOpen(false);
      add_Disease(animal.id, Number(selectedDisease)).then(() => single_read_animal.refetch());
    };

    const SingleChoiceListOfPossibleDiseases = () => {
      const [possibleDiseases, setPossibleDiseases] = useState({});

      useEffect(() => {
        const excludedKeys = (animal.diseases ?? []).concat([99]).map(Number);
        const filtered = Object.fromEntries(
          Object.entries(ANIMAL_DISEASES).filter(([key]) => !excludedKeys.includes(Number(key)))
        );
        setPossibleDiseases(filtered);
      }, [animal.diseases]);

      return (
        <select
          className="border-2 border-gray-300 bg-[#6b7280] h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          onChange={(e) => setSelectedDisease(Number(e.target.value))}
          value={selectedDisease}
        >
          {Object.entries(possibleDiseases).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      );
    };

    return (
      <div>
        <button
          className="bg-[#9a3412] hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
          onClick={() => setModalOpen(true)}
        >
          Add Disease
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded">
              <p className="text-gray-800 mb-4">Add disease</p>
              <SingleChoiceListOfPossibleDiseases />
              <button
                className="bg-[#4d7c0f] hover:bg-red-600 text-white font-bold py-2 px-4 mt-4 ml-4 rounded"
                onClick={handleConfirm}
              >
                Confirm
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 ml-2 mt-4 rounded"
                ref={cancelButtonRef}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AddVaccinationButton = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedVaccination, setSelectedVaccination] = useState(0);
    const cancelButtonRef = useRef(null);

    useEffect(() => {
      if (isModalOpen) cancelButtonRef.current?.focus();
    }, [isModalOpen]);

    const handleConfirm = () => {
      setModalOpen(false);
      add_Vaccination(animal.id, Number(selectedVaccination)).then(() => single_read_animal.refetch());
    };

    const SingleChoiceListOfPossibleVaccinations = () => {
      const [possibleVaccinations, setPossibleVaccinations] = useState({});

      useEffect(() => {
        const excludedKeys = (animal.vaccinations ?? []).concat([99]).map(Number);
        const filtered = Object.fromEntries(
          Object.entries(ANIMAL_VACCINATIONS).filter(([key]) => !excludedKeys.includes(Number(key)))
        );
        setPossibleVaccinations(filtered);
      }, [animal.vaccinations]);

      return (
        <select
          className="border-2 border-gray-300 bg-[#6b7280] h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          onChange={(e) => setSelectedVaccination(Number(e.target.value))}
          value={selectedVaccination}
        >
          {Object.entries(possibleVaccinations).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      );
    };

    return (
      <div>
        <button
          className="bg-[#9a3412] hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
          onClick={() => setModalOpen(true)}
        >
          Add Vaccination
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded">
              <p className="text-gray-800 mb-4">Add vaccination</p>
              <SingleChoiceListOfPossibleVaccinations />
              <button
                className="bg-[#4d7c0f] hover:bg-red-600 text-white font-bold py-2 px-4 mt-4 ml-4 rounded"
                onClick={handleConfirm}
              >
                Confirm
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 ml-2 mt-4 rounded"
                ref={cancelButtonRef}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const RemoveDiseaseButton = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedDisease, setSelectedDisease] = useState(null);
    const cancelButtonRef = useRef(null);

    useEffect(() => {
      if (isModalOpen && animal && (animal.diseases?.length ?? 0) > 0) {
        setSelectedDisease(Number(animal.diseases[0]));
        cancelButtonRef.current?.focus();
      }
    }, [isModalOpen, animal]);

    const handleConfirm = () => {
      setModalOpen(false);
      if (selectedDisease != null && animal) {
        remove_Disease(animal.id, Number(selectedDisease)).then((r) => {
          if (!r) alert("Failed to remove disease.");
          else single_read_animal.refetch();
        });
      }
    };

    if (!animal || (animal.diseases?.length ?? 0) === 0) return null;

    return (
      <div>
        <button
          className="bg-red-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded ml-2"
          onClick={() => setModalOpen(true)}
        >
          Remove Disease
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded">
              <p className="text-gray-800 mb-4">Select disease to remove</p>
              <select
                className="border-2 border-gray-300 bg-[#6b7280] h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                onChange={(e) => setSelectedDisease(Number(e.target.value))}
                value={selectedDisease ?? ""}
              >
                {animal.diseases.map((d) => (
                  <option key={String(d)} value={Number(d)}>
                    {AnimalMaps.ANIMAL_DISEASES[Number(d)]}
                  </option>
                ))}
              </select>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 mt-4 ml-4 rounded"
                onClick={handleConfirm}
                disabled={selectedDisease == null}
              >
                Confirm
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 ml-2 mt-4 rounded"
                ref={cancelButtonRef}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const RemoveVaccinationButton = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedVaccination, setSelectedVaccination] = useState(null);
    const cancelButtonRef = useRef(null);

    useEffect(() => {
      if (isModalOpen && animal && (animal.vaccinations?.length ?? 0) > 0) {
        setSelectedVaccination(Number(animal.vaccinations[0]));
        cancelButtonRef.current?.focus();
      }
    }, [isModalOpen, animal]);

    const handleConfirm = () => {
      setModalOpen(false);
      if (selectedVaccination != null && animal) {
        remove_Vaccination(animal.id, Number(selectedVaccination)).then((r) => {
          if (!r) alert("Failed to remove vaccination.");
          else single_read_animal.refetch();
        });
      }
    };

    if (!animal || (animal.vaccinations?.length ?? 0) === 0) return null;

    return (
      <div>
        <button
          className="bg-red-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded ml-2"
          onClick={() => setModalOpen(true)}
        >
          Remove Vaccination
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded">
              <p className="text-gray-800 mb-4">Select vaccination to remove</p>
              <select
                className="border-2 border-gray-300 bg-[#6b7280] h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                onChange={(e) => setSelectedVaccination(Number(e.target.value))}
                value={selectedVaccination ?? ""}
              >
                {animal.vaccinations.map((v) => (
                  <option key={String(v)} value={Number(v)}>
                    {AnimalMaps.ANIMAL_VACCINATIONS[Number(v)]}
                  </option>
                ))}
              </select>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 mt-4 ml-4 rounded"
                onClick={handleConfirm}
                disabled={selectedVaccination == null}
              >
                Confirm
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 ml-2 mt-4 rounded"
                ref={cancelButtonRef}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (tokenId === null) {
    return (
      <main className="p-8 text-white text-center">
        <h1 className="text-3xl font-bold mb-4">Invalid Animal ID</h1>
        <p>Route param <b>{String(id)}</b> is not a valid token id.</p>
      </main>
    );
  }

  if (single_read_animal.isError) {
    return (
      <main className="p-8 text-white text-center">
        <h1 className="text-3xl font-bold mb-4">Animal Not Found</h1>
        <p>
          Could not load animal data for ID <b>{id}</b>.
        </p>
        <p className="text-sm mt-2 text-red-400">{single_read_animal.error?.message}</p>
      </main>
    );
  }

  return (
    <main className="p-4 rounded-lg w-full milky-glass border-2 border-solid border-neutral-200">
      {single_read_animal.isLoading || single_ownerOf_animal.isLoading ? (
        <>loading...</>
      ) : !single_read_animal.isError && !single_ownerOf_animal.isError && animal && owner ? (
        <div className="relative">
          <div className="flex flex-col items-center">
            <img
              src={
                animal.imageHash
                  ? `https://gateway.pinata.cloud/ipfs/${animal.imageHash}`
                  : AnimalMaps.ANIMAL_SPECIES_IMAGES[animal.species ?? 99n]
              }
              alt="Animal"
              className="rounded-full border-white border-4 w-32 h-32 mx-auto mt-6 blue-glow-element"
            />

            <h2 className="text-3xl font-bold mt-4">Animal Name: {animal.name}</h2>

            <div className="text-xl mt-1">
              Owner:{" "}
              <Link to={`/owner/${owner}`} className="underline">
                <EthAddress>{owner}</EthAddress>
              </Link>
            </div>

            <div className="text-2xl">{animal.dateOfDeath > 0n ? <span className="text-7xl">❌</span> : ""}</div>

            <div className="text-sm mt-2">
              <span>Species: {AnimalMaps.ANIMAL_SPECIES[Number(animal.species) ?? 99]}</span>
              <span className="mx-2">|</span>
              <span>Gender: {AnimalMaps.ANIMAL_GENDERS[Number(animal.gender) ?? 99]}</span>
              <span className="mx-2">|</span>
              <span>Birthday: {new Date(Number(animal.dateOfBirth * 1000n)).toLocaleDateString("de-AT")}</span>
            </div>

            <div className="text-sm mt-1">
              <span>Fur Color: {AnimalMaps.ANIMAL_COLORS[Number(animal.furColor) ?? 99]}</span>
              <span className="mx-2">|</span>
              <span>
                Diseases:{" "}
                {(animal.diseases?.length ?? 0) > 0
                  ? animal.diseases.map((d) => AnimalMaps.ANIMAL_DISEASES[Number(d)]).join(", ")
                  : "no known diseases"}
              </span>
              <span className="mx-2">|</span>
              <span>
                Vaccinations:{" "}
                {(animal.vaccinations?.length ?? 0) > 0
                  ? animal.vaccinations.map((v) => AnimalMaps.ANIMAL_VACCINATIONS[Number(v)]).join(", ")
                  : "no known vaccinations"}
              </span>
            </div>

            <h3 className="text-3xl font-bold mt-8">Parents:</h3>
            <Link to={`/ancestry/${Number(animal.id)}`} className="underline">
              Ancestral tree
            </Link>
            <div>Mother {String(animal.mother)}</div>
            <div>Father {String(animal.father)}</div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={downloadAnimalPdf}
                className="px-4 py-2 rounded-lg bg-white text-neutral-900 text-sm font-medium shadow-sm hover:bg-neutral-200 transition"
              >
                Download Certificate PDF
              </button>

              {account.address === owner && (
                <>
                  {animal.dateOfDeath <= 0n &&
                    (animal.diseases?.length ?? 0) < Object.keys(AnimalMaps.ANIMAL_DISEASES).length && (
                      <>
                        <AddDiseaseButton />
                        <RemoveDiseaseButton />
                      </>
                    )}

                  {animal.dateOfDeath <= 0n &&
                    (animal.vaccinations?.length ?? 0) < Object.keys(AnimalMaps.ANIMAL_VACCINATIONS).length && (
                      <>
                        <AddVaccinationButton />
                        <RemoveVaccinationButton />
                      </>
                    )}

                  {animal.dateOfDeath <= 0n && <DeclareDeathButton animal={animal} />}
                </>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 right-0 mb-4 flex flex-col gap-1 items-end">
            {animal.pregnant === false &&
              animal.dateOfDeath <= 0n &&
              Number(animal.gender) === 0 &&
              account.address === owner && <ConfirmPregnancyButton animal={animal} />}

            {animal.pregnant === true && account.address === owner && (
              <>
                <BirthButton animal={animal} />
                <AbortPregnancyButton />
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          An error occurred while loading Passport number <b>"{id}"</b>:<br />
          Status: animal: <i>{single_read_animal.status}</i>; ownerOf: <i>{single_ownerOf_animal.status}</i>
          <br />
          {single_read_animal.isError && <code>{single_read_animal.error.toString()}</code>}
          {single_ownerOf_animal.isError && <code>{single_ownerOf_animal.error.toString()}</code>}
        </>
      )}
    </main>
  );
};

export default AnimalDetails;
