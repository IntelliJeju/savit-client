<template>
  <div class="p-5 max-w-2xl mx-auto">
    <div class="flex justify-center items-center h-96 border-none rounded-lg p-5">
      <canvas ref="chartCanvas" class="w-100 h-100 rounded-lg"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCardsStore } from '@/stores/cards'
// import { useBudgetsStore } from '@/stores/budgets'

interface Props {
  totalAmount: number
  totalBudget: number
}

const props = defineProps<Props>()

const cardsStore = useCardsStore()

const chartCanvas = ref<HTMLCanvasElement | null>(null)

let chartInstance: any = null

const generateCardColors = (cards: any[]): string[] => {
  // 카드사별 색상 매핑
  const cardCompanyColors: { [key: string]: string } = {
    '국민': '#FFBC00', 
    '신한': '#0046FF',
    '하나': '#008485',
    '비씨': '#FA3246',
    '기본': '#0AB68B'
  }
  
  const colors = cards.map(card => {
    const cardName = card.cardName || ''
    // 카드명에서 카드사 추출
    const company = Object.keys(cardCompanyColors).find(comp => cardName.includes(comp))
    return cardCompanyColors[company || '기본']
  })
  
  return [...colors, 'transparent']
}

const chartData = computed(() => {
  const cards = cardsStore.registeredCards
  const billingData = cardsStore.currentMonthBilling
  
  const labels = cards.map(card => card.cardNickname || card.cardName)
  const amounts = cards.map(card => {
    const billing = billingData.find(b => b.cardId === card.cardId)
    return billing ? billing.amount : 0
  })
  
  const totalAmount = props.totalAmount
  const totalBudget = props.totalBudget
  const remainingBudget = Math.max(0, totalBudget - totalAmount)
  
  return {
    labels: [...labels,'남은 예산'],
    datasets: [
      {
        data: [...amounts, remainingBudget],
        backgroundColor: generateCardColors(cards),
        borderWidth: 0,
        cutout: '65%',
        borderRadius: 20,
      },
      {
        data: [...amounts, remainingBudget],
        backgroundColor: [...new Array(cards.length).fill('transparent'),'#D9D9D9'],
        borderWidth: 0,
        cutout: '80%',
        borderRadius: 20,
        radius: '105%',
      },
    ],
    totalAmount,
    totalBudget,
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // 캔버스 안에 차트 고정 (창 크기에 영향 X)
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20, // 여백
        usePointStyle: true,
        filter: function(legendItem: any) {
          return legendItem.text !== '남은 예산'
        }
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
  rotation: 0,
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

    const totalAmount = chartData.value.totalAmount
    const totalBudget = chartData.value.totalBudget

    ctx.save()
    ctx.font = 'bold 2rem Pretendard'
    ctx.fillStyle = '#333'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillText(`${((totalAmount/totalBudget)*100).toFixed(1).toLocaleString()}%`, x, y - 10)
    
    ctx.font = '1rem Pretendard'
    ctx.fillText('사용률', x, y + 25)
  
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
    data: chartData.value,
    options: chartOptions,
    plugins: [centerTextPlugin],
  })
}

// 차트 업데이트
const updateChart = () => {
  if (chartInstance && chartData.value) {
    chartInstance.data = chartData.value
    chartInstance.update()
  }
}

// 차트 데이터 변경 감지
watch(chartData, updateChart, { deep: true })

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
