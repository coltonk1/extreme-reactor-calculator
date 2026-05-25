import { Block } from './blocks';
import { Fuel, fuels } from './fuels';
import { moderators } from './moderators';

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

// Reactor simulation logic is adapted from the Extreme Reactors 2 source code.
// Many systems were simplified, reorganized, renamed, or precomputed for performance,
// so the structure does not directly match the source and may be harder to follow.
// If anything here is unclear, refer to the ER2 source for additional context.
export class Reactor {
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  readonly innerReactorVolume: number = 0;
  readonly innerSurfaceArea: number;
  readonly exteriorSurfaceArea: number;
  readonly fluidCapacity: number;
  readonly currentFuel: Fuel;

  static ambientTemp = 20;
  static energyPerRadUnit = 10;
  static energyPerCentigradePerUnitVol = 10;
  static passiveCoolingTransferEfficiency = 0.2;
  static passiveCoolingPowerEfficiency = 0.5;
  static reactorHeatLossConductivity = 0.001;

  private _insertionRatio: number;
  private _steamGenerated = 0;
  private _fuelHeat = 0;
  private _reactorHeat = 0;
  private _reactorMap: Block[][];
  private _numControlRods = 0;
  private _numFuelRods = 0;
  private _fuelAmount = 0;
  private _totalEnergy = 0;
  private _fuelUsage = 0;
  private _isActivelyCooled = false;
  private _blockCounts = new Map<Block, number>();

  get insertionRatio() {
    return this._insertionRatio;
  }
  get steamGenerated() {
    return this._steamGenerated;
  }
  get fuelHeat() {
    return this._fuelHeat;
  }
  get reactorHeat() {
    return this._reactorHeat;
  }
  get reactorMap() {
    return this._reactorMap.map(row => [...row]);
  }
  get numControlRods() {
    return this._numControlRods;
  }
  get numFuelRods() {
    return this._numFuelRods;
  }
  get fuelAmount() {
    return this._fuelAmount;
  }
  get totalEnergy() {
    return this._totalEnergy;
  }
  get fuelUsage() {
    return this._fuelUsage;
  }
  get isActivelyCooled() {
    return this._isActivelyCooled;
  }
  get blockCounts(): ReadonlyMap<Block, number> {
    return new Map(this._blockCounts);
  }

  private fertility = 0;
  private controlRodPositions: [number, number][];
  private fuelUsageMult = 1;

  // Precomputed constants for faster simulation
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

  constructor(width: number, depth: number, height: number, insertionRatio: number, currentFuel: Fuel, activelyCooled: boolean) {
    this.width = width;
    this.depth = depth;
    this.height = height;
    this.currentFuel = currentFuel;
    this._insertionRatio = insertionRatio;
    this._isActivelyCooled = activelyCooled;

    this.controlRodPositions = [];
    this._reactorMap = this.createReactorMap(width, depth);

    this.innerReactorVolume = width * depth * height;

    const [extWidth, extDepth, extHeight] = [width + 2, depth + 2, height + 2];

    this.innerSurfaceArea = this.calcSurfaceArea(width, depth, height);
    this.exteriorSurfaceArea = this.calcSurfaceArea(extWidth, extDepth, extHeight);

    this.fluidCapacity = Math.min(this.exteriorSurfaceArea, 200) * 1000; // Max 200 B

    this.recalculateHeatTransfer();
    this.recalculateFuelConstants();
    this.reactorHeatLossCoefficient = Reactor.reactorHeatLossConductivity * this.exteriorSurfaceArea;
    this.coolantSystemHeatTransferCoefficient = 0.6 * this.innerSurfaceArea;

    // Initialize block counts
    this.incrementBlockCount(Block.Air, this.innerReactorVolume);
    this.incrementBlockCount(Block.ReactorCasing, extWidth * extDepth * extHeight - this.innerReactorVolume - 2);
    this.incrementBlockCount(Block.ReactorController, 1);
    this.incrementBlockCount(Block.ReactorAccessPort, 1);
  }

  setBlock(z: number, x: number, block: Block) {
    const outOfBounds = 0 > z || z >= this.depth || 0 > x || x >= this.width;
    if (outOfBounds) throw new Error('Index out of range');

    const previousBlock = this._reactorMap[z][x];
    if (block === previousBlock) return;

    // Remove previous block counts
    if (previousBlock === Block.ReactorControlRod) this.removeControlRod(x, z);
    else this.incrementBlockCount(previousBlock, -this.height);

    // Add new block counts
    if (block === Block.ReactorControlRod) this.addControlRod(x, z);
    else this.incrementBlockCount(block, this.height);

    this._reactorMap[z][x] = block;
    this.recalculateHeatTransfer();
  }

  simulate(_maxIterateAmount: number = 1500) {
    const start = performance.now();
    let output = null;
    let previousOutput = null;

    if (this._insertionRatio === 100) {
      this._steamGenerated = 0;
      return;
    }

    for (let i = 0; i < _maxIterateAmount; i++) {
      output = this.simulateTick();

      // This may cause some very small inaccuracies compared to full simulations, but is worth it for performance.
      if (this.isNearlyEqual(output.fuelHeat, previousOutput?.fuelHeat || 0)) break;

      previousOutput = output;
    }

    this._fuelUsage = output?.fuelUsage || 0;
    console.log(`Simulation time: ${performance.now() - start} ms`);
  }

  clone(): Reactor {
    const copy = new Reactor(this.width, this.depth, this.height, this._insertionRatio, this.currentFuel, this._isActivelyCooled);

    copy._fuelHeat = this._fuelHeat;
    copy._reactorHeat = this._reactorHeat;
    copy._numControlRods = this._numControlRods;
    copy._numFuelRods = this._numFuelRods;
    copy._fuelAmount = this._fuelAmount;
    copy._totalEnergy = this._totalEnergy;
    copy._fuelUsage = this._fuelUsage;
    copy._reactorMap = this._reactorMap.map(row => [...row]);
    copy._steamGenerated = this._steamGenerated;
    copy._blockCounts = new Map(this._blockCounts);

    copy.fertility = this.fertility;
    copy.fuelUsageMult = this.fuelUsageMult;
    copy.controlRodPositions = this.controlRodPositions.map(([x, z]) => [x, z]);
    copy.reactorHeatLossCoefficient = this.reactorHeatLossCoefficient;
    copy.coolantSystemHeatTransferCoefficient = this.coolantSystemHeatTransferCoefficient;
    copy.reactorHeatTransferCoefficient = this.reactorHeatTransferCoefficient;
    copy.heatTransferFactor = this.heatTransferFactor;

    copy.recalculateFuelConstants();

    return copy;
  }

  reset() {
    this._totalEnergy = 0;
    this.fertility = 0;
    this._fuelHeat = 0;
    this._reactorHeat = 0;
    this._fuelUsage = 0;
  }

  updateInsertionRatio(newInsertionRatio: number) {
    if (newInsertionRatio < 0 || newInsertionRatio > 100) return;
    this._insertionRatio = newInsertionRatio;
    this.recalculateFuelConstants();
    this.reset();
    this.simulate();
  }

  updateActivelyCooled(activelyCooled: boolean) {
    this._isActivelyCooled = activelyCooled;
    this.recalculateFuelConstants();
    this.reset();
    this.simulate();
  }

  private createReactorMap(x: number, z: number): Block[][] {
    return Array.from({ length: z }, () => Array.from({ length: x }, () => Block.Air));
  }

  private calcSurfaceArea(w: number, d: number, h: number) {
    return 2 * (w * d + w * h + d * h);
  }

  private incrementBlockCount(block: Block, amount: number) {
    this._blockCounts.set(block, (this._blockCounts.get(block) ?? 0) + amount);
  }

  private isNearlyEqual(a: number, b: number, epsilon = 1e-5) {
    return Math.abs(a - b) < epsilon;
  }

  private updateNumControlRods(amount: number) {
    this._numControlRods = amount;
    this._numFuelRods = this._numControlRods * this.height;
    this._fuelAmount = this._numFuelRods * 4000; // Each rod is worth 4 B of fuel

    this.recalculateHeatTransfer();
    this.recalculateFuelConstants();
  }

  private removeControlRod(x: number, z: number) {
    const idx = this.controlRodPositions.findIndex(([rx, rz]) => rx === x && rz === z);
    if (idx !== -1) this.controlRodPositions.splice(idx, 1);

    this.updateNumControlRods(this._numControlRods - 1);

    this.incrementBlockCount(Block.FuelRod, -this.height);
    this.incrementBlockCount(Block.ReactorControlRod, -1);
    this.incrementBlockCount(Block.ReactorCasing, 1);
  }

  private addControlRod(x: number, z: number) {
    this.controlRodPositions.push([x, z]);
    this.updateNumControlRods(this._numControlRods + 1);

    this.incrementBlockCount(Block.FuelRod, this.height);
    this.incrementBlockCount(Block.ReactorControlRod, 1);
    this.incrementBlockCount(Block.ReactorCasing, -1);
  }

  private recalculateFuelConstants() {
    const currentFuelData = fuels.get(this.currentFuel)!;
    const reactivity = currentFuelData.standardReactivity;

    this.insertion = this._insertionRatio / 100;
    this.controlRodModifier = 1 - this.insertion;

    this.rawRadIntensity = this._fuelAmount * currentFuelData.fissionEventsPerFuelUnit * this.controlRodModifier;

    this.scaledRadIntensity = this.rawRadIntensity ** (reactivity * reactivity) * this.controlRodModifier ** (1 - reactivity * reactivity) * this._numControlRods ** (1 - reactivity);

    this.moderationFactor = currentFuelData.moderationFactor + currentFuelData.moderationFactor * this.insertion + this.insertion;

    this.moderationFactorRecip = 1 / this.moderationFactor;
    this.currentFuelHardnessRecip = 1 / currentFuelData.hardnessDivisor;
    this.currentFuelAbsorptionCoefficient = currentFuelData.absorptionCoefficient;
    this.currentFuelUnitsPerFissionEvent = currentFuelData.fuelUnitsPerFissionEvent;
  }

  private recalculateHeatTransfer() {
    let output = 0;

    for (const [x, z] of this.controlRodPositions) {
      for (const [dx, dz] of directions) {
        const nx = x + dx;
        const nz = z + dz;
        const isOutOfBounds = 0 > nx || nx >= this.width || 0 > nz || nz >= this.depth;

        if (isOutOfBounds) output += moderators.get(Block.Iron)!.heatConductivity;
        else if (this._reactorMap[nz][nx] === Block.ReactorControlRod) output += moderators.get(Block.Air)!.heatConductivity;
        else output += moderators.get(this._reactorMap[nz][nx])!.heatConductivity;
      }
    }

    this.reactorHeatTransferCoefficient = output;
    this.heatTransferFactor = this.reactorHeatTransferCoefficient * this.height;
  }

  private calcEnergyFromVolAndTemp(volume: number, temperature: number) {
    return temperature * volume * Reactor.energyPerCentigradePerUnitVol;
  }

  private calcTempFromVolAndEnergy(volume: number, energy: number) {
    return energy / (volume * Reactor.energyPerCentigradePerUnitVol);
  }

  private radiate(origin: [number, number]) {
    const radiationPenaltyBase = Math.exp(-15.0 * Math.exp(-0.0025 * this._fuelHeat));
    const radHardness = 0.2 + 0.8 * radiationPenaltyBase;

    const fertilityModifier = this.fertility > 1 ? Math.log10(this.fertility) + 1 : 1;
    const rawFuelUsage = ((this.currentFuelUnitsPerFissionEvent * this.rawRadIntensity) / fertilityModifier) * this.fuelUsageMult;

    const fuelHeatResponse = 1.0 - 0.95 * Math.exp(-10.0 * Math.exp(-0.0022 * this._fuelHeat));

    let effectiveRadIntensity = this.scaledRadIntensity * (1.0 + -0.95 * Math.exp(-10.0 * Math.exp(-0.0012 * this._fuelHeat)));

    let environmentEnergyAbsorption = 0;
    let fuelAbsorbedRadiation = 0;
    let fuelEnergyAbsorbed = Reactor.energyPerRadUnit * effectiveRadIntensity;

    effectiveRadIntensity *= 0.25;

    for (const [dx, dz] of directions) {
      let radPacketHardness = radHardness;
      let radPacketIntensity = effectiveRadIntensity;

      let [x, z] = origin;

      for (let ttl = 4; ttl > 0; ttl--) {
        x += dx;
        z += dz;

        if (0 > x || x >= this.width || 0 > z || z >= this.depth) break;

        const currentBlock = this._reactorMap[z][x];
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

    return {
      fuelUsage: rawFuelUsage,
      fuelHeatChange: this.calcTempFromVolAndEnergy(this._numFuelRods, fuelEnergyAbsorbed),
      environmentHeatChange: this.calcTempFromVolAndEnergy(this.innerReactorVolume, environmentEnergyAbsorption),
    };
  }

  private transferHeatBetweenReactorAndCoolant() {
    const tempToRemove = this._isActivelyCooled ? Math.min(this.reactorHeat, 100) : Reactor.ambientTemp; // 100 is boiling point for water
    const temperatureDifferential = this._reactorHeat - tempToRemove;
    const energyTransferred = temperatureDifferential * this.coolantSystemHeatTransferCoefficient * (this._isActivelyCooled ? 1 : Reactor.passiveCoolingTransferEfficiency);
    const reactorEnergy = this._reactorHeat * 10 * this.innerReactorVolume;

    if (temperatureDifferential > 0.01) {
      this._totalEnergy = energyTransferred * Reactor.passiveCoolingPowerEfficiency;
      this._steamGenerated = Math.min(this.fluidCapacity, energyTransferred * 0.25);
      this._reactorHeat = this.calcTempFromVolAndEnergy(this.innerReactorVolume, reactorEnergy - energyTransferred);
    }
  }

  private performPassiveHeatLoss() {
    const tempToRemove = this._isActivelyCooled ? Math.min(this.reactorHeat, 100) : Reactor.ambientTemp; // 100 is boiling point for water
    const temperatureDifferential = this._reactorHeat - tempToRemove;

    if (temperatureDifferential > 0.01) {
      const totalLost = temperatureDifferential * this.reactorHeatLossCoefficient;
      const energyLost = 1 > totalLost ? 1 : totalLost;

      const energyFromTemp = this.calcEnergyFromVolAndTemp(this.innerReactorVolume, this._reactorHeat) - energyLost;
      const newEnergy = 0 > energyFromTemp ? 0 : energyFromTemp;

      this._reactorHeat = this.calcTempFromVolAndEnergy(this.innerReactorVolume, newEnergy);
    }
  }

  private transferHeatBetweenFuelAndReactor() {
    const temperatureDifferential = this._fuelHeat - this.reactorHeat;

    if (temperatureDifferential > 0.01) {
      const energyTransferred = temperatureDifferential * this.heatTransferFactor;

      const fuelVolEnergy = this.calcEnergyFromVolAndTemp(this._numFuelRods, this._fuelHeat) - energyTransferred;
      const reactorEnergy = this.calcEnergyFromVolAndTemp(this.innerReactorVolume, this._reactorHeat) + energyTransferred;

      this._fuelHeat = this.calcTempFromVolAndEnergy(this._numFuelRods, fuelVolEnergy);
      this._reactorHeat = this.calcTempFromVolAndEnergy(this.innerReactorVolume, reactorEnergy);
    }
  }

  private simulateTick() {
    let data: RadiateOutput | null = null;
    for (const rod of this.controlRodPositions) {
      data = this.radiate(rod);
      this._fuelHeat += data.fuelHeatChange;
      this._reactorHeat += data.environmentHeatChange;
      this.fertility = Math.max(0, this.fertility - Math.max(0.1, this.fertility * 0.05));

      this.transferHeatBetweenFuelAndReactor();
      this.transferHeatBetweenReactorAndCoolant();
      this.performPassiveHeatLoss();
    }

    return { fuelHeat: this._fuelHeat, reactorHeat: this.reactorHeat, ...data };
  }
}
