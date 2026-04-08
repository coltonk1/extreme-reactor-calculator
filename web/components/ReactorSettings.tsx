import { Reactor } from '@/lib/reactor_simulation';
import { useState } from 'react';

export default function ReactorSettings({ reactor, setReactor, resizeReactor, activelyCooled, setActivelyCooled, findOptimalRatio }: { reactor: Reactor; setReactor: React.Dispatch<React.SetStateAction<Reactor>>; resizeReactor: (newCols: number, newRows: number, newHeight: number) => void; activelyCooled: boolean; setActivelyCooled: React.Dispatch<React.SetStateAction<boolean>>; findOptimalRatio: () => void }) {
  const [ratioFound, setRatioFound] = useState(false);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Reactor Settings</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold">Inner Size</h3>
            <p className="text-xs text-neutral-300/60">Changing dimensions will reset the reactor</p>
          </div>
          <div className="grid grid-cols-3 gap-4 w-fit">
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
        </div>

        <div className="space-y-2">
          <div>
            <h2 className="text-sm font-semibold">Cooling Mode</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
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
        </div>

        <div className="space-y-2">
          <div>
            <h2 className="text-sm font-semibold">Insertion Ratio</h2>
          </div>
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
        </div>
      </div>
    </div>
  );
}
