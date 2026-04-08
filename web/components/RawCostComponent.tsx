import { getCostOfBlock } from '@/lib/blockCosts';
import { Block, BlockNames } from '@/lib/blocks';
import { Material, MaterialNames } from '@/lib/materials';
import { Reactor } from '@/lib/reactor_simulation';
import { useState } from 'react';

export default function RawCostComponent({ reactor }: { reactor: Reactor }) {
  const [steelAvailable, setSteelAvailable] = useState(true);

  const costTotals: Partial<Record<Block | Material, number>> = {};

  const getResourceName = (resource: Block | Material): string => {
    return MaterialNames.get(resource as Material) ?? BlockNames.get(resource as Block) ?? resource;
  };

  [...reactor.getLayerBlockCounts()].forEach(([block, count]) => {
    if (block === Block.Air || count === 0) return;
    const reactorIsLarge = reactor.height > 3 || reactor.width > 3 || reactor.depth > 3;
    const reactorIsReinforced = reactorIsLarge || reactor.getActivelyCooled();

    const cost = getCostOfBlock(block, reactorIsReinforced, steelAvailable);

    const listOfCosts = Object.entries(cost) as [Material | Block, number][];

    listOfCosts.forEach(([material, qty]) => {
      costTotals[material] = (costTotals[material] ?? 0) + qty * count;
    });
  });

  const sortedCostTotals = (Object.entries(costTotals) as [Block | Material, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <div className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={steelAvailable}
          onChange={e => {
            setSteelAvailable(() => e.target.checked);
          }}
          className="w-4 h-4 accent-blue-500 cursor-pointer"
        />
        <p className="text-neutral-300/80">Modpack includes steel ingots</p>
      </div>
      <div>
        {sortedCostTotals.map(([material, total], index) => (
          <div key={material} className={`grid grid-cols-2 text-sm p-1 rounded ${index % 2 == 0 ? 'bg-neutral-800/75' : ''}`}>
            <p>{getResourceName(material)}</p>
            <p className="text-right">{total}</p>
          </div>
        ))}
      </div>
    </>
  );
}
