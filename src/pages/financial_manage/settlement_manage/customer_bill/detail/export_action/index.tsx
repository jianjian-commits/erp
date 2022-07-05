import React, { useRef } from 'react'
import { t } from 'gm-i18n'
import { Button, Popover, List, ListDataItem } from '@gm-pc/react'
import SVGDownTriangle from '@/svg/down_triangle.svg'

type ActionEventName =
  /** 导出账单明细表 */
  | 'onExportBillDetail'
  /** 导出订单明细表 */
  | 'onExportOrderDetail'
  /** 导出商品汇总表 */
  | 'onExportProductSummary'
  /** 导出订单类型汇总表 */
  | 'onExportOrderTypeSummary'
  /** 自定义导出字段 */
  | 'onEditFields'

type ActionEvent = Partial<Record<ActionEventName, () => void>>

interface ExportActionProps extends ActionEvent {
  className?: string
  style?: React.CSSProperties
}

const Action: ListDataItem<ActionEventName>[] = [
  { value: 'onExportBillDetail', text: t('导出账单明细表') },
  { value: 'onExportOrderDetail', text: t('导出订单明细表') },
  { value: 'onExportProductSummary', text: t('导出商品汇总表') },
  { value: 'onExportOrderTypeSummary', text: t('导出订单类型汇总表') },
  // { value: 'onEditFields', text: t('自定义导出字段') },
]

const ExportAction: React.VFC<ExportActionProps> = (props) => {
  const { className, style } = props

  const popoverRef = useRef<Popover>(null)

  const handleAction = (type: ActionEventName) => {
    const handler = props[type]
    const closePopover = popoverRef.current?.apiDoSetActive
    if (typeof closePopover === 'function') {
      closePopover(false)
    }
    if (typeof handler === 'function') {
      handler()
    }
  }

  return (
    <Popover
      type='click'
      right
      ref={popoverRef}
      popup={
        <>
          <List
            data={Action}
            onSelect={handleAction}
            className='gm-border-0'
            style={{ minWidth: '120px' }}
          />
          <button
            className='tw-block tw-w-full tw-border-none tw-bg-blue-50 tw-text-blue-500 tw-py-1 tw-font-bold tw-cursor-pointer'
            onClick={() => {
              handleAction('onEditFields')
            }}
          >
            {t('自定义导出字段')}
          </button>
        </>
      }
    >
      <Button className={className} style={style}>
        <span className='gm-margin-right-10'>{t('导出')}</span>
        <SVGDownTriangle />
      </Button>
    </Popover>
  )
}

export default ExportAction
