import { Processor, ProcessType } from 'gm_api/src/production'

interface ProcessTypeItem extends ProcessType {
  value: string
  text: string
}

interface ProcessorItem extends Processor {
  edit?: boolean
  expand?: boolean
  showIcon?: boolean
  selected?: boolean
  children: ProcessorItem[]
}

export type { ProcessorItem, ProcessTypeItem }
