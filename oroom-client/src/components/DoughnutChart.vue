<template>
  <div class="p-5 max-w-2xl mx-auto font-[Pretendard]">
    <h2 class="text-center text-gray-500">카드 사용 현황</h2>

    <div class="flex justify-center items-center h-96 my-5 border-none rounded-lg p-5 bg-gray-50">
      <canvas ref="chartCanvas" class="w-100 h-100 rounded-lg"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const chartCanvas = ref<HTMLCanvasElement | null>(null)

let chartInstance: any = null

const chartData = {
  labels: ['남은 예산', '카드1', '카드2', '카드3'],
  datasets: [
    {
      data: [10, 20, 30, 40],
      backgroundColor: ['transparent', '#92DE8B', '#0AB68B', '#028174'],
      borderWidth: 0,
      cutout: '65%', // 두께 조절
      borderRadius: 20,
      spacing: -50,
    },
    {
      data: [10, 20, 30, 40],
      backgroundColor: ['#E5E7EB', 'transparent', 'transparent', 'transparent'],
      borderWidth: 0,
      cutout: '80%', // 두께 조절
      borderRadius: 20,
      spacing: 0,
      radius: '105%',
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // 캔버스 안에 차트 고정 (창 크기에 영향 X)
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20, // 여백
        usePointStyle: true,
      },
      // onClick: () => {},     // 항목 클릭시 숨김처리가 디폴트라 원치 않으면 onClick 별도 선언
    },
    tooltip: {
      callbacks: {
        // 백분율 표시
        label: function (context: any) {
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((context.parsed * 100) / total).toFixed(1)
          return `${context.label}: ${context.parsed} (${percentage}%)`
        },
      },
    },
  },
  rotation: -35,
  circumference: 360,
}

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart: any) {
    const { ctx } = chart

    // 첫 번째 데이터의 메타 정보에서 중심 좌표를 얻음
    const meta = chart.getDatasetMeta(0)
    const arc = meta.data[0]
    if (!arc) return

    const { x, y } = arc.getProps(['x', 'y'], true)

    ctx.save()
    ctx.font = 'bold 1.5rem Pretendard'
    ctx.fillStyle = '#333'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillText('사용량 %', x, y)
    ctx.restore()
  },
}

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`)
    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.type = 'text/javascript'
    script.async = false

    script.onload = () => {
      console.log(`Successfully loaded: ${src}`)
      resolve()
    }

    script.onerror = (error) => {
      console.error(`Failed to load script: ${src}`, error)
      reject(new Error(`Failed to load script: ${src}`))
    }

    document.head.appendChild(script)
  })
}

// 차트 초기화
const initChart = () => {
  if (!chartCanvas.value || !window.Chart) {
    return
  }

  chartInstance = new window.Chart(chartCanvas.value, {
    type: 'doughnut',
    data: chartData,
    options: chartOptions,
    plugins: [centerTextPlugin],
  })
}

// 전역 Chart 선언
declare global {
  interface Window {
    Chart: any
  }
}

onMounted(async () => {
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js')

    if (!window.Chart) {
      throw new Error('차트 불러오기 실패')
    }

    // 차트 초기화
    initChart()
  } catch (error) {
    // 실패 시 fallback: 에러 메시지를 캔버스에 표시
    if (chartCanvas.value) {
      const ctx = chartCanvas.value.getContext('2d')
      if (ctx) {
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(
          'Chart loading failed',
          chartCanvas.value.width / 2,
          chartCanvas.value.height / 2,
        )
      }
    }
  }
})
</script>

<style scoped>
/* 전체 차트 영역 스타일 */
.chart-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Pretendard';
}

/* 캔버스 둥근 모서리 처리 */
canvas {
  border-radius: 4px;
  border: none;
}
</style>
