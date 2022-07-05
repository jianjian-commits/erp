import React, { FC, ReactNode } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Flex } from '@gm-pc/react'

interface TableListTipsProps {
  tips: ReactNode[]
}

// PS 这个组件黄黄的 提示
/*
tips: [element,element,...], false则不显示
 */
const TableListTips: FC<TableListTipsProps> = (props) => {
  const legalTips = _.filter(props.tips, (item) => {
    return item
  }) // 若全部为false，则不显示

  return (
    <>
      {legalTips.length > 0 && (
        <Flex row className='b-table-tip gm-padding-tb-10'>
          <span className='b-table-tip-default'>{t('提示：')}</span>
          <ul className='gm-padding-left-10 gm-margin-tb-0'>
            {_.map(legalTips, (tip, index) => {
              return (
                tip && (
                  <li
                    className='b-table-tip-text'
                    key={`${tip}${index}`}
                    style={{ marginTop: index > 0 ? '10px' : '0px' }}
                  >
                    {tip}
                  </li>
                )
              )
            })}
          </ul>
        </Flex>
      )}
    </>
  )
}

export default TableListTips
