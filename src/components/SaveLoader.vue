<template>
    <div
        class="save-loader border-4 border-dashed border-amber-700 rounded-lg p-12 text-center cursor-pointer transition-colors"
        :class="{ 'bg-amber-100 border-amber-500': dragging, 'bg-amber-50 hover:bg-amber-100': !dragging }"
        @dragenter.prevent="dragging = true"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="handleDrop"
        @click="triggerPicker"
    >
        <div v-if="!loading">
            <svg class="mx-auto mb-4 w-14 h-14 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="font-display text-2xl text-amber-900 mb-2">Load Save File</p>
            <p class="text-sm text-amber-700">Drag & drop your <code class="bg-amber-200 px-1 rounded">.sav</code> file here, or click to browse</p>
            <p class="text-xs text-amber-600 mt-2">Typically found in <code class="bg-amber-200 px-1 rounded">%LocalAppData%\arr\Saved\SaveGames\</code></p>
        </div>
        <div v-else class="flex flex-col items-center gap-3">
            <svg class="animate-spin w-10 h-10 text-amber-700" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p class="font-display text-xl text-amber-900">Parsing save file…</p>
        </div>

        <input ref="fileInput" type="file" accept=".sav" class="hidden" @change="handleChange" />
    </div>

    <div v-if="error" class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {{ error }}
    </div>
</template>

<script>
import { useRailroadStore } from '@/stores/railroad'

export default {
    setup() {
        const railroadStore = useRailroadStore()
        return { railroadStore }
    },

    data() {
        return { dragging: false }
    },

    computed: {
        loading() { return this.railroadStore.loading },
        error() { return this.railroadStore.error },
    },

    methods: {
        triggerPicker() {
            this.$refs.fileInput.click()
        },

        handleChange(e) {
            const file = e.target.files?.[0]
            if (file) this.railroadStore.loadFile(file)
        },

        handleDrop(e) {
            this.dragging = false
            const file = e.dataTransfer?.files?.[0]
            if (file) this.railroadStore.loadFile(file)
        },
    },
}
</script>
