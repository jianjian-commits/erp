import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import { Modal } from 'antd'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { LabelFilter } from '../interface'
import SupplierSelect from '../../supplier_select'
import createStore from '../store'
import _ from 'lodash'

interface Supplier {
  visible: boolean
  handleSupplierVisible: (visible: boolean) => void
  options: LabelFilter[]
}

const Supplier: FC<Supplier> = ({
  visible,
  handleSupplierVisible,
  options,
}) => {
  const { list, setList } = createStore
  const [value, setValue] = useState('')
  const handleCancel = () => {
    handleSupplierVisible(false)
  }

  const handleOk = () => {
    const tableList = _.map(list, (item) => ({
      ...item,
      supplier_id: value,
    }))
    setList(tableList)

    handleSupplierVisible(false)
  }

  const handleChange = (value: string) => {
    setValue(value)
  }

  return (
    <Modal
      key='supplier'
      title={t('一键设置供应商')}
      onCancel={handleCancel}
      onOk={handleOk}
      visible={visible}
    >
      <Flex className='tw-h-9' alignCenter>
        <span>{t('供应商：')}</span>
        <SupplierSelect
          onChange={handleChange}
          options={options}
          style={{ width: '200px' }}
        />
      </Flex>
    </Modal>
  )
}
export default observer(Supplier)
