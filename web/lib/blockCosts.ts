import { Block } from './blocks';
import { Material } from './materials';

type BlockCost = { [item: string]: number };
type ReactorBlock = { basic: BlockCost; reinforced: BlockCost };

export const BlockCosts: Partial<Record<string, BlockCost | ReactorBlock>> = {
  [Block.Gold]: {
    [Material.GoldIngot]: 9,
  },
  [Block.Diamond]: {
    [Material.DiamondGem]: 9,
  },
  [Block.Iron]: {
    [Material.IronIngot]: 9,
  },
  [Block.Graphite]: {
    [Material.GraphiteIngot]: 9,
  },
  [Material.Hopper]: {
    [Material.IronIngot]: 5,
    [Material.Chest]: 1,
  },
  [Material.RedstoneTorch]: {
    [Material.RedstoneDust]: 1,
    [Material.Stick]: 1,
  },
  [Material.Comparator]: {
    [Material.Stone]: 3,
    [Material.RedstoneTorch]: 3,
    [Material.NetherQuartz]: 1,
  },
  [Material.Chest]: {
    [Material.WoodenPlank]: 8,
  },
  [Material.Piston]: {
    [Material.IronIngot]: 1,
    [Material.RedstoneDust]: 1,
    [Material.Cobblestone]: 4,
    [Material.WoodenPlank]: 3,
  },
  [Block.ReactorCasing]: {
    basic: {
      [Material.IronIngot]: 4,
      [Material.Sand]: 1,
      [Material.GraphiteIngot]: 4,
    },
    reinforced: {
      [Material.SteelIngot]: 4,
      [Block.Iron]: 1,
      [Material.GraphiteIngot]: 4,
    },
  },
  [Block.FuelRod]: {
    basic: {
      [Material.IronIngot]: 4,
      [Material.Uranium]: 1,
      [Material.GraphiteIngot]: 2,
      [Material.Glass]: 2,
    },
    reinforced: {
      [Material.SteelIngot]: 4,
      [Material.Uranium]: 1,
      [Material.GraphiteIngot]: 2,
      [Material.Glass]: 2,
    },
  },
  [Block.ReactorControlRod]: {
    basic: {
      [Block.ReactorCasing]: 4,
      [Material.IronIngot]: 2,
      [Material.RedstoneDust]: 1,
      [Material.GraphiteIngot]: 1,
      [Material.Piston]: 1,
    },
    reinforced: {
      [Block.ReactorCasing]: 4,
      [Material.SteelIngot]: 2,
      [Material.RedstoneDust]: 1,
      [Material.GraphiteIngot]: 1,
      [Material.Piston]: 1,
    },
  },
  [Block.ReactorController]: {
    basic: {
      [Block.ReactorCasing]: 4,
      [Material.Uranium]: 2,
      [Material.RedstoneDust]: 1,
      [Material.DiamondGem]: 1,
      [Material.Comparator]: 1,
    },
    reinforced: {
      [Block.ReactorCasing]: 4,
      [Material.Uranium]: 2,
      [Material.RedstoneDust]: 1,
      [Block.Diamond]: 1,
      [Material.Comparator]: 1,
    },
  },
  [Block.ReactorAccessPort]: {
    basic: {
      [Block.ReactorCasing]: 4,
      [Material.IronIngot]: 2,
      [Material.Hopper]: 1,
      [Material.Chest]: 1,
      [Material.Piston]: 1,
    },
    reinforced: {
      [Block.ReactorCasing]: 4,
      [Material.SteelIngot]: 2,
      [Material.Hopper]: 1,
      [Material.Chest]: 1,
      [Material.Piston]: 1,
    },
  },
};

function getFullCost(cost: BlockCost | ReactorBlock, reinforced: boolean, steelAvailable: boolean): BlockCost {
  const resolved = 'basic' in cost ? (reinforced ? cost.reinforced : cost.basic) : cost;

  const totals: BlockCost = {};

  for (const [item, qty] of Object.entries(resolved)) {
    if (item === Material.SteelIngot && !steelAvailable) {
      totals[Material.IronIngot] = (totals[Material.IronIngot] ?? 0) + qty * 9;
      continue;
    }

    const recipe = BlockCosts[item];

    if (recipe) {
      const expanded = getFullCost(recipe, reinforced, steelAvailable);

      for (const [subItem, subQty] of Object.entries(expanded)) {
        totals[subItem] = (totals[subItem] ?? 0) + subQty * qty;
      }
    } else {
      totals[item] = (totals[item] ?? 0) + qty;
    }
  }

  return totals;
}

function getCostOfBlock(block: Block, reinforced: boolean, steelAvailable: boolean): BlockCost {
  if (!BlockCosts[block]) return { [block]: 1 };

  return getFullCost(BlockCosts[block], reinforced, steelAvailable);
}

export { getCostOfBlock };
