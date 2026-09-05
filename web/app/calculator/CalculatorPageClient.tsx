/* eslint-disable @next/next/no-img-element */
'use client';
import BlockPalette from '@/components/BlockPalette';
import ReactorGrid from '@/components/ReactorGrid';
import { useReactorState } from '@/components/ReactorStateProvider';
import Sidebar from '@/components/Sidebar';
import { Block, BlockIds } from '@/lib/blocks';
import { PresetKey, presets } from '@/lib/configPresets';
import { Fuel } from '@/lib/fuels';
import { Reactor } from '@/lib/reactor_simulation';
import clsx from 'clsx';
import { toBlob } from 'html-to-image';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LuCheck, LuCopy, LuDownload, LuFolderOpen, LuLoader, LuSave, LuShare2, LuTrash2, LuX } from 'react-icons/lu';

// TODO: Refactor this file to reduce overall complexity and imrpove readability.

export default function Page() {
  const reactorState = useReactorState();
  const searchParams = useSearchParams();
  const reactorParam = searchParams.get('reactor');

  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [currentSavedReactors, setCurrentSavedReactors] = useState<{ name: string; reactor: string; image: string }[]>([]);
  const [loadSelectedName, setLoadSelectedName] = useState<string | null>(null);
  const [savingReactor, setSavingReactor] = useState(false);
  const [currentReactorSaveNameInput, setCurrentReactorSaveNameInput] = useState('');
  const [currentSelectedReactor, setCurrentSelectedReactor] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);
  const reactorImageRef = useRef<HTMLImageElement>(null);

  const getReactorBlob = async () => {
    await new Promise(r => setTimeout(r, 0));

    const node = document.getElementById('reactor-map');
    if (!node) return;

    node.style.fontFamily = 'system-ui';
    const blob = await toBlob(node, {
      fontEmbedCSS: '',
      skipFonts: true,
      style: {
        margin: '0',
      },
    });

    return blob;
  };

  const setReactorImageRef = async () => {
    const blob = await getReactorBlob();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    reactorImageRef.current!.src = url ?? '';
  };

  const downloadReactorAsImage = async () => {
    const blob = await getReactorBlob();
    if (!blob) return;

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'reactor.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const createReactor = (map: number[][], ratio: number, width: number, depth: number, height: number, isActivelyCooled: boolean, fuelSource: Fuel) => {
    const newReactor = new Reactor(width, depth, height, ratio, Fuel.Uranium, isActivelyCooled);

    map.forEach((row: number[], z: number) => {
      row.forEach((blockId: number, x: number) => {
        newReactor.setBlock(z, x, Object.values(Block)[blockId]);
      });
    });

    newReactor.updateFuelSource(fuelSource);

    return newReactor;
  };

  const loadReactor = (encodedReactor: string) => {
    try {
      const decoded = JSON.parse(decompressFromEncodedURIComponent(encodedReactor));
      const { map, ratio, width, depth, height, isActivelyCooled, fuelUsageMultiplier, powerProductionMultiplier, reactorPowerProductionMultiplier, reinforcedPreferred, selectedPreset, fuelSource } =
        decoded;

      const newReactor = createReactor(map, ratio, width, depth, height, isActivelyCooled || false, fuelSource ?? Fuel.Uranium);

      reactorState.setReinforcedPreferred(reinforcedPreferred || false);
      reactorState.setActivelyCooled(isActivelyCooled || false);
      reactorState.setFuelUsageMultiplier(fuelUsageMultiplier || presets.default.fuel);
      reactorState.setPowerProductionMultiplier(powerProductionMultiplier || presets.default.power);
      reactorState.setReactorPowerProductionMultiplier(reactorPowerProductionMultiplier || presets.default.reactorPower);

      reactorState.setReactor(newReactor);
      const matchedPreset = Object.entries(presets).find(([, preset]) => {
        return (
          preset.fuel === (fuelUsageMultiplier || presets.default.fuel) &&
          preset.power === (powerProductionMultiplier || presets.default.power) &&
          preset.reactorPower === (reactorPowerProductionMultiplier || presets.default.reactorPower)
        );
      });
      reactorState.setSelectedPreset(selectedPreset ?? (matchedPreset ? (matchedPreset[0] as PresetKey) : 'CUSTOM'));
    } catch (e) {
      console.error('Failed to load reactor:', e);
    }
  };

  useEffect(() => {
    if (reactorParam) {
      loadReactor(reactorParam);
    }

    setCurrentSavedReactors(savedReactors());

    // Do not add reactorParam for this effect, only want to run on initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savedReactors = () => {
    const result = JSON.parse(localStorage.getItem('savedReactors') || '[]');
    return result;
  };

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  }

  const saveCurrentReactor = async (name: string) => {
    let _currentSavedReactors = savedReactors();
    const encoded = createEncodedReactor();

    const imgBlob = await getReactorBlob();
    if (!imgBlob) return;

    const imgResult = await blobToBase64(imgBlob);

    _currentSavedReactors = _currentSavedReactors.filter((item: { name: string; reactor: string; image: string }) => item.name !== name);
    _currentSavedReactors.push({ name, reactor: encoded, image: imgResult });

    localStorage.setItem('savedReactors', JSON.stringify(_currentSavedReactors));
    setCurrentSavedReactors(_currentSavedReactors);
  };

  const removeSavedReactor = (name: string) => {
    let _currentSavedReactors = savedReactors();
    _currentSavedReactors = _currentSavedReactors.filter((item: { name: string; reactor: string; image: string }) => item.name !== name);
    localStorage.setItem('savedReactors', JSON.stringify(_currentSavedReactors));
    setCurrentSavedReactors(_currentSavedReactors);
  };

  const createEncodedReactor = useCallback(() => {
    const numericMap = reactorState.reactor.reactorMap.map(row => row.map(block => BlockIds[block]));

    const reactorPayload = {
      map: numericMap,
      ratio: reactorState.reactor.insertionRatio,
      width: reactorState.reactor.width,
      depth: reactorState.reactor.depth,
      height: reactorState.reactor.height,
      isActivelyCooled: reactorState.reactor.isActivelyCooled,
      fuelUsageMultiplier: reactorState.fuelUsageMultiplier,
      powerProductionMultiplier: reactorState.powerProductionMultiplier,
      reactorPowerProductionMultiplier: reactorState.reactorPowerProductionMultiplier,
      reinforcedPreferred: reactorState.reinforcedPreferred,
      selectedPreset: reactorState.selectedPreset,
      fuelSource: reactorState.reactor.currentFuel,
    };

    const encoded = compressToEncodedURIComponent(JSON.stringify(reactorPayload));

    return encoded;
  }, [
    reactorState.reactor,
    reactorState.fuelUsageMultiplier,
    reactorState.powerProductionMultiplier,
    reactorState.reactorPowerProductionMultiplier,
    reactorState.reinforcedPreferred,
    reactorState.selectedPreset,
  ]);

  const createShareURL = useCallback(() => {
    const shareUrl = `${window.location.origin}/calculator/?reactor=${createEncodedReactor()}`;
    return shareUrl;
  }, [createEncodedReactor]);

  useEffect(() => {
    window.history.replaceState(null, '', createShareURL());
  }, [createShareURL]);

  useEffect(() => {
    reactorState.setReactor(prev => {
      const next = prev.clone();
      next.updateActivelyCooled(reactorState.activelyCooled);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactorState.activelyCooled]);

  return (
    <div className="flex flex-1 mx-auto w-full h-full">
      <div className="md:hidden fixed z-60 bg-neutral-800 w-full h-full p-6">
        <div className="flex justify-center items-center">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-semibold text-white">Desktop Required</h1>

            <p className="text-neutral-400">The Extreme Reactors 2 Calculator is designed for larger screens and is not currently supported on mobile devices.</p>

            <Link href="/" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-md hover:opacity-80">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex  bg-neutral-900/90 text-neutral-200 overflow-auto backdrop-blur-xs">
          <div className="max-w-sm w-full text-left px-6 flex items-center flex-col gap-4 py-30 m-auto">
            <div className="flex justify-between w-full ">
              <div>
                <h2 className="text-xl font-semibold">Share Your Reactor</h2>
                <p className="text-sm text-neutral-400">Copy the URL below to share your reactor design with others!</p>
              </div>
              <div
                className="bg-red-500 p-2 rounded text-red-950 text-xl cursor-pointer hover:opacity-80 w-fit h-fit"
                onClick={() => {
                  setShowShareModal(false);
                }}
              >
                <LuX />
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <input
                type="text"
                readOnly
                value={createShareURL()}
                className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-neutral-200 cursor-pointer outline-none"
                onClick={e => {
                  (e.target as HTMLInputElement).select();
                  navigator.clipboard.writeText(createShareURL());
                }}
              />
              <div
                className="bg-blue-500 p-2 rounded text-blue-950 text-xl cursor-pointer hover:opacity-80"
                onClick={() => {
                  navigator.clipboard.writeText(createShareURL());
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 800);
                }}
              >
                {copied ? <LuCheck /> : <LuCopy />}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-2 bg-neutral-800 border border-neutral-700 rounded">
                <img ref={reactorImageRef} alt="Loading image..." className="w-full max-h-100" />
              </div>
              <div
                className="bg-blue-500 p-2 rounded text-blue-950 text-xl cursor-pointer hover:opacity-80 w-fit"
                onClick={() => {
                  setCopyingImage(true);
                  downloadReactorAsImage();

                  setTimeout(() => {
                    setCopyingImage(false);
                  }, 0);
                }}
              >
                {copyingImage ? <LuLoader /> : <LuDownload />}
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex  bg-neutral-900/90 text-neutral-200 overflow-auto backdrop-blur-xs">
          <div className="max-w-sm text-left w-full px-6 flex items-center flex-col gap-4 py-30 m-auto">
            <div className="flex justify-between w-full ">
              <div>
                <h2 className="text-xl font-semibold">Load Reactor</h2>
                <p className="text-sm text-neutral-400">Select a reactor to load</p>
              </div>

              <div
                className="bg-red-500 p-2 rounded text-red-950 text-xl cursor-pointer hover:opacity-80 w-fit h-fit"
                onClick={() => {
                  setShowLoadModal(false);
                  setLoadSelectedName(null);
                }}
              >
                <LuX />
              </div>
            </div>

            {currentSavedReactors.length === 0 && <div className="text-neutral-300">No saved reactors found. Please save a reactor to load it here.</div>}

            <div className="w-full space-y-2 max-h-100 overflow-auto">
              {currentSavedReactors.map((item: { name: string; reactor: string; image: string }) => {
                const decoded = JSON.parse(decompressFromEncodedURIComponent(item.reactor));
                const { map, ratio, width, depth, height, isActivelyCooled, fuelUsageMultiplier, powerProductionMultiplier, reactorPowerProductionMultiplier, reinforcedPreferred, fuelSource } =
                  decoded;
                const currentReactor = createReactor(map, ratio, width, depth, height, isActivelyCooled, fuelSource);

                const reactorIsLarge = height > 3 || width > 3 || depth > 3;
                const reactorIsReinforced = reactorIsLarge || isActivelyCooled || reinforcedPreferred;

                const energyAfterMultipliers = currentReactor.totalEnergy * powerProductionMultiplier * reactorPowerProductionMultiplier * (reactorIsReinforced ? 1 : 0.8);
                const fuelAfterMultiplier = currentReactor.fuelUsage * fuelUsageMultiplier;

                const steam = currentReactor.steamGenerated;
                return (
                  <div
                    key={item.name}
                    className={clsx(
                      'flex items-center gap-2 py-3 px-2 rounded cursor-pointer select-none transition-colors h-fit',
                      'bg-neutral-300/10 hover:bg-neutral-700 border-2 border-transparent',
                      item.name === loadSelectedName && 'border-blue-400! bg-blue-500/10!',
                    )}
                    onClick={() => {
                      setLoadSelectedName(item.name);
                    }}
                  >
                    <div className="w-12 self-stretch shrink-0 relative">
                      <img className="absolute inset-0 w-full h-full object-contain" src={item.image} alt="" />
                    </div>
                    <div className="w-full">
                      <div className={(item.name === '' ? 'text-neutral-600' : undefined) + 'text-wrap break-all'}>{item.name === '' ? 'No name provided' : item.name}</div>
                      <div className="text-sm text-neutral-300">
                        {isActivelyCooled ? (
                          <div>Steam: {steam < 1000 ? `${steam.toFixed(2)} mB/t` : `${(steam / 1000).toFixed(2)} B/t`}</div>
                        ) : (
                          <div>Power: {energyAfterMultipliers.toFixed(2)} FE/t</div>
                        )}
                        <div>Fuel Usage: {fuelAfterMultiplier.toFixed(4)} mB/t</div>
                      </div>
                    </div>
                    <div
                      className="mr-0 ml-auto p-2 bg-red-500 rounded-md text-red-950 hover:opacity-80"
                      onClick={e => {
                        e.stopPropagation();
                        removeSavedReactor(item.name);
                      }}
                    >
                      <LuTrash2 />
                    </div>
                  </div>
                );
              })}
            </div>

            {currentSavedReactors.length !== 0 && (
              <button
                onClick={() => {
                  setShowLoadModal(false);
                  setLoadSelectedName(null);
                  loadReactor(currentSavedReactors.find((item: { name: string }) => item.name === loadSelectedName)?.reactor || '');
                  setCurrentSelectedReactor(loadSelectedName || '');
                }}
                disabled={loadSelectedName === null || !currentSavedReactors.some(item => item.name === loadSelectedName)}
                className={'w-full py-1.5 text-sm rounded transition-colors cursor-pointer bg-neutral-700 disabled:text-neutral-400 !disabled:hover:bg-neutral-600 !disabled:text-white'}
              >
                Load
              </button>
            )}
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex  bg-neutral-900/90 text-neutral-200 overflow-auto backdrop-blur-xs">
          <div className="max-w-sm w-full text-left px-6 flex items-center flex-col gap-4 py-30 m-auto">
            <div className="flex justify-between w-full ">
              <div>
                <h2 className="text-xl font-semibold">Save Reactor</h2>
                <p className="text-sm text-neutral-400">Enter a reactor name, then click the save button to save your reactor design for later!</p>
              </div>
              <div
                className="bg-red-500 p-2 rounded text-red-950 text-xl cursor-pointer hover:opacity-80 w-fit h-fit"
                onClick={() => {
                  setShowSaveModal(false);
                }}
              >
                <LuX />
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <input
                onChange={e => {
                  const value = e.target.value;
                  setCurrentReactorSaveNameInput(value);
                }}
                placeholder="Reactor name"
                value={currentReactorSaveNameInput}
                className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-sm text-neutral-200 outline-none"
              />
            </div>
            {savedReactors().some((item: { name: string }) => item.name === currentReactorSaveNameInput) && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded">
                Reactor name conflicts with another saved reactor. Saving will overwrite the existing reactor.
              </div>
            )}
            <button
              onClick={async () => {
                setSavingReactor(true);
                await saveCurrentReactor(currentReactorSaveNameInput);
                setSavingReactor(false);
                setShowSaveModal(false);
                setCurrentSelectedReactor(currentReactorSaveNameInput);
              }}
              disabled={savingReactor}
              className={'w-full py-1.5 text-sm rounded transition-colors cursor-pointer bg-neutral-700 disabled:text-neutral-400 !disabled:hover:bg-neutral-600 !disabled:text-white'}
            >
              {savingReactor ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* LEFT PANEL */}
      <BlockPalette selectedBlock={reactorState.selectedBlock} setSelectedBlock={reactorState.setSelectedBlock} />

      {/* CENTER SECTION */}
      <div
        className="flex flex-col relative gap-10 items-center flex-1 overflow-auto min-h-0"
        style={{
          boxShadow: 'inset 0 0 2rem #0004',
        }}
      >
        {/* TOP BUTTONS */}
        <div className="fixed top-20 z-20 flex gap-2">
          <div
            title="Save current reactor..."
            className="bg-blue-500 p-2 rounded text-blue-950 text-xl cursor-pointer hover:opacity-80"
            onClick={() => {
              setShowSaveModal(true);
              setCurrentReactorSaveNameInput(currentSelectedReactor);
            }}
          >
            <LuSave />
          </div>

          <div
            title="Load saved reactor..."
            className="bg-blue-500 p-2 rounded text-blue-950 text-xl cursor-pointer hover:opacity-80"
            onClick={() => {
              setShowLoadModal(true);
            }}
          >
            <LuFolderOpen />
          </div>

          <div
            title="Share reactor..."
            className="bg-blue-500 p-2 rounded text-blue-950 text-xl cursor-pointer hover:opacity-80"
            onClick={() => {
              setShowShareModal(true);
              setReactorImageRef();
            }}
          >
            <LuShare2 />
          </div>

          <div
            title="Clear all blocks"
            className="bg-red-700 p-2 rounded text-red-200 text-xl cursor-pointer hover:opacity-80 relative group ml-4"
            onClick={() => {
              reactorState.setReactor(prev => new Reactor(prev.width, prev.depth, prev.height, prev.insertionRatio, Fuel.Uranium, prev.isActivelyCooled));
            }}
          >
            <LuTrash2 />
          </div>
        </div>

        <div
          className="m-auto"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff0a 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff0a 1px, transparent 1px)
            `,
            backgroundSize: '2rem 2rem',
            backgroundPosition: '1rem 1rem',
            boxShadow: 'inset 0 0 1rem 2rem #262626',
          }}
        >
          {/* DISPLAYED REACTOR */}
          <ReactorGrid />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <Sidebar />
    </div>
  );
}
