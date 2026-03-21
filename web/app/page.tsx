'use client';
import { Reactor, Block, BlockNames, Fuel } from '@/lib/reactor_simulation';

import Image from 'next/image';
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
    reactor.simulate(250);
    setReactor(reactor.clone());
    console.log((performance.now() - start) / 1000);
  };

  return (
    <div className="flex flex-1 max-w-7xl mx-auto">
      <div className="px-16 grid h-fit text-white/90 gap-2 grid-cols-3">
        {Object.values(Block).map(block => (
          <div title={BlockNames.get(block)} className={`${block === selectedBlock && 'bg-neutral-500 hover:bg-neutral-500'} flex items-center gap-2 border border-black/50 bg-black/10 px-2 py-1 rounded-sm cursor-pointer select-none hover:bg-black/50`} key={block} onClick={() => setSelectedBlock(block)}>
            <div className="relative w-8 h-8 shrink-0 border border-white/75">
              <Image src={`/assets/blocks/${block}.png`} alt={block} fill className="object-contain" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="truncate">{BlockNames.get(block)}</div>
          </div>
        ))}
      </div>
      <div className="bg-white h-fit">
        <p>Fuel Heat: {reactor.getFuelHeat().toFixed(0)} C</p>
        <p>Reactor Heat: {reactor.getReactorHeat().toFixed(0)} C</p>
        <p>Power: {reactor.getTotalEnergy().toFixed(2)} FE/t</p>
        <p>Fuel Usage: {reactor.getFuelUsage().toFixed(4)} mB/t</p>
      </div>
      <div className="w-fit flex-col  gap-10 justify-center items-center flex">
        <div className="w-fit px-10 py-3 bg-white rounded-lg grid grid-cols-2">
          X:
          <input value={reactor.width} onChange={e => resizeReactor(Number(e.target.value), rows, height)} />
          Y:
          <input value={reactor.height} onChange={e => resizeReactor(cols, rows, Number(e.target.value))} />
          Z:
          <input value={reactor.depth} onChange={e => resizeReactor(cols, Number(e.target.value), height)} />
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${reactor.width + 2}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${reactor.depth + 2}, minmax(0, 1fr))`,
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
      className={`bg-white/10 hover:bg-white ${!casing && 'cursor-pointer hover:opacity-35'} h-7 w-7 bg-cover`}
      style={{
        backgroundImage: `${getCasingImage(x, z)}`,
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
