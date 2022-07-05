import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Button } from '@gm-pc/react'
import { DetailStore } from '../stores/index'

interface BoxSummaryProps {
  handleToggle: () => void
  isShowSummary: boolean
}

const BoxSummary: FC<BoxSummaryProps> = observer(
  ({ handleToggle, isShowSummary }) => {
    const { receiptLoading, productDetailsMerged } = DetailStore
    const handleToggleTable = () => {
      handleToggle()
      if (!productDetailsMerged.length) {
        DetailStore.fetchSummaryData()
      }
    }

    return (
      <Button
        type='primary'
        onClick={handleToggleTable}
        loading={receiptLoading}
      >
        {isShowSummary ? t('按生产计划展示') : t('按商品汇总展示')}
      </Button>
    )
  },
)

export default BoxSummary
