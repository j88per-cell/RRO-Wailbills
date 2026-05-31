import { defineStore } from 'pinia'
import { parseGvas } from '@/lib/parser'
import { gvasToRailroad } from '@/lib/importer'
import { getIndustryName, industryNames, industryInputLabels, industryOutputLabels } from '@/lib/industries'

const EXCLUDED_INDUSTRY_KEYS = new Set([
    'watertower_1870_style1', 'watertower_1870_style2', 'watertower_1870_style3', 'watertower_1870_style4',
    'WaterTower_DRGW',
    'watertower_kanaskat_style1', 'watertower_kanaskat_style2', 'watertower_kanaskat_style3', 'watertower_kanaskat_style4',
    'WaterTower_Small',
    'telegraphoffice',
])

// Extract a flat list of string values from a GvasText (recursive)
function gvasTextStrings(text) {
    if (!text) return []
    // GvasTextBase: has a .value string
    if (typeof text.value === 'string') return [text.value]
    // GvasTextNone: has .values array
    if (Array.isArray(text.values)) return text.values.filter(Boolean)
    // GvasTextArgumentFormat: has .sourceFormat and .args
    if (text.args) {
        return text.args.flatMap(arg => {
            const val = arg.value
            if (!val) return []
            if (val[0] === 'Text') return gvasTextStrings(val[1])
            return []
        })
    }
    return []
}

// Pull candidate railroad names from frame names — filter out numbers, GUIDs, format strings
function extractRoadNames(frames) {
    const seen = new Set()
    const results = []
    for (const frame of frames) {
        for (const str of gvasTextStrings(frame.name)) {
            const s = str.trim()
            if (!s) continue
            if (/^\d+$/.test(s)) continue           // pure number
            if (s.includes('{') || s.includes('<')) continue  // format template
            if (/^[0-9a-f-]{32,}$/i.test(s)) continue        // GUID
            if (!seen.has(s)) {
                seen.add(s)
                results.push(s)
            }
        }
    }
    return results
}

export const useRailroadStore = defineStore('railroad', {
    persist: {
        pick: ['railroad', 'fileName', 'railroadName', 'roadNameCandidates'],
    },

    state: () => ({
        railroad: null,
        loading: false,
        error: null,
        fileName: null,
        railroadName: null,
        roadNameCandidates: [],
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
            this.railroadName = null
            this.roadNameCandidates = []
            try {
                const buffer = await file.arrayBuffer()
                const gvas = parseGvas(buffer)
                this.railroad = gvasToRailroad(gvas)
                this.fileName = file.name
                this.roadNameCandidates = extractRoadNames(this.railroad.frames)
            } catch (e) {
                this.error = e.message || 'Failed to parse save file'
                this.railroad = null
            } finally {
                this.loading = false
            }
        },

        setRailroadName(name) {
            this.railroadName = name
        },

        clear() {
            this.railroad = null
            this.fileName = null
            this.error = null
            this.railroadName = null
            this.roadNameCandidates = []
        },
    },
})
