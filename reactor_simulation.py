from enum import StrEnum
import math
import time

class Block(StrEnum):
    Air = "air"
    Copper = "copper"
    ReactorControlRod = "reactorcontrolrod"
    Iron = "iron"
    Gold = "gold"

xLength = 6
zLength = 5

reactorMap = [[Block.Air for _ in range(xLength)] for _ in range(zLength)]
reactorInnerHeight = 7
insertionRatio = 50 # %

rodPositions = set()

def setColumn(z: int, x: int, block: Block):
    if not 0 <= z < zLength: raise IndexError(f"Index out of range | z: {z} | z length: {zLength}")
    if not 0 <= x < xLength: raise IndexError(f"Index out of range | x: {x} | x length: {xLength}")

    previousBlock = reactorMap[z][x]
    if block == previousBlock: return

    if previousBlock == Block.ReactorControlRod: rodPositions.remove((x, z))
    elif block == Block.ReactorControlRod: rodPositions.add((x, z))
    
    reactorMap[z][x] = block

setColumn(3, 3, Block.ReactorControlRod)
setColumn(3, 1, Block.ReactorControlRod)
setColumn(0, 4, Block.ReactorControlRod)
setColumn(1, 3, Block.ReactorControlRod)
setColumn(0, 0, Block.ReactorControlRod)
setColumn(3, 5, Block.ReactorControlRod)
setColumn(1, 0, Block.Iron)
setColumn(2, 0, Block.Iron)
setColumn(3, 0, Block.Iron)
setColumn(4, 0, Block.Iron)
setColumn(1, 2, Block.Iron)
setColumn(3, 2, Block.Iron)
setColumn(2, 3, Block.Iron)
setColumn(1, 1, Block.Gold)

def getRodPositions():
    return rodPositions

controlRodAmount = len(getRodPositions())

def getControlRodCount():
    return controlRodAmount

numControlRods = getControlRodCount()
numFuelRods = numControlRods * reactorInnerHeight

# Amount in mB (4 ingots per fuel rod)
fuelAmount = 4000 * numFuelRods

width = len(reactorMap[0])
depth = len(reactorMap)
height = reactorInnerHeight

reactorVolume = width * height * depth

internalSurfaceArea = 2 * (
    width * depth +
    width * height +
    depth * height
)

ext_width = width + 2
ext_depth = depth + 2
ext_height = height + 2

externalSurfaceArea = 2 * (
    ext_width * ext_depth +
    ext_width * ext_height +
    ext_depth * ext_height
)
AMBIENT_TEMPERATURE = 20

# absorption, heatEfficiency, inverse-moderation, heatConductivity
faster_moderators = {
    Block.Iron: (0.5, 0.75, 1 / 1.4, 0.6),
    Block.Air: (0.1, 0.25, 1 / 1.1, 0.05),
    Block.Gold: (0.52, 0.80, 1 / 1.45, 2),
    Block.Copper: (0.50, 0.75, 1 / 1.40, 1),
}
fuel = {
    "uranium": {
        "moderationFactor": 1.5, 
        "absorptionCoefficient": 0.5, 
        "hardnessDivisor": 1.0, 
        "fissionEventsPerFuelUnit": 0.01, 
        "fuelUnitsPerFissionEvent": 0.0007, 
        "standardReactivity": 1.05, 
        "standardFissionRate": 0.01
        }
}

currentFuel = fuel["uranium"]

DIRECTIONS = ((0,1),(1,0),(0,-1),(-1,0))
REACTOR_HEAT_TRANSFER_COEFFICIENT = 0
def calculateReactorHeatTransferCoefficient():
    global REACTOR_HEAT_TRANSFER_COEFFICIENT
    for rod in getRodPositions():
        for direction in DIRECTIONS:
            currentPos = (rod[0] + direction[0], rod[1] + direction[1])
            if (currentPos[0] < 0 or currentPos[0] >= len(reactorMap[0]) or
                currentPos[1] < 0 or currentPos[1] >= len(reactorMap)):
                REACTOR_HEAT_TRANSFER_COEFFICIENT += faster_moderators[Block.Iron][3]
                continue
            if reactorMap[currentPos[1]][currentPos[0]] == Block.ReactorControlRod:
                REACTOR_HEAT_TRANSFER_COEFFICIENT += faster_moderators[Block.Air][3]
                continue
            REACTOR_HEAT_TRANSFER_COEFFICIENT += faster_moderators[reactorMap[currentPos[1]][currentPos[0]]][3]

calculateReactorHeatTransferCoefficient()

reactorHeat = 0
fuelHeat = 0
fertility = 0

FUEL_USAGE_MULTIPLIER = 1
ENERGY_PER_RADIATION_UNIT = 10

rawRadIntensity = fuelAmount * currentFuel["fissionEventsPerFuelUnit"]
controlRodModifier = (100 - insertionRatio) / 100
# scaledRadIntensity = rawRadIntensity ** currentFuel["standardReactivity"]
# scaledRadIntensity = ((scaledRadIntensity / numControlRods) ** (currentFuel["standardReactivity"])) * numControlRods
# scaledRadIntensity = scaledRadIntensity * controlRodModifier
rawRadIntensity = rawRadIntensity * controlRodModifier
a = currentFuel["standardReactivity"]
scaledRadIntensity = rawRadIntensity ** (a * a) * controlRodModifier ** (1 - a * a) * numControlRods ** (1 - a)
insertion = insertionRatio / 100
moderationFactor = currentFuel["moderationFactor"]
moderationFactor += moderationFactor * insertion + insertion
moderationFactorRecip = 1 / moderationFactor
currentFuelHardnessDivisor = currentFuel["hardnessDivisor"]
currentFuelHardnessReciprocal = 1 / currentFuel["hardnessDivisor"]
currentFuelAbsorptionCoefficient = currentFuel["absorptionCoefficient"]
currentFuelUnitsPerFissionEvent = currentFuel["fuelUnitsPerFissionEvent"]

def radiate(origin):
    global fertility, fuelHeat
    
    radiationPenaltyBase = math.exp(-15.0 * math.exp(-0.0025 * fuelHeat))
    effectiveRadIntensity = scaledRadIntensity * (1.0 + (-0.95 * math.exp(-10.0 * math.exp(-0.0012 * fuelHeat))))
    fuelHeatResponse = (1.0 - (0.95 * math.exp(-10.0 * math.exp(-0.0022 * fuelHeat))))

    radHardness = 0.2 + (0.8 * radiationPenaltyBase)
    fertilityModifier = math.log10(fertility) + 1 if fertility > 1 else 1
    rawFuelUsage = (currentFuelUnitsPerFissionEvent * rawRadIntensity / fertilityModifier) * FUEL_USAGE_MULTIPLIER
    
    environmentEnergyAbsorption = 0
    fuelAbsorbedRadiation = 0
    fuelEnergyAbsorbed = ENERGY_PER_RADIATION_UNIT * effectiveRadIntensity

    effectiveRadIntensity *= 0.25

    for dx, dz in DIRECTIONS:
        radPacketHardness = radHardness
        radPacketIntensity = effectiveRadIntensity

        ttl = 4
        x, z = origin

        while ttl > 0:
            ttl -= 1
            x += dx
            z += dz

            if not 0 <= x < xLength or not 0 <= z < zLength: break
            
            currentBlock = reactorMap[z][x]
            if currentBlock == Block.ReactorControlRod:
                # Moderate radiation
                baseAbsorption = fuelHeatResponse * (1.0 - (radPacketHardness * currentFuelHardnessReciprocal))
                scaledAbsorption = baseAbsorption * currentFuelAbsorptionCoefficient
                if scaledAbsorption > 1.0: scaledAbsorption = 1.0

                controlRodBonus = (1.0 - scaledAbsorption) * insertion * 0.5
                controlRodPenalty = scaledAbsorption * insertion * 0.5

                radiationAbsorbed = (scaledAbsorption + controlRodBonus) * radPacketIntensity
                fertilityAbsorbed = (scaledAbsorption - controlRodPenalty) * radPacketIntensity

                radPacketIntensity -= radiationAbsorbed
                if radPacketIntensity < 0: radPacketIntensity = 0
                radPacketHardness *= moderationFactorRecip

                fuelEnergyAbsorbed += radiationAbsorbed * ENERGY_PER_RADIATION_UNIT
                fuelAbsorbedRadiation += fertilityAbsorbed
            else:
                absorption, heatEff, hardnessRecip, _ = faster_moderators[currentBlock]
                # Apply moderator
                radiationAbsorbed = radPacketIntensity * absorption * (1.0 - radPacketHardness)

                radPacketIntensity -= radiationAbsorbed
                if radPacketIntensity < 0: radPacketIntensity = 0
                radPacketHardness *= hardnessRecip

                environmentEnergyAbsorption += heatEff * radiationAbsorbed * ENERGY_PER_RADIATION_UNIT
            
    fertility += fuelAbsorbedRadiation
    
    return {
        "fuelUsage": rawFuelUsage,
        # "environmentEnergyAbsorption": environmentEnergyAbsorption,
        # "fuelAsborbedRadiation": fuelAbsorbedRadiation,
        # "fuelEnergyAbsorption": fuelEnergyAbsorbed,
        "fuelHeatChange": getTemperatureFromVolumeAndEnergy(numFuelRods, fuelEnergyAbsorbed),
        "environmentHeatChange": getTemperatureFromVolumeAndEnergy(reactorVolume, environmentEnergyAbsorption)
    }

ENERGY_PER_CENTIGRADE_PER_UNIT_VOLUME = 10
def getEnergyFromVolumeAndTemperature(volume, temperature):
    return temperature * volume * ENERGY_PER_CENTIGRADE_PER_UNIT_VOLUME

def getTemperatureFromVolumeAndEnergy(volume, energy):
    return energy / (volume * ENERGY_PER_CENTIGRADE_PER_UNIT_VOLUME)


PASSIVE_COOLING_TRANSFER_EFFICIENCY = 0.2
PASSIVE_COOLING_POWER_EFFICIENCY = 0.5
REACTOR_HEAT_LOSS_CONDUCTIVITY = 0.001
REACTOR_HEAT_LOSS_COEFFICIENT = REACTOR_HEAT_LOSS_CONDUCTIVITY * externalSurfaceArea
COOLANT_SYSTEM_HEAT_TRANSFER_COEFFICIENT = 0.6 * internalSurfaceArea
exposed_sides = 2

total_energy = 0

def transferHeatBetweenReactorAndCoolant():
    global reactorHeat, total_energy
    temperatureDifferential = reactorHeat - AMBIENT_TEMPERATURE

    if temperatureDifferential > 0.01:
        energyTransferred = temperatureDifferential * COOLANT_SYSTEM_HEAT_TRANSFER_COEFFICIENT
        reactorEnergy = reactorHeat * 10 * reactorVolume
        energyTransferred *= PASSIVE_COOLING_TRANSFER_EFFICIENCY
        total_energy = (energyTransferred * PASSIVE_COOLING_POWER_EFFICIENCY)
        reactorEnergy -= energyTransferred
        reactorHeat = getTemperatureFromVolumeAndEnergy(reactorVolume, reactorEnergy)

def performPassiveHeatLoss():
    global reactorHeat

    temperatureDifferential = reactorHeat - AMBIENT_TEMPERATURE

    if temperatureDifferential > 0.01:
        energyLost = max(1, temperatureDifferential * REACTOR_HEAT_LOSS_COEFFICIENT)
        reactorNewEnergy = max(0, getEnergyFromVolumeAndTemperature(reactorVolume, reactorHeat) - energyLost)
        reactorHeat = getTemperatureFromVolumeAndEnergy(reactorVolume, reactorNewEnergy)

HEAT_TRANSFER_FACTOR = REACTOR_HEAT_TRANSFER_COEFFICIENT * reactorInnerHeight
def transferHeatBetweenFuelAndReactor():
    global fuelHeat, reactorHeat

    temperatureDifferential = fuelHeat - reactorHeat

    if temperatureDifferential > 0.01:
        energyTransferred = temperatureDifferential * HEAT_TRANSFER_FACTOR
        fuelVolEnergy = getEnergyFromVolumeAndTemperature(numFuelRods, fuelHeat) - energyTransferred
        reactorEnergy = getEnergyFromVolumeAndTemperature(reactorVolume, reactorHeat) + energyTransferred
        fuelHeat = getTemperatureFromVolumeAndEnergy(numFuelRods, fuelVolEnergy)
        reactorHeat = getTemperatureFromVolumeAndEnergy(reactorVolume, reactorEnergy)

def update():
    global fuelHeat, reactorHeat, fertility, reactorVolume
    
    data = None
    for origin in getRodPositions():
        data = radiate(origin)
        fuelHeat += data["fuelHeatChange"]
        reactorHeat += data["environmentHeatChange"]
        fertility = max(0, fertility - max(0.1, fertility * 0.05))

        transferHeatBetweenFuelAndReactor()
        transferHeatBetweenReactorAndCoolant()
        performPassiveHeatLoss()

    return fuelHeat, reactorHeat, data

def loop(_insertionRatio=0, _iterateAmount=250):
    global insertionRatio
    insertionRatio = _insertionRatio

    output = None

    for _ in range(_iterateAmount):
        output = update()

    print(f"Insertion {insertionRatio}% | "
            f"Fuel heat: {output[0]:.3f}; "
            f"Reactor heat: {output[1]:.3f}; "
            f"Usage {output[2]['fuelUsage']:.4f}; "
            f"Fertility {fertility:.3f}")

    amtPerBlock = total_energy / reactorVolume
    print(total_energy, amtPerBlock, amtPerBlock / output[2]["fuelUsage"])

    return amtPerBlock / output[2]["fuelUsage"], total_energy



start = time.perf_counter()
loop(50, 50 * 100)
end = time.perf_counter()
print(f"Time: {end-start:.6f} seconds")
# Time: 0.13s
