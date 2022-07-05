import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import { Flex, Form, FormItem, Select, Button, Modal, Tip } from '@gm-pc/react'
import { observer } from 'mobx-react'
import {
  BatchUpdateAfterSaleOrderTaskMethod,
  AfterSaleOrderDetail_TaskMethod,
} from 'gm_api/src/aftersale'
import type { BatchProps } from '../../interface'
import { dealWay } from '../../enum'
import store from '../../store'

const DealWay: FC<BatchProps> = observer(
  ({ selected, isSelectAll = false }) => {
    const [deal, setDealWay] = useState(
      AfterSaleOrderDetail_TaskMethod.TASK_METHOD_PICK_UP,
    )

    const handleCancel = () => {
      Modal.hide()
    }

    const handleSelect = (value: number) => {
      setDealWay(value)
    }

    const handleOk = () => {
      // 当选择 【勾选所有页内容时使用】 时传值其他情况传 null
      const filterData = store.getSearchData()
      const req = {}
      if (isSelectAll) {
        Object.assign(req, {
          ...filterData,
          method: deal,
        })
      } else {
        Object.assign(req, {
          task_ids: selected,
          method: deal,
        })
      }
      BatchUpdateAfterSaleOrderTaskMethod(req).then(() => {
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
          <FormItem label={t('更改状态为')}>
            <Select value={deal} data={dealWay} onChange={handleSelect} />
          </FormItem>
          <div className='gm-margin-left-15 gm-text-desc'>
            {t('提示：已完成的任务不能修改处理方式')}
          </div>
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
  },
)

export default DealWay
