<template>
    <div class="min-h-screen bg-stone-100">
        <!-- Load screen -->
        <div v-if="!railroadStore.isLoaded" class="flex items-center justify-center min-h-screen p-8">
            <div class="w-full max-w-lg">
                <h1 class="font-display text-4xl text-center text-amber-900 mb-2">RRO Waybills</h1>
                <p class="text-center text-amber-700 mb-8 text-sm">Railroads Online run planner</p>
                <SaveLoader />
            </div>
        </div>

        <!-- Railroad name picker -->
        <div
            v-else-if="railroadStore.railroadName === null"
            class="flex items-center justify-center min-h-screen p-8"
        >
            <div class="w-full max-w-sm bg-white border border-amber-200 rounded-lg shadow p-6">
                <h2 class="font-display text-2xl text-amber-900 mb-1">Which railroad?</h2>
                <p class="text-sm text-amber-600 mb-4">Select the name to appear on your waybills.</p>
                <div class="space-y-2 mb-4">
                    <button
                        v-for="name in railroadStore.roadNameCandidates"
                        :key="name"
                        class="w-full text-left px-3 py-2 rounded border border-amber-200 hover:bg-amber-50 hover:border-amber-400 transition-colors font-display text-amber-900"
                        @click="railroadStore.setRailroadName(name)"
                    >
                        {{ name }}
                    </button>
                </div>
                <div class="flex gap-2">
                    <input
                        v-model="customRoadName"
                        type="text"
                        placeholder="Or type a custom name…"
                        class="flex-1 text-sm border border-amber-300 rounded px-2 py-1.5 focus:outline-none focus:border-amber-500"
                        @keydown.enter="confirmCustomName"
                    />
                    <button
                        class="text-sm bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded transition-colors"
                        :disabled="!customRoadName.trim()"
                        @click="confirmCustomName"
                    >
                        Use
                    </button>
                </div>
            </div>
        </div>

        <!-- Main app -->
        <div v-else class="flex h-screen overflow-hidden">
            <!-- Industry list sidebar -->
            <aside class="w-80 shrink-0 border-r border-amber-200 bg-white overflow-y-auto p-4">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-amber-500 truncate">{{ railroadStore.fileName }}</span>
                    <button
                        class="text-xs text-amber-500 hover:text-amber-700 underline shrink-0 ml-2"
                        @click="railroadStore.clear()"
                    >
                        Change file
                    </button>
                </div>
                <IndustryList @create-waybill="onCreateWaybill" />
            </aside>

            <!-- Waybill board -->
            <main class="flex-1 overflow-y-auto p-4">
                <WaybillBoard :incoming-waybill="pendingWaybill" @waybill-added="pendingWaybill = null" />
            </main>
        </div>
    </div>
</template>

<script>
import { useRailroadStore } from '@/stores/railroad'
import SaveLoader from '@/components/SaveLoader.vue'
import IndustryList from '@/components/IndustryList.vue'
import WaybillBoard from '@/components/WaybillBoard.vue'

export default {
    components: { SaveLoader, IndustryList, WaybillBoard },

    setup() {
        const railroadStore = useRailroadStore()
        return { railroadStore }
    },

    data() {
        return { pendingWaybill: null, customRoadName: '' }
    },

    methods: {
        onCreateWaybill(payload) {
            this.pendingWaybill = { ...payload }
        },
        confirmCustomName() {
            const name = this.customRoadName.trim()
            if (name) this.railroadStore.setRailroadName(name)
        },
    },
}
</script>
