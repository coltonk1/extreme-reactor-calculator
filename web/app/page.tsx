'use client';
import { Reactor, Block, BlockNames, Fuel } from '@/lib/reactor_simulation';
import { toBlob } from 'html-to-image';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function Home() {
  const searchParams = useSearchParams();

  const reactorParam = searchParams.get('reactor');

  const blockToId = Object.fromEntries(Object.values(Block).map((block, i) => [block, i]));

  const [cols, setCols] = useState(7);
  const [rows, setRows] = useState(7);
  const [height, setHeight] = useState(7);
  const [selectedBlock, setSelectedBlock] = useState(Block.Air);

  const [reactor, setReactor] = useState(() => new Reactor(cols, rows, height, 0, Fuel.Uranium));

  const [copied, setCopied] = useState(false);

  const [copiedImage, setCopiedImage] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);

  const [ratioFound, setRatioFound] = useState(false);

  const reactorMap = reactor.getReactorMap();

  useEffect(() => {
    if (reactorParam) {
      try {
        const decoded = JSON.parse(decompressFromEncodedURIComponent(reactorParam));
        const { map, ratio, width, depth, height } = decoded;
        const newReactor = new Reactor(width, depth, height, ratio, Fuel.Uranium);

        map.forEach((row: number[], z: number) => {
          row.forEach((blockId: number, x: number) => {
            newReactor.setCol(z, x, Object.values(Block)[blockId]);
          });
        });

        newReactor.simulate();

        setCols(width);
        setRows(depth);
        setHeight(height);
        setReactor(newReactor);
      } catch (e) {
        console.error('Failed to load reactor from URL:', e);
      }
    }

    // Do not add reactorParam for this effect, only want to run on initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resizeReactor = (newCols: number, newRows: number, newHeight: number) => {
    setCols(newCols);
    setRows(newRows);
    setHeight(newHeight);
    setReactor(new Reactor(newCols, newRows, newHeight, 0, Fuel.Uranium));
  };

  useEffect(() => {
    const numericMap = reactor.getReactorMap().map(row => row.map(block => blockToId[block]));

    const reactorPayload = {
      map: numericMap,
      ratio: reactor.getInsertionRatio(),
      width: reactor.width,
      depth: reactor.depth,
      height: reactor.height,
    };

    window.history.replaceState(null, '', `/?reactor=${compressToEncodedURIComponent(JSON.stringify(reactorPayload))}`);
  }, [reactor]);

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
      const efficiency = reactor.getFuelUsage() > 0 ? reactor.getTotalEnergy() / reactor.getFuelUsage() : 0;
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
      const efficiency = reactor.getFuelUsage() > 0 ? reactor.getTotalEnergy() / reactor.getFuelUsage() : 0;
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

  const nextTitlePoints = [Block.ReactorControlRod, Block.Bronze, Block.RefinedObsidian];
  const sectionTitles = ['Vanilla', 'Extreme Reactors', 'General Metals', 'Other'];
  let titleIndex = 0;

  const reactorParts = [Block.ReactorCasing, Block.ReactorController, Block.ReactorAccessPort];

  const copyMapAsImage = async () => {
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

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  };

  return (
    <div className="flex flex-1 mx-auto w-full h-full">
      <div className="px-8 grid text-white/90 gap-2 grid-cols-2 overflow-y-scroll pb-16 bg-neutral-900 border-r border-black">
        <div className="col-span-2 px-4 py-2 font-semibold bg-neutral-300 text-neutral-900 rounded shadow-md mt-8">Vanilla</div>
        {Object.values(Block).map(block => {
          if (reactorParts.includes(block) || block === Block.FuelRod) return;
          let newSection = null;
          if (block === nextTitlePoints[titleIndex]) {
            titleIndex++;
            newSection = <div className="col-span-2 px-4 py-2 font-semibold bg-neutral-300 text-neutral-900 rounded shadow-md mt-8">{sectionTitles[titleIndex]}</div>;
          }

          return (
            <React.Fragment key={block}>
              {newSection}
              <div title={BlockNames.get(block)} className={`${block === selectedBlock && 'bg-neutral-500 hover:bg-neutral-500'} flex items-center gap-2 bg-neutral-300/10 p-1.5 rounded-sm cursor-pointer select-none hover:bg-black/50`} onClick={() => setSelectedBlock(block)}>
                <div className="relative w-8 h-8 shrink-0 border border-white/75">
                  <Image src={`/assets/blocks/${block}.png`} alt={block} sizes="100%" fill className="object-contain select-none pointer-events-none" style={{ imageRendering: 'pixelated' }} />
                </div>
                <div className="truncate">{BlockNames.get(block)}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex flex-col gap-10 items-center flex-1 overflow-auto min-h-0">
        <div className="m-auto">
          <div
            className="grid w-fit m-12 bg-neutral-800"
            id="reactor-map"
            style={{
              gridTemplateColumns: `repeat(${reactor.width + 2}, minmax(1.75rem, 1fr))`,
              gridTemplateRows: `repeat(${reactor.depth + 2}, minmax(1.75rem, 1fr))`,
            }}
          >
            {Array.from({ length: (reactor.width + 2) * (reactor.depth + 2) }, (_, i) => {
              const x = i % (reactor.width + 2);
              const z = Math.floor(i / (reactor.width + 2));
              const casing = x == 0 || z == 0 || x == reactor.width + 2 - 1 || z == reactor.depth + 2 - 1;
              return <ReactorItem key={i} x={x - 1} z={z - 1} casing={casing} rows={reactor.depth + 2} cols={reactor.width + 2} block={!casing ? reactorMap[z - 1][x - 1] : null} updateReactor={updateReactor} />;
            })}
          </div>
        </div>
      </div>

      <div className="w-fit border-l border-black bg-neutral-900 px-6 py-5 space-y-5 text-neutral-300 overflow-auto">
        <div className="flex flex-col gap-2">
          <button
            className="py-2 text-sm bg-blue-500 rounded-md w-full font-semibold cursor-pointer hover:opacity-80"
            onClick={async () => {
              if (copyingImage) return;

              setCopyingImage(true);

              await new Promise(requestAnimationFrame);
              await new Promise(requestAnimationFrame);

              await copyMapAsImage();

              setCopiedImage(true);
              setCopyingImage(false);

              setTimeout(() => {
                setCopiedImage(false);
              }, 800);
            }}
          >
            {copyingImage ? 'Copying...' : copiedImage ? 'Image Copied!' : copiedImage ? 'Image Copied!' : 'Copy Image of Reactor'}
          </button>
          <button
            className="py-2 px-4 text-sm bg-blue-500 rounded-md w-full font-semibold cursor-pointer hover:opacity-80"
            onClick={() => {
              const numericMap = reactor.getReactorMap().map(row => row.map(block => blockToId[block]));

              const reactorPayload = {
                map: numericMap,
                ratio: reactor.getInsertionRatio(),
                width: reactor.width,
                depth: reactor.depth,
                height: reactor.height,
              };

              const encoded = compressToEncodedURIComponent(JSON.stringify(reactorPayload));

              const shareUrl = `${window.location.origin}/?reactor=${encoded}`;

              navigator.clipboard.writeText(shareUrl);

              setCopied(true);

              setTimeout(() => {
                setCopied(false);
              }, 800);

              fetch('/api/saveReactor', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reactor: encoded, timestamp: Date.now() }),
              });
            }}
          >
            {copied ? 'URL Copied!' : 'Copy Share Link'}
          </button>
        </div>
        <div className="space-y-2">
          <div>
            <h2 className="text-lg font-semibold">Reactor Inner Size</h2>
            <p className="text-xs text-neutral-300/60">Changing dimensions resets the reactor</p>
          </div>
          <div className="grid grid-cols-3 gap-4 w-fit">
            <label className="flex flex-col text-sm">
              X
              <input className="mt-1 w-20 px-2 py-1 rounded bg-white text-neutral-900" value={reactor.width} onChange={e => resizeReactor(Number(e.target.value), rows, height)} />
            </label>

            <label className="flex flex-col text-sm">
              <p>
                Y <span className="text-xs text-neutral-300/60">(height)</span>
              </p>
              <input className="mt-1 w-20 px-2 py-1 rounded bg-white text-neutral-900" value={reactor.height} onChange={e => resizeReactor(cols, rows, Number(e.target.value))} />
            </label>

            <label className="flex flex-col text-sm">
              Z
              <input className="mt-1 w-20 px-2 py-1 rounded bg-white text-neutral-900" value={reactor.depth} onChange={e => resizeReactor(cols, Number(e.target.value), height)} />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <h2 className="text-lg font-semibold">Insertion Ratio</h2>
          </div>
          <div className="mb-4 flex gap-2">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Number(reactor.getInsertionRatio())}
              onChange={e => {
                reactor.updateInsertionRatio(Number(e.target.value));
                setReactor(reactor.clone());
              }}
              className="w-full"
            />
            <span className="text-sm w-10 text-right">{reactor.getInsertionRatio()}%</span>
          </div>
          <button
            className="py-2 px-4 text-sm bg-blue-500 rounded-md w-full font-semibold cursor-pointer hover:opacity-80"
            onClick={() => {
              findOptimalRatio();
              setRatioFound(true);

              setTimeout(() => {
                setRatioFound(false);
              }, 800);
            }}
          >
            {ratioFound ? 'Optimal Ratio Found!' : 'Find Optimal Ratio'}
          </button>
          <p className="text-xs text-neutral-300/60">*Uses default mod configuration</p>
        </div>

        <div className="space-y-2">
          <div>
            <h2 className="text-lg font-semibold">Reactor Stats</h2>
            <p className="text-xs text-neutral-300/60">Values assume default mod configuration settings</p>
          </div>
          {reactor.getNumControlRods() === 0 && <div className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded w-full">Place a control rod for stats to update</div>}

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <span className="text-neutral-300/60">Fuel Heat</span>
            <span>{reactor.getFuelHeat().toFixed(0)} C</span>

            <span className="text-neutral-300/60">Reactor Heat</span>
            <span>{reactor.getReactorHeat().toFixed(0)} C</span>

            <span className="text-neutral-300/60">Power</span>
            <span>{reactor.getTotalEnergy().toFixed(2)} FE/t</span>

            <span className="text-neutral-300/60">Fuel Usage</span>
            <span>{reactor.getFuelUsage().toFixed(4)} mB/t</span>

            <span className="text-neutral-300/60">Fuel Efficiency</span>
            <span>{(reactor.getFuelUsage() > 0 ? reactor.getTotalEnergy() / reactor.getFuelUsage() : 0).toFixed(2)} FE/mB</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Build Materials</h2>
          {[...reactor.getLayerBlockCounts()].map(([block, count]) => {
            if (block === Block.Air) return;
            if (count === 0) return;
            let realCount = 0;
            const reactorIsLarge = reactor.height > 3 || reactor.width > 3 || reactor.depth > 3;
            let prepend = '';
            if (reactorParts.includes(block) || block === Block.ReactorControlRod || block === Block.FuelRod) {
              if (reactorIsLarge) {
                prepend = 'Reinforced ';
              } else {
                prepend = 'Basic ';
              }
            }

            if (reactorParts.includes(block) || block === Block.ReactorControlRod) {
              realCount = count;
            } else {
              realCount = count * reactor.height;
            }
            return (
              <div key={block} className="flex items-center gap-2 text-sm ml-0.5">
                <div className="relative w-6 h-6 border border-white/75">
                  <Image src={`/assets/blocks/${block}.png`} alt={block} sizes="100%" fill className="object-contain select-none pointer-events-none" style={{ imageRendering: 'pixelated' }} />
                </div>
                <span>
                  {prepend + BlockNames.get(block)}: {realCount}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReactorItem({ x, z, casing, rows, cols, block, updateReactor }: { x: number; z: number; casing: boolean; rows: number; cols: number; block: Block | null; updateReactor: (x: number, z: number) => void }) {
  const getCasingImage = (x: number, z: number) => {
    const left = x === -1;
    const right = x === cols - 2;
    const top = z === -1;
    const bottom = z === rows - 2;

    if (bottom && right) return 'url(/assets/casing_right_down.png)';
    if (bottom && left) return 'url(/assets/casing_left_down.png)';
    if (top && right) return 'url(/assets/casing_right_up.png)';
    if (top && left) return 'url(/assets/casing_left_up.png)';
    if (left) return 'url(/assets/casing_left.png)';
    if (right) return 'url(/assets/casing_right.png)';
    if (top) return 'url(/assets/casing_up.png)';
    if (bottom) return 'url(/assets/casing_down.png)';

    return `url(/assets/blocks/${block}.png)`;
  };

  return (
    <div
      className={`bg-white/10 hover:bg-white ${!casing && 'cursor-pointer hover:opacity-35'} bg-cover select-none`}
      style={{
        backgroundImage: `${getCasingImage(x, z)}`,
        imageRendering: 'pixelated',
      }}
      onMouseDown={() => {
        if (casing) return;
        updateReactor(x, z);
      }}
      onMouseEnter={e => {
        if (casing) return;
        if (e.buttons === 1) {
          updateReactor(x, z);
        }
      }}
    ></div>
  );
}
