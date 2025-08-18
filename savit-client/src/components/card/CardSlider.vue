<template>
  <div class="mb-6">
    <swiper
      v-if="cards.length > 0"
      :modules="[Navigation, Pagination]"
      :slides-per-view="1"
      :space-between="20"
      :centered-slides="true"
      :pagination="{ clickable: true, el: '.custom-pagination' }"
      :navigation="{
        nextEl: '.custom-next',
        prevEl: '.custom-prev',
      }"
      @swiper="onSwiper"
      @slide-change="onSlideChange"
      class="card-swiper"
    >
      <!-- 등록된 카드들 -->
      <swiper-slide v-for="(card, index) in cards" :key="card.cardId">
        <div
          class="w-full aspect-[16/10] rounded-xl relative overflow-hidden"
          :style="{
            backgroundImage: `url(${card.resImageLink})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }"
        >
          <!-- 그라디언트 오버레이 -->
          <div class="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60"></div>

          <!-- 카드 정보 -->
          <div class="relative z-10 h-full flex flex-col justify-between p-6 text-white">
            <div>
              <div class="flex items-center justify-between">
                <div class="text-sm opacity-90 drop-shadow-lg">
                  {{ card.cardName || '카드별칭' }}
                </div>
              </div>
              <div class="text-3xl font-bold mt-8 drop-shadow-lg">
                {{ totalAmount.toLocaleString() }}원
              </div>
            </div>

            <div>
              <div class="flex justify-between items-end">
                <div class="text-sm opacity-90 drop-shadow">이번 달 사용 금액</div>
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>

      <!-- 새 카드 등록 버튼 -->
      <swiper-slide>
        <router-link
          to="/card/register"
          class="block w-full aspect-[16/10] rounded-3xl p-6 relative overflow-hidden border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 active:scale-95 transition-all"
        >
          <div class="relative z-10 h-full flex flex-col justify-center items-center text-center">
            <div
              class="w-16 h-16 bg-app-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <svg class="w-8 h-8 text-app-green" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="text-slate-800 text-lg font-semibold mb-2">새 카드 등록</div>
            <div class="text-slate-500 text-sm">카드를 추가해보세요</div>
          </div>
        </router-link>
      </swiper-slide>
    </swiper>

    <!-- 카드가 없을 때 새 카드 추가 버튼만 표시 -->
    <div v-else class="w-full max-w-80 mx-auto">
      <router-link
        to="/card/register"
        class="block w-full aspect-[16/10] rounded-3xl p-6 relative overflow-hidden border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 active:scale-95 transition-all"
      >
        <div class="relative z-10 h-full flex flex-col justify-center items-center text-center">
          <div
            class="w-16 h-16 bg-app-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <svg class="w-8 h-8 text-app-green" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="text-slate-800 text-lg font-semibold mb-2">새 카드 등록</div>
          <div class="text-slate-500 text-sm">카드를 추가해보세요</div>
        </div>
      </router-link>
    </div>

    <!-- 외부 네비게이션 -->
    <div
      class="relative flex justify-center items-center mt-4"
      v-if="cards.length > 0 && totalSlots > 1"
    >
      <!-- 이전 버튼 -->
      <button
        class="custom-prev absolute left-0 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-all hover:bg-slate-50 shadow-sm"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- 페이지네이션 (가운데) -->
      <div class="custom-pagination flex justify-center items-center space-x-2"></div>

      <!-- 다음 버튼 -->
      <button
        class="custom-next absolute right-0 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-all hover:bg-slate-50 shadow-sm"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import type { Card } from '@/types/card.ts'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Props {
  cards: Card[]
  totalAmount: number
}

interface Emits {
  (e: 'slide-change', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const swiperInstance = ref<SwiperType | null>(null)

const totalSlots = computed(() => props.cards.length + 1)

// Swiper 이벤트 핸들러
const onSwiper = (swiper: SwiperType) => {
  swiperInstance.value = swiper
}

const onSlideChange = (swiper: SwiperType) => {
  emit('slide-change', swiper.activeIndex)
}
</script>

<style scoped>
/* Swiper 커스텀 스타일 */
.card-swiper {
  width: 100%;
  max-width: 20rem;
  margin: 0 auto;
}

.card-swiper .swiper-slide {
  display: flex;
  justify-content: center;
}

/* 외부 네비게이션 스타일 */
.custom-prev,
.custom-next {
  cursor: pointer;
}

/* 외부 페이지네이션 스타일 */
.custom-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 40px; /* 버튼과 같은 높이로 맞춤 */
}

.custom-pagination .swiper-pagination-bullet {
  width: 8px;
  height: 8px;
  background-color: #cbd5e1;
  border-radius: 50%;
  opacity: 1;
  transition: background-color 0.15s ease-in-out;
  cursor: pointer;
}

.custom-pagination .swiper-pagination-bullet-active {
  background-color: #16a34a;
}

/* 터치 반응 개선 */
.active\:scale-95:active {
  transform: scale(0.95);
}

/* 호버 효과 */
.hover\:bg-slate-50:hover {
  background-color: rgb(248 250 252);
}

/* 전환 효과 */
.transition-all {
  transition: all 0.15s ease-in-out;
}
</style>
