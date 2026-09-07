import { useState } from 'react';
import { Fuel } from './fuels';
import { Reactor } from './reactor_simulation';
import { Block } from './blocks';
import { PresetKey } from './configPresets';

export function useReactorState() {
  const [reactor, setReactor] = useState(new Reactor(7, 7, 7, 0, Fuel.Uranium, false));
  const [activelyCooled, setActivelyCooled] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(Block.Air);

  const [powerProductionMultiplier, setPowerProductionMultiplier] = useState(1);
  const [reactorPowerProductionMultiplier, setReactorPowerProductionMultiplier] = useState(1);
  const [fuelUsageMultiplier, setFuelUsageMultiplier] = useState(1);
  const [reinforcedPreferred, setReinforcedPreferred] = useState(false);
  const [mode, setMode] = useState<'individual' | 'replaceAll' | 'grid'>('individual');

  const [selectedPreset, setSelectedPreset] = useState<PresetKey | 'CUSTOM'>('default');

  const resizeReactor = (newCols: number, newRows: number, newHeight: number) => {
    setReactor(prev => new Reactor(newCols, newRows, newHeight, prev.insertionRatio, prev.currentFuel, activelyCooled));
  };

  const updateReactor = (x: number, z: number) => {
    if (mode === 'replaceAll') {
      const replaceBlock = reactor.reactorMap[z][x];

      for (let xGrid = 0; xGrid < reactor.width; xGrid++) {
        for (let zGrid = 0; zGrid < reactor.depth; zGrid++) {
          if (reactor.reactorMap[zGrid][xGrid] !== replaceBlock) continue;
          reactor.setBlock(zGrid, xGrid, selectedBlock);
        }
      }
    } else if (mode === 'grid') {
      const xOffset = x % 2;
      const zOffset = z % 2;

      for (let xGrid = 0; xGrid < reactor.width; xGrid++) {
        for (let zGrid = 0; zGrid < reactor.depth; zGrid++) {
          if ((xGrid % 2 === xOffset && zGrid % 2 === zOffset) || (xGrid % 2 !== xOffset && zGrid % 2 !== zOffset)) {
            reactor.setBlock(zGrid, xGrid, selectedBlock);
          }
        }
      }
    }
    reactor.setBlock(z, x, selectedBlock);
    reactor.reset();
    reactor.simulate();
    setReactor(reactor.clone());
  };

  const findOptimalRatio = () => {
    let bestRatio = 0;
    let bestEfficiency = 0;
    for (let ratio = 0; ratio <= 100; ratio += 5) {
      reactor.updateInsertionRatio(ratio);
      const outputMetric = reactor.isActivelyCooled ? reactor.steamGenerated : reactor.totalEnergy;
      const efficiency = reactor.fuelUsage > 0 ? outputMetric / reactor.fuelUsage : 0;
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
      const outputMetric = reactor.isActivelyCooled ? reactor.steamGenerated : reactor.totalEnergy;
      const efficiency = reactor.fuelUsage > 0 ? outputMetric / reactor.fuelUsage : 0;
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

  return {
    reactor,
    setReactor,
    activelyCooled,
    setActivelyCooled,
    selectedBlock,
    setSelectedBlock,
    powerProductionMultiplier,
    reactorPowerProductionMultiplier,
    fuelUsageMultiplier,
    reinforcedPreferred,
    selectedPreset,
    setPowerProductionMultiplier,
    setReactorPowerProductionMultiplier,
    setFuelUsageMultiplier,
    setReinforcedPreferred,
    setSelectedPreset,
    resizeReactor,
    updateReactor,
    findOptimalRatio,
    mode,
    setMode,
  };
}
