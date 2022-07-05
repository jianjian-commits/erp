import React from 'react'

import { TreeTitleProps } from './data'

/** Tree title and action node */
const TreeTitle = (props: TreeTitleProps) => {
  const {
    node: { title = '-', icon, key },
    treeDataMap,
    treeExtraActions,
  } = props

  const level = treeDataMap[key]?.level || 0

  return (
    <>
      <div className='tree-title-node'>
        <span title={title as string} className='tree-title'>
          {icon}
          {title}
        </span>
        <span className='tree-title-placeholder-node' />
        <span className='tree-title-action'>
          {treeExtraActions && treeExtraActions[level]}
        </span>
      </div>
    </>
  )
}

export default TreeTitle
