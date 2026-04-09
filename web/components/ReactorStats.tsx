import { Reactor } from '@/lib/reactor_simulation';

export default function ReactorStats({
  reactor,
  activelyCooled,
  powerProductionMultiplier,
  reactorPowerProductionMultiplier,
  fuelUsageMultiplier,
}: {
  reactor: Reactor;
  activelyCooled: boolean;
  powerProductionMultiplier: number;
  reactorPowerProductionMultiplier: number;
  fuelUsageMultiplier: number;
}) {
  const energyAfterMultipliers = reactor.getTotalEnergy() * powerProductionMultiplier * reactorPowerProductionMultiplier;
  const fuelAfterMultiplier = reactor.getFuelUsage() * fuelUsageMultiplier;

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-lg font-semibold">Reactor Stats</h2>
      </div>
      {reactor.getNumControlRods() === 0 && <div className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded w-full">Place a control rod for stats to update</div>}

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <span className="text-neutral-300/60">Fuel Heat</span>
        <span>{reactor.getFuelHeat().toFixed(0)} C</span>

        <span className="text-neutral-300/60">Reactor Heat</span>
        <span>{reactor.getReactorHeat().toFixed(0)} C</span>

        {!activelyCooled && (
          <>
            <span className="text-neutral-300/60">Power</span>
            <span>{energyAfterMultipliers.toFixed(2)} FE/t</span>
          </>
        )}

        {activelyCooled &&
          (() => {
            const steam = reactor.getSteamGenerated();

            return (
              <>
                <span className="text-neutral-300/60">Steam</span>
                <span>{steam < 1000 ? `${steam.toFixed(2)} mB/t` : `${(steam / 1000).toFixed(2)} B/t`}</span>
              </>
            );
          })()}

        <span className="text-neutral-300/60">Fuel Usage</span>
        <span>{fuelAfterMultiplier.toFixed(4)} mB/t</span>

        {!activelyCooled && (
          <>
            <span className="text-neutral-300/60">Fuel Efficiency</span>
            <span>{(fuelAfterMultiplier > 0 ? energyAfterMultipliers / fuelAfterMultiplier : 0).toFixed(2)} FE/mB</span>
          </>
        )}

        {activelyCooled && (
          <>
            <span className="text-neutral-300/60">Fuel Efficiency</span>
            <span>{(fuelAfterMultiplier > 0 ? reactor.getSteamGenerated() / 1000 / fuelAfterMultiplier : 0).toFixed(2)} B/mB</span>
          </>
        )}
      </div>
    </div>
  );
}
