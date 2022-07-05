import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  Flex,
  Form,
  FormItem,
  MoreSelect,
  Button,
  Modal,
  Tip,
  MoreSelectDataItem,
} from '@gm-pc/react'
import type { BatchProps } from '../../interface'
import store from '../../store'
import { BatchUpdateAfterSaleOrderTaskDriver } from 'gm_api/src/aftersale'

interface Selected {
  text: string
  value: string
}

const Driver: FC<BatchProps> = observer(({ selected, isSelectAll = false }) => {
  const { driverList } = store
  const [driver, setDriver] = useState<Selected>({
    value: '',
    text: '',
  })

  const handleChange = (selected: Selected) => {
    setDriver(selected)
  }

  const handleCancel = () => {
    Modal.hide()
  }

  const handleOk = () => {
    if (driver === undefined || driver?.value! === '') {
      Tip.danger(t('请选择司机'))
      return
    }
    const filterData = store.getSearchData()
    const req = {}
    if (isSelectAll) {
      Object.assign(req, {
        ...filterData,
        driver_id: driver?.value!,
      })
    } else {
      Object.assign(req, {
        task_ids: selected,
        driver_id: driver?.value!,
      })
    }
    BatchUpdateAfterSaleOrderTaskDriver(req).then(() => {
      Modal.hide()
      Tip.success(t('修改成功'))
      store.doRequest()
      return null
    })
  }

  return (
    <Flex column>
      <Form labelWidth='90px' className='gm-padding-lr-20'>
        <div className='gm-margin-left-15 gm-margin-bottom-20'>
          {isSelectAll
            ? t('选中了当前所有页售后任务')
            : t(`已勾选${selected.length}售后任务`)}
        </div>
        <FormItem label={t('司机修改为')}>
          <MoreSelect
            renderListFilterType='pinyin'
            placeholder={t('请选择司机')}
            data={driverList}
            selected={driver}
            onSelect={(selected: MoreSelectDataItem<string>) => {
              handleChange(selected)
            }}
          />
        </FormItem>
        <Flex className='gm-margin-left-15 gm-text-desc'>
          {t('提示：已完成的任务不能修改司机')}
        </Flex>
      </Form>

      <div className='gm-text-right'>
        <Button className='gm-margin-right-10' onClick={handleCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleOk}>
          {t('确定')}
        </Button>
      </div>
    </Flex>
  )
})

export default Driver
