import React from 'react'
import { CatagoryFilterTreeContext } from './data'
import _ from 'lodash'
import { t } from 'gm-i18n'

export const ComponentContext = React.createContext<CatagoryFilterTreeContext>({
  isExpandTree: false,
  setExpandTree: _.noop,
  selectedKeys: [],
  setSelectedKeys: _.noop,
  treeDataMap: {},
})

export const DEFAULT_TREE_NAME_ENUM = {
  name: t('全部分类'),
  key: '0',
}
