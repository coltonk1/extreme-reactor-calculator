import math

reactorMap = [
    ["air","air","air","air","air","air"],
    ["air","air","air","air","air","air"],
    ["air","air","air","air","air","air"],
    ["air","air","air","air","air","air"],
    ["air","air","air","air","air","air"],
]
reactorInnerHeight = 7
insertionRatio = 50 # %

reactorMap[1][3] = "reactorcontrolrod"
reactorMap[3][1] = "reactorcontrolrod"
reactorMap[3][3] = "reactorcontrolrod"
reactorMap[3][5] = "reactorcontrolrod"
reactorMap[0][0] = "reactorcontrolrod"
reactorMap[1][0] = "copper"
reactorMap[2][0] = "copper"
reactorMap[3][0] = "copper"
reactorMap[4][0] = "copper"
reactorMap[0][4] = "reactorcontrolrod"
reactorMap[1][2] = "iron"
reactorMap[3][2] = "iron"
reactorMap[2][3] = "copper"
reactorMap[1][1] = "gold"

def getRodPositions():
    rods = []
    for y in range(len(reactorMap)):
        for x in range(len(reactorMap[0])):
            if reactorMap[y][x] == "reactorcontrolrod":
                rods.append((x, y))
    return rods

def getControlRodCount():
    return len(getRodPositions())

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

moderators = {
    "iron": {
        "absorption": 0.5, 
        "heatEfficiency": 0.75, 
        "moderation": 1.4, 
        "heatConductivity": 0.6
        },
    "air": {
        "absorption": 0.1, 
        "heatEfficiency": 0.25, 
        "moderation": 1.1, 
        "heatConductivity": 0.05
        },
    "gold": {
        "absorption": 0.52, 
        "heatEfficiency": 0.80, 
        "moderation": 1.45, 
        "heatConductivity": 2
        },
    "copper": {
        "absorption": 0.50, 
        "heatEfficiency": 0.75, 
        "moderation": 1.40, 
        "heatConductivity": 1
        }
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

reactorHeat = 0
fuelHeat = 0
fertility = 0

def getFertilityModifier():
    if fertility > 1: return math.log10(fertility) + 1 
    else: return 1

FUEL_USAGE_MULTIPLIER = 1
ENERGY_PER_RADIATION_UNIT = 10

def radiate(origin):
    global currentModerator, fertility, insertionRatio, currentFuel, fuelHeat, numControlRods, numFuelRods
    
    radiationPenaltyBase = math.exp(-15 * math.exp(-0.0025 * fuelHeat))

    rawRadIntensity = fuelAmount * currentFuel["fissionEventsPerFuelUnit"]
    scaledRadIntensity = rawRadIntensity ** currentFuel["standardReactivity"]
    scaledRadIntensity = ((scaledRadIntensity / numControlRods) ** (currentFuel["standardReactivity"])) * numControlRods

    controlRodModifier = (100 - insertionRatio) / 100

    scaledRadIntensity = scaledRadIntensity * controlRodModifier
    rawRadIntensity = rawRadIntensity * controlRodModifier

    effectiveRadIntensity = scaledRadIntensity * (1.0 + (-0.95 * math.exp(-10.0 * math.exp(-0.0012 * fuelHeat))))

    radHardness = 0.2 + (0.8 * radiationPenaltyBase)
    rawFuelUsage = (currentFuel["fuelUnitsPerFissionEvent"] * rawRadIntensity / getFertilityModifier()) * FUEL_USAGE_MULTIPLIER
    
    environmentEnergyAbsorption = 0
    fuelAbsorbedRadiation = 0
    fuelEnergyAbsorbed = ENERGY_PER_RADIATION_UNIT * effectiveRadIntensity

    effectiveRadIntensity *= 0.25

    for direction in [(0,1),(1,0),(0,-1),(-1,0)]:
        packet = {
            "hardness": radHardness,
            "intensity": effectiveRadIntensity
        }

        ttl = 4
        currentCoord = list(origin)

        while ttl > 0 and packet["intensity"] > 0.0001:
            ttl -= 1
            currentCoord[0] += direction[0]
            currentCoord[1] += direction[1]

            if currentCoord[0] < 0 or currentCoord[0] >= len(reactorMap[0]) or \
            currentCoord[1] < 0 or currentCoord[1] >= len(reactorMap):
                continue
            
            currentBlock = reactorMap[currentCoord[1]][currentCoord[0]]
            if currentBlock == "reactorcontrolrod":
                # Moderate radiation
                insertion = insertionRatio / 100
                baseAbsorption = (1.0 - (0.95 * math.exp(-10 * math.exp(-0.0022 * fuelHeat)))) * (1.0 - (packet["hardness"] / currentFuel["hardnessDivisor"]))
                scaledAbsorption = min(1.0, baseAbsorption * currentFuel["absorptionCoefficient"])

                controlRodBonus = (1.0 - scaledAbsorption) * insertion * 0.5
                controlRodPenalty = scaledAbsorption * insertion * 0.5

                radiationAbsorbed = (scaledAbsorption + controlRodBonus) * packet["intensity"]
                fertilityAbsorbed = (scaledAbsorption - controlRodPenalty) * packet["intensity"]

                moderationFactor = currentFuel["moderationFactor"]
                moderationFactor += moderationFactor * insertion + insertion

                packet["intensity"] = max(0, packet["intensity"] - radiationAbsorbed)
                packet["hardness"] /= moderationFactor

                fuelEnergyAbsorbed += radiationAbsorbed * ENERGY_PER_RADIATION_UNIT
                fuelAbsorbedRadiation += fertilityAbsorbed
            else:
                currentModerator = moderators[currentBlock]
                # Apply moderator
                radiationAbsorbed = packet["intensity"] * currentModerator["absorption"] * (1.0 - packet["hardness"])

                packet["intensity"] = max(0, packet["intensity"] - radiationAbsorbed)
                packet["hardness"] /= currentModerator["moderation"]

                environmentEnergyAbsorption += currentModerator["heatEfficiency"] * radiationAbsorbed * ENERGY_PER_RADIATION_UNIT
            
    fertility += fuelAbsorbedRadiation
    
    # ! fuelContainer.onIrridation(rawFuelUsage)
    return {
        "fuelUsage": rawFuelUsage,
        "environmentEnergyAbsorption": environmentEnergyAbsorption,
        "fuelAsborbedRadiation": fuelAbsorbedRadiation,
        "fuelEnergyAbsorption": fuelEnergyAbsorbed,
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
# REACTOR_HEAT_TRANSFER_COEFFICIENT = (0.6 + currentModerator["heatConductivity"]) * exposed_sides * fuel_rod_height 

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

    if temperatureDifferential > 0.000001:
        energyLost = max(1, temperatureDifferential * REACTOR_HEAT_LOSS_COEFFICIENT)
        reactorNewEnergy = max(0, getEnergyFromVolumeAndTemperature(reactorVolume, reactorHeat) - energyLost)
        reactorHeat = getTemperatureFromVolumeAndEnergy(reactorVolume, reactorNewEnergy)

def transferHeatBetweenFuelAndReactor():
    global fuelHeat, reactorHeat, numFuelRods
    rods = getRodPositions()
    REACTOR_HEAT_TRANSFER_COEFFICIENT = 0
    for rod in rods:
        for direction in [(0,1), (1,0), (0,-1), (-1,0)]:
            currentPos = (rod[0] + direction[0], rod[1] + direction[1])
            if (currentPos[0] < 0 or currentPos[0] >= len(reactorMap[0]) or
                currentPos[1] < 0 or currentPos[1] >= len(reactorMap)):
                REACTOR_HEAT_TRANSFER_COEFFICIENT += moderators["iron"]["heatConductivity"]
                continue
            if reactorMap[currentPos[1]][currentPos[0]] == "reactorcontrolrod":
                REACTOR_HEAT_TRANSFER_COEFFICIENT += moderators["air"]["heatConductivity"]
                continue
            REACTOR_HEAT_TRANSFER_COEFFICIENT += moderators[reactorMap[currentPos[1]][currentPos[0]]]["heatConductivity"]
    temperatureDifferential = fuelHeat - reactorHeat

    if temperatureDifferential > 0.01:
        energyTransferred = temperatureDifferential * REACTOR_HEAT_TRANSFER_COEFFICIENT * reactorInnerHeight
        fuelVolEnergy = getEnergyFromVolumeAndTemperature(numFuelRods, fuelHeat) - energyTransferred
        reactorEnergy = getEnergyFromVolumeAndTemperature(reactorVolume, reactorHeat) + energyTransferred
        fuelHeat = getTemperatureFromVolumeAndEnergy(numFuelRods, fuelVolEnergy)
        reactorHeat = getTemperatureFromVolumeAndEnergy(reactorVolume, reactorEnergy)

def update():
    # Perform irridation
    global fuelHeat, reactorHeat, fertility, reactorVolume
    rod_positions = getRodPositions()
    for origin in rod_positions:
        # Perform irridation
        data = radiate(origin)
        fuelHeat += data["fuelHeatChange"]
        reactorHeat += data["environmentHeatChange"]
        # print("FUEL CONSUMED LAST: " + str(data["fuelUsage"]))
        # print("FUEL HEAT: ", str(fuelHeat), "REACTOR HEAT: ", str(reactorHeat))
        # performRadiationDecay
        fertility = max(0, fertility - max(0.1, fertility / 20))

        # HEAT TRANSFERS
        transferHeatBetweenFuelAndReactor()
        transferHeatBetweenReactorAndCoolant()
        performPassiveHeatLoss()

        if fuelHeat < 0: fuelHeat = 0
        if reactorHeat < 0: reactorHeat = 0

    return fuelHeat, reactorHeat, data

def loop():
    output = 0
    for _ in range(500):
        output = update()
    print(f"Fuel heat: {output[0]:.3f}; Reactor heat: {output[1]:.3f}; Usage {output[2]["fuelUsage"]:.4f}; Fertility {fertility}")
    print(total_energy)

loop()