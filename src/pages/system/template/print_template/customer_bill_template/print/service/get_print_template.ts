import { t } from 'gm-i18n'
import { GetPrintingTemplate } from 'gm_api/src/preference'

export interface Template {
  name: string
  page: Page
  header: Header
  contents: Content[]
  sign: Sign
  footer: Footer
}

interface Footer {
  blocks: Block3[]
  style: Style
}

interface Block3 {
  text: string
  style: Style7
}

interface Style7 {
  right: string
  left: string
  position: string
  top: string
}

interface Sign {
  blocks: any[]
  style: Style
}

export interface Content {
  blocks?: Block2[]
  style?: Style4
  className?: string
  type?: string
  dataKey?: string
  subtotal?: Subtotal
  specialConfig?: SpecialConfig
  columns?: Column[]
}

interface Column {
  head: string
  headStyle: HeadStyle
  style: Style6
  text: string
}

interface Style6 {
  textAlign: string
}

interface HeadStyle {
  textAlign: string
  width?: string
}

interface SpecialConfig {
  style: Style5
}

interface Style5 {}

interface Subtotal {
  show: boolean
}

interface Style4 {
  height: string
  fontWeight?: string
}

interface Block2 {
  text: string
  style: Style3
}

interface Style3 {
  left: string
  position: string
  top: string
}

interface Header {
  style: Style
  blocks: Block[]
}

interface Block {
  text: string
  style: Style2
}

interface Style2 {
  right?: string
  left: string
  position: string
  top: string
  fontWeight?: string
  fontSize?: string
  textAlign?: string
}

interface Style {
  height: string
}

interface Page {
  name: string
  size: Size
  printDirection: string
  type: string
  gap: Gap
}

interface Gap {
  paddingRight: string
  paddingLeft: string
  paddingBottom: string
  paddingTop: string
}

interface Size {
  width: string
  height: string
}

/**
 * 获取打印模板
 */
async function getPrintTemplate(templateId: string): Promise<Template> {
  try {
    const res = await GetPrintingTemplate({ printing_template_id: templateId })
    const layout = JSON.parse(
      res.response.printing_template.attrs?.layout || '',
    )
    if (!layout) {
      return Promise.reject(Error(t('此模板不存在')))
    }
    return layout
  } catch (error) {
    return Promise.reject(error)
  }
}

export default getPrintTemplate
