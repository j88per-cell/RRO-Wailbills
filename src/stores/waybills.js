import { defineStore } from 'pinia'
import { useRailroadStore } from './railroad'
import { carsNeeded, runValue } from '@/lib/cargo'

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

        autoGenerate(options = {}) {
            const {
                maxWaybills = 0,        // 0 = unlimited
                maxCars = 0,            // 0 = unlimited
                minStock = 1,
                sortByValue = true,
                allowedCommodities = null,  // null = all; array of commodity names to restrict
            } = options

            const railroadStore = useRailroadStore()
            const industries = railroadStore.industries

            const needsMap = {}
            for (const industry of industries) {
                for (let i = 0; i < industry.inputs.length; i++) {
                    const slot = industry.inputs[i]
                    if (!needsMap[slot.label]) needsMap[slot.label] = []
                    needsMap[slot.label].push({ industry, slot: i })
                }
            }

            const sessionId = `auto-${Date.now()}`
            const pending = []

            for (const industry of industries) {
                for (let i = 0; i < industry.outputs.length; i++) {
                    const slot = industry.outputs[i]
                    if (slot.amount < minStock) continue
                    const commodity = slot.label
                    if (allowedCommodities && !allowedCommodities.includes(commodity)) continue

                    const destinations = needsMap[commodity] || []
                    for (const dest of destinations) {
                        if (dest.industry.idx === industry.idx) continue
                        let quantity = carsNeeded(commodity, slot.amount) ?? slot.amount
                        if (maxCars > 0) quantity = Math.min(quantity, maxCars)
                        pending.push({
                            fromIndustryIdx: industry.idx,
                            toIndustryIdx: dest.industry.idx,
                            commodity,
                            fromSlot: i,
                            toSlot: dest.slot,
                            quantity,
                            sessionId,
                        })
                    }
                }
            }

            if (sortByValue) {
                pending.sort((a, b) => (runValue(b.commodity, b.quantity) ?? 0) - (runValue(a.commodity, a.quantity) ?? 0))
            }

            const toAdd = maxWaybills > 0 ? pending.slice(0, maxWaybills) : pending
            for (const w of toAdd) this.addWaybill(w)

            if (toAdd.length > 0) {
                this.sessions.push({ id: sessionId, name: `Auto Run ${new Date().toLocaleTimeString()}`, createdAt: Date.now() })
            }

            return toAdd.length
        },
    },
})
