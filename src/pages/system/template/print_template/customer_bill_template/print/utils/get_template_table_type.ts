import _ from 'lodash'
import type { Template } from '../service/get_print_template'
import {
  isValidTableType,
  TableType,
} from '../../config/data_to_key/table_type'

/**
 * 获取打印模板中的表格的类型，用于数据请求
 */
function getTemplateTableType(template: Template): TableType[] {
  const { contents } = template
  const typeSet = new Set<TableType>()
  _.forEach(contents, (item) => {
    if (item.type === 'table' && isValidTableType(item.dataKey)) {
      typeSet.add(item.dataKey)
    }
  })
  return Array.from(typeSet)
}

export default getTemplateTableType
