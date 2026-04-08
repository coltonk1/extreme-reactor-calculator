'use client';
import BlockPalette from '@/components/BlockPalette';
import BuildMaterialSection from '@/components/BuildMaterialSection';
import ReactorGrid from '@/components/ReactorGrid';
import ReactorSettings from '@/components/ReactorSettings';
import ReactorStats from '@/components/ReactorStats';
import ShareSection from '@/components/ShareSection';
import { Block, BlockIds } from '@/lib/blocks';
import { Fuel } from '@/lib/fuels';
import { Reactor } from '@/lib/reactor_simulation';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function Home() {
  const searchParams = useSearchParams();
  const reactorParam = searchParams.get('reactor');
  const [selectedBlock, setSelectedBlock] = useState(Block.Air);
  const [activelyCooled, setActivelyCooled] = useState(false);
  const [reactor, setReactor] = useState(new Reactor(7, 7, 7, 0, Fuel.Uranium, false));

  useEffect(() => {
    if (reactorParam) {
      try {
        const decoded = JSON.parse(decompressFromEncodedURIComponent(reactorParam));
        const { map, ratio, width, depth, height, isActivelyCooled } = decoded;
        const newReactor = new Reactor(width, depth, height, ratio, Fuel.Uranium, isActivelyCooled || false);
        map.forEach((row: number[], z: number) => {
          row.forEach((blockId: number, x: number) => {
            newReactor.setCol(z, x, Object.values(Block)[blockId]);
          });
        });

        newReactor.simulate();

        setActivelyCooled(isActivelyCooled || false);
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
    };

    window.history.replaceState(null, '', `/?reactor=${compressToEncodedURIComponent(JSON.stringify(reactorPayload))}`);
  }, [reactor]);

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

  return (
    <div className="flex flex-1 mx-auto w-full h-full">
      <BlockPalette selectedBlock={selectedBlock} setSelectedBlock={setSelectedBlock} />
      <div className="flex flex-col gap-10 items-center flex-1 overflow-auto min-h-0">
        <div className="m-auto">
          <ReactorGrid reactor={reactor} updateReactor={updateReactor} />
        </div>
      </div>

      <Sidebar reactor={reactor} setReactor={setReactor} activelyCooled={activelyCooled} setActivelyCooled={setActivelyCooled} resizeReactor={resizeReactor} findOptimalRatio={findOptimalRatio} />
    </div>
  );
}

function Sidebar({ reactor, setReactor, activelyCooled, setActivelyCooled, resizeReactor, findOptimalRatio }: { reactor: Reactor; setReactor: React.Dispatch<React.SetStateAction<Reactor>>; activelyCooled: boolean; setActivelyCooled: React.Dispatch<React.SetStateAction<boolean>>; resizeReactor: (newCols: number, newRows: number, newHeight: number) => void; findOptimalRatio: () => void }) {
  return (
    <div className="w-fit border-l border-black bg-neutral-900 px-6 py-5 space-y-8 text-neutral-300 overflow-auto">
      <ShareSection reactor={reactor} />
      <ReactorSettings reactor={reactor} setReactor={setReactor} resizeReactor={resizeReactor} activelyCooled={activelyCooled} setActivelyCooled={setActivelyCooled} findOptimalRatio={findOptimalRatio} />
      <ReactorStats reactor={reactor} activelyCooled={activelyCooled} />
      <BuildMaterialSection reactor={reactor} />
    </div>
  );
}
