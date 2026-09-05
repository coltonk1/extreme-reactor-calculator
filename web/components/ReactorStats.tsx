import { useReactorState } from './ReactorStateProvider';

export default function ReactorStats() {
  const reactorState = useReactorState();
  const reactor = reactorState.reactor;
  const activelyCooled = reactorState.activelyCooled;
  const powerProductionMultiplier = reactorState.powerProductionMultiplier;
  const reactorPowerProductionMultiplier = reactorState.reactorPowerProductionMultiplier;
  const fuelUsageMultiplier = reactorState.fuelUsageMultiplier;
  const reinforcedPreferred = reactorState.reinforcedPreferred;

  const reactorIsLarge = reactor.height > 3 || reactor.width > 3 || reactor.depth > 3;
  const reactorIsReinforced = reactorIsLarge || reactor.isActivelyCooled || reinforcedPreferred;

  const energyAfterMultipliers = reactor.totalEnergy * powerProductionMultiplier * reactorPowerProductionMultiplier * (reactorIsReinforced ? 1 : 0.8);
  const fuelAfterMultiplier = reactor.fuelUsage * fuelUsageMultiplier;

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-lg font-semibold">Reactor Stats</h2>
      </div>
      {reactor.numControlRods === 0 && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded">
          <span className="font-medium">No control rods. Place one to update stats</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <span className="text-neutral-300/60">Fuel Heat</span>
        <span>{reactor.fuelHeat.toFixed(0)} C</span>

        <span className="text-neutral-300/60">Reactor Heat</span>
        <span>{reactor.reactorHeat.toFixed(0)} C</span>

        {!activelyCooled && (
          <>
            <span className="text-neutral-300/60">Power</span>
            <span>{energyAfterMultipliers.toFixed(2)} FE/t</span>
          </>
        )}

        {activelyCooled &&
          (() => {
            const steam = reactor.steamGenerated;

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
            <span>{(fuelAfterMultiplier > 0 ? reactor.steamGenerated / 1000 / fuelAfterMultiplier : 0).toFixed(2)} B/mB</span>
          </>
        )}
      </div>
    </div>
  );
}
