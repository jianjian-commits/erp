import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import { Modal } from 'antd'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { LabelFilter } from '../interface'
import PurchaseSelect from '../../purchase_select'
import _ from 'lodash'
import store from '../store'
interface Purchase {
  visible: boolean
  handlePurchaseVisible: (visible: boolean) => void
  options: LabelFilter[]
}
const Purchase: FC<Purchase> = ({
  visible,
  handlePurchaseVisible,
  options,
}) => {
  const { list, setList } = store

  const [value, setValue] = useState('')

  const handleCancel = () => {
    handlePurchaseVisible(false)
  }

  /** 点击确认的时候 */
  const handleOk = () => {
    const tableList = _.map(list, (item) => ({
      ...item,
      purchaser_id: value,
    }))
    setList(tableList)
    handlePurchaseVisible(false)
  }

  /** 赋值value */
  const handleChange = (value: string) => {
    setValue(value)
  }
  return (
    <Modal
      key='purchase'
      title={t('一键设置采购员')}
      visible={visible}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <Flex className='tw-h-9' alignCenter>
        <span>{t('采购员：')}</span>
        <PurchaseSelect
          onChange={(value) => handleChange(value)}
          options={options}
          style={{ width: '200px' }}
        />
      </Flex>
    </Modal>
  )
}
export default observer(Purchase)
