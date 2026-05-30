// Commodity capacities and car types, sourced from Railroads-Online-main/utils/data.js
// cargoType names are normalized to match the commodity labels used in industries.ts

export const cargoData = [
    { commodity: 'Logs',        carType: 'Flatcar (Rounds)',   unitsPerCar: 6,  unitWeight_lbs: 4409, unitWeight_kg: 2000 },
    { commodity: 'Cordwood',    carType: 'Flatcar (Bulkhead)', unitsPerCar: 8,  unitWeight_lbs: 2646, unitWeight_kg: 1200 },
    { commodity: 'Lumber',      carType: 'Flatcar (Stakes)',   unitsPerCar: 6,  unitWeight_lbs: 2976, unitWeight_kg: 1350 },
    { commodity: 'Beams',       carType: 'Flatcar (Stakes)',   unitsPerCar: 3,  unitWeight_lbs: 3109, unitWeight_kg: 1410 },
    { commodity: 'Raw Iron',    carType: 'Flatcar (Stakes)',   unitsPerCar: 3,  unitWeight_lbs: 3285, unitWeight_kg: 1490 },
    { commodity: 'Rails',       carType: 'Flatcar (Stakes)',   unitsPerCar: 10, unitWeight_lbs: 1984, unitWeight_kg: 900  },
    { commodity: 'Steel Pipes', carType: 'Flatcar (Rounds)',   unitsPerCar: 9,  unitWeight_lbs: 3968, unitWeight_kg: 1800 },
    { commodity: 'Oil Barrel',  carType: 'Flatcar (Bulkhead)', unitsPerCar: 46, unitWeight_lbs: 302,  unitWeight_kg: 137  },
    { commodity: 'Iron Ore',    carType: 'Hopper',             unitsPerCar: 10, unitWeight_lbs: 2205, unitWeight_kg: 1000 },
    { commodity: 'Coal',        carType: 'Hopper',             unitsPerCar: 10, unitWeight_lbs: 2205, unitWeight_kg: 1000 },
    { commodity: 'Crude Oil',   carType: 'Tanker',             unitsPerCar: 12, unitWeight_lbs: 2205, unitWeight_kg: 1000 },
    { commodity: 'Tool Crates', carType: 'Box Car',            unitsPerCar: 32, unitWeight_lbs: 220,  unitWeight_kg: 100  },
]

// Keyed by commodity label for fast lookup
export const cargoByComodity = Object.fromEntries(cargoData.map(c => [c.commodity, c]))

export function carsNeeded(commodity, units) {
    const cargo = cargoByComodity[commodity]
    if (!cargo || !units) return null
    return Math.ceil(units / cargo.unitsPerCar)
}
