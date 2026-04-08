export const presets = {
  default: {
    fuel: 1.0,
    power: 1.0,
    reactorPower: 1.0,
  },
  atm10: {
    fuel: 0.8,
    power: 4.0,
    reactorPower: 3.0,
  },
  atm9: {
    fuel: 1.0,
    power: 1.0,
    reactorPower: 3.0,
  },
  all_the_mons: {
    fuel: 0.8,
    power: 4.0,
    reactorPower: 3.0,
  },
};

type PresetKey = keyof typeof presets;

export type { PresetKey };
