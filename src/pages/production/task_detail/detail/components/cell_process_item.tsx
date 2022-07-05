import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'

import { cellHeight } from '@/pages/production/enum'

interface Props {
  text: string
}

const CellProcessItem: FC<Props> = observer(({ text }) => {
  return (
    <Flex
      column
      justifyCenter
      style={{
        width: '100%',
        height: `${cellHeight}px`,
      }}
    >
      {text}
    </Flex>
  )
})

export default CellProcessItem
