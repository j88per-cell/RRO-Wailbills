<template>
    <div class="publish-overlay" ref="overlay" tabindex="0" @keydown.left.prevent="prev" @keydown.right.prevent="next" @keydown.esc="$emit('close')">

        <!-- Nav bar -->
        <div class="publish-nav">
            <button class="pub-btn" @click="$emit('close')">← Waybills</button>

            <div class="nav-center">
                <button class="nav-arrow" :disabled="currentIdx === 0" @click="prev">‹</button>
                <span class="nav-count">{{ currentIdx + 1 }} / {{ groups.length }}</span>
                <button class="nav-arrow" :disabled="currentIdx === groups.length - 1" @click="next">›</button>
            </div>

            <button class="pub-btn" @click="printWaybill">Print</button>
        </div>

        <!-- Stage -->
        <div class="publish-stage">
            <div v-if="currentGroup.length" class="wb-paper">

                <!-- Masthead -->
                <div style="text-align:center;line-height:1.05;">
                    <div class="wb-flourish" style="font-size:13px;letter-spacing:.4em;">✦ &nbsp; ❧ &nbsp; ✦</div>
                    <div class="wb-fat" style="font-size:38px;margin:2px 0 0;letter-spacing:.06em;">{{ roadName || '[ Railroad Name ]' }}</div>
                    <div class="wb-sc" style="font-size:26px;letter-spacing:.18em;margin-top:6px;">RAILROAD FREIGHT LINE</div>
                    <div class="wb-bodit" style="font-size:14px;color:var(--ink-soft);margin-top:2px;">Receipt &amp; Bill of Lading for Goods Carried by Rail</div>
                </div>
                <hr class="wb-rule-d" style="margin:14px 0 0;" />
                <hr class="wb-rule" style="margin:2px 0 16px;" />

                <!-- Received line + loco image -->
                <div style="display:flex;align-items:flex-end;gap:14px;">
                    <div class="wb-vignette loco-slot">
                        <img v-if="locoImage" :src="locoImage" class="loco-img" alt="Locomotive" />
                        <div v-else class="loco-placeholder">
                            <span>locomotive<br/>engraving</span>
                        </div>
                    </div>
                    <div style="flex:1;">
                        <div style="display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;">
                            <span class="wb-fat" style="font-size:26px;line-height:.9;">Received,</span>
                            <span class="wb-bodit wb-fill" style="font-size:16px;padding-bottom:2px;">{{ fromNames }}</span>
                            <span class="wb-dotline" />
                            <span class="wb-bodit" style="font-size:14px;color:var(--ink-soft);padding-bottom:3px;">{{ dateLabel }}</span>
                        </div>
                        <div class="wb-bodit" style="font-size:15px;line-height:1.5;color:var(--ink);margin-top:10px;">
                            in apparent good order, the following articles, marked and described as below,
                            which the Company agrees to forward by rail and deliver without delay, in like good order
                            — the dangers of fire, flood, derailment and collision excepted —
                        </div>
                    </div>
                </div>

                <!-- Destination line -->
                <div style="display:flex;align-items:flex-end;gap:8px;margin-top:10px;flex-wrap:wrap;">
                    <span class="wb-bodit" style="font-size:15px;padding-bottom:2px;">unto the consignee at</span>
                    <span class="wb-fill" style="font-size:17px;padding-bottom:2px;">{{ toName }}</span>
                    <span class="wb-dotline" />
                    <span class="wb-bodit" style="font-size:15px;padding-bottom:2px;">he paying freight at the rate annexed.</span>
                </div>

                <!-- Articles table -->
                <table class="wb-articles">
                    <thead>
                        <tr>
                            <th class="wb-sc" style="text-align:left;width:42%;">ARTICLES</th>
                            <th class="wb-sc" style="text-align:left;width:28%;">CONVEYANCE</th>
                            <th class="wb-sc" style="text-align:center;">CARS</th>
                            <th class="wb-sc" style="text-align:right;">CHARGES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="w in currentGroup" :key="w.id">
                            <td class="wb-fill" style="font-size:15px;">
                                {{ w.commodity }}
                                <span class="wb-bodit" style="font-size:12px;color:var(--ink-soft);margin-left:4px;">
                                    from {{ railroadStore.industries[w.fromIndustryIdx]?.displayName ?? '?' }}
                                </span>
                            </td>
                            <td class="wb-fill" style="font-size:14px;">{{ cargoByComodity[w.commodity]?.carType ?? '—' }}</td>
                            <td class="wb-fill" style="font-size:15px;text-align:center;">{{ w.quantity }}</td>
                            <td class="wb-fill" style="font-size:15px;text-align:right;">${{ (runValue(w.commodity, w.quantity) ?? 0).toLocaleString() }}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Footer -->
                <div style="margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;padding-top:16px;gap:16px;">
                    <div style="max-width:380px;">
                        <div class="wb-sc" style="font-size:11px;letter-spacing:.1em;color:var(--ink-soft);">
                            WAYBILL No.&nbsp;<span class="wb-fill" style="font-size:15px;color:var(--ironblue);">{{ waybillNo }}</span>
                        </div>
                        <div class="wb-bodit" style="font-size:11px;color:var(--ink-light);margin-top:6px;line-height:1.35;">
                            In witness whereof the Agent of said Company hath signed Bills of Lading all of this tenor, one accomplished, the others void.
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="display:flex;align-items:flex-end;gap:8px;justify-content:flex-end;">
                            <span class="wb-fat" style="font-size:18px;">Total Charges, $</span>
                            <span class="wb-fill" style="font-size:22px;min-width:80px;border-bottom:1px solid var(--rule);text-align:right;">{{ groupTotalCharges.toLocaleString() }}</span>
                        </div>
                        <div class="wb-script" style="font-size:30px;margin-top:10px;color:var(--ironblue);line-height:.7;">Agent</div>
                        <div class="wb-sc" style="font-size:10px;letter-spacing:.1em;color:var(--ink-soft);border-top:1px solid var(--rule);padding-top:3px;width:160px;margin-left:auto;margin-top:8px;">FOR THE COMPANY</div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import { useRailroadStore } from '@/stores/railroad'
import { cargoByComodity, runValue } from '@/lib/cargo'

export default {
    props: {
        waybills: { type: Array, required: true },
    },

    emits: ['close'],

    setup() {
        return { railroadStore: useRailroadStore(), cargoByComodity, runValue }
    },

    data() {
        return {
            currentIdx: 0,
            locoImage: null,
        }
    },

    computed: {
        // Group waybills by destination industry so multi-commodity deliveries share one document
        groups() {
            const map = new Map()
            for (const w of this.waybills) {
                const key = w.toIndustryIdx
                if (!map.has(key)) map.set(key, [])
                map.get(key).push(w)
            }
            return [...map.values()]
        },

        currentGroup() {
            return this.groups[this.currentIdx] ?? []
        },

        toName() {
            const idx = this.currentGroup[0]?.toIndustryIdx
            return this.railroadStore.industries[idx]?.displayName ?? 'Unknown'
        },

        // For the "Received at" line — list unique origins
        fromNames() {
            const names = [...new Set(
                this.currentGroup.map(w => this.railroadStore.industries[w.fromIndustryIdx]?.displayName ?? 'Unknown')
            )]
            return names.join(', ')
        },

        groupTotalCharges() {
            let total = 0
            for (const w of this.currentGroup) {
                total += runValue(w.commodity, w.quantity) ?? 0
            }
            return total
        },

        waybillNo() {
            return String(this.currentGroup[0]?.id ?? 0).padStart(4, '0')
        },

        dateLabel() {
            const now = new Date()
            return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + ', 1889'
        },

        roadName() {
            return this.railroadStore.railroadName ?? ''
        },
    },

    mounted() {
        this.$refs.overlay.focus()
    },

    methods: {
        prev() { if (this.currentIdx > 0) this.currentIdx-- },
        next() { if (this.currentIdx < this.groups.length - 1) this.currentIdx++ },
        printWaybill() { window.print() },
    },
}
</script>

<style>
/* ── Vintage ink & paper tokens ─────────────────────────────────────── */
:root {
    --ink:       #2c2113;
    --ink-soft:  #5c4631;
    --ink-light: #897053;
    --paper:     #f3e7c9;
    --paper-hi:  #f8f0d9;
    --paper-lo:  #e7d4ab;
    --rule:      #6f5736;
    --rule-soft: #b39a6e;
    --oxblood:   #7a2c1d;
    --ironblue:  #3a4666;
}

/* ── Typeface helpers ────────────────────────────────────────────────── */
.wb-fat    { font-family: 'Abril Fatface', serif; letter-spacing: .01em; }
.wb-sc     { font-family: 'IM Fell DW Pica SC', serif; }
.wb-bodit  { font-family: 'IM Fell English', serif; font-style: italic; }
.wb-script { font-family: 'Pinyon Script', cursive; }
.wb-fill   { font-family: 'Special Elite', monospace; color: var(--ironblue); }
.wb-flourish { color: var(--ink-soft); font-family: 'IM Fell English', serif; letter-spacing: .3em; }

/* ── Rule lines ─────────────────────────────────────────────────────── */
.wb-rule   { border: 0; border-top: 1px solid var(--rule); }
.wb-rule-d { border: 0; border-top: 3px double var(--rule); }
.wb-dotline {
    flex: 1;
    border-bottom: 1px dotted var(--rule-soft);
    align-self: flex-end;
    height: 1.1em;
    min-width: 20px;
}

/* ── Aged paper surface ─────────────────────────────────────────────── */
.wb-paper {
    position: relative;
    color: var(--ink);
    background-color: var(--paper);
    background-image:
        radial-gradient(120% 80% at 78% -10%, rgba(120,86,40,.10), transparent 60%),
        radial-gradient(90%  70% at  8% 110%, rgba(120,86,40,.12), transparent 55%),
        radial-gradient(70%  55% at 50%  50%, rgba(255,250,235,.55), transparent 70%);
    box-shadow:
        inset 0 0 60px rgba(120,86,40,.16),
        inset 0 0 4px  rgba(120,86,40,.25),
        0 4px 32px rgba(0,0,0,.35);
    overflow: hidden;
    width: 860px;
    min-height: 580px;
    padding: 30px 40px 26px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
.wb-paper::before {
    content: "";
    position: absolute; inset: 0;
    pointer-events: none; opacity: .5; mix-blend-mode: multiply;
    background-image:
        radial-gradient(circle at 12% 22%, rgba(126,86,42,.20) 0 1px,   transparent 2px),
        radial-gradient(circle at 84% 16%, rgba(126,86,42,.15) 0 1.5px, transparent 3px),
        radial-gradient(circle at 66% 78%, rgba(126,86,42,.13) 0 1px,   transparent 3px),
        radial-gradient(circle at 30% 88%, rgba(126,86,42,.12) 0 1px,   transparent 2px),
        radial-gradient(circle at 92% 60%, rgba(126,86,42,.10) 0 1px,   transparent 2px);
    background-repeat: no-repeat;
}
.wb-paper > * { position: relative; z-index: 1; }
.wb-vignette { border: 1px solid var(--rule-soft); background: rgba(255,250,235,.4); }

/* ── Articles table ─────────────────────────────────────────────────── */
.wb-articles {
    width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;
}
.wb-articles th {
    border-bottom: 1px solid var(--rule);
    border-top:    1px solid var(--rule);
    padding: 5px 8px;
    letter-spacing: .12em;
    font-weight: normal;
}
.wb-articles td {
    padding: 12px 8px;
    border-bottom: 1px dotted var(--rule-soft);
}

/* ── Loco image slot ────────────────────────────────────────────────── */
.loco-slot { flex: 0 0 auto; padding: 4px; }
.loco-img  { display: block; width: 150px; height: 92px; object-fit: cover; filter: sepia(.4) contrast(1.05); }
.loco-placeholder {
    width: 150px; height: 92px;
    display: flex; align-items: center; justify-content: center; text-align: center;
    font-family: 'Special Elite', monospace;
    font-size: 11px; color: var(--ink-light);
    border: 1px dashed var(--rule-soft);
}

/* ── Publish overlay & nav ──────────────────────────────────────────── */
.publish-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: #3b2c1a;
    display: flex; flex-direction: column; align-items: center;
    overflow-y: auto;
    outline: none;
}
.publish-nav {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    padding: 10px 20px; background: #2a1f11; flex-shrink: 0;
    position: sticky; top: 0; z-index: 10;
}
.pub-btn {
    font-family: 'Special Elite', monospace;
    font-size: 13px; color: #d4b483; background: transparent;
    border: 1px solid #6f5736; border-radius: 3px;
    padding: 5px 14px; cursor: pointer; transition: background .15s;
}
.pub-btn:hover { background: rgba(212,180,131,.1); }
.nav-center { display: flex; align-items: center; gap: 16px; }
.nav-count  { font-family: 'Special Elite', monospace; font-size: 14px; color: #d4b483; min-width: 60px; text-align: center; }
.nav-arrow  {
    font-size: 28px; line-height: 1; color: #d4b483; background: transparent;
    border: none; cursor: pointer; padding: 0 8px; transition: color .15s;
}
.nav-arrow:disabled { color: #6f5736; cursor: default; }
.nav-arrow:not(:disabled):hover { color: #fff; }

.road-name-bar { padding: 10px 0 4px; flex-shrink: 0; }
.road-name-input {
    font-family: 'Abril Fatface', serif;
    font-size: 15px; color: #d4b483; background: transparent;
    border: none; border-bottom: 1px dashed #6f5736;
    text-align: center; width: 340px; padding: 2px 8px;
    letter-spacing: .06em; outline: none;
}
.road-name-input::placeholder { color: #6f5736; }

.publish-stage { padding: 20px 0 40px; display: flex; justify-content: center; }

/* ── Print ──────────────────────────────────────────────────────────── */
@media print {
    .publish-overlay { background: white; }
    .publish-nav, .road-name-bar { display: none; }
    .publish-stage { padding: 0; }
    .wb-paper { box-shadow: none; }
}
</style>
