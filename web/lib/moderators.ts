// Defines moderator properties for each block used in the reactor simulation.

import { Block } from './blocks';

type ModeratorData = {
  absorption: number;
  heatEfficiency: number;
  inverseModeration: number;
  heatConductivity: number;
};

const moderators = new Map<Block, ModeratorData>();

function addModerator(block: Block, data: [absorption: number, heatEfficiency: number, inverseModeration: number, heatConductivity: number]) {
  if (data.length !== 4) throw new Error('Moderator data must have 4 values');

  moderators.set(block, {
    absorption: data[0],
    heatEfficiency: data[1],
    inverseModeration: data[2],
    heatConductivity: data[3],
  });
}

enum Conductivity {
  Air = 0.05,
  Rubber = 0.01,
  Water = 0.1,
  Stone = 0.15,
  Glass = 0.3,
  Iron = 0.6,
  Copper = 1,
  Silver = 1.5,
  Gold = 2,
  Emerald = 2.5,
  Diamond = 3,
  Graphene = 5,
}

function setupModerators() {
  // Base
  addModerator(Block.Air, [0.1, 0.25, 1 / 1.1, 0.05]);

  // Solids
  addModerator(Block.Apatite, [0.48, 0.73, 1 / 1.3, Conductivity.Stone]);
  addModerator(Block.Cinnabar, [0.48, 0.75, 1 / 1.32, Conductivity.Stone]);
  addModerator(Block.Iron, [0.5, 0.75, 1 / 1.4, Conductivity.Iron]);
  addModerator(Block.Manasteel, [0.6, 0.75, 1 / 1.5, Conductivity.Iron]);
  addModerator(Block.Elementium, [0.61, 0.77, 1 / 1.52, Conductivity.Emerald]);
  addModerator(Block.Nickel, [0.51, 0.77, 1 / 1.4, Conductivity.Iron]);
  addModerator(Block.Gold, [0.52, 0.8, 1 / 1.45, Conductivity.Gold]);
  addModerator(Block.Diamond, [0.55, 0.85, 1 / 1.5, Conductivity.Diamond]);
  addModerator(Block.Netherite, [0.55, 0.95, 1 / 1.65, Conductivity.Diamond]);
  addModerator(Block.Terrasteel, [0.57, 0.87, 1 / 1.52, Conductivity.Diamond]);
  addModerator(Block.Emerald, [0.55, 0.85, 1 / 1.5, Conductivity.Emerald]);
  // addModerator(Block.Colorless, [0.2, 0.25, 1 / 1.1, Conductivity.Glass]);
  addModerator(Block.Copper, [0.5, 0.75, 1 / 1.4, Conductivity.Copper]);
  addModerator(Block.Brass, [0.52, 0.78, 1 / 1.42, Conductivity.Copper]);
  addModerator(Block.Osmium, [0.51, 0.77, 1 / 1.41, Conductivity.Copper]);
  addModerator(Block.RefinedObsidian, [0.53, 0.79, 1 / 1.42, Conductivity.Copper]);
  addModerator(Block.RefinedGlowstone, [0.54, 0.79, 1 / 1.44, Conductivity.Emerald]);
  addModerator(Block.Bronze, [0.51, 0.77, 1 / 1.41, Conductivity.Copper]);
  addModerator(Block.Zinc, [0.51, 0.77, 1 / 1.41, Conductivity.Copper]);
  addModerator(Block.Aluminum, [0.5, 0.78, 1 / 1.42, Conductivity.Iron]);
  addModerator(Block.Steel, [0.5, 0.78, 1 / 1.42, Conductivity.Iron]);
  addModerator(Block.Invar, [0.5, 0.79, 1 / 1.43, Conductivity.Iron]);
  addModerator(Block.Tin, [0.5, 0.73, 1 / 1.38, Conductivity.Silver]);
  addModerator(Block.Silver, [0.51, 0.79, 1 / 1.43, Conductivity.Silver]);
  addModerator(Block.Signalum, [0.51, 0.75, 1 / 1.42, Conductivity.Copper]);
  addModerator(Block.Lumium, [0.51, 0.79, 1 / 1.45, Conductivity.Silver]);
  addModerator(Block.Lead, [0.75, 0.75, 1 / 1.75, Conductivity.Silver]);
  addModerator(Block.Electrum, [0.53, 0.82, 1 / 1.47, 2.2]);
  addModerator(Block.Platinum, [0.57, 0.86, 1 / 1.58, Conductivity.Emerald]);
  addModerator(Block.Enderium, [0.6, 0.88, 1 / 1.6, Conductivity.Diamond]);
  addModerator(Block.Graphite, [0.1, 0.5, 1 / 2.0, Conductivity.Gold]);
  addModerator(Block.Ice, [0.33, 0.33, 1 / 1.15, Conductivity.Water]);
  addModerator(Block.DryIce, [0.42, 0.52, 1 / 1.32, Conductivity.Water]);

  // Fluids
  addModerator(Block.Cryomisi, [0.75, 0.55, 1 / 1.6, Conductivity.Emerald]);
  addModerator(Block.Tangerium, [0.9, 0.75, 1 / 2.0, Conductivity.Gold]);
  addModerator(Block.Redfrigium, [0.66, 0.95, 1 / 6.0, Conductivity.Diamond]);
  addModerator(Block.Water, [0.33, 0.5, 1 / 1.33, Conductivity.Water]);

  // ATM
  addModerator(Block.Allthemodium, [0.697, 0.942, 1 / 3.84, 3.65]);
  addModerator(Block.Vibranium, [0.24, 0.81, 1 / 7.47, 4.38]);
  addModerator(Block.Unobtainium, [0.972, 0.91, 1 / 3.074, 5.0]);

  // Other

  addModerator(Block.Draconium, [0.59, 0.88, 1 / 1.6, 3.3]);
  addModerator(Block.AwakenedDraconium, [0.76, 0.88, 1 / 1.78, 4.8]);
  addModerator(Block.Dragonsteel, [0.55, 0.81, 1 / 1.46, Conductivity.Silver]);
  addModerator(Block.Twinite, [0.5, 0.78, 1 / 1.42, Conductivity.Copper]);
  addModerator(Block.Shellite, [0.52, 0.78, 1 / 1.42, Conductivity.Gold]);

  // More Fluids

  addModerator(Block.LiquidStarlight, [0.92, 0.8, 1 / 2.0, Conductivity.Diamond]);
  addModerator(Block.LifeEssence, [0.8, 0.55, 1 / 1.75, Conductivity.Emerald]);
  addModerator(Block.HydrofluoricAcid, [0.68, 0.45, 1 / 1.4, Conductivity.Emerald]);
  addModerator(Block.Sodium, [0.28, 0.6, 1 / 1.7, Conductivity.Copper]);
  addModerator(Block.HydrogenChloride, [0.38, 0.65, 1 / 1.7, Conductivity.Copper]);
  addModerator(Block.Ethene, [0.45, 0.65, 1 / 1.9, Conductivity.Silver]);
  addModerator(Block.ThermalEnder, [0.92, 0.76, 1 / 2.02, Conductivity.Gold]);
  addModerator(Block.ThermalRedstone, [0.77, 0.56, 1 / 1.61, Conductivity.Emerald]);

  addModerator(Block.MoltenAllthemodium, [0.697, 0.942, 1 / 3.84, 3.65]);
  addModerator(Block.MoltenVibranium, [0.24, 0.81, 1 / 7.47, 4.38]);
  addModerator(Block.MoltenUnobtainium, [0.972, 0.91, 1 / 3.074, 5.0]);

  // Not placeable
  addModerator(Block.FlowingEthene, [0.37, 0.65, 1 / 1.9, Conductivity.Silver]);
  addModerator(Block.FlowingSodium, [0.23, 0.6, 1 / 1.7, Conductivity.Copper]);
  addModerator(Block.FlowingLiquidStarlight, [0.8, 0.85, 1 / 2.0, Conductivity.Diamond]);
  addModerator(Block.FlowingLifeEssence, [0.7, 0.55, 1 / 1.75, Conductivity.Emerald]);
  addModerator(Block.FlowingHydrofluoricAcid, [0.6, 0.45, 1 / 1.4, Conductivity.Emerald]);
  addModerator(Block.FlowingHydrogenChloride, [0.31, 0.65, 1 / 1.7, Conductivity.Copper]);
  addModerator(Block.FlowingThermalEnder, [0.9, 0.75, 1 / 2.0, Conductivity.Gold]);
  addModerator(Block.FlowingThermalRedstone, [0.75, 0.55, 1 / 1.6, Conductivity.Emerald]);
  addModerator(Block.FlowingCryomisi, [0.68, 0.49, 1 / 1.4, Conductivity.Emerald]);
  addModerator(Block.FlowingTangerium, [0.84, 0.69, 1 / 1.7, Conductivity.Gold]);
  addModerator(Block.FlowingRedfrigium, [0.57, 0.86, 1 / 5.0, Conductivity.Diamond]);
  addModerator(Block.FlowingWater, [0.33, 0.5, 1 / 1.33, Conductivity.Water]);
}

setupModerators();

export { moderators };
