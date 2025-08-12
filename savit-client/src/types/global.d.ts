declare global {
  interface Window {
    IMP: {
      init: (impCode: string) => void
      request_pay: (data: any, callback: (response: any) => void) => void
    }
  }
}

export {}