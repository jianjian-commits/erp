/**
 * @description 商品详情-报价单tab-列表同步
 */
import React, { useState, Key, RefObject, useImperativeHandle } from 'react'
import { Modal } from 'antd'
import SelectTable, { Pagination } from '@/common/components/select_table'
import {
  BatchSyncPriceToOtherQuotation,
  ListBasicPriceV2,
  Quotation,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import baseStore from '../../store'
import { t } from 'gm-i18n'
import { ColumnType } from 'antd/lib/table'
import TableTextOverflow from '@/common/components/table_text_overflow'
import _ from 'lodash'
import globalStore from '@/stores/global'

type Params = {
  q: string
}

export interface SyncBasicPriceModalRef {
  handleOpen: (basicPrice: string, sku: string, quotation: string) => void
}

interface SyncBasicPriceModalProps {
  modalRef: RefObject<SyncBasicPriceModalRef>
}

interface SyncBasicPriceListItem extends Quotation {
  basic_price_id: string
}

const SyncBasicPriceModal = (props: SyncBasicPriceModalProps) => {
  const { modalRef } = props
  const [visible, setVisible] = useState(false)
  const [basicPirceId, setBasicPirceId] = useState('')
  const [skuId, setSkuId] = useState('')
  const [quotationId, setQuotationId] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [loading, setLoading] = useState(false)

  useImperativeHandle(
    modalRef,
    (): SyncBasicPriceModalRef => ({
      handleOpen,
    }),
  )

  const handleOpen = (basicPrice: string, sku: string, quotation: string) => {
    setBasicPirceId(basicPrice)
    setSkuId(sku)
    setQuotationId(quotation)
    setVisible(true)
  }

  /** 关闭弹窗 */
  const handleCancel = () => {
    setSelectedRowKeys([])
    setVisible(false)
  }

  /** 选中报价单条目 */
  const onSelect = (selectedRowKeys: Key[], rowData: Quotation[]) => {
    setSelectedRowKeys(selectedRowKeys)
  }

  /** 获取报价单列表 */
  const fetchList = (paging: Pagination, values: Params | undefined) => {
    return ListBasicPriceV2({
      filter_params: {
        ...values,
        sku_id: baseStore.skuId,
        quotation_types: [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC],
        periodic_time: `${Date.now()}`,
      },
      without_basic_price_id: basicPirceId,
      paging,
    }).then((json) => {
      const { basic_prices = [], quotation_map = {}, paging } = json.response

      const newQuotation = _.map(basic_prices, (basicPriceItem) => {
        const { quotation_id, basic_price_id } = basicPriceItem
        const quotationItem = quotation_map[quotation_id!]
        if (quotationItem.type === Quotation_Type.PERIODIC) {
          const { parent_child_inner_name = '', parent_serial_no = '' } =
            quotationItem

          return {
            ...quotationItem,
            inner_name: parent_child_inner_name,
            serial_no: parent_serial_no,
            basic_price_id,
          }
        } else {
          return { ...quotationItem, basic_price_id }
        }
      })

      return {
        list: newQuotation,
        count: paging.count,
      }
    })
  }

  /** 发起同步异步任务 */
  const handleOk = () => {
    setLoading(true)
    BatchSyncPriceToOtherQuotation({
      basic_price_id: basicPirceId,
      sku_id: skuId,
      quotation_id: quotationId,
      to_sync_basic_price_ids: selectedRowKeys as string[],
    })
      .then(() => {
        globalStore.showTaskPanel('1')
        handleCancel()
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const columns: ColumnType<SyncBasicPriceListItem>[] = [
    {
      title: t('报价单名称'),
      key: 'inner_name',
      dataIndex: 'inner_name',
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('报价单编码'),
      key: 'serial_no',
      dataIndex: 'serial_no',
    },
    {
      title: t('对外简称'),
      key: 'outer_name',
      dataIndex: 'outer_name',
      render: (text) => <TableTextOverflow text={text} />,
    },
  ]

  return (
    <Modal
      title={t('同步到其余报价单')}
      destroyOnClose
      style={{ top: 20 }}
      visible={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      maskClosable={false}
      bodyStyle={{ margin: '0px 16px', padding: '16px 16px 0 16px' }}
      width={1250}
      okButtonProps={{ disabled: !selectedRowKeys.length }}
    >
      <SelectTable<SyncBasicPriceListItem, Params>
        filter={[
          {
            name: 'quotation_q',
            placeholder: t('请输入报价单名称/编码'),
            type: 'input',
          },
        ]}
        selectedKey='inner_name'
        onSelect={onSelect}
        rowKey='basic_price_id'
        onSearch={fetchList}
        limitCount={99999}
        columns={columns}
      />
    </Modal>
  )
}

export default SyncBasicPriceModal
