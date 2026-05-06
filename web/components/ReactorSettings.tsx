import { PresetKey, presets } from '@/lib/configPresets';
import { Reactor } from '@/lib/reactor_simulation';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export default function ReactorSettings({
  reactor,
  setReactor,
  resizeReactor,
  activelyCooled,
  setActivelyCooled,
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
  resizeReactor: (newCols: number, newRows: number, newHeight: number) => void;
  activelyCooled: boolean;
  setActivelyCooled: React.Dispatch<React.SetStateAction<boolean>>;
  findOptimalRatio: () => void;
  powerProductionMultiplier: number;
  reactorPowerProductionMultiplier: number;
  fuelUsageMultiplier: number;
  setPowerProductionMultiplier: React.Dispatch<React.SetStateAction<number>>;
  setReactorPowerProductionMultiplier: React.Dispatch<React.SetStateAction<number>>;
  setFuelUsageMultiplier: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [ratioFound, setRatioFound] = useState(false);

  const [reactorPowerInputValue, setReactorPowerInputValue] = useState(reactorPowerProductionMultiplier.toString());
  const [powerInputValue, setPowerInputValue] = useState(powerProductionMultiplier.toString());
  const [fuelInputValue, setFuelInputValue] = useState(fuelUsageMultiplier.toString());

  useEffect(() => {
    setFuelInputValue(fuelUsageMultiplier.toString());
  }, [fuelUsageMultiplier]);

  useEffect(() => {
    setPowerInputValue(powerProductionMultiplier.toString());
  }, [powerProductionMultiplier]);

  useEffect(() => {
    setReactorPowerInputValue(reactorPowerProductionMultiplier.toString());
  }, [reactorPowerProductionMultiplier]);

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
              value=""
              className="w-full px-2 py-1.5 text-sm rounded bg-neutral-800 border border-neutral-600 text-white outline-none focus:bg-neutral-700 focus:border-neutral-400 cursor-pointer"
              onChange={e => {
                const key = e.target.value as PresetKey;
                if (!key) return;

                const preset = presets[key];

                setFuelUsageMultiplier(preset.fuel);
                setPowerProductionMultiplier(preset.power);
                setReactorPowerProductionMultiplier(preset.reactorPower);
              }}
            >
              <option value="">Select preset</option>
              {Object.keys(presets).map(value => (
                <option key={value} value={value}>
                  {value.replaceAll('_', ' ')}
                </option>
              ))}
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
                      setFuelUsageMultiplier(num);
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
                      setPowerProductionMultiplier(num);
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
                      setReactorPowerProductionMultiplier(num);
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
                value={reactor.width}
                onChange={e => resizeReactor(Number(e.target.value), reactor.depth, reactor.height)}
              />
            </div>

            <div className="flex-1">
              <p className="text-xs text-neutral-400 mb-1">
                Y <span className="text-neutral-500">(height)</span>
              </p>
              <input
                className="w-full px-2 py-1 text-sm rounded bg-neutral-800 border border-neutral-600 text-white outline-none focus:bg-neutral-700 focus:border-neutral-400 text-right"
                value={reactor.height}
                onChange={e => resizeReactor(reactor.width, reactor.depth, Number(e.target.value))}
              />
            </div>

            <div className="flex-1">
              <p className="text-xs text-neutral-400 mb-1">Z</p>
              <input
                className="w-full px-2 py-1 text-sm rounded bg-neutral-800 border border-neutral-600 text-white outline-none focus:bg-neutral-700 focus:border-neutral-400 text-right"
                value={reactor.depth}
                onChange={e => resizeReactor(reactor.width, Number(e.target.value), reactor.height)}
              />
            </div>
          </div>
        </div>

        <hr className="border-neutral-700/50 my-1"></hr>

        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between cursor-pointer " onClick={() => setActivelyCooled(v => !v)}>
            <div>
              <p className="text-sm font-medium">Cooling Mode</p>
              <p className="text-xs text-neutral-500">{activelyCooled ? 'Active cooling enabled' : 'Passive cooling'}</p>
            </div>

            <div className="flex flex-col gap-1 items-end">
              <span className={clsx('text-xs font-medium', activelyCooled ? 'text-blue-400' : 'text-neutral-500')}>{activelyCooled ? 'Active' : 'Passive'}</span>
              <div className={clsx('relative w-10 h-5 rounded-full transition', activelyCooled ? 'bg-blue-500' : 'bg-neutral-600')}>
                <span className={clsx('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition', activelyCooled && 'translate-x-5')} />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-neutral-700/50 my-1"></hr>

        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Insertion Ratio</p>
              <p className="text-xs text-neutral-500">Controls rod insertion level</p>
            </div>
            <span className="text-sm font-semibold text-white tabular-nums">{reactor.getInsertionRatio()}%</span>
          </div>

          <div className="relative w-full">
            <div className="h-3 w-full rounded-full bg-neutral-700" />

            <div className="absolute top-0 left-0 h-3 rounded-full bg-blue-500" style={{ width: `${reactor.getInsertionRatio()}%` }} />

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Number(reactor.getInsertionRatio())}
              onChange={e => {
                reactor.updateInsertionRatio(Number(e.target.value));
                setReactor(reactor.clone());
              }}
              className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer"
            />

            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow pointer-events-none" style={{ left: `calc(${reactor.getInsertionRatio()}% - 8px)` }} />
          </div>
          <button
            className={clsx('w-full py-1.5 text-sm rounded transition-colors cursor-pointer', ratioFound ? 'bg-blue-500 text-blue-950' : 'bg-neutral-700 hover:bg-neutral-600 text-white')}
            onClick={() => {
              findOptimalRatio();
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
