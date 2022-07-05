import { ListProcessor, Processor } from 'gm_api/src/production'
import _ from 'lodash'

interface ModalItem extends Processor {
  value: string
  text: string
  children: ModalItem[]
}

async function getModalTree() {
  const res = await ListProcessor({ paging: { limit: 999 } })

  const { processors } = res.response
  const map: { [key: string]: ModalItem } = {}
  const tree: ModalItem[] = []

  _.each(processors, (processor: Processor) => {
    const newProcessor: ModalItem = {
      ...processor,
      value: processor.processor_id,
      text: processor.name,
      children: [],
    }

    map[newProcessor.processor_id] = newProcessor

    // 目前只有两层模型，一级
    if (newProcessor.parent_id === '0') {
      tree.push(newProcessor)
    } else {
      if (newProcessor.parent_id && map[newProcessor.parent_id]) {
        map[newProcessor.parent_id].children.push(newProcessor)
      }
    }
  })

  return tree
}

function getFactoryModalTree() {
  return getModalTree()
}

export default getFactoryModalTree
export type { ModalItem }
