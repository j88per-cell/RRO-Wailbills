<template>
    <div class="industry-list">
        <div class="flex items-center justify-between mb-3">
            <h2 class="font-display text-xl text-amber-900">Industries</h2>
            <span class="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">{{ filtered.length }} / {{ industries.length }}</span>
        </div>

        <!-- Category filter chips -->
        <div class="flex flex-wrap gap-1 mb-3">
            <button
                v-for="cat in CATEGORIES"
                :key="cat.label"
                class="text-xs px-2 py-0.5 rounded-full border transition-colors"
                :class="activeCategories.has(cat.label)
                    ? 'bg-amber-700 border-amber-700 text-white'
                    : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'"
                @click="toggleCategory(cat.label)"
            >
                {{ cat.label }}
            </button>
            <button
                v-if="activeCategories.size > 0"
                class="text-xs px-2 py-0.5 rounded-full border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                @click="clearCategories"
            >
                ✕ Clear
            </button>
        </div>

        <input
            v-model="filter"
            type="text"
            placeholder="Filter industries…"
            class="w-full mb-3 px-3 py-1.5 text-sm border border-amber-300 rounded bg-amber-50 focus:outline-none focus:border-amber-500"
        />

        <div class="space-y-2">
            <div
                v-for="industry in filtered"
                :key="industry.idx"
                class="industry-card bg-amber-50 border border-amber-200 rounded p-3 text-sm"
            >
                <p class="font-semibold text-amber-900 mb-2">{{ industry.displayName }}</p>

                <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div v-if="industry.outputs.length">
                        <p class="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Available</p>
                        <div v-for="slot in industry.outputs" :key="slot.label" class="flex justify-between gap-2">
                            <span class="text-gray-700 truncate">{{ slot.label }}</span>
                            <span class="font-mono text-right shrink-0" :class="slot.amount > 0 ? 'text-green-700' : 'text-gray-400'">
                                {{ slot.amount }}
                                <template v-if="carsNeeded(slot.label, slot.amount)">
                                    <span class="text-gray-400 text-xs">({{ carsNeeded(slot.label, slot.amount) }} cars)</span>
                                </template>
                            </span>
                        </div>
                    </div>

                    <div v-if="industry.inputs.length">
                        <p class="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">Needs</p>
                        <div v-for="slot in industry.inputs" :key="slot.label" class="flex justify-between gap-2">
                            <span class="text-gray-700 truncate">{{ slot.label }}</span>
                            <span class="font-mono text-right shrink-0" :class="slot.amount > 0 ? 'text-red-700' : 'text-gray-400'">
                                {{ slot.amount }}
                                <template v-if="carsNeeded(slot.label, slot.amount)">
                                    <span class="text-gray-400 text-xs">({{ carsNeeded(slot.label, slot.amount) }} cars)</span>
                                </template>
                            </span>
                        </div>
                    </div>
                </div>

                <div v-if="industry.outputs.some(s => s.amount > 0)" class="mt-2 flex flex-wrap gap-1">
                    <button
                        v-for="slot in industry.outputs.filter(s => s.amount > 0)"
                        :key="'out-' + slot.label"
                        class="text-xs bg-green-100 hover:bg-green-200 text-green-800 border border-green-300 px-2 py-0.5 rounded transition-colors"
                        @click="$emit('create-waybill', { fromIndustryIdx: industry.idx, commodity: slot.label, fromSlot: industry.outputs.indexOf(slot) })"
                    >
                        Ship {{ slot.label }}
                    </button>
                </div>
            </div>

            <div v-if="filtered.length === 0" class="text-center text-amber-600 text-sm py-4">
                No industries match your filters.
            </div>
        </div>
    </div>
</template>

<script>
import { useRailroadStore } from '@/stores/railroad'
import { carsNeeded, cargoByComodity } from '@/lib/cargo'

const STORAGE_KEY = 'rro-industry-filters'

const CATEGORIES = [
    { label: 'Wood',        commodities: ['Logs', 'Lumber', 'Beams', 'Cordwood', 'Firewood'] },
    { label: 'Iron',        commodities: ['Iron Ore', 'Raw Iron', 'Rails', 'Steel Pipes', 'Tool Crates'] },
    { label: 'Coal',        commodities: ['Coal'] },
    { label: 'Oil',         commodities: ['Crude Oil', 'Oil Barrel', 'Steel Pipes'] },
    { label: 'Gold',        commodities: ['Gold Ore', 'Refined Gold', 'Gold Ingot'] },
    { label: 'Agriculture', commodities: ['Grain', 'Straw Bale', 'Cattle', 'Meat', 'Seed Pallet', 'Water'] },
    { label: 'Sand',        commodities: ['Sand'] },
]

export default {
    emits: ['create-waybill'],

    setup() {
        return { railroadStore: useRailroadStore(), CATEGORIES, carsNeeded, cargoByComodity }
    },

    data() {
        const saved = localStorage.getItem(STORAGE_KEY)
        const active = saved ? JSON.parse(saved) : []
        return {
            filter: '',
            activeCategories: new Set(active),
        }
    },

    computed: {
        industries() {
            return this.railroadStore.productiveIndustries
        },

        filtered() {
            let list = this.industries

            if (this.activeCategories.size > 0) {
                const allowed = new Set(
                    CATEGORIES
                        .filter(c => this.activeCategories.has(c.label))
                        .flatMap(c => c.commodities)
                )
                list = list.filter(i =>
                    i.outputs.some(s => allowed.has(s.label)) ||
                    i.inputs.some(s => allowed.has(s.label))
                )
            }

            if (this.filter) {
                const q = this.filter.toLowerCase()
                list = list.filter(i =>
                    i.displayName.toLowerCase().includes(q) ||
                    i.outputs.some(s => s.label.toLowerCase().includes(q)) ||
                    i.inputs.some(s => s.label.toLowerCase().includes(q))
                )
            }

            return list
        },
    },

    methods: {
        toggleCategory(label) {
            if (this.activeCategories.has(label)) {
                this.activeCategories.delete(label)
            } else {
                this.activeCategories.add(label)
            }
            this.saveCategories()
            // Trigger reactivity — Set mutations aren't tracked automatically
            this.activeCategories = new Set(this.activeCategories)
        },

        clearCategories() {
            this.activeCategories = new Set()
            this.saveCategories()
        },

        saveCategories() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.activeCategories]))
        },
    },
}
</script>
