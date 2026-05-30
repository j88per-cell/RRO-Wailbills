import { defineStore } from 'pinia'
import { parseGvas } from '@/lib/parser'
import { gvasToRailroad } from '@/lib/importer'
import { getIndustryName, industryNames, industryInputLabels, industryOutputLabels } from '@/lib/industries'

// Water towers/wells fill passively — you can't deliver to them or pick up from them via waybill
const EXCLUDED_INDUSTRY_KEYS = new Set([
    'watertower_1870_style1', 'watertower_1870_style2', 'watertower_1870_style3', 'watertower_1870_style4',
    'WaterTower_DRGW',
    'watertower_kanaskat_style1', 'watertower_kanaskat_style2', 'watertower_kanaskat_style3', 'watertower_kanaskat_style4',
    'WaterTower_Small',
    'telegraphoffice',
])

export const useRailroadStore = defineStore('railroad', {
    state: () => ({
        railroad: null,
        loading: false,
        error: null,
        fileName: null,
    }),

    getters: {
        isLoaded: (state) => state.railroad !== null,

        industries: (state) => {
            if (!state.railroad) return []
            return state.railroad.industries.map((industry, idx) => {
                const key = getIndustryName(industry)
                const displayName = key ? industryNames[key] : String(industry.type)
                const inputLabels = key ? industryInputLabels[key] : null
                const outputLabels = key ? industryOutputLabels[key] : null

                const inputs = inputLabels
                    ? industry.inputs
                        .map((amount, i) => ({ label: inputLabels[i], amount }))
                        .filter(s => !s.label.startsWith('Unused'))
                    : []

                const outputs = outputLabels
                    ? industry.outputs
                        .map((amount, i) => ({ label: outputLabels[i], amount }))
                        .filter(s => !s.label.startsWith('Unused'))
                    : []

                return { idx, key, displayName, inputs, outputs }
            })
        },

        productiveIndustries() {
            return this.industries.filter(i =>
                !EXCLUDED_INDUSTRY_KEYS.has(i.key) &&
                (i.inputs.length > 0 || i.outputs.length > 0)
            )
        },
    },

    actions: {
        async loadFile(file) {
            this.loading = true
            this.error = null
            try {
                const buffer = await file.arrayBuffer()
                const gvas = parseGvas(buffer)
                this.railroad = gvasToRailroad(gvas)
                this.fileName = file.name
            } catch (e) {
                this.error = e.message || 'Failed to parse save file'
                this.railroad = null
            } finally {
                this.loading = false
            }
        },

        clear() {
            this.railroad = null
            this.fileName = null
            this.error = null
        },
    },
})
