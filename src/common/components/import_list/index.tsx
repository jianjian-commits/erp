import React, { FC, ReactNode } from 'react'
import { observer } from 'mobx-react'
import { Row, Space } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { gmHistory as history } from '@gm-common/router'
import './style.less'

export interface ImportItem {
  icon: ReactNode
  title: string
  tips: string
  page: string
  quotation_id?: string
  isHide?: boolean
}

export interface ImportListInterface {
  list: ImportItem[]
}

const ImportList: FC<ImportListInterface> = observer((props) => {
  const { list } = props

  const toImportDetail = (page: string, quotation_id: string) => {
    let params = ''
    if (page === 'price_add') {
      params = `&quotation_id=${quotation_id}`
    }
    history.push(`/batch_import?page=${page}${params}`)
  }
  return (
    <Row
      className='import gm-site-card-border-less-wrapper-50'
      justify='center'
      align='middle'
    >
      <div>
        {_.map(list, (importItem) => {
          if (!importItem.isHide) {
            return (
              <div
                className='import-item'
                onClick={() =>
                  toImportDetail(importItem.page, importItem.quotation_id || '')
                }
              >
                <Space>
                  <div className='import-icon'>{importItem.icon}</div>
                  <div>
                    <p className='import-title'>{t(importItem.title)}</p>
                    <p className='import-tips'>{t(importItem.tips)}</p>
                  </div>
                </Space>
              </div>
            )
          }
        })}
      </div>
    </Row>
  )
})

export default ImportList
