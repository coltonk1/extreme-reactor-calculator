'use client';
import { Reactor, Block, BlockNames, Fuel } from '@/lib/reactor_simulation';

import Image from 'next/image';
import React from 'react';
import { useState } from 'react';

export default function Home() {
  const [cols, setCols] = useState(7);
  const [rows, setRows] = useState(7);
  const [height, setHeight] = useState(7);
  const [selectedBlock, setSelectedBlock] = useState(Block.Air);

  const [reactor, setReactor] = useState(() => new Reactor(cols, rows, height, 0, Fuel.Uranium));

  const reactorMap = reactor.getReactorMap();

  const resizeReactor = (newCols: number, newRows: number, newHeight: number) => {
    setCols(newCols);
    setRows(newRows);
    setHeight(newHeight);
    setReactor(new Reactor(newCols, newRows, newHeight, 0, Fuel.Uranium));
  };

  const updateReactor = (x: number, z: number) => {
    reactor.setCol(z, x, selectedBlock);
    const start = performance.now();
    reactor.reset();
    reactor.simulate(1000);
    setReactor(reactor.clone());
    console.log((performance.now() - start) / 1000);
  };

  const findOptimalRatio = () => {
    const start = performance.now();

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

    console.log(`Performance: ${(performance.now() - start) / 1000} seconds`);
  };

  const nextTitlePoints = [Block.ReactorControlRod, Block.Bronze, Block.RefinedObsidian];
  const sectionTitles = ['Vanilla', 'Extreme Reactors', 'General Metals', 'Other'];
  let titleIndex = 0;

  const reactorParts = [Block.FuelRod, Block.ReactorCasing, Block.ReactorController, Block.ReactorAccessPort];

  return (
    <div className="flex flex-1 mx-auto w-full h-full">
      <div className="px-8 grid text-white/90 gap-2 grid-cols-2 overflow-y-scroll pb-16 bg-neutral-900 border-r border-black">
        <div className="col-span-2 px-4 py-2 font-semibold bg-neutral-300 text-neutral-900 rounded shadow-md mt-8">Vanilla</div>
        {Object.values(Block).map(block => {
          if (reactorParts.includes(block)) return;
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
            className="grid w-fit m-12"
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
            }}
          >
            Find Optimal Ratio
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
            if (reactorParts.includes(block) || block === Block.ReactorControlRod) {
              realCount = count;
              if (reactorIsLarge) {
                prepend = 'Reinforced ';
              } else {
                prepend = 'Basic ';
              }
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
