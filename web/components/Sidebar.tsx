import { Reactor } from '@/lib/reactor_simulation';
import BuildMaterialSection from './BuildMaterialSection';
import ReactorSettings from './ReactorSettings';
import ReactorStats from './ReactorStats';
// import ShareSection from './ShareSection';
import { useState } from 'react';
import clsx from 'clsx';

export default function Sidebar({
  reactor,
  setReactor,
  activelyCooled,
  setActivelyCooled,
  resizeReactor,
  findOptimalRatio,
  powerProductionMultiplier,
  reactorPowerProductionMultiplier,
  fuelUsageMultiplier,
  setPowerProductionMultiplier,
  setReactorPowerProductionMultiplier,
  setFuelUsageMultiplier,
}: {
  reactor: Reactor;
  setReactor: React.Dispatch<React.SetStateAction<Reactor>>;
  activelyCooled: boolean;
  setActivelyCooled: React.Dispatch<React.SetStateAction<boolean>>;
  resizeReactor: (newCols: number, newRows: number, newHeight: number) => void;
  findOptimalRatio: () => void;
  powerProductionMultiplier: number;
  reactorPowerProductionMultiplier: number;
  fuelUsageMultiplier: number;
  setPowerProductionMultiplier: React.Dispatch<React.SetStateAction<number>>;
  setReactorPowerProductionMultiplier: React.Dispatch<React.SetStateAction<number>>;
  setFuelUsageMultiplier: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [showSettings, setShowSettings] = useState(true);

  return (
    <div className="bg-neutral-900 w-100 overflow-y-scroll border-l border-neutral-900 text-white">
      {/* <ShareSection
        reactor={reactor}
        fuelUsageMultiplier={fuelUsageMultiplier}
        powerProductionMultiplier={powerProductionMultiplier}
        reactorPowerProductionMultiplier={reactorPowerProductionMultiplier}
      /> */}
      <div className="sticky top-0 z-20">
        <div className="bg-neutral-900 bg-linear-to-b from-neutral-800 to-neutral-900 px-6 py-3 flex flex-col gap-2 border-b border-neutral-800">
          <ReactorStats
            reactor={reactor}
            activelyCooled={activelyCooled}
            powerProductionMultiplier={powerProductionMultiplier}
            reactorPowerProductionMultiplier={reactorPowerProductionMultiplier}
            fuelUsageMultiplier={fuelUsageMultiplier}
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
      <div className="p-4">
        {showSettings ? (
          <ReactorSettings
            reactor={reactor}
            setReactor={setReactor}
            resizeReactor={resizeReactor}
            activelyCooled={activelyCooled}
            setActivelyCooled={setActivelyCooled}
            findOptimalRatio={findOptimalRatio}
            powerProductionMultiplier={powerProductionMultiplier}
            reactorPowerProductionMultiplier={reactorPowerProductionMultiplier}
            fuelUsageMultiplier={fuelUsageMultiplier}
            setPowerProductionMultiplier={setPowerProductionMultiplier}
            setReactorPowerProductionMultiplier={setReactorPowerProductionMultiplier}
            setFuelUsageMultiplier={setFuelUsageMultiplier}
          />
        ) : (
          <BuildMaterialSection reactor={reactor} />
        )}
      </div>
    </div>
  );
}
