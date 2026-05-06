'use client';
import BlockPalette from '@/components/BlockPalette';
import ReactorGrid from '@/components/ReactorGrid';
import Sidebar from '@/components/Sidebar';
import { Block, BlockIds } from '@/lib/blocks';
import { presets } from '@/lib/configPresets';
import { Fuel } from '@/lib/fuels';
import { Reactor } from '@/lib/reactor_simulation';
import { toBlob } from 'html-to-image';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { LuCheck, LuCopy, LuDownload, LuLoader, LuRotateCcw, LuShare2, LuX } from 'react-icons/lu';

export default function Home() {
  const searchParams = useSearchParams();
  const reactorParam = searchParams.get('reactor');
  const [selectedBlock, setSelectedBlock] = useState(Block.Air);
  const [activelyCooled, setActivelyCooled] = useState(false);
  const [reactor, setReactor] = useState(new Reactor(7, 7, 7, 0, Fuel.Uranium, false));

  const [powerProductionMultiplier, setPowerProductionMultiplier] = useState(1);
  const [reactorPowerProductionMultiplier, setReactorPowerProductionMultiplier] = useState(1);
  const [fuelUsageMultiplier, setFuelUsageMultiplier] = useState(1);

  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  // const [copiedImage, setCopiedImage] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);
  const reactorImageRef = useRef<HTMLImageElement>(null);

  const createReactorImage = async () => {
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

    if (!blob) return;
    const url = URL.createObjectURL(blob);

    reactorImageRef.current!.src = url;
  };

  const downloadReactorAsImage = async () => {
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

    if (!blob) return;

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'reactor.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    if (reactorParam) {
      try {
        const decoded = JSON.parse(decompressFromEncodedURIComponent(reactorParam));
        const { map, ratio, width, depth, height, isActivelyCooled, fuelUsageMultiplier, powerProductionMultiplier, reactorPowerProductionMultiplier } = decoded;
        const newReactor = new Reactor(width, depth, height, ratio, Fuel.Uranium, isActivelyCooled || false);
        map.forEach((row: number[], z: number) => {
          row.forEach((blockId: number, x: number) => {
            newReactor.setCol(z, x, Object.values(Block)[blockId]);
          });
        });

        newReactor.simulate();

        setActivelyCooled(isActivelyCooled || false);
        setFuelUsageMultiplier(fuelUsageMultiplier || presets.default.fuel);
        setPowerProductionMultiplier(powerProductionMultiplier || presets.default.power);
        setReactorPowerProductionMultiplier(reactorPowerProductionMultiplier || presets.default.reactorPower);
        setReactor(newReactor);
      } catch (e) {
        console.error('Failed to load reactor from URL:', e);
      }
    }

    // Do not add reactorParam for this effect, only want to run on initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resizeReactor = (newCols: number, newRows: number, newHeight: number) => {
    setReactor(() => new Reactor(newCols, newRows, newHeight, 0, Fuel.Uranium, activelyCooled));
  };

  useEffect(() => {
    const numericMap = reactor.getReactorMap().map(row => row.map(block => BlockIds[block]));

    const reactorPayload = {
      map: numericMap,
      ratio: reactor.getInsertionRatio(),
      width: reactor.width,
      depth: reactor.depth,
      height: reactor.height,
      isActivelyCooled: reactor.getActivelyCooled(),
      fuelUsageMultiplier,
      powerProductionMultiplier,
      reactorPowerProductionMultiplier,
    };

    window.history.replaceState(null, '', `/?reactor=${compressToEncodedURIComponent(JSON.stringify(reactorPayload))}`);
  }, [fuelUsageMultiplier, powerProductionMultiplier, reactor, reactorPowerProductionMultiplier]);

  useEffect(() => {
    setReactor(prev => {
      const next = prev.clone();
      next.updateActivelyCooled(activelyCooled);
      return next;
    });
  }, [activelyCooled]);

  const updateReactor = (x: number, z: number) => {
    reactor.setCol(z, x, selectedBlock);
    reactor.reset();
    reactor.simulate();
    setReactor(reactor.clone());
  };

  const findOptimalRatio = () => {
    let bestRatio = 0;
    let bestEfficiency = 0;
    for (let ratio = 0; ratio <= 100; ratio += 5) {
      reactor.updateInsertionRatio(ratio);
      const outputMetric = reactor.getActivelyCooled() ? reactor.getSteamGenerated() : reactor.getTotalEnergy();
      const efficiency = reactor.getFuelUsage() > 0 ? outputMetric / reactor.getFuelUsage() : 0;
      if (efficiency > bestEfficiency) {
        bestEfficiency = efficiency;
        bestRatio = ratio;
      } else {
        break;
      }
    }

    bestEfficiency = 0;
    for (let ratio = bestRatio - 5; ratio <= bestRatio + 5; ratio++) {
      if (ratio < 0 || ratio > 100) continue;
      reactor.updateInsertionRatio(ratio);
      const outputMetric = reactor.getActivelyCooled() ? reactor.getSteamGenerated() : reactor.getTotalEnergy();
      const efficiency = reactor.getFuelUsage() > 0 ? outputMetric / reactor.getFuelUsage() : 0;
      if (efficiency > bestEfficiency) {
        bestEfficiency = efficiency;
        bestRatio = ratio;
      } else {
        break;
      }
    }
    reactor.updateInsertionRatio(bestRatio);
    setReactor(reactor.clone());
  };

  const createShareURL = () => {
    const numericMap = reactor.getReactorMap().map(row => row.map(block => BlockIds[block]));

    const reactorPayload = {
      map: numericMap,
      ratio: reactor.getInsertionRatio(),
      width: reactor.width,
      depth: reactor.depth,
      height: reactor.height,
      isActivelyCooled: reactor.getActivelyCooled(),
      fuelUsageMultiplier,
      powerProductionMultiplier,
      reactorPowerProductionMultiplier,
    };

    const encoded = compressToEncodedURIComponent(JSON.stringify(reactorPayload));

    const shareUrl = `${window.location.origin}/?reactor=${encoded}`;
    return shareUrl;
  };

  return (
    <div className="flex flex-1 mx-auto w-full h-full">
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex  bg-neutral-900/90 text-neutral-200 overflow-auto backdrop-blur-xs">
          <div className="max-w-sm text-left px-6 flex items-center flex-col gap-4 py-30 m-auto">
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

      <BlockPalette selectedBlock={selectedBlock} setSelectedBlock={setSelectedBlock} />
      <div
        className="flex flex-col relative gap-10 items-center flex-1 overflow-auto min-h-0"
        style={{
          boxShadow: 'inset 0 0 2rem #0004',
        }}
      >
        <div className="sticky top-4 z-20 flex gap-2">
          <div
            className="bg-blue-500 p-2 rounded text-blue-950 text-xl cursor-pointer hover:opacity-80 relative group"
            onClick={() => {
              setReactor(prev => new Reactor(prev.width, prev.depth, prev.height, prev.getInsertionRatio(), Fuel.Uranium, prev.getActivelyCooled()));
            }}
          >
            <LuRotateCcw />
          </div>
          <div
            className="bg-blue-500 p-2 rounded text-blue-950 text-xl cursor-pointer hover:opacity-80"
            onClick={() => {
              setShowShareModal(true);
              createReactorImage();
            }}
          >
            <LuShare2 />
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
          <ReactorGrid reactor={reactor} updateReactor={updateReactor} />
        </div>
      </div>

      <Sidebar
        reactor={reactor}
        setReactor={setReactor}
        activelyCooled={activelyCooled}
        setActivelyCooled={setActivelyCooled}
        resizeReactor={resizeReactor}
        findOptimalRatio={findOptimalRatio}
        powerProductionMultiplier={powerProductionMultiplier}
        reactorPowerProductionMultiplier={reactorPowerProductionMultiplier}
        fuelUsageMultiplier={fuelUsageMultiplier}
        setPowerProductionMultiplier={setPowerProductionMultiplier}
        setReactorPowerProductionMultiplier={setReactorPowerProductionMultiplier}
        setFuelUsageMultiplier={setFuelUsageMultiplier}
      />
    </div>
  );
}
