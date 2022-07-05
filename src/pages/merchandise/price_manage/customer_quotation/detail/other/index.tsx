import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { Card, Form, Button, Tag } from 'antd'
import store from '../store'
import { gmHistory as history } from '@gm-common/router'
import {
  map_Quotation_Type,
  Quotation,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import QuotationStatusTag from '@/pages/merchandise/price_manage/customer_quotation/components/quotation_status_tag'

const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 12 },
}

const Other = () => {
  const [quotationDesc, setQuotationDesc] = useState<Quotation>({
    quotation_id: '',
    type: 0,
  })

  useEffect(() => {
    const { type, quotation, parentQuotation } = store
    const quotationObj =
      type === Quotation_Type.PERIODIC ? parentQuotation : quotation
    setQuotationDesc(_.cloneDeep(quotationObj))
  }, [])

  const {
    outer_name = '-',
    description = '-',
    inner_name,
    status,
    is_default,
  } = quotationDesc

  /**
   * 跳转编辑报价单
   */
  const handleEdit = () => {
    history.push(
      `/merchandise/price_manage/customer_quotation/edit?quotation_id=${quotationDesc.quotation_id}`,
    )
  }
  return (
    <Card
      title={t('基本信息')}
      bordered={false}
      extra={
        <PermissionJudge
          permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
        >
          <Button type='primary' onClick={handleEdit}>
            {t('编辑')}
          </Button>
        </PermissionJudge>
      }
      headStyle={{ marginTop: '-16px', fontSize: '14px' }}
    >
      <Form {...formItemLayout}>
        <Form.Item label={t('报价单名称')}>{inner_name}</Form.Item>
        <Form.Item label={t('对外名称')}>{outer_name}</Form.Item>
        <Form.Item label={t('是否默认报价单')}>
          {is_default ? t('是') : t('否')}
        </Form.Item>
        <Form.Item label={t('状态')}>
          <QuotationStatusTag status={status || 0} />
        </Form.Item>
        <Form.Item label={t('类型')}>
          {t(map_Quotation_Type[store.type])}
        </Form.Item>
        <Form.Item label={t('描述')}>{description}</Form.Item>
      </Form>
    </Card>
  )
}

export default Other
