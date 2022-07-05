import _ from 'lodash'

import { ProcessorItem } from './interface'

export const recursiveCloseItem = (list: ProcessorItem[]) => {
  _.forEach(list, (item) => {
    item.expand = false
    if (item.children && item.children.length) {
      recursiveCloseItem(item.children)
    }
  })
}
