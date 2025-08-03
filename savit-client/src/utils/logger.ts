type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug'

interface LogOptions {
  data?: any
  showTimestamp?: boolean
}

class Logger {
  private isDev = import.meta.env.MODE === 'development'

  private formatMessage(level: LogLevel, context: string, message: string, timestamp?: boolean): string {
    const icons = {
      info: 'ℹ️',
      success: '✅', 
      warn: '⚠️',
      error: '❌',
      debug: '🐛'
    }
    
    const time = timestamp ? `[${new Date().toLocaleTimeString()}] ` : ''
    return `${time}${icons[level]} [${context}] ${message}`
  }

  private log(level: LogLevel, context: string, message: string, options: LogOptions = {}) {
    if (!this.isDev && level === 'debug') return

    const formattedMessage = this.formatMessage(level, context, message, options.showTimestamp)
    
    switch (level) {
      case 'error':
        console.error(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'success':
      case 'info':
        console.log(formattedMessage)
        break
      case 'debug':
        console.debug(formattedMessage)
        break
    }

    if (options.data) {
      console.log('상세 정보:', options.data)
    }
  }

  info(context: string, message: string, data?: any) {
    this.log('info', context, message, { data })
  }

  success(context: string, message: string, data?: any) {
    this.log('success', context, message, { data })
  }

  warn(context: string, message: string, data?: any) {
    this.log('warn', context, message, { data })
  }

  error(context: string, message: string, error?: any) {
    this.log('error', context, `실패: ${message}`, { data: error })
  }

  debug(context: string, message: string, data?: any) {
    this.log('debug', context, message, { data })
  }

  // API 전용 로깅 메서드
  apiCall(method: string, url: string, data?: any) {
    this.debug('API', `${method.toUpperCase()} ${url}`, data)
  }

  apiSuccess(method: string, url: string, response?: any) {
    this.success('API', `${method.toUpperCase()} ${url} 성공`, response)
  }

  apiError(method: string, url: string, error: any) {
    this.error('API', `${method.toUpperCase()} ${url}`, error)
  }

  // Store 전용 로깅 메서드
  storeAction(storeName: string, action: string, data?: any) {
    this.debug('Store', `${storeName}.${action}`, data)
  }

  storeError(storeName: string, action: string, error: any) {
    this.error('Store', `${storeName}.${action}`, error)
  }
}

export const logger = new Logger()

// 편의를 위한 단축 함수들
export const logInfo = (context: string, message: string, data?: any) => 
  logger.info(context, message, data)

export const logSuccess = (context: string, message: string, data?: any) => 
  logger.success(context, message, data)

export const logWarn = (context: string, message: string, data?: any) => 
  logger.warn(context, message, data)

export const logError = (context: string, message: string, error?: any) => 
  logger.error(context, message, error)

export const logDebug = (context: string, message: string, data?: any) => 
  logger.debug(context, message, data)