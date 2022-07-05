declare module 'gm-i18n' {
  type language = 'zh' | 'zh-HK' | 'en' | 'th'
  function t(text: string, config?: { [key: string]: string }): string

  class i18next {
    static t(text: string, config?: { [key: string]: string }): string
  }

  class appTranslator {
    static loadSimplifiedChinese(obj: { [key: string]: string }): void
  }
  function getCurrentLng(lng: string): language
  function getCurrentLng(): language
  export { t, i18next, appTranslator, getCurrentLng }
}

declare module 'gm-excel' {
  function doImport(file: File): Promise<any>
  function doExport(list: any[][], opts: any): void
}

declare module 'gm-printer-label'

declare module '*.svg' {
  import React from 'react'
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.png' {
  const value: string
  export default value
}
declare module 'qrcode.react' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare const __DEVELOPMENT__: boolean
