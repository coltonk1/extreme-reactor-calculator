import { performance } from 'perf_hooks';

enum Block {
  Air = 'air',
  Copper = 'copper',
  ReactorControlRod = 'reactorcontrolrod',
  Iron = 'iron',
  Gold = 'gold',
}

enum Fuel {
  Uranium = 'uranium',
}

// Inner width, depth, and height
const width = 6;
const depth = 5;
const height = 7;
let insertionRatio = 50;

let rodPositions = new Array<[number, number]>();

function newReactorMap(x: number, z: number): Block[][] {
  const output = [];
  for (let i = 0; i < z; i++) {
    const temp = [];
    for (let i2 = 0; i2 < x; i2++) {
      temp.push(Block.Air);
    }
    output.push(temp);
  }
  return output;
}

let reactorMap = newReactorMap(width, depth);

function setCol(z: number, x: number, block: Block) {
  if (0 > z || z >= depth) throw new Error('Index out of range');
  if (0 > x || x >= width) throw new Error('Index out of range');

  let previousBlock = reactorMap[z][x];
  if (block === previousBlock) return;

  if (previousBlock === Block.ReactorControlRod) {
    const idx = rodPositions.findIndex(([rx, rz]) => rx === x && rz === z);
    if (idx !== -1) rodPositions.splice(idx, 1);
  } else if (block === Block.ReactorControlRod) rodPositions.push([x, z]);

  reactorMap[z][x] = block;
}

setCol(3, 3, Block.ReactorControlRod);
setCol(3, 1, Block.ReactorControlRod);
setCol(0, 4, Block.ReactorControlRod);
setCol(1, 3, Block.ReactorControlRod);
setCol(0, 0, Block.ReactorControlRod);
setCol(3, 5, Block.ReactorControlRod);
setCol(1, 0, Block.Iron);
setCol(2, 0, Block.Iron);
setCol(3, 0, Block.Iron);
setCol(4, 0, Block.Iron);
setCol(1, 2, Block.Iron);
setCol(3, 2, Block.Iron);
setCol(2, 3, Block.Iron);
setCol(1, 1, Block.Gold);

// Pre-compute
const numControlRods = rodPositions.length;
const numFuelRods = numControlRods * height;
const fuelAmount = 4000 * numFuelRods;
const innerReactorVolume = width * depth * height;
const innerSurfaceArea = 2 * (width * depth + width * height + depth * height);
const [extWidth, extDepth, extHeight] = [width + 2, depth + 2, height + 2];
const exteriorSurfaceArea = 2 * (extWidth * extDepth + extWidth * extHeight + extDepth * extHeight);
const ambientTemp = 20;

type ModeratorData = {
  absorption: number;
  heatEfficiency: number;
  inverseModeration: number;
  heatConductivity: number;
};

type FuelData = {
  moderationFactor: number;
  absorptionCoefficient: number;
  hardnessDivisor: number;
  fissionEventsPerFuelUnit: number;
  fuelUnitsPerFissionEvent: number;
  standardReactivity: number;
  standardFissionRate: number;
};

const moderators = new Map<Block, ModeratorData>();

function addModerator(block: Block, data: number[]) {
  if (data.length !== 4) throw new Error('Moderator data must have 4 values');

  moderators.set(block, {
    absorption: data[0],
    heatEfficiency: data[1],
    inverseModeration: data[2],
    heatConductivity: data[3],
  });
}

function setupModerators() {
  addModerator(Block.Air, [0.1, 0.25, 1 / 1.1, 0.05]);
  addModerator(Block.Iron, [0.5, 0.75, 1 / 1.4, 0.6]);
  addModerator(Block.Gold, [0.52, 0.8, 1 / 1.45, 2]);
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
}

setupModerators();
setupFuels();

const currentFuel = Fuel.Uranium;
const directions: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

function calcReactorHeatTransferCoefficient() {
  let output = 0;
  for (const [x, z] of rodPositions) {
    for (const [dx, dz] of directions) {
      const nx = x + dx;
      const nz = z + dz;

      if (0 > nx || nx >= width || 0 > nz || nz >= depth) {
        output += moderators.get(Block.Iron)!.heatConductivity;
      } else if (reactorMap[nz][nx] === Block.ReactorControlRod) {
        output += moderators.get(Block.Air)!.heatConductivity;
      } else {
        output += moderators.get(reactorMap[nz][nx])!.heatConductivity;
      }
    }
  }
  return output;
}

const reactorHeatTransferCoefficient = calcReactorHeatTransferCoefficient();

let reactorHeat = 0;
let fuelHeat = 0;
let fertility = 0;

const fuelUsageMult = 1;
const energyPerRadUnit = 10;
const controlRodModifier = (100 - insertionRatio) / 100;
const rawRadIntensity = fuelAmount * fuels.get(currentFuel)!.fissionEventsPerFuelUnit * controlRodModifier;
const a = fuels.get(currentFuel)!.standardReactivity;
const scaledRadIntensity = rawRadIntensity ** (a * a) * controlRodModifier ** (1 - a * a) * numControlRods ** (1 - a);
const insertion = insertionRatio / 100;
const moderationFactor = fuels.get(currentFuel)!.moderationFactor + fuels.get(currentFuel)!.moderationFactor * insertion + insertion;
const moderationFactorRecip = 1 / moderationFactor;
const currentFuelHardnessDivisor = fuels.get(currentFuel)!.hardnessDivisor;
const currentFuelHardnessRecip = 1 / fuels.get(currentFuel)!.hardnessDivisor;
const currentFuelAbsorptionCoefficient = fuels.get(currentFuel)!.absorptionCoefficient;
const currentFuelUnitsPerFissionEvent = fuels.get(currentFuel)!.fuelUnitsPerFissionEvent;

const energyPerCentigradePerUnitVol = 10;
function getEnergyFromVolAndTemp(volume: number, temperature: number) {
  return temperature * volume * energyPerCentigradePerUnitVol;
}

function getTempFromVolAndEnergy(volume: number, energy: number) {
  return energy / (volume * energyPerCentigradePerUnitVol);
}

function radiate(origin: [number, number]) {
  const radiationPenaltyBase = Math.exp(-15.0 * Math.exp(-0.0025 * fuelHeat));
  const radHardness = 0.2 + 0.8 * radiationPenaltyBase;

  const fertilityModifier = fertility > 1 ? Math.log10(fertility) + 1 : 1;
  const rawFuelUsage = ((currentFuelUnitsPerFissionEvent * rawRadIntensity) / fertilityModifier) * fuelUsageMult;

  const fuelHeatResponse = 1.0 - 0.95 * Math.exp(-10.0 * Math.exp(-0.0022 * fuelHeat));

  let effecitveRadIntensity = scaledRadIntensity * (1.0 + -0.95 * Math.exp(-10.0 * Math.exp(-0.0012 * fuelHeat)));

  let environmentEnergyAbsorption = 0;
  let fuelAbsorbedRadiation = 0;
  let fuelEnergyAbsorbed = energyPerRadUnit * effecitveRadIntensity;

  effecitveRadIntensity *= 0.25;

  for (const [dx, dz] of directions) {
    let radPacketHardness = radHardness;
    let radPacketIntensity = effecitveRadIntensity;

    let [x, z] = origin;

    for (let ttl = 4; ttl > 0; ttl--) {
      x += dx;
      z += dz;

      if (0 > x || x >= width || 0 > z || z >= depth) break;

      const currentBlock = reactorMap[z][x];
      if (currentBlock === Block.ReactorControlRod) {
        let scaledAbsorption = fuelHeatResponse * (1.0 - radPacketHardness * currentFuelHardnessRecip) * currentFuelAbsorptionCoefficient;
        if (scaledAbsorption > 1) scaledAbsorption = 1;

        const controlRodBonus = (1 - scaledAbsorption) * insertion * 0.5;
        const controlRodPenalty = scaledAbsorption * insertion * 0.5;

        const radiationAbsorbed = (scaledAbsorption + controlRodBonus) * radPacketIntensity;
        const fertilityAbsorbed = (scaledAbsorption - controlRodPenalty) * radPacketIntensity;

        radPacketIntensity -= radiationAbsorbed;
        radPacketHardness *= moderationFactorRecip;

        fuelEnergyAbsorbed += radiationAbsorbed * energyPerRadUnit;
        fuelAbsorbedRadiation += fertilityAbsorbed;
      } else {
        const moderator = moderators.get(currentBlock);
        const radiationAbsorbed = radPacketIntensity * moderator!.absorption * (1 - radPacketHardness);

        radPacketIntensity -= radiationAbsorbed;
        radPacketHardness *= moderator!.inverseModeration;
        environmentEnergyAbsorption += moderator!.heatEfficiency * radiationAbsorbed * energyPerRadUnit;
      }

      if (radPacketIntensity < 0) radPacketIntensity = 0;
    }
  }

  fertility += fuelAbsorbedRadiation;
  return {
    fuelUsage: rawFuelUsage,
    fuelHeatChange: getTempFromVolAndEnergy(numFuelRods, fuelEnergyAbsorbed),
    environmentHeatChange: getTempFromVolAndEnergy(innerReactorVolume, environmentEnergyAbsorption),
  };
}

const passiveCoolingTransferEfficiency = 0.2;
const passiveCoolingPowerEfficiency = 0.5;
const reactorHeatLossConductivity = 0.001;
const reactorHeatLossCoefficient = reactorHeatLossConductivity * exteriorSurfaceArea;
const coolantSystemHeatTransferCoefficient = 0.6 * innerSurfaceArea;

let totalEnergy = 0;
function transferHeatBetweenReactorAndCoolant() {
  const temperatureDifferential = reactorHeat - ambientTemp;
  if (temperatureDifferential > 0.01) {
    const energyTransferred = temperatureDifferential * coolantSystemHeatTransferCoefficient * passiveCoolingTransferEfficiency;
    let reactorEnergy = reactorHeat * 10 * innerReactorVolume;
    totalEnergy = energyTransferred * passiveCoolingPowerEfficiency;
    reactorEnergy -= energyTransferred;
    reactorHeat = getTempFromVolAndEnergy(innerReactorVolume, reactorEnergy);
  }
}

function performPassiveHeatLoss() {
  const temperatureDifferential = reactorHeat - ambientTemp;
  if (temperatureDifferential > 0.01) {
    const totalLost = temperatureDifferential * reactorHeatLossCoefficient;
    const energyLost = 1 > totalLost ? 1 : totalLost;
    const energyFromTemp = getEnergyFromVolAndTemp(innerReactorVolume, reactorHeat) - energyLost;
    const newEnergy = 0 > energyFromTemp ? 0 : energyFromTemp;

    reactorHeat = getTempFromVolAndEnergy(innerReactorVolume, newEnergy);
  }
}

const heatTransferFactor = reactorHeatTransferCoefficient * height;
function transferHeatBetweenFuelAndReactor() {
  const temperatureDifferential = fuelHeat - reactorHeat;
  if (temperatureDifferential > 0.01) {
    const energyTransferred = temperatureDifferential * heatTransferFactor;
    const fuelVolEnergy = getEnergyFromVolAndTemp(numFuelRods, fuelHeat) - energyTransferred;
    const reactorEnergy = getEnergyFromVolAndTemp(innerReactorVolume, reactorHeat) + energyTransferred;
    fuelHeat = getTempFromVolAndEnergy(numFuelRods, fuelVolEnergy);
    reactorHeat = getTempFromVolAndEnergy(innerReactorVolume, reactorEnergy);
  }
}

interface RadiateOutput {
  fuelUsage: number;
  fuelHeatChange: number;
  environmentHeatChange: number;
}

function update() {
  let data: RadiateOutput | null = null;
  for (const rod of rodPositions) {
    data = radiate(rod);
    fuelHeat += data.fuelHeatChange;
    reactorHeat += data.environmentHeatChange;
    fertility = Math.max(0, fertility - Math.max(0.1, fertility * 0.05));

    transferHeatBetweenFuelAndReactor();
    transferHeatBetweenReactorAndCoolant();
    performPassiveHeatLoss();
  }

  return { fuelHeat, reactorHeat, ...data };
}

function loop(_iterateAmount: number = 250) {
  let output = null;

  for (let i = 0; i < _iterateAmount; i++) {
    output = update();
  }

  console.log(`Insertion ${insertionRatio}% | Fuel heat: ${output?.fuelHeat} | Reactor heat: ${output?.reactorHeat} | Usage: ${output?.fuelUsage} | Fertility: ${fertility}`);
  const amtPerBlock = totalEnergy / innerReactorVolume;
  if (output?.fuelUsage) console.log(`Energy: ${totalEnergy} | Efficiency: ${amtPerBlock / output?.fuelUsage}`);
}

const start = performance.now();
loop(50 * 100);
console.log(`Time: ${((performance.now() - start) / 1000).toFixed(4)} seconds`);
// Time: 0.0149s
