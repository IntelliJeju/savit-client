<template>
  <!-- 세그먼트별로 나뉘어진 프로그레스바 컴포넌트 -->
  <div class="segmented-progress-container">
    <!-- 프로그레스바 본체 -->
    <div class="progress-back w-full h-2 bg-[#E0E0E0] rounded-full">
      <!-- 각 세그먼트를 렌더링 -->
      <div 
        v-for="(segment, index) in segments"
        :key="`${name}-segment-${index}`"
        class="progress-segment h-2"
        :class="{
          'rounded-l-full': index === 0,
          'rounded-r-full': index === segments.length - 1
        }"
        :style="{ 
          width: (segment.value / total) * 100 + '%',
          backgroundColor: segment.color,
          marginLeft: index > 0 ? '-1px' : '0'
        }"
      />
    </div>
    
    <!-- 범례 (legend) 영역 - showLegend가 true일 때만 표시 -->
    <div v-if="showLegend" class="legend-container mt-2">
      <!-- 각 세그먼트에 대한 범례 항목 -->
      <div 
        v-for="(segment, index) in segments"
        :key="`${name}-legend-${index}`"
        class="legend-item flex items-center gap-2 text-xs"
      >
        <!-- 색상 표시 점 -->
        <div 
          class="legend-color w-3 h-3 rounded-full"
          :style="{ backgroundColor: segment.color }"
        />
        <!-- 세그먼트 라벨 -->
        <span class="legend-label">{{ segment.label }}</span>
        <!-- 세그먼트 값 (퍼센트) -->
        <span class="legend-value text-gray-500">{{ segment.value.toFixed(1) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 세그먼트 데이터 구조 정의
 * 각 세그먼트는 라벨, 값, 색상 정보를 포함
 */
interface Segment {
  label: string    // 세그먼트 이름 (예: "식당", "카페")
  value: number    // 세그먼트 값 (백분율)
  color: string    // 세그먼트 색상 (HEX 또는 RGB)
}

/**
 * 컴포넌트 props 정의
 * @param name - 프로그레스바 식별자 (고유 키 생성용)
 * @param segments - 표시할 세그먼트 배열
 * @param total - 전체 값 (일반적으로 100)
 * @param showLegend - 범례 표시 여부 (기본값: true)
 */
const props = withDefaults(defineProps<{
  name: string        // 프로그레스바 고유 식별자
  segments: Segment[] // 세그먼트 데이터 배열
  total: number       // 전체 기준값 (보통 100%)
  showLegend?: boolean // 범례 표시 여부
}>(), {
  showLegend: true
})
</script>

<style scoped>
/* 프로그레스바 컨테이너 - 전체 너비 사용 */
.segmented-progress-container {
  width: 100%;
}

/* 프로그레스바 배경 - flexbox로 세그먼트들 배치 */
.progress-back {
  position: relative;
  display: flex;
}

/* 개별 프로그레스 세그먼트 - 좌측부터 배치 */
.progress-segment {
  float: left;
}

/* 범례 컨테이너 - 가로 배치, 필요시 줄바꿈 */
.legend-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* 개별 범례 항목 - 색상점, 라벨, 값을 가로 배치 */
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 범례 색상 점 - 크기 고정 */
.legend-color {
  flex-shrink: 0;
}

/* 범례 라벨 텍스트 - 중간 굵기 */
.legend-label {
  font-weight: 500;
}

/* 범례 값 텍스트 - 일반 굵기 */
.legend-value {
  font-weight: 400;
}
</style>