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

function setupFuels() {
  addFuel(Fuel.Uranium, [1.5, 0.5, 1.0, 0.01, 0.0007, 1.05, 0.01]);
  addFuel(Fuel.Blutonium, [2.23, 0.6, 2.0, 0.0137, 0.0006, 1.0871, 0.051]);
  addFuel(Fuel.Verderium, [3.74, 0.8741, 2.0049, 0.0312, 0.0081, 1.0984, 0.0743]);
}

setupFuels();

export { Fuel, fuels };
