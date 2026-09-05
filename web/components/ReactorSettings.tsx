import { PresetKey, presets } from '@/lib/configPresets';
import { Fuel } from '@/lib/fuels';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useReactorState } from './ReactorStateProvider';

export default function ReactorSettings() {
  const reactorState = useReactorState();

  const [ratioFound, setRatioFound] = useState(false);

  const [reactorPowerInputValue, setReactorPowerInputValue] = useState(reactorState.reactorPowerProductionMultiplier.toString());
  const [powerInputValue, setPowerInputValue] = useState(reactorState.powerProductionMultiplier.toString());
  const [fuelInputValue, setFuelInputValue] = useState(reactorState.fuelUsageMultiplier.toString());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFuelInputValue(reactorState.fuelUsageMultiplier.toString());
    setReactorPowerInputValue(reactorState.reactorPowerProductionMultiplier.toString());
    setPowerInputValue(reactorState.powerProductionMultiplier.toString());
  }, [reactorState.reactorPowerProductionMultiplier, reactorState.powerProductionMultiplier, reactorState.fuelUsageMultiplier]);

  const reactorIsLarge = reactorState.reactor.height > 3 || reactorState.reactor.width > 3 || reactorState.reactor.depth > 3;
  const isReinforced = reactorState.reinforcedPreferred || reactorIsLarge || reactorState.reactor.isActivelyCooled || reactorState.reactor.currentFuel === Fuel.Verderium;

  const isValidNumber = (num: string | number) => {
    return !isNaN(Number(num)) && Number(num) >= 0.499 && Number(num) <= 100.01;
  };

  return (
    <div className="space-y-2">
      <div className="">
        <div className="space-y-3 py-2">
          <div>
            <p className="text-sm font-medium">Config Settings</p>
            <p className="text-xs text-neutral-500">Adjust simulation multipliers</p>
          </div>

          {!(isValidNumber(fuelInputValue) && isValidNumber(powerInputValue) && isValidNumber(reactorPowerInputValue)) && <p className="text-xs text-red-400">Values must be between 0.5 and 100.0</p>}

          <div>
            <p className="text-xs text-neutral-400 mb-1">Preset</p>
            <select
              value={reactorState.selectedPreset}
              className="w-full px-2 py-1.5 text-sm rounded bg-neutral-800 border border-neutral-600 text-white outline-none focus:bg-neutral-700 focus:border-neutral-400 cursor-pointer"
              onChange={e => {
                const key = e.target.value as PresetKey;
                const preset = presets[key];

                reactorState.setSelectedPreset(key);

                reactorState.setFuelUsageMultiplier(preset.fuel);
                reactorState.setPowerProductionMultiplier(preset.power);
                reactorState.setReactorPowerProductionMultiplier(preset.reactorPower);
              }}
            >
              {Object.keys(presets).map(value => (
                <option key={value} value={value}>
                  {value.replaceAll('_', ' ')}
                </option>
              ))}
              {reactorState.selectedPreset === 'CUSTOM' && <option value={'CUSTOM'}>{'CUSTOM'}</option>}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm">Fuel Usage</p>
                <p className="text-xs text-neutral-500">fuelUsageMultiplier</p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  className="w-20 px-2 py-1 text-sm rounded bg-neutral-800 border border-neutral-600 text-white outline-none focus:bg-neutral-700 focus:border-neutral-400 text-right"
                  value={fuelInputValue}
                  onChange={e => {
                    const v = e.target.value;
                    setFuelInputValue(v);

                    const num = Number(v);
                    if (!isNaN(num) && num >= 0.5 && num <= 100) {
                      reactorState.setFuelUsageMultiplier(num);
                      reactorState.setSelectedPreset('CUSTOM');
                    }
                  }}
                />
                <span className="text-xs text-neutral-400">x</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm">Power</p>
                <p className="text-xs text-neutral-500">powerProductionMultiplier</p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  className="w-20 px-2 py-1 text-sm rounded bg-neutral-800 border border-neutral-600 text-white outline-none focus:bg-neutral-700 focus:border-neutral-400 text-right"
                  value={powerInputValue}
                  onChange={e => {
                    const v = e.target.value;
                    setPowerInputValue(v);

                    const num = Number(v);
                    if (!isNaN(num) && num >= 0.5 && num <= 100) {
                      reactorState.setPowerProductionMultiplier(num);
                      reactorState.setSelectedPreset('CUSTOM');
                    }
                  }}
                />
                <span className="text-xs text-neutral-400">x</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm">Reactor Power</p>
                <p className="text-xs text-neutral-500">reactorPowerProductionMultiplier</p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  className="w-20 px-2 py-1 text-sm rounded bg-neutral-800 border border-neutral-600 text-white outline-none focus:bg-neutral-700 focus:border-neutral-400 text-right"
                  value={reactorPowerInputValue}
                  onChange={e => {
                    const v = e.target.value;
                    setReactorPowerInputValue(v);

                    const num = Number(v);
                    if (!isNaN(num) && num >= 0.5 && num <= 100) {
                      reactorState.setReactorPowerProductionMultiplier(num);
                      reactorState.setSelectedPreset('CUSTOM');
                    }
                  }}
                />
                <span className="text-xs text-neutral-400">x</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-neutral-700/50 my-1"></hr>

        <div className="space-y-2 py-2">
          <div>
            <p className="text-sm font-medium">Inner Size</p>
            <p className="text-xs text-neutral-500">Changing dimensions will reset the reactor</p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-xs text-neutral-400 mb-1">X</p>
              <input
                className="w-full px-2 py-1 text-sm rounded bg-neutral-800 border border-neutral-600 text-white outline-none focus:bg-neutral-700 focus:border-neutral-400 text-right"
                value={reactorState.reactor.width}
                onChange={e => reactorState.resizeReactor(Number(e.target.value), reactorState.reactor.depth, reactorState.reactor.height)}
              />
            </div>

            <div className="flex-1">
              <p className="text-xs text-neutral-400 mb-1">
                Y <span className="text-neutral-500">(height)</span>
              </p>
              <input
                className="w-full px-2 py-1 text-sm rounded bg-neutral-800 border border-neutral-600 text-white outline-none focus:bg-neutral-700 focus:border-neutral-400 text-right"
                value={reactorState.reactor.height}
                onChange={e => reactorState.resizeReactor(reactorState.reactor.width, reactorState.reactor.depth, Number(e.target.value))}
              />
            </div>

            <div className="flex-1">
              <p className="text-xs text-neutral-400 mb-1">Z</p>
              <input
                className="w-full px-2 py-1 text-sm rounded bg-neutral-800 border border-neutral-600 text-white outline-none focus:bg-neutral-700 focus:border-neutral-400 text-right"
                value={reactorState.reactor.depth}
                onChange={e => reactorState.resizeReactor(reactorState.reactor.width, Number(e.target.value), reactorState.reactor.height)}
              />
            </div>
          </div>
        </div>

        <hr className="border-neutral-700/50 my-1"></hr>

        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between cursor-pointer " onClick={() => reactorState.setActivelyCooled(v => !v)}>
            <div>
              <p className="text-sm font-medium">Cooling Mode</p>
              <p className="text-xs text-neutral-500">{reactorState.activelyCooled ? 'Active cooling enabled' : 'Passive cooling'}</p>
            </div>

            <div className="flex flex-col gap-1 items-end">
              <span className={clsx('text-xs font-medium', reactorState.activelyCooled ? 'text-blue-400' : 'text-neutral-500')}>{reactorState.activelyCooled ? 'Active' : 'Passive'}</span>
              <div className={clsx('relative w-10 h-5 rounded-full transition', reactorState.activelyCooled ? 'bg-blue-500' : 'bg-neutral-600')}>
                <span className={clsx('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition', reactorState.activelyCooled && 'translate-x-5')} />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-neutral-700/50 my-1"></hr>

        <div className="space-y-2 py-2">
          <div>
            <p className="text-sm font-medium">Reactor Tier</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                reactorState.setReinforcedPreferred(false);
              }}
              disabled={reactorIsLarge || reactorState.activelyCooled}
              className={clsx(
                'rounded border px-3 py-2 text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                !isReinforced ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-neutral-600 bg-neutral-800 text-neutral-300',
              )}
            >
              Basic
            </button>

            <button
              type="button"
              onClick={() => {
                reactorState.setReinforcedPreferred(true);
              }}
              className={clsx(
                'rounded border px-3 py-2 text-sm transition cursor-pointer',
                isReinforced ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-neutral-600 bg-neutral-800 text-neutral-300',
              )}
            >
              Reinforced
            </button>
          </div>

          {reactorIsLarge && <p className="text-xs text-red-400">Reinforced is required for the current dimensions.</p>}
          {reactorState.reactor.isActivelyCooled && <p className="text-xs text-red-400">Reinforced is required for active cooling.</p>}
          {reactorState.reactor.currentFuel === Fuel.Verderium && <p className="text-xs text-red-400">Reinforced is required to use Verderium as fuel.</p>}
        </div>

        <hr className="border-neutral-700/50 my-1"></hr>

        <div className="space-y-2 py-2">
          <div>
            <p className="text-sm font-medium">Fuel Source</p>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => {
                reactorState.setReactor(prev => {
                  const next = prev.clone();
                  next.updateFuelSource(Fuel.Uranium);
                  return next;
                });
              }}
              className={clsx(
                'rounded border px-3 py-2 text-sm transition cursor-pointer',
                reactorState.reactor.currentFuel === Fuel.Uranium ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-neutral-600 bg-neutral-800 text-neutral-300',
              )}
            >
              Uranium / Yellorium
            </button>
            <button
              type="button"
              onClick={() => {
                reactorState.setReactor(prev => {
                  const next = prev.clone();
                  next.updateFuelSource(Fuel.Blutonium);
                  return next;
                });
              }}
              className={clsx(
                'rounded border px-3 py-2 text-sm transition cursor-pointer',
                reactorState.reactor.currentFuel === Fuel.Blutonium ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-neutral-600 bg-neutral-800 text-neutral-300',
              )}
            >
              Blutonium
            </button>
            <button
              type="button"
              onClick={() => {
                reactorState.setReactor(prev => {
                  const next = prev.clone();
                  next.updateFuelSource(Fuel.Verderium);
                  return next;
                });
              }}
              className={clsx(
                'rounded border px-3 py-2 text-sm transition cursor-pointer',
                reactorState.reactor.currentFuel === Fuel.Verderium ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-neutral-600 bg-neutral-800 text-neutral-300',
              )}
            >
              Verderium
            </button>
          </div>
        </div>

        <hr className="border-neutral-700/50 my-1"></hr>

        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Insertion Ratio</p>
              <p className="text-xs text-neutral-500">Controls rod insertion level</p>
            </div>
            <span className="text-sm font-semibold text-white tabular-nums">{reactorState.reactor.insertionRatio}%</span>
          </div>

          <div className="relative w-full">
            <div className="h-3 w-full rounded-full bg-neutral-700" />

            <div className="absolute top-0 left-0 h-3 rounded-full bg-blue-500" style={{ width: `${reactorState.reactor.insertionRatio}%` }} />

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Number(reactorState.reactor.insertionRatio)}
              onChange={e => {
                reactorState.reactor.updateInsertionRatio(Number(e.target.value));
                reactorState.setReactor(reactorState.reactor.clone());
              }}
              className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer"
            />

            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow pointer-events-none" style={{ left: `calc(${reactorState.reactor.insertionRatio}% - 8px)` }} />
          </div>
          <button
            className={clsx('w-full py-1.5 text-sm rounded transition-colors cursor-pointer', ratioFound ? 'bg-blue-500 text-blue-950' : 'bg-neutral-700 hover:bg-neutral-600 text-white')}
            onClick={() => {
              reactorState.findOptimalRatio();
              setRatioFound(true);
              setTimeout(() => setRatioFound(false), 800);
            }}
          >
            {ratioFound ? 'Optimal Ratio Found' : 'Auto Optimize'}
          </button>
        </div>
      </div>
    </div>
  );
}
