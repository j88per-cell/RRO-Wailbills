// Commodity capacities, car types, and prices
// Capacities from Railroads-Online-main/utils/data.js; prices from in-game data
// unitsPerCar for ag/gold commodities derived from (price per full car / price per unit)

export const cargoData = [
    { commodity: 'Logs',         carType: 'Flatcar (Rounds)',   unitsPerCar: 6,  pricePerUnit: 12  },
    { commodity: 'Cordwood',     carType: 'Flatcar (Bulkhead)', unitsPerCar: 8,  pricePerUnit: 10  },
    { commodity: 'Lumber',       carType: 'Flatcar (Stakes)',   unitsPerCar: 6,  pricePerUnit: 16  },
    { commodity: 'Beams',        carType: 'Flatcar (Stakes)',   unitsPerCar: 3,  pricePerUnit: 32  },
    { commodity: 'Raw Iron',     carType: 'Flatcar (Stakes)',   unitsPerCar: 3,  pricePerUnit: 60  },
    { commodity: 'Rails',        carType: 'Flatcar (Stakes)',   unitsPerCar: 10, pricePerUnit: 35  },
    { commodity: 'Steel Pipes',  carType: 'Flatcar (Rounds)',   unitsPerCar: 9,  pricePerUnit: 50  },
    { commodity: 'Oil Barrel',   carType: 'Flatcar (Bulkhead)', unitsPerCar: 46, pricePerUnit: 90  },
    { commodity: 'Iron Ore',     carType: 'Hopper',             unitsPerCar: 10, pricePerUnit: 50  },
    { commodity: 'Coal',         carType: 'Hopper',             unitsPerCar: 10, pricePerUnit: 30  },
    { commodity: 'Crude Oil',    carType: 'Tanker',             unitsPerCar: 12, pricePerUnit: 35  },
    { commodity: 'Tool Crates',  carType: 'Box Car',            unitsPerCar: 32, pricePerUnit: 30  },
    { commodity: 'Water',        carType: 'Tanker',             unitsPerCar: 12, pricePerUnit: 10  },
    { commodity: 'Seed Pallet',  carType: 'Box Car',            unitsPerCar: 14, pricePerUnit: 10  },
    { commodity: 'Straw Bale',   carType: 'Flatcar (Stakes)',   unitsPerCar: 15, pricePerUnit: 12  },
    { commodity: 'Grain',        carType: 'Hopper',             unitsPerCar: 12, pricePerUnit: 12  },
    { commodity: 'Cattle',       carType: 'Stock Car',          unitsPerCar: 6,  pricePerUnit: 90  },
    { commodity: 'Meat',         carType: 'Reefer',             unitsPerCar: 36, pricePerUnit: 90  },
    { commodity: 'Gold Ore',     carType: 'Hopper',             unitsPerCar: 22, pricePerUnit: 600 },
    { commodity: 'Refined Gold', carType: 'Box Car',            unitsPerCar: 16, pricePerUnit: 3000 },
    { commodity: 'Gold Ingot',   carType: 'Box Car',            unitsPerCar: 5,  pricePerUnit: 6400 },
]

// Keyed by commodity label for fast lookup
export const cargoByComodity = Object.fromEntries(cargoData.map(c => [c.commodity, c]))

export function carsNeeded(commodity, units) {
    const cargo = cargoByComodity[commodity]
    if (!cargo || !units) return null
    return Math.ceil(units / cargo.unitsPerCar)
}

export function runValue(commodity, cars) {
    const cargo = cargoByComodity[commodity]
    if (!cargo || !cars) return null
    return cars * cargo.unitsPerCar * cargo.pricePerUnit
}
