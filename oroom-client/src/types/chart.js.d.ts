// types/chart.js.d.ts
declare module 'chart.js' {
  export class Chart {
    constructor(ctx: HTMLCanvasElement | string, config: any)
    static register(...items: any[]): void
    data: any
    update(): void
    destroy(): void
  }

  export const DoughnutController: any
  export const ArcElement: any
  export const Tooltip: any
  export const Legend: any

  export interface ChartConfiguration {
    type: string
    data: any
    options?: any
  }

  export interface ChartData {
    labels?: string[]
    datasets: any[]
  }

  export interface ChartOptions {
    responsive?: boolean
    maintainAspectRatio?: boolean
    plugins?: any
  }
}

declare module 'chartjs-plugin-doughnutlabel' {
  const plugin: any
  export default plugin
}
