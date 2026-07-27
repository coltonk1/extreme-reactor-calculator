import BuildMaterialSection from './BuildMaterialSection';
import ReactorSettings from './ReactorSettings';
import ReactorStats from './ReactorStats';
// import ShareSection from './ShareSection';
import { useState } from 'react';
import clsx from 'clsx';
import { useReactorState } from '@/lib/useReactorState';

export default function Sidebar({ reactorState }: { reactorState: ReturnType<typeof useReactorState> }) {
  const [showSettings, setShowSettings] = useState(true);

  return (
    <div className="bg-neutral-900 w-100 overflow-y-scroll border-l border-neutral-900 text-white">
      <div className="sticky top-0 z-20">
        <div className="bg-neutral-900 bg-linear-to-b from-neutral-800 to-neutral-900 px-6 py-3 flex flex-col gap-2 border-b border-neutral-800">
          <ReactorStats
            reactor={reactorState.reactor}
            activelyCooled={reactorState.activelyCooled}
            powerProductionMultiplier={reactorState.powerProductionMultiplier}
            reactorPowerProductionMultiplier={reactorState.reactorPowerProductionMultiplier}
            fuelUsageMultiplier={reactorState.fuelUsageMultiplier}
            reinforcedPreferred={reactorState.reinforcedPreferred}
          />
        </div>
        <div className="flex border-b border-neutral-800 shadow-lg">
          <button
            className={clsx(
              'flex-1 py-1.5 text-sm font-medium transition-colors cursor-pointer',
              showSettings ? 'bg-neutral-700 text-white shadow-sm' : 'bg-neutral-900 text-neutral-400 hover:text-white',
            )}
            onClick={() => setShowSettings(true)}
          >
            Settings
          </button>
          <button
            className={clsx(
              'flex-1 py-1.5 text-sm font-medium transition-colors cursor-pointer',
              !showSettings ? 'bg-neutral-700 text-white shadow-sm' : 'bg-neutral-900 text-neutral-400 hover:text-white',
            )}
            onClick={() => setShowSettings(false)}
          >
            Materials
          </button>
        </div>
      </div>
      <div className="p-4">{showSettings ? <ReactorSettings reactorState={reactorState} /> : <BuildMaterialSection reactorState={reactorState} />}</div>
    </div>
  );
}
