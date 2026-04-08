// This enum determines the order in which the placeable blocks will be shown
enum Block {
  Air = 'air',
  Iron = 'iron',
  Gold = 'gold',
  Diamond = 'diamond',
  Emerald = 'emerald',
  Copper = 'copper',
  Netherite = 'netherite',
  // Colorless = 'colorless',
  Ice = 'ice',
  Water = 'water',

  ReactorControlRod = 'reactorcontrolrod',
  FuelRod = 'fuelrod',
  ReactorCasing = 'reactorcasing',
  ReactorController = 'reactorcontroller',
  ReactorAccessPort = 'accessport',
  Graphite = 'graphite',
  Cryomisi = 'cryomisi',
  Tangerium = 'tangerium',
  Redfrigium = 'redfrigium',

  Bronze = 'bronze',
  Steel = 'steel',
  Tin = 'tin',
  Osmium = 'osmium',
  Nickel = 'nickel',
  Brass = 'brass',
  Zinc = 'zinc',
  Aluminum = 'aluminum',
  Silver = 'silver',
  Lead = 'lead',
  Platinum = 'platinum',
  Invar = 'invar',

  RefinedObsidian = 'refinedobsidian',
  RefinedGlowstone = 'refinedglowstone',
  Allthemodium = 'allthemodium',
  Vibranium = 'vibranium',
  Unobtainium = 'unobtainium',
  DryIce = 'dryice',
  Cinnabar = 'cinnabar',
  Enderium = 'enderium',
  Electrum = 'electrum',
  Signalum = 'signalum',
  Lumium = 'lumium',
  Manasteel = 'manasteel',
  Elementium = 'elementium',
  Terrasteel = 'terrasteel',
  Apatite = 'apatite',
}

// NotPlaceableBlocks will be excluded from being displayed on the Moderator list
export const NotPlaceableBlock = new Set<Block>([Block.ReactorAccessPort, Block.ReactorCasing, Block.ReactorController, Block.FuelRod]);
// BasicOrReinforcedBlocks will display under build materials with 'Reinforced' or 'Basic' depending on reactor type
export const BasicOrReinforcedBlocks = new Set<Block>([Block.ReactorAccessPort, Block.ReactorCasing, Block.ReactorControlRod, Block.ReactorController, Block.FuelRod]);

const BlockNames = new Map([
  [Block.Air, 'Air'],
  [Block.ReactorControlRod, 'Reactor Control Rod'],

  [Block.FuelRod, 'Reactor Fuel Rod'],
  [Block.ReactorCasing, 'Reactor Casing'],
  [Block.ReactorController, 'Reactor Controller'],
  [Block.ReactorAccessPort, 'Reactor Access Port'],

  // Solids
  [Block.Apatite, 'Apatite'],
  [Block.Cinnabar, 'Cinnabar'],
  [Block.Iron, 'Iron Block'],
  [Block.Manasteel, 'Manasteel Block'],
  [Block.Elementium, 'Elementium Block'],
  [Block.Nickel, 'Nickel Block'],
  [Block.Gold, 'Gold Block'],
  [Block.Diamond, 'Diamond Block'],
  [Block.Netherite, 'Netherite Block'],
  [Block.Terrasteel, 'Terrasteel Block'],
  [Block.Emerald, 'Emerald Block'],
  // [Block.Colorless, 'Glass'],
  [Block.Copper, 'Copper Block'],
  [Block.Brass, 'Brass Block'],
  [Block.Osmium, 'Osmium Block'],
  [Block.RefinedObsidian, 'Refined Obsidian Block'],
  [Block.RefinedGlowstone, 'Refined Glowstone Block'],
  [Block.Bronze, 'Bronze Block'],
  [Block.Zinc, 'Zinc Block'],
  [Block.Aluminum, 'Aluminum Block'],
  [Block.Steel, 'Steel Block'],
  [Block.Invar, 'Invar Block'],
  [Block.Tin, 'Tin Block'],
  [Block.Silver, 'Silver Block'],
  [Block.Signalum, 'Signalum Block'],
  [Block.Lumium, 'Lumium Block'],
  [Block.Lead, 'Lead Block'],
  [Block.Electrum, 'Electrum Block'],
  [Block.Platinum, 'Platinum Block'],
  [Block.Enderium, 'Enderium Block'],
  [Block.Graphite, 'Graphite Block'],
  [Block.Ice, 'Ice'],
  [Block.DryIce, 'Dry Ice'],

  // Liquids
  [Block.Cryomisi, 'Cryomisi'],
  [Block.Tangerium, 'Tangerium'],
  [Block.Redfrigium, 'Redfrigium'],
  [Block.Water, 'Water'],

  // ATM
  [Block.Unobtainium, 'Unobtainium'],
  [Block.Vibranium, 'Vibranium'],
  [Block.Allthemodium, 'Allthemodium'],
]);

const BlockIds = Object.fromEntries(Object.values(Block).map((block, i) => [block, i]));

export { Block, BlockNames, BlockIds };
