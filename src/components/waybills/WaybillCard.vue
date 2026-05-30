<template>
    <div
        class="waybill-card font-display border-2 rounded p-3 transition-all"
        :class="waybill.fulfilled
            ? 'bg-gray-100 border-gray-300 opacity-60'
            : 'bg-amber-50 border-amber-400 shadow-sm'"
    >
        <!-- Header row -->
        <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                    <span class="text-xs text-amber-600 uppercase tracking-wide">{{ waybill.commodity }}</span>
                    <div class="flex items-center gap-1 text-xs text-amber-700">
                        <span>Cars:</span>
                        <input
                            :value="waybill.quantity"
                            type="number"
                            min="1"
                            class="w-14 border border-amber-300 rounded px-1 py-0.5 bg-amber-50 focus:outline-none focus:border-amber-500 text-right font-mono"
                            :disabled="waybill.fulfilled"
                            @change="$emit('set-quantity', waybill.id, $event.target.value)"
                        />
                    </div>
                </div>
                <div class="flex items-center gap-1 mt-0.5">
                    <span class="text-sm font-semibold text-amber-900 truncate">{{ fromName }}</span>
                    <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                    <span class="text-sm font-semibold text-amber-900 truncate">{{ toName }}</span>
                </div>
                <div class="text-xs text-amber-500 mt-0.5 flex gap-2 items-center">
                    <span v-if="carType">{{ carType }}</span>
                    <span v-if="runValue" class="text-green-700 font-mono font-semibold">${{ runValue.toLocaleString() }}</span>
                    <span v-if="waybill.sessionId">· {{ sessionLabel }}</span>
                </div>
            </div>

            <!-- Fulfilled checkbox -->
            <button
                class="shrink-0 w-7 h-7 rounded border-2 flex items-center justify-center transition-colors"
                :class="waybill.fulfilled
                    ? 'bg-green-500 border-green-600 text-white'
                    : 'border-amber-400 hover:border-green-500 hover:bg-green-50'"
                :title="waybill.fulfilled ? 'Mark unfulfilled' : 'Mark fulfilled'"
                @click="$emit('toggle', waybill.id)"
            >
                <svg v-if="waybill.fulfilled" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
            </button>
        </div>

        <!-- Remove button -->
        <button
            class="text-xs text-red-400 hover:text-red-600 transition-colors"
            @click="$emit('remove', waybill.id)"
        >
            Remove
        </button>
    </div>
</template>

<script>
import { useRailroadStore } from '@/stores/railroad'
import { cargoByComodity, runValue as calcRunValue } from '@/lib/cargo'

export default {
    props: {
        waybill: { type: Object, required: true },
    },

    emits: ['toggle', 'remove', 'set-quantity'],

    setup() {
        const railroadStore = useRailroadStore()
        return { railroadStore }
    },

    computed: {
        fromName() {
            return this.railroadStore.industries[this.waybill.fromIndustryIdx]?.displayName ?? 'Unknown'
        },
        toName() {
            return this.railroadStore.industries[this.waybill.toIndustryIdx]?.displayName ?? 'Unknown'
        },
        sessionLabel() {
            if (!this.waybill.sessionId) return null
            if (this.waybill.sessionId.startsWith('auto-')) return 'Auto-generated'
            return this.waybill.sessionId
        },
        carType() {
            return cargoByComodity[this.waybill.commodity]?.carType ?? null
        },
        runValue() {
            return calcRunValue(this.waybill.commodity, this.waybill.quantity)
        },
    },
}
</script>
