<template>
    <div class="waybill-board">
        <!-- Toolbar -->
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 class="font-display text-xl text-amber-900">Waybills</h2>
            <div class="flex gap-2 flex-wrap">
                <button
                    class="text-sm bg-amber-700 hover:bg-amber-800 text-white px-3 py-1 rounded transition-colors"
                    @click="autoGenerate"
                >
                    ⚙ Auto-Generate Run
                </button>
                <button
                    v-if="fulfilledWaybills.length > 0"
                    class="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition-colors"
                    @click="clearFulfilled"
                >
                    Clear Fulfilled
                </button>
                <button
                    v-if="waybills.length > 0"
                    class="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition-colors"
                    @click="clearAll"
                >
                    Clear All
                </button>
            </div>
        </div>

        <!-- Auto-generate result notice -->
        <div v-if="lastGenerated !== null" class="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
            Generated {{ lastGenerated }} waybill{{ lastGenerated !== 1 ? 's' : '' }} based on current industry stock.
            <button class="ml-2 underline text-green-600 hover:text-green-800" @click="lastGenerated = null">Dismiss</button>
        </div>
        <div v-if="lastGenerated === 0" class="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
            No waybills could be generated — no industries have output stock ready to ship.
        </div>

        <!-- Create waybill modal trigger (from IndustryList) -->
        <div v-if="pendingWaybill" class="mb-3 bg-white border-2 border-amber-400 rounded p-3 text-sm">
            <p class="font-semibold text-amber-900 mb-2">
                Ship <em>{{ pendingWaybill.commodity }}</em> from <em>{{ fromIndustryName }}</em> to…
            </p>
            <select
                v-model="pendingDestIdx"
                class="w-full border border-amber-300 rounded px-2 py-1 bg-amber-50 focus:outline-none focus:border-amber-500 mb-2"
            >
                <option :value="null" disabled>Select destination industry</option>
                <option
                    v-for="industry in validDestinations"
                    :key="industry.idx"
                    :value="industry.idx"
                >
                    {{ industry.displayName }} — needs {{ matchingInput(industry) }}
                </option>
            </select>
            <div class="flex items-center gap-2 mb-2">
                <label class="text-amber-700 shrink-0">Quantity (cars):</label>
                <input
                    v-model.number="pendingQuantity"
                    type="number"
                    min="1"
                    class="w-24 border border-amber-300 rounded px-2 py-1 bg-amber-50 focus:outline-none focus:border-amber-500"
                />
            </div>
            <div class="flex gap-2">
                <button
                    class="text-sm bg-amber-700 hover:bg-amber-800 text-white px-3 py-1 rounded"
                    :disabled="pendingDestIdx === null"
                    @click="confirmWaybill"
                >
                    Add Waybill
                </button>
                <button
                    class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
                    @click="pendingWaybill = null; pendingDestIdx = null"
                >
                    Cancel
                </button>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="waybills.length === 0" class="text-center text-amber-600 text-sm py-8 border-2 border-dashed border-amber-200 rounded">
            <p class="font-display text-lg mb-1">No waybills yet</p>
            <p>Click "Ship" on an industry, or use Auto-Generate.</p>
        </div>

        <!-- Active waybills -->
        <div v-if="activeWaybills.length > 0" class="mb-4">
            <p class="text-xs uppercase tracking-wide text-amber-600 font-semibold mb-2">Active ({{ activeWaybills.length }})</p>
            <div class="space-y-2">
                <WaybillCard
                    v-for="w in activeWaybills"
                    :key="w.id"
                    :waybill="w"
                    @toggle="toggle"
                    @remove="remove"
                    @set-quantity="setQuantity"
                />
            </div>
        </div>

        <!-- Fulfilled waybills -->
        <div v-if="fulfilledWaybills.length > 0">
            <p class="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Fulfilled ({{ fulfilledWaybills.length }})</p>
            <div class="space-y-2">
                <WaybillCard
                    v-for="w in fulfilledWaybills"
                    :key="w.id"
                    :waybill="w"
                    @toggle="toggle"
                    @remove="remove"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { useWaybillStore } from '@/stores/waybills'
import { useRailroadStore } from '@/stores/railroad'
import WaybillCard from '@/components/waybills/WaybillCard.vue'

export default {
    components: { WaybillCard },

    props: {
        // Passed from IndustryList "Ship" button clicks
        incomingWaybill: { type: Object, default: null },
    },

    setup() {
        return {
            waybillStore: useWaybillStore(),
            railroadStore: useRailroadStore(),
        }
    },

    data() {
        return {
            pendingWaybill: null,
            pendingDestIdx: null,
            pendingQuantity: 1,
            lastGenerated: null,
        }
    },

    computed: {
        waybills() { return this.waybillStore.waybills },
        activeWaybills() { return this.waybillStore.activeWaybills },
        fulfilledWaybills() { return this.waybillStore.fulfilledWaybills },

        fromIndustryName() {
            if (!this.pendingWaybill) return ''
            return this.railroadStore.industries[this.pendingWaybill.fromIndustryIdx]?.displayName ?? ''
        },

        // Industries that have an input slot matching the commodity being shipped
        validDestinations() {
            if (!this.pendingWaybill) return []
            const commodity = this.pendingWaybill.commodity
            return this.railroadStore.industries.filter(i =>
                i.idx !== this.pendingWaybill.fromIndustryIdx &&
                i.inputs.some(s => s.label === commodity)
            )
        },
    },

    watch: {
        incomingWaybill(val) {
            if (val) {
                this.pendingWaybill = val
                this.pendingDestIdx = null
                this.pendingQuantity = 1
            }
        },
    },

    methods: {
        matchingInput(industry) {
            const slot = industry.inputs.find(s => s.label === this.pendingWaybill?.commodity)
            return slot ? `${slot.label} (has ${slot.amount})` : ''
        },

        confirmWaybill() {
            if (!this.pendingWaybill || this.pendingDestIdx === null) return
            const destIndustry = this.railroadStore.industries[this.pendingDestIdx]
            const toSlot = destIndustry.inputs.findIndex(s => s.label === this.pendingWaybill.commodity)
            this.waybillStore.addWaybill({
                ...this.pendingWaybill,
                toIndustryIdx: this.pendingDestIdx,
                toSlot,
                quantity: this.pendingQuantity,
                sessionId: null,
            })
            this.pendingWaybill = null
            this.pendingDestIdx = null
            this.pendingQuantity = 1
        },

        autoGenerate() {
            this.lastGenerated = this.waybillStore.autoGenerate()
        },

        toggle(id) { this.waybillStore.toggleFulfilled(id) },
        remove(id) { this.waybillStore.removeWaybill(id) },
        setQuantity(id, qty) { this.waybillStore.setQuantity(id, qty) },
        clearFulfilled() { this.waybillStore.clearFulfilled() },
        clearAll() { this.waybillStore.clearAll() },
    },
}
</script>
