'use client';
import BlockPalette from '@/components/BlockPalette';
import ReactorGrid from '@/components/ReactorGrid';
import Sidebar from '@/components/Sidebar';
import { Block, BlockIds } from '@/lib/blocks';
import { presets } from '@/lib/configPresets';
import { Fuel } from '@/lib/fuels';
import { Reactor } from '@/lib/reactor_simulation';
import { useReactorState } from '@/lib/useReactorState';
import { toBlob } from 'html-to-image';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LuCheck, LuCopy, LuDownload, LuLoader, LuRotateCcw, LuShare2, LuX } from 'react-icons/lu';

export default function Page() {
  const reactorState = useReactorState();
  const searchParams = useSearchParams();
  const reactorParam = searchParams.get('reactor');

  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
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
            newReactor.setBlock(z, x, Object.values(Block)[blockId]);
          });
        });

        newReactor.simulate();

        reactorState.setActivelyCooled(isActivelyCooled || false);
        reactorState.setFuelUsageMultiplier(fuelUsageMultiplier || presets.default.fuel);
        reactorState.setPowerProductionMultiplier(powerProductionMultiplier || presets.default.power);
        reactorState.setReactorPowerProductionMultiplier(reactorPowerProductionMultiplier || presets.default.reactorPower);
        reactorState.setReactor(newReactor);
      } catch (e) {
        console.error('Failed to load reactor from URL:', e);
      }
    }

    // Do not add reactorParam for this effect, only want to run on initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createShareURL = useCallback(() => {
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
    };

    const encoded = compressToEncodedURIComponent(JSON.stringify(reactorPayload));

    const shareUrl = `${window.location.origin}/calculator/?reactor=${encoded}`;
    return shareUrl;
  }, [reactorState.reactor, reactorState.fuelUsageMultiplier, reactorState.powerProductionMultiplier, reactorState.reactorPowerProductionMultiplier]);

  useEffect(() => {
    window.history.replaceState(null, '', createShareURL());
  }, [createShareURL, reactorState.fuelUsageMultiplier, reactorState.powerProductionMultiplier, reactorState.reactor, reactorState.reactorPowerProductionMultiplier]);

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
            className="bg-blue-500 p-2 rounded text-blue-950 text-xl cursor-pointer hover:opacity-80 relative group"
            onClick={() => {
              reactorState.setReactor(prev => new Reactor(prev.width, prev.depth, prev.height, prev.insertionRatio, Fuel.Uranium, prev.isActivelyCooled));
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
          {/* DISPLAYED REACTOR */}
          <ReactorGrid reactor={reactorState.reactor} updateReactor={reactorState.updateReactor} />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <Sidebar reactorState={reactorState} />
    </div>
  );
}
