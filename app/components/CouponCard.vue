<script setup lang="ts">
import type { Coupon } from '~/composables/useCampaign'

withDefaults(
  defineProps<{
    coupon: Coupon
    /** 店家核銷端的呈現：放大、可選取 */
    selectable?: boolean
    selected?: boolean
  }>(),
  { selectable: false, selected: false }
)
</script>

<template>
  <div
    class="relative overflow-hidden rounded-card border-2 transition-all"
    :class="[
      coupon.status === 'unused'
        ? selected
          ? 'bg-white border-clay-500 shadow-pop'
          : 'bg-white border-marigold-500 shadow-card'
        : 'bg-paper-soft border-paper-deep',
      selectable ? 'active:scale-[.99] cursor-pointer' : ''
    ]"
  >
    <div class="flex items-stretch">
      <!-- 面額區 -->
      <div
        class="shrink-0 w-[104px] grid place-items-center px-3 py-4"
        :class="coupon.status === 'unused' ? 'bg-marigold-100' : 'bg-paper-deep'"
      >
        <div class="text-center">
          <p
            class="font-black leading-none"
            :class="coupon.status === 'unused' ? 'text-ink' : 'text-ink-faint'"
          >
            <span class="text-sm align-top">$</span><span class="text-[34px]">{{ coupon.value }}</span>
          </p>
          <p class="mt-1 text-[10px] font-bold text-ink-soft">優惠券</p>
        </div>
      </div>

      <!-- 虛線撕線 -->
      <div class="relative w-0 border-l-2 border-dashed border-paper-deep ticket-notch" />

      <!-- 明細區 -->
      <div class="flex-1 min-w-0 px-3.5 py-3">
        <div class="flex items-center gap-1.5">
          <span
            class="chip"
            :class="{
              'bg-moss-100 text-moss-700': coupon.status === 'unused',
              'bg-paper-deep text-ink-faint': coupon.status !== 'unused'
            }"
          >
            {{ coupon.status === 'unused' ? '可使用' : coupon.status === 'used' ? '已核銷' : '已過期' }}
          </span>
          <span class="text-[10px] text-ink-faint">第 {{ coupon.stage }} 段任務</span>
        </div>

        <p class="mt-1.5 font-mono text-[13px] font-bold tracking-widest text-ink">
          {{ coupon.code }}
        </p>

        <p class="mt-1 text-[11px] leading-snug text-ink-soft">
          最低消費 {{ CAMPAIGN.minSpend }} 元 ‧ 不找零
        </p>
        <p class="text-[11px] text-ink-faint">
          <template v-if="coupon.status === 'used'">
            {{ coupon.usedAt }} 於 {{ coupon.usedStore }}
          </template>
          <template v-else>有效至 {{ coupon.expiresAt }}</template>
        </p>
      </div>
    </div>

    <!-- 已核銷的斜印 -->
    <div
      v-if="coupon.status !== 'unused'"
      class="pointer-events-none absolute inset-0 grid place-items-center"
    >
      <span
        class="rotate-[-14deg] rounded-lg border-[3px] border-ink-faint/40 px-4 py-1
               text-lg font-black tracking-widest text-ink-faint/50"
      >
        {{ coupon.status === 'used' ? '已核銷' : '已過期' }}
      </span>
    </div>
  </div>
</template>
