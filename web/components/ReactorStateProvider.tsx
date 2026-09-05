'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

import { Fuel } from '../lib/fuels';
import { Reactor } from '../lib/reactor_simulation';
import { Block } from '../lib/blocks';
import { PresetKey } from '../lib/configPresets';

function useCreateReactorState() {
  const [reactor, setReactor] = useState(new Reactor(7, 7, 7, 0, Fuel.Uranium, false));
  const [activelyCooled, setActivelyCooled] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(Block.Air);
  const [powerProductionMultiplier, setPowerProductionMultiplier] = useState(1);
  const [reactorPowerProductionMultiplier, setReactorPowerProductionMultiplier] = useState(1);
  const [fuelUsageMultiplier, setFuelUsageMultiplier] = useState(1);
  const [reinforcedPreferred, setReinforcedPreferred] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | 'CUSTOM'>('default');

  const resizeReactor = (newCols: number, newRows: number, newHeight: number) => {
    setReactor(prev => new Reactor(newCols, newRows, newHeight, prev.insertionRatio, prev.currentFuel, activelyCooled));
  };

  const updateReactor = (x: number, z: number) => {
    setReactor(prev => {
      const next = prev.clone();
      next.setBlock(z, x, selectedBlock);
      next.reset();
      next.simulate();
      return next;
    });
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
    setPowerProductionMultiplier,
    reactorPowerProductionMultiplier,
    setReactorPowerProductionMultiplier,
    fuelUsageMultiplier,
    setFuelUsageMultiplier,
    reinforcedPreferred,
    setReinforcedPreferred,
    selectedPreset,
    setSelectedPreset,
    resizeReactor,
    updateReactor,
    findOptimalRatio,
  };
}

type ReactorState = ReturnType<typeof useCreateReactorState>;

const ReactorStateContext = createContext<ReactorState | null>(null);

export function ReactorStateProvider({ children }: { children: ReactNode }) {
  const state = useCreateReactorState();

  return <ReactorStateContext.Provider value={state}>{children}</ReactorStateContext.Provider>;
}

export function useReactorState() {
  const context = useContext(ReactorStateContext);

  if (!context) {
    throw new Error('useReactorState must be used inside ReactorStateProvider');
  }

  return context;
}
