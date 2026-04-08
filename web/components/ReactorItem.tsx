import { Block } from '@/lib/blocks';

export default function ReactorItem({ x, z, casing, rows, cols, block, updateReactor }: { x: number; z: number; casing: boolean; rows: number; cols: number; block: Block | null; updateReactor: (x: number, z: number) => void }) {
  const getCasingImage = (x: number, z: number) => {
    const left = x === -1;
    const right = x === cols - 2;
    const top = z === -1;
    const bottom = z === rows - 2;

    if (bottom && right) return 'url(/assets/casing_right_down.png)';
    if (bottom && left) return 'url(/assets/casing_left_down.png)';
    if (top && right) return 'url(/assets/casing_right_up.png)';
    if (top && left) return 'url(/assets/casing_left_up.png)';
    if (left) return 'url(/assets/casing_left.png)';
    if (right) return 'url(/assets/casing_right.png)';
    if (top) return 'url(/assets/casing_up.png)';
    if (bottom) return 'url(/assets/casing_down.png)';

    return `url(/assets/blocks/${block}.png)`;
  };

  return (
    <div
      className={`bg-white/10 hover:bg-white ${!casing && 'cursor-pointer hover:opacity-35'} bg-cover select-none`}
      style={{
        backgroundImage: `${getCasingImage(x, z)}`,
        imageRendering: 'pixelated',
      }}
      onMouseDown={() => {
        if (casing) return;
        updateReactor(x, z);
      }}
      onMouseEnter={e => {
        if (casing) return;
        if (e.buttons === 1) {
          updateReactor(x, z);
        }
      }}
    ></div>
  );
}
