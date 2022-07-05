import React from 'react'
import _ from 'lodash'
import { TAnchorContext } from './Anchor'

export const AnchorContext = React.createContext<TAnchorContext>({
  activeId: '',
  onActive: _.noop,
})
