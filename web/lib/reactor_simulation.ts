import { Block } from './blocks';
import { Fuel, fuels, setupFuels } from './fuels';
import { moderators, setupModerators } from './moderators';

// Reactor simulation logic is adapted from the Extreme Reactors 2 source code.
// This implementation condenses several behaviors and precomputes constants,
// so its structure does not directly match the original and may be harder to follow.
// If anything here is unclear, refer to the ER2 source for additional context.
class Reactor {
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  private insertionRatio: number;
  getInsertionRatio() {
    return this.insertionRatio;
  }

  private steamGenerated = 0;
  getSteamGenerated() {
    return this.steamGenerated;
  }

  private fuelHeat = 0;
  getFuelHeat() {
    return this.fuelHeat;
  }
  private reactorHeat = 0;
  getReactorHeat() {
    return this.reactorHeat;
  }
  private fertility = 0;

  private rodPositions: [number, number][];
  private reactorMap: Block[][];
  getReactorMap() {
    return this.reactorMap.map(row => [...row]);
  }

  private numControlRods = 0;
  getNumControlRods() {
    return this.numControlRods;
  }
  private numFuelRods = 0;
  getNumFuelRods() {
    return this.numFuelRods;
  }
  private fuelAmount = 0;
  getFuelAmount() {
    return this.fuelAmount;
  }

  static ambientTemp = 20;

  readonly innerReactorVolume: number = 0;
  readonly innerSurfaceArea: number;
  readonly exteriorSurfaceArea: number;
  readonly fluidCapacity: number;

  private currentFuel: Fuel;
  getCurrentFuel() {
    return this.currentFuel;
  }

  private totalEnergy = 0;
  getTotalEnergy() {
    return this.totalEnergy;
  }

  private fuelUsage = 0;
  getFuelUsage() {
    return this.fuelUsage;
  }

  private fuelUsageMult = 1;

  static energyPerRadUnit = 10;
  static energyPerCentigradePerUnitVol = 10;
  static passiveCoolingTransferEfficiency = 0.2;
  static passiveCoolingPowerEfficiency = 0.5;
  static reactorHeatLossConductivity = 0.001;

  private controlRodModifier = 0;
  private rawRadIntensity = 0;
  private scaledRadIntensity = 0;

  private insertion = 0;
  private moderationFactor = 0;
  private moderationFactorRecip = 0;

  private currentFuelHardnessRecip = 0;
  private currentFuelAbsorptionCoefficient = 0;
  private currentFuelUnitsPerFissionEvent = 0;

  private reactorHeatLossCoefficient = 0;
  private coolantSystemHeatTransferCoefficient = 0;
  private reactorHeatTransferCoefficient = 0;

  private heatTransferFactor = 0;

  private isActivelyCooled = false;
  getActivelyCooled() {
    return this.isActivelyCooled;
  }

  private blockCountsInLayer = new Map<Block, number>();
  getLayerBlockCounts(): ReadonlyMap<Block, number> {
    return new Map(this.blockCountsInLayer);
  }

  constructor(width: number, depth: number, height: number, insertionRatio: number, currentFuel: Fuel, activelyCooled: boolean) {
    this.width = width;
    this.depth = depth;
    this.height = height;
    this.insertionRatio = insertionRatio;
    this.currentFuel = currentFuel;

    this.rodPositions = [];
    this.reactorMap = this.#newReactorMap(width, depth);

    this.isActivelyCooled = activelyCooled;

    this.innerReactorVolume = width * depth * height;
    this.innerSurfaceArea = 2 * (width * depth + width * height + depth * height);

    const [extWidth, extDepth, extHeight] = [width + 2, depth + 2, height + 2];

    this.exteriorSurfaceArea = 2 * (extWidth * extDepth + extWidth * extHeight + extDepth * extHeight);

    // Max 200 B
    this.fluidCapacity = Math.min(this.exteriorSurfaceArea, 200) * 1000;

    this.#calcReactorHeatTransferCoefficient();
    this.#updateFuelConstants();
    this.reactorHeatLossCoefficient = Reactor.reactorHeatLossConductivity * this.exteriorSurfaceArea;
    this.coolantSystemHeatTransferCoefficient = 0.6 * this.innerSurfaceArea;
    this.heatTransferFactor = this.reactorHeatTransferCoefficient * this.height;

    this.blockCountsInLayer.set(Block.Air, this.width * this.depth);
    this.blockCountsInLayer.set(Block.ReactorCasing, (this.width + 2) * (this.depth + 2) * (this.height + 2) - this.innerReactorVolume - 2);
    this.blockCountsInLayer.set(Block.ReactorController, 1);
    this.blockCountsInLayer.set(Block.ReactorAccessPort, 1);
  }

  #updateFuelConstants() {
    const currentFuelData = fuels.get(this.currentFuel)!;
    const a = currentFuelData.standardReactivity;

    this.controlRodModifier = (100 - this.insertionRatio) / 100;

    this.rawRadIntensity = this.fuelAmount * currentFuelData.fissionEventsPerFuelUnit * this.controlRodModifier;

    this.scaledRadIntensity = this.rawRadIntensity ** (a * a) * this.controlRodModifier ** (1 - a * a) * this.numControlRods ** (1 - a);

    this.insertion = this.insertionRatio / 100;

    this.moderationFactor = currentFuelData.moderationFactor + currentFuelData.moderationFactor * this.insertion + this.insertion;

    this.moderationFactorRecip = 1 / this.moderationFactor;

    this.currentFuelHardnessRecip = 1 / currentFuelData.hardnessDivisor;

    this.currentFuelAbsorptionCoefficient = currentFuelData.absorptionCoefficient;

    this.currentFuelUnitsPerFissionEvent = currentFuelData.fuelUnitsPerFissionEvent;
  }

  #newReactorMap(x: number, z: number): Block[][] {
    return Array.from({ length: z }, () => Array.from({ length: x }, () => Block.Air));
  }

  setCol(z: number, x: number, block: Block) {
    if (0 > z || z >= this.depth) throw new Error('Index out of range');
    if (0 > x || x >= this.width) throw new Error('Index out of range');

    const previousBlock = this.reactorMap[z][x];
    if (block === previousBlock) return;

    if (previousBlock === Block.ReactorControlRod) {
      const idx = this.rodPositions.findIndex(([rx, rz]) => rx === x && rz === z);
      if (idx !== -1) this.rodPositions.splice(idx, 1);
      this.#updateNumControlRods(this.numControlRods - 1);
      this.blockCountsInLayer.set(Block.FuelRod, this.blockCountsInLayer.getOrInsert(Block.FuelRod, 0) - this.height);
      // vvv Offset so if a control rod is removed, the count only goes down by 1
      this.blockCountsInLayer.set(Block.ReactorControlRod, this.blockCountsInLayer.getOrInsert(Block.ReactorControlRod, 0) + this.height - 1);
      this.blockCountsInLayer.set(Block.ReactorCasing, this.blockCountsInLayer.getOrInsert(Block.ReactorCasing, 0) + 1);
    } else if (block === Block.ReactorControlRod) {
      this.rodPositions.push([x, z]);
      this.#updateNumControlRods(this.numControlRods + 1);
      this.blockCountsInLayer.set(Block.FuelRod, this.blockCountsInLayer.getOrInsert(Block.FuelRod, 0) + this.height);
      // vvv Offset so if a control rod is placed, the count only goes up by 1
      this.blockCountsInLayer.set(Block.ReactorControlRod, this.blockCountsInLayer.getOrInsert(Block.ReactorControlRod, 0) - this.height + 1);
      this.blockCountsInLayer.set(Block.ReactorCasing, this.blockCountsInLayer.getOrInsert(Block.ReactorCasing, 0) - 1);
    }
    this.blockCountsInLayer.set(block, this.blockCountsInLayer.getOrInsert(block, 0) + this.height);
    this.blockCountsInLayer.set(previousBlock, this.blockCountsInLayer.getOrInsert(previousBlock, 0) - this.height);

    this.reactorMap[z][x] = block;
    this.#calcReactorHeatTransferCoefficient();
    this.heatTransferFactor = this.reactorHeatTransferCoefficient * this.height;
  }

  #updateNumControlRods(amount: number) {
    this.numControlRods = amount;
    this.numFuelRods = this.numControlRods * this.height;
    this.fuelAmount = this.numFuelRods * 4000;

    this.#calcReactorHeatTransferCoefficient();
    this.heatTransferFactor = this.reactorHeatTransferCoefficient * this.height;

    this.#updateFuelConstants();
  }

  #calcReactorHeatTransferCoefficient() {
    let output = 0;
    for (const [x, z] of this.rodPositions) {
      for (const [dx, dz] of directions) {
        const nx = x + dx;
        const nz = z + dz;

        if (0 > nx || nx >= this.width || 0 > nz || nz >= this.depth) {
          output += moderators.get(Block.Iron)!.heatConductivity;
        } else if (this.reactorMap[nz][nx] === Block.ReactorControlRod) {
          output += moderators.get(Block.Air)!.heatConductivity;
        } else {
          output += moderators.get(this.reactorMap[nz][nx])!.heatConductivity;
        }
      }
    }

    this.reactorHeatTransferCoefficient = output;
  }

  #getEnergyFromVolAndTemp(volume: number, temperature: number) {
    return temperature * volume * Reactor.energyPerCentigradePerUnitVol;
  }

  #getTempFromVolAndEnergy(volume: number, energy: number) {
    return energy / (volume * Reactor.energyPerCentigradePerUnitVol);
  }

  #radiate(origin: [number, number]) {
    const radiationPenaltyBase = Math.exp(-15.0 * Math.exp(-0.0025 * this.fuelHeat));
    const radHardness = 0.2 + 0.8 * radiationPenaltyBase;

    const fertilityModifier = this.fertility > 1 ? Math.log10(this.fertility) + 1 : 1;
    const rawFuelUsage = ((this.currentFuelUnitsPerFissionEvent * this.rawRadIntensity) / fertilityModifier) * this.fuelUsageMult;

    const fuelHeatResponse = 1.0 - 0.95 * Math.exp(-10.0 * Math.exp(-0.0022 * this.fuelHeat));

    let effecitveRadIntensity = this.scaledRadIntensity * (1.0 + -0.95 * Math.exp(-10.0 * Math.exp(-0.0012 * this.fuelHeat)));

    let environmentEnergyAbsorption = 0;
    let fuelAbsorbedRadiation = 0;
    let fuelEnergyAbsorbed = Reactor.energyPerRadUnit * effecitveRadIntensity;

    effecitveRadIntensity *= 0.25;

    for (const [dx, dz] of directions) {
      let radPacketHardness = radHardness;
      let radPacketIntensity = effecitveRadIntensity;

      let [x, z] = origin;

      for (let ttl = 4; ttl > 0; ttl--) {
        x += dx;
        z += dz;

        if (0 > x || x >= this.width || 0 > z || z >= this.depth) break;

        const currentBlock = this.reactorMap[z][x];
        if (currentBlock === Block.ReactorControlRod) {
          let scaledAbsorption = fuelHeatResponse * (1.0 - radPacketHardness * this.currentFuelHardnessRecip) * this.currentFuelAbsorptionCoefficient;
          if (scaledAbsorption > 1) scaledAbsorption = 1;

          const controlRodBonus = (1 - scaledAbsorption) * this.insertion * 0.5;
          const controlRodPenalty = scaledAbsorption * this.insertion * 0.5;

          const radiationAbsorbed = (scaledAbsorption + controlRodBonus) * radPacketIntensity;
          const fertilityAbsorbed = (scaledAbsorption - controlRodPenalty) * radPacketIntensity;

          radPacketIntensity -= radiationAbsorbed;
          radPacketHardness *= this.moderationFactorRecip;

          fuelEnergyAbsorbed += radiationAbsorbed * Reactor.energyPerRadUnit;
          fuelAbsorbedRadiation += fertilityAbsorbed;
        } else {
          const moderator = moderators.get(currentBlock);
          const radiationAbsorbed = radPacketIntensity * moderator!.absorption * (1 - radPacketHardness);

          radPacketIntensity -= radiationAbsorbed;
          radPacketHardness *= moderator!.inverseModeration;
          environmentEnergyAbsorption += moderator!.heatEfficiency * radiationAbsorbed * Reactor.energyPerRadUnit;
        }

        if (radPacketIntensity < 0) radPacketIntensity = 0;
      }
    }

    this.fertility += fuelAbsorbedRadiation;
    // console.log(this.fuelUsage);
    return {
      fuelUsage: rawFuelUsage,
      fuelHeatChange: this.#getTempFromVolAndEnergy(this.numFuelRods, fuelEnergyAbsorbed),
      environmentHeatChange: this.#getTempFromVolAndEnergy(this.innerReactorVolume, environmentEnergyAbsorption),
    };
  }

  #transferHeatBetweenReactorAndCoolant() {
    // 100 is boiling point for water
    const tempToRemove = this.isActivelyCooled ? Math.min(this.reactorHeat, 100) : Reactor.ambientTemp;
    const temperatureDifferential = this.reactorHeat - tempToRemove;
    const energyTransferred = temperatureDifferential * this.coolantSystemHeatTransferCoefficient * (this.isActivelyCooled ? 1 : Reactor.passiveCoolingTransferEfficiency);
    const reactorEnergy = this.reactorHeat * 10 * this.innerReactorVolume;

    if (temperatureDifferential > 0.01) {
      // if (!this.isActivelyCooled) {
      this.totalEnergy = energyTransferred * Reactor.passiveCoolingPowerEfficiency;
      // } else {
      this.steamGenerated = Math.min(this.fluidCapacity, energyTransferred * 0.25);
      // }

      this.reactorHeat = this.#getTempFromVolAndEnergy(this.innerReactorVolume, reactorEnergy - energyTransferred);
    }
  }

  #performPassiveHeatLoss() {
    // 100 is boiling point for water
    const tempToRemove = this.isActivelyCooled ? Math.min(this.reactorHeat, 100) : Reactor.ambientTemp;
    const temperatureDifferential = this.reactorHeat - tempToRemove;

    if (temperatureDifferential > 0.01) {
      const totalLost = temperatureDifferential * this.reactorHeatLossCoefficient;
      const energyLost = 1 > totalLost ? 1 : totalLost;
      const energyFromTemp = this.#getEnergyFromVolAndTemp(this.innerReactorVolume, this.reactorHeat) - energyLost;
      const newEnergy = 0 > energyFromTemp ? 0 : energyFromTemp;

      this.reactorHeat = this.#getTempFromVolAndEnergy(this.innerReactorVolume, newEnergy);
    }
  }

  #transferHeatBetweenFuelAndReactor() {
    const temperatureDifferential = this.fuelHeat - this.reactorHeat;
    if (temperatureDifferential > 0.01) {
      const energyTransferred = temperatureDifferential * this.heatTransferFactor;
      const fuelVolEnergy = this.#getEnergyFromVolAndTemp(this.numFuelRods, this.fuelHeat) - energyTransferred;
      const reactorEnergy = this.#getEnergyFromVolAndTemp(this.innerReactorVolume, this.reactorHeat) + energyTransferred;
      this.fuelHeat = this.#getTempFromVolAndEnergy(this.numFuelRods, fuelVolEnergy);
      this.reactorHeat = this.#getTempFromVolAndEnergy(this.innerReactorVolume, reactorEnergy);
    }
  }

  #update() {
    let data: RadiateOutput | null = null;
    for (const rod of this.rodPositions) {
      data = this.#radiate(rod);
      this.fuelHeat += data.fuelHeatChange;
      this.reactorHeat += data.environmentHeatChange;
      this.fertility = Math.max(0, this.fertility - Math.max(0.1, this.fertility * 0.05));

      this.#transferHeatBetweenFuelAndReactor();
      this.#transferHeatBetweenReactorAndCoolant();
      this.#performPassiveHeatLoss();
    }

    return { fuelHeat: this.fuelHeat, reactorHeat: this.reactorHeat, ...data };
  }

  #nearlyEqual(a: number, b: number, epsilon = 1e-5) {
    return Math.abs(a - b) < epsilon;
  }

  simulate(_maxIterateAmount: number = 1500) {
    const start = performance.now();
    let output = null;
    let previousOutput = null;

    if (this.insertionRatio === 100) {
      this.steamGenerated = 0;
      return;
    }

    for (let i = 0; i < _maxIterateAmount; i++) {
      output = this.#update();
      if (this.#nearlyEqual(output.fuelHeat, previousOutput?.fuelHeat || 0)) {
        // This stops early when values are very similar, indicating it is close to a stable state, saving a lot of time with many control rods.
        // This may cause some very small inaccuracies compared to full simulations.
        // For example, 300ms went down to 11ms. 1500 iterations to 48 iterations. Tons of control rods, while results stayed nearly the same
        break;
      }
      previousOutput = output;
    }

    this.fuelUsage = output?.fuelUsage || 0;
    console.log(`Simulation time: ${performance.now() - start} ms`);
  }

  clone(): Reactor {
    const copy = new Reactor(this.width, this.depth, this.height, this.insertionRatio, this.currentFuel, this.isActivelyCooled);

    copy.fuelHeat = this.fuelHeat;
    copy.reactorHeat = this.reactorHeat;
    copy.fertility = this.fertility;

    copy.numControlRods = this.numControlRods;
    copy.numFuelRods = this.numFuelRods;
    copy.fuelAmount = this.fuelAmount;

    copy.totalEnergy = this.totalEnergy;
    copy.fuelUsageMult = this.fuelUsageMult;

    copy.fuelUsage = this.fuelUsage;

    copy.rodPositions = this.rodPositions.map(([x, z]) => [x, z]);

    copy.reactorMap = this.reactorMap.map(row => [...row]);

    copy.reactorHeatLossCoefficient = this.reactorHeatLossCoefficient;
    copy.coolantSystemHeatTransferCoefficient = this.coolantSystemHeatTransferCoefficient;
    copy.reactorHeatTransferCoefficient = this.reactorHeatTransferCoefficient;
    copy.heatTransferFactor = this.heatTransferFactor;

    copy.steamGenerated = this.steamGenerated;

    copy.#updateFuelConstants();

    copy.blockCountsInLayer = new Map(this.blockCountsInLayer);

    return copy;
  }

  reset() {
    this.totalEnergy = 0;
    this.fertility = 0;
    this.fuelHeat = 0;
    this.reactorHeat = 0;
    this.fuelUsage = 0;
  }

  updateInsertionRatio(newInsertionRatio: number) {
    if (newInsertionRatio < 0 || newInsertionRatio > 100) return;
    this.insertionRatio = newInsertionRatio;
    this.#updateFuelConstants();
    this.reset();
    this.simulate();
  }

  updateActivelyCooled(activelyCooled: boolean) {
    this.isActivelyCooled = activelyCooled;
    this.#updateFuelConstants();
    this.reset();
    this.simulate();
  }
}

setupModerators();
setupFuels();

const directions: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

interface RadiateOutput {
  fuelUsage: number;
  fuelHeatChange: number;
  environmentHeatChange: number;
}

export { Reactor };
