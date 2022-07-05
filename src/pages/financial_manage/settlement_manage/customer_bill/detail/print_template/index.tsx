import React, { useEffect, useState } from 'react'
import { Button, Drawer, Spin, Radio, message } from 'antd'
import { Link } from 'react-router-dom'
import { t } from 'gm-i18n'
import usePrintTemplateList from './use_print_template_list'
import _ from 'lodash'
import { openNewTab } from '@/common/util'
import { SearchTimeParams } from '../interface'

export interface PrintTemplateProps {
  visible?: boolean
  /** 客户 id */
  customerId?: string
  /** 时间筛选参数 */
  timeFilter?: SearchTimeParams
  onClose?: (visible: false) => void
}

const PrintTemplate: React.VFC<PrintTemplateProps> = (props) => {
  const { visible, customerId, timeFilter, onClose } = props

  const handleClose = () => {
    onClose && onClose(false)
  }

  const { list, loading, defaultTemplateId } = usePrintTemplateList({
    ready: visible,
  })
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>()

  useEffect(() => {
    setSelectedTemplateId((id) => {
      if (id) {
        return id
      }
      return defaultTemplateId
    })
  }, [defaultTemplateId])

  const onPrint = () => {
    if (!selectedTemplateId) {
      message.error({
        key: 'CUSTOMER_BILL_PRINT_TEMPLATE',
        content: t('请选择打印模板'),
      })
      return
    }
    if (!customerId) {
      message.error({
        key: 'CUSTOMER_BILL_PRINT_TEMPLATE_CUSTOMER_ID',
        content: t('数据错误，缺少客户信息'),
      })
      return
    }
    if (!timeFilter) {
      message.error({
        key: 'CUSTOMER_BILL_PRINT_TEMPLATE_TIME',
        content: t('数据错误，缺少账单周期'),
      })
      return
    }
    const timeQueryString = new URLSearchParams(
      _.pickBy(timeFilter, (item) => !_.isNil(item)) as Record<string, string>,
    ).toString()

    openNewTab(
      `#system/template/print_template/customer_bill_template/print?template_id=${selectedTemplateId}&customerId=${customerId}&${timeQueryString}`,
    )
  }

  return (
    <Drawer
      visible={visible}
      title={t('选择单据模板')}
      extra={
        <Button type='primary' onClick={onPrint}>
          {t('打印')}
        </Button>
      }
      onClose={handleClose}
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <Radio.Group
          className='tw-w-full'
          value={selectedTemplateId}
          onChange={(e) => {
            setSelectedTemplateId(e.target.value)
          }}
        >
          {_.map(list, (item) => (
            <div key={item.id} className='tw-flex tw-items-center'>
              <Radio key={item.id} value={item.id}>
                {item.name}
              </Radio>
              <Link
                className='tw-ml-auto tw-text-xs'
                target='_blank'
                rel='noopener noreferrer'
                to={`/system/template/print_template/customer_bill_template/edit?template_id=${item.id}`}
              >
                {t('设置模板')}
              </Link>
            </div>
          ))}
        </Radio.Group>
      </Spin>
    </Drawer>
  )
}

export default PrintTemplate
