class Reactor {
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  private insertionRatio: number;
  getInsertionRatio() {
    return this.insertionRatio;
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

  private blockCountsInLayer = new Map<Block, number>();
  getLayerBlockCounts(): ReadonlyMap<Block, number> {
    return new Map(this.blockCountsInLayer);
  }

  constructor(width: number, depth: number, height: number, insertionRatio: number, currentFuel: Fuel) {
    this.width = width;
    this.depth = depth;
    this.height = height;
    this.insertionRatio = insertionRatio;
    this.currentFuel = currentFuel;

    this.rodPositions = [];
    this.reactorMap = this.#newReactorMap(width, depth);

    this.innerReactorVolume = width * depth * height;
    this.innerSurfaceArea = 2 * (width * depth + width * height + depth * height);

    const [extWidth, extDepth, extHeight] = [width + 2, depth + 2, height + 2];

    this.exteriorSurfaceArea = 2 * (extWidth * extDepth + extWidth * extHeight + extDepth * extHeight);

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
      this.blockCountsInLayer.set(Block.FuelRod, this.blockCountsInLayer.get(Block.FuelRod)! - 1);
      this.blockCountsInLayer.set(Block.ReactorCasing, this.blockCountsInLayer.get(Block.ReactorCasing)! + 1);
    } else if (block === Block.ReactorControlRod) {
      this.rodPositions.push([x, z]);
      this.#updateNumControlRods(this.numControlRods + 1);
      this.blockCountsInLayer.set(Block.FuelRod, (this.blockCountsInLayer.get(Block.FuelRod) || 0) + 1);
      this.blockCountsInLayer.set(Block.ReactorCasing, this.blockCountsInLayer.get(Block.ReactorCasing)! - 1);
    }
    this.blockCountsInLayer.set(block, (this.blockCountsInLayer.get(block) || 0) + 1);
    this.blockCountsInLayer.set(previousBlock, this.blockCountsInLayer.get(previousBlock)! - 1);

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
    const temperatureDifferential = this.reactorHeat - Reactor.ambientTemp;
    if (temperatureDifferential > 0.01) {
      const energyTransferred = temperatureDifferential * this.coolantSystemHeatTransferCoefficient * Reactor.passiveCoolingTransferEfficiency;
      let reactorEnergy = this.reactorHeat * 10 * this.innerReactorVolume;
      this.totalEnergy = energyTransferred * Reactor.passiveCoolingPowerEfficiency;
      reactorEnergy -= energyTransferred;
      this.reactorHeat = this.#getTempFromVolAndEnergy(this.innerReactorVolume, reactorEnergy);
    }
  }

  #performPassiveHeatLoss() {
    const temperatureDifferential = this.reactorHeat - Reactor.ambientTemp;
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
    const copy = new Reactor(this.width, this.depth, this.height, this.insertionRatio, this.currentFuel);

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
}

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
]);

enum Fuel {
  Uranium = 'uranium',
  Blutonium = 'blutonium',
  Verderium = 'verderium',
}

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

function addModerator(block: Block, data: [number, number, number, number]) {
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

// const start = performance.now();
// loop(50 * 100);
// console.log(`Time: ${((performance.now() - start) / 1000).toFixed(4)} seconds`);

export { Reactor, Block, BlockNames, Fuel };
