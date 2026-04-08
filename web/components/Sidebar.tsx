import { Reactor } from '@/lib/reactor_simulation';
import BuildMaterialSection from './BuildMaterialSection';
import ReactorSettings from './ReactorSettings';
import ReactorStats from './ReactorStats';
import ShareSection from './ShareSection';

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
  return (
    <div className="w-fit border-l border-black bg-neutral-900 px-6 py-5 space-y-8 text-neutral-300 overflow-auto">
      <ShareSection reactor={reactor} />
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
      <ReactorStats
        reactor={reactor}
        activelyCooled={activelyCooled}
        powerProductionMultiplier={powerProductionMultiplier}
        reactorPowerProductionMultiplier={reactorPowerProductionMultiplier}
        fuelUsageMultiplier={fuelUsageMultiplier}
      />
      <BuildMaterialSection reactor={reactor} />
    </div>
  );
}
