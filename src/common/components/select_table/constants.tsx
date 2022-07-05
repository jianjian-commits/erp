import React from 'react'
import _ from 'lodash'
import { SelectTableContext } from './interface'

export const TableContext = React.createContext<SelectTableContext>({
  fetchList: _.noop,
})
