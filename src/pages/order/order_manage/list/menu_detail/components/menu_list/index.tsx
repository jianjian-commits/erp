import React from 'react'
import { observer } from 'mobx-react'
import View from './view'
import Edit from './edit'
import store from '../../store'

const MenuList = () => {
  const {
    order: { view_type },
  } = store
  if (view_type === 'view') {
    return <View />
  }
  return <Edit />
}

export default observer(MenuList)
