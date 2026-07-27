import { useState } from 'react';
import CraftedCostComponent from './CraftedCostComponent';
import RawCostComponent from './RawCostComponent';
import clsx from 'clsx';
import { useReactorState } from '@/lib/useReactorState';

export default function BuildMaterialSection({ reactorState }: { reactorState: ReturnType<typeof useReactorState> }) {
  const [showRaw, setShowRaw] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex bg-neutral-800/60 rounded-md p-0.5 mb-4">
        <button
          className={clsx('flex-1 py-1 text-sm font-medium rounded transition-colors cursor-pointer', !showRaw ? 'bg-neutral-700/80 text-white' : 'text-neutral-400 hover:text-white')}
          onClick={() => setShowRaw(false)}
        >
          Crafted Blocks
        </button>

        <button
          className={clsx('flex-1 py-1 text-sm font-medium rounded transition-colors cursor-pointer', showRaw ? 'bg-neutral-700/80 text-white' : 'text-neutral-400 hover:text-white')}
          onClick={() => setShowRaw(true)}
        >
          Raw Materials
        </button>
      </div>
      {showRaw ? <RawCostComponent reactorState={reactorState} /> : <CraftedCostComponent reactorState={reactorState} />}
    </div>
  );
}
