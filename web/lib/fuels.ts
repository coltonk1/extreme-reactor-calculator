type FuelData = {
  moderationFactor: number;
  absorptionCoefficient: number;
  hardnessDivisor: number;
  fissionEventsPerFuelUnit: number;
  fuelUnitsPerFissionEvent: number;
  standardReactivity: number;
  standardFissionRate: number;
};

enum Fuel {
  Uranium = 'uranium',
  Blutonium = 'blutonium',
  Verderium = 'verderium',
}

const fuels = new Map<Fuel, FuelData>();

function addFuel(fuel: Fuel, data: number[]) {
  if (data.length != 7) throw new Error('Fuel data must have 7 values');

  fuels.set(fuel, {
    moderationFactor: data[0],
    absorptionCoefficient: data[1],
    hardnessDivisor: data[2],
    fissionEventsPerFuelUnit: data[3],
    fuelUnitsPerFissionEvent: data[4],
    standardReactivity: data[5],
    standardFissionRate: data[6],
  });
}

// todo: Add other fuels and ability to choose them
function setupFuels() {
  addFuel(Fuel.Uranium, [1.5, 0.5, 1.0, 0.01, 0.0007, 1.05, 0.01]);
}

export { Fuel, setupFuels, fuels };
