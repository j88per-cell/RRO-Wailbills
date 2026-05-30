import { defineStore } from 'pinia'
import { useRailroadStore } from './railroad'
import { carsNeeded } from '@/lib/cargo'

export const useWaybillStore = defineStore('waybills', {
    state: () => ({
        waybills: [],
        sessions: [],
        nextId: 1,
    }),

    getters: {
        activeWaybills: (state) => state.waybills.filter(w => !w.fulfilled),
        fulfilledWaybills: (state) => state.waybills.filter(w => w.fulfilled),

        waybillsBySession: (state) => {
            const map = {}
            for (const w of state.waybills) {
                const key = w.sessionId ?? '__manual__'
                if (!map[key]) map[key] = []
                map[key].push(w)
            }
            return map
        },
    },

    actions: {
        addWaybill({ fromIndustryIdx, toIndustryIdx, commodity, fromSlot, toSlot, quantity = 1, sessionId = null }) {
            this.waybills.push({
                id: this.nextId++,
                fromIndustryIdx,
                toIndustryIdx,
                commodity,
                fromSlot,
                toSlot,
                quantity,
                sessionId,
                fulfilled: false,
                createdAt: Date.now(),
            })
        },

        setQuantity(id, quantity) {
            const w = this.waybills.find(w => w.id === id)
            if (w) w.quantity = Math.max(1, parseInt(quantity) || 1)
        },

        toggleFulfilled(id) {
            const w = this.waybills.find(w => w.id === id)
            if (w) w.fulfilled = !w.fulfilled
        },

        removeWaybill(id) {
            this.waybills = this.waybills.filter(w => w.id !== id)
        },

        clearFulfilled() {
            this.waybills = this.waybills.filter(w => !w.fulfilled)
        },

        clearAll() {
            this.waybills = []
            this.sessions = []
            this.nextId = 1
        },

        // Auto-generate waybills: find output→input commodity matches where source has stock
        autoGenerate() {
            const railroadStore = useRailroadStore()
            const industries = railroadStore.industries

            // Build a map: commodity name → list of industries that need it as input
            const needsMap = {}
            for (const industry of industries) {
                for (let i = 0; i < industry.inputs.length; i++) {
                    const slot = industry.inputs[i]
                    const commodity = slot.label
                    if (!needsMap[commodity]) needsMap[commodity] = []
                    needsMap[commodity].push({ industry, slot: i })
                }
            }

            const sessionId = `auto-${Date.now()}`
            let generated = 0

            for (const industry of industries) {
                for (let i = 0; i < industry.outputs.length; i++) {
                    const slot = industry.outputs[i]
                    if (slot.amount === 0) continue
                    const commodity = slot.label

                    const destinations = needsMap[commodity] || []
                    for (const dest of destinations) {
                        if (dest.industry.idx === industry.idx) continue
                        this.addWaybill({
                            fromIndustryIdx: industry.idx,
                            toIndustryIdx: dest.industry.idx,
                            commodity,
                            fromSlot: i,
                            toSlot: dest.slot,
                            quantity: carsNeeded(commodity, slot.amount) ?? slot.amount,
                            sessionId,
                        })
                        generated++
                    }
                }
            }

            if (generated > 0) {
                this.sessions.push({ id: sessionId, name: `Auto Run ${new Date().toLocaleTimeString()}`, createdAt: Date.now() })
            }

            return generated
        },
    },
})
