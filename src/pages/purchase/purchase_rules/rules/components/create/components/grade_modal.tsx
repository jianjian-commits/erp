import React, { FC, useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import { Modal } from 'antd'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { LabelFilter } from '../interface'
import { Sku } from 'gm_api/src/merchandise'
import GradeSelect from '../../grade_select'
import store from '../store'
import _ from 'lodash'
interface Grade {
  visible: boolean
  options: LabelFilter[]
  skuInfo: Sku
  type: string
  handleGradeVisible: (visible: boolean) => void
}
const GradeModal: FC<Grade> = ({
  visible,
  handleGradeVisible,
  options,
  skuInfo,
  type,
}) => {
  const { list, setList } = store

  const [value, setValue] = useState('')
  const handleCancel = () => {
    handleGradeVisible(false)
  }

  const handleOk = () => {
    const tableList = _.map(list, (item) => ({
      ...item,
      level_field_id: value,
    }))
    setList(tableList)
    handleGradeVisible(false)
  }

  /** 赋值value */
  const handleChange = (value: string) => {
    setValue(value)
  }
  return (
    <Modal
      key='grade'
      title={t('一键设置商品等级')}
      visible={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Flex className='tw-h-9' alignCenter>
        <span>{t('商品等级：')}</span>
        <GradeSelect
          onChange={(value) => handleChange(value)}
          options={options}
          type={type}
          skuInfo={skuInfo}
          style={{ width: '200px' }}
        />
      </Flex>
    </Modal>
  )
}
export default observer(GradeModal)
