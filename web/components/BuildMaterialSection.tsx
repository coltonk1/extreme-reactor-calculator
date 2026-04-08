import { Reactor } from '@/lib/reactor_simulation';
import { useState } from 'react';
import CraftedCostComponent from './CraftedCostComponent';
import RawCostComponent from './RawCostComponent';

export default function BuildMaterialSection({ reactor }: { reactor: Reactor }) {
  const [showRaw, setShowRaw] = useState(false);
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Build Materials</h2>
      <div className="flex rounded-md overflow-hidden mb-4">
        <button className={`flex-1 py-1 text-sm bg-blue-500 ${showRaw ? 'bg-gray-500' : ''} w-full font-semibold cursor-pointer hover:opacity-80`} onClick={() => setShowRaw(() => false)}>
          Crafted Blocks
        </button>
        <button className={`flex-1 py-1 text-sm bg-blue-500 ${showRaw ? '' : 'bg-gray-500'} w-full font-semibold cursor-pointer hover:opacity-80`} onClick={() => setShowRaw(() => true)}>
          Raw Materials
        </button>
      </div>
      {showRaw ? <RawCostComponent reactor={reactor} /> : <CraftedCostComponent reactor={reactor} />}
    </div>
  );
}
