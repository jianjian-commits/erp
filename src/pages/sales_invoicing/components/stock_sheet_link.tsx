import { history } from '@/common/service'
import IsInvented from '@/pages/sales_invoicing/components/isInvented'
import { Flex } from '@gm-pc/react'
import React, { FC } from 'react'

interface Props {
  url: string
  showText: string
  sheetStatus: number
  stockSheetId: string
  status?: string
  target?: boolean
}

const StockSheetLink: FC<Props> = (props) => {
  const { showText, sheetStatus, target, url, stockSheetId, status } = props
  return (
    <Flex column>
      <a
        onClick={(e) => {
          e.preventDefault()
          const targetUrl = `${url}/detail?sheet_id=${stockSheetId}`
          target ? window.open(`#${targetUrl}`) : history.push(targetUrl)
        }}
        className='gm-cursor'
      >
        {showText}
      </a>
      <IsInvented status={status!} />
    </Flex>
  )
}

export default StockSheetLink
