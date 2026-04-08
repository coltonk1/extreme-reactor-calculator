import { PresetKey, presets } from '@/lib/configPresets';
import { Reactor } from '@/lib/reactor_simulation';
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
      <h2 className="text-lg font-semibold">Reactor Settings</h2>
      <div className="">
        <details className="space-y-2">
          <summary className="w-full cursor-pointer hover:bg-neutral-800 rounded px-1">
            <h3 className="text-sm font-semibold inline">Config Settings</h3>
          </summary>
          <p className="text-red-400 mt-1 text-sm text-left col-span-2 mb-3">
            {isValidNumber(fuelInputValue) && isValidNumber(powerInputValue) && isValidNumber(reactorPowerInputValue) ? '' : 'Input value must be between 0.5 and 100.0'}
          </p>
          <label className="text-sm">Preset</label>
          <select
            value=""
            className="text-sm text-neutral-400 block cursor-pointer"
            onChange={e => {
              const key = e.target.value as PresetKey;
              if (!key) return;
              const preset = presets[key];

              e.preventDefault();

              setFuelUsageMultiplier(preset.fuel);
              setPowerProductionMultiplier(preset.power);
              setReactorPowerProductionMultiplier(preset.reactorPower);
            }}
          >
            <option value="" className="">
              Select preset
            </option>
            {Object.keys(presets).map(value => {
              return (
                <option key={value} value={value}>
                  {value.replaceAll('_', ' ')}
                </option>
              );
            })}
          </select>

          <div className="text-sm items-center justify-between grid grid-cols-[auto_5rem] gap-2 mb-4">
            <label>
              <p className="text-sm">Fuel Usage Multiplier</p>
              <p className="text-xs text-neutral-300/60">fuelUsageMultiplier</p>
            </label>
            <div className="flex gap-1 items-center">
              <input
                className="w-20 text-right px-2 py-1 rounded bg-white text-neutral-900"
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

              <p className="text-xs">x</p>
            </div>

            <label>
              <p className="text-sm">Power Multiplier</p>
              <p className="text-xs text-neutral-300/60">powerProductionMultiplier</p>
            </label>
            <div className="flex gap-1 items-center">
              <input
                className="w-20 text-right px-2 py-1 rounded bg-white text-neutral-900"
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

              <p className="text-xs">x</p>
            </div>

            <label>
              <p className="text-sm">Reactor Power Multiplier</p>
              <p className="text-xs text-neutral-300/60">reactorPowerProductionMultiplier</p>
            </label>
            <div className="flex gap-1 items-center">
              <input
                className="w-20 text-right px-2 py-1 rounded bg-white text-neutral-900"
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

              <p className="text-xs">x</p>
            </div>
          </div>
        </details>

        <details className="space-y-2">
          <summary className="w-full cursor-pointer hover:bg-neutral-800 rounded px-1">
            <h3 className="text-sm font-semibold inline">Inner Size</h3>
          </summary>
          <p className="text-xs text-neutral-300/60">Changing dimensions will reset the reactor</p>
          <div className="grid grid-cols-3 gap-4 w-fit pb-6">
            <label className="flex flex-col text-sm">
              X
              <input className="mt-1 w-20 px-2 py-1 rounded bg-white text-neutral-900" value={reactor.width} onChange={e => resizeReactor(Number(e.target.value), reactor.depth, reactor.height)} />
            </label>

            <label className="flex flex-col text-sm">
              <p>
                Y <span className="text-xs text-neutral-300/60">(height)</span>
              </p>
              <input className="mt-1 w-20 px-2 py-1 rounded bg-white text-neutral-900" value={reactor.height} onChange={e => resizeReactor(reactor.width, reactor.depth, Number(e.target.value))} />
            </label>

            <label className="flex flex-col text-sm">
              Z
              <input className="mt-1 w-20 px-2 py-1 rounded bg-white text-neutral-900" value={reactor.depth} onChange={e => resizeReactor(reactor.width, Number(e.target.value), reactor.height)} />
            </label>
          </div>
        </details>

        <details className="space-y-2">
          <summary className="w-full cursor-pointer hover:bg-neutral-800 rounded px-1">
            <h3 className="text-sm font-semibold inline">Cooling Mode</h3>
          </summary>
          <div className="flex items-center gap-2 text-sm pb-6">
            <input
              type="checkbox"
              checked={activelyCooled}
              onChange={e => {
                setActivelyCooled(e.target.checked);
              }}
              className="w-4 h-4 accent-blue-500 cursor-pointer"
            />
            <p className="text-neutral-300/80">Actively cooled</p>
          </div>
        </details>

        <details className="space-y-2">
          <summary className="w-full cursor-pointer hover:bg-neutral-800 rounded px-1">
            <h3 className="text-sm font-semibold inline">Insertion Ratio</h3>
          </summary>
          <div className="mb-4 flex gap-2">
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
              className="w-full"
            />
            <span className="text-sm w-10 text-right">{reactor.getInsertionRatio()}%</span>
          </div>
          <button
            className="py-2 px-4 text-sm bg-blue-500 rounded-md w-full font-semibold cursor-pointer hover:opacity-80"
            onClick={() => {
              findOptimalRatio();
              setRatioFound(true);

              setTimeout(() => {
                setRatioFound(false);
              }, 800);
            }}
          >
            {ratioFound ? 'Optimal Ratio Found!' : 'Find Optimal Ratio'}
          </button>
        </details>
      </div>
    </div>
  );
}
