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
        return { pendingWaybill: null }
    },

    methods: {
        onCreateWaybill(payload) {
            this.pendingWaybill = { ...payload }
        },
    },
}
</script>
