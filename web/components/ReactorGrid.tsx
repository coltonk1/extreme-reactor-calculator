import { Reactor } from '@/lib/reactor_simulation';
import ReactorItem from './ReactorItem';

export default function ReactorGrid({ reactor, updateReactor }: { reactor: Reactor; updateReactor: (x: number, z: number) => void }) {
  const reactorMap = reactor.getReactorMap();

  return (
    <div
      className="grid w-fit m-12 bg-neutral-800"
      id="reactor-map"
      style={{
        gridTemplateColumns: `repeat(${reactor.width + 2}, minmax(1.75rem, 1fr))`,
        gridTemplateRows: `repeat(${reactor.depth + 2}, minmax(1.75rem, 1fr))`,
      }}
    >
      {Array.from({ length: (reactor.width + 2) * (reactor.depth + 2) }, (_, i) => {
        const x = i % (reactor.width + 2);
        const z = Math.floor(i / (reactor.width + 2));
        const casing = x == 0 || z == 0 || x == reactor.width + 2 - 1 || z == reactor.depth + 2 - 1;
        return <ReactorItem key={i} x={x - 1} z={z - 1} casing={casing} rows={reactor.depth + 2} cols={reactor.width + 2} block={!casing ? reactorMap[z - 1][x - 1] : null} updateReactor={updateReactor} />;
      })}
    </div>
  );
}
