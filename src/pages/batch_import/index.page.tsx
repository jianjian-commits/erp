import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Col, Row, Steps } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import BatchUpload from './components/upload'
import BatchUploading from './components/uploading'
import store from './store'
import { useGMLocation } from '@gm-common/router'

const { Step } = Steps

const BatchImport: FC = observer(() => {
  const location = useGMLocation<{ page: string; quotation_id: string }>()
  const { page, quotation_id } = location.query
  const { step, pageConfig, setPage, setQuotationId, clearStore } = store

  useEffect(() => {
    setConfig()
    return () => clearStore()
  }, [page])

  const setConfig = () => {
    setPage(page)
    if (page === 'price_add') {
      setQuotationId(quotation_id)
    }
  }

  return (
    <Row
      className='
    batch_import gm-site-card-border-less-wrapper-50'
    >
      <Col span={16} offset={4}>
        <Row>
          <Col className='batch_import_steps' span={12} offset={6}>
            <Steps direction='horizontal' current={step}>
              <Step title={t(pageConfig.titleOne || '选择文件')} />
              <Step title={t(pageConfig.titleTwo)} />
            </Steps>
          </Col>
        </Row>
        {step === 0 && <BatchUpload />}
        {step === 1 && <BatchUploading />}
      </Col>
    </Row>
  )
})

export default BatchImport
