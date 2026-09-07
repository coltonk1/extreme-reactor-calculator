'use client';
import { Reactor } from '@/lib/reactor_simulation';
import ReactorItem from './ReactorItem';
import { useState } from 'react';

export default function ReactorGrid({ reactor, updateReactor, mode }: { reactor: Reactor; updateReactor: (x: number, z: number) => void; mode: 'replaceAll' | 'grid' | 'individual' }) {
  const reactorMap = reactor.reactorMap;

  const [currentlyHovered, setCurrentlyHovered] = useState([-1, -1]);

  return (
    <div
      className="grid w-fit m-12 bg-neutral-900/85"
      id="reactor-map"
      style={{
        gridTemplateColumns: `repeat(${reactor.width + 2}, 2rem)`,
        gridTemplateRows: `repeat(${reactor.depth + 2}, 2rem)`,
      }}
      onMouseLeave={() => {
        setCurrentlyHovered(() => [-1, -1]);
      }}
    >
      {Array.from({ length: (reactor.width + 2) * (reactor.depth + 2) }, (_, i) => {
        const x = i % (reactor.width + 2);
        const z = Math.floor(i / (reactor.width + 2));
        const casing = x == 0 || z == 0 || x == reactor.width + 2 - 1 || z == reactor.depth + 2 - 1;

        let shouldHighlight = false;

        if (currentlyHovered[0] >= 0 && currentlyHovered[1] >= 0 && currentlyHovered[0] < reactor.width && currentlyHovered[1] < reactor.depth && !casing) {
          if (mode === 'replaceAll') {
            const currentlyHoveredBlock = reactorMap[currentlyHovered[1]][currentlyHovered[0]];

            if (currentlyHoveredBlock === reactorMap[z - 1][x - 1]) {
              shouldHighlight = true;
            }
          } else if (mode === 'grid') {
            const xOffset = currentlyHovered[0] % 2;
            const zOffset = currentlyHovered[1] % 2;

            if ((xOffset === (x - 1) % 2 && zOffset === (z - 1) % 2) || (xOffset !== (x - 1) % 2 && zOffset !== (z - 1) % 2)) {
              shouldHighlight = true;
            }
          }
        }

        return (
          <ReactorItem
            key={i}
            x={x - 1}
            z={z - 1}
            casing={casing}
            rows={reactor.depth + 2}
            cols={reactor.width + 2}
            block={!casing ? reactorMap[z - 1][x - 1] : null}
            updateReactor={updateReactor}
            highlighted={shouldHighlight}
            setCurrentlyHovered={setCurrentlyHovered}
          />
        );
      })}
    </div>
  );
}
