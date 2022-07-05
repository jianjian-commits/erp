import { Modal, Box, Flex, Button } from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC, useState, useEffect } from 'react'
import { Table, Column } from '@gm-pc/table-x'
import _ from 'lodash'

import ScanDrawer from './scan_drawer'
import {
  GetTaskMaterialSheet,
  GetMaterialOrder,
  GetTaskProductSheet,
} from 'gm_api/src/production'

import { adapterProduce, adapterMaterial } from './util'
import { toFixedSalesInvoicing } from '@/common/util'
import { COMMON_COLUMNS } from '@/common/enum'

interface Props {
  onEnsure?: (data: any) => void
  onSearch?: (code: string) => void
  verifyCode?: (code: string) => 'onSearch' | 'onEnsure'
  type: 'produceStockIn' | 'getMaterial' | 'refundMaterial'
}

const OutputStorage: FC<Props> = ({ onEnsure, onSearch, verifyCode, type }) => {
  const handleSearch = (barcode: string, afterFunc: () => void) => {
    if (!verifyCode) {
      handleBillSearch(barcode, afterFunc)
    } else if (verifyCode(barcode) === 'onSearch') {
      onSearch && onSearch(barcode)
      afterFunc()
    } else if (verifyCode(barcode) === 'onEnsure') {
      handleBillSearch(barcode, afterFunc)
    }
  }

  const handleBillSearch = (barcode: string, afterFunc: () => void) => {
    let text = ''
    if (type === 'produceStockIn') {
      text = t('产出入库确认')
    } else if (type === 'getMaterial') {
      text = t('领料出库确认')
    } else if (type === 'refundMaterial') {
      text = t('退料入库确认')
    }
    Modal.render({
      children: (
        <OutputStorageModal
          onCancel={() => {
            Modal.hide()
            afterFunc()
          }}
          onEnsure={(data) => {
            onEnsure && onEnsure(data)
            afterFunc()
          }}
          barcode={barcode}
          type={type}
        />
      ),
      disableMaskClose: true,
      title: text,
      onHide: () => {
        Modal.hide()
        afterFunc()
      },
    })
  }

  return <ScanDrawer onSearch={handleSearch} />
}

interface ModalProps {
  onEnsure: (data: any) => void
  onCancel: () => void
  barcode: string
  type: 'produceStockIn' | 'getMaterial' | 'refundMaterial'
}

const OutputStorageModal: FC<ModalProps> = (props) => {
  const [selected, setSelected] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const { type } = props

  useEffect(() => {
    if (type === 'produceStockIn') {
      GetTaskProductSheet({ code: props.barcode }).then((json) => {
        setData(adapterProduce(json.response))
        return json
      })
    } else if (type === 'getMaterial' || type === 'refundMaterial') {
      GetMaterialOrder({ serial_no: props.barcode, need_sku: true }).then(
        (json) => {
          setData(adapterMaterial(json.response))
          return json
        },
      )
    }
  }, [])

  const _columns: Column[] = [
    { Header: t('商品名称'), accessor: 'sku_name' },
    // { Header: t('规格'), accessor: 'ssu_display_name' },
    // 基本单位
    COMMON_COLUMNS.SKU_BASE_UNIT_NAME_NO_MINWIDTH,
    {
      Header:
        type === 'getMaterial'
          ? t('出库数（基本单位）')
          : t('入库数（基本单位）'),
      accessor: 'sku_base_quantity',
      Cell: (cellProps) => {
        const { sku_base_quantity, sku_base_unit_name } = cellProps.original
        return toFixedSalesInvoicing(sku_base_quantity) + sku_base_unit_name
      },
    },
    {
      Header: t('计划编号'),
      accessor: 'scan_serial_no',
      show: type === 'produceStockIn',
    },
  ]

  const handleEnsure = () => {
    props.onEnsure(
      _.filter(data, (item) =>
        selected.includes(
          type === 'produceStockIn'
            ? item.uniqueKey
            : item.material_order_detail_id,
        ),
      ),
    )
    Modal.hide()
  }

  const handleSelect = (selected: any[]) => {
    setSelected(selected)
  }

  return (
    <Box>
      <Table
        isVirtualized
        isSelect
        id='scan_task'
        keyField={
          type === 'produceStockIn' ? 'uniqueKey' : 'material_order_detail_id'
        }
        columns={_columns}
        data={data}
        selected={selected}
        onSelect={handleSelect}
      />
      <Flex justifyEnd className='gm-margin-top-10'>
        <Button onClick={props.onCancel} className='gm-margin-right-10'>
          {t('取消')}
        </Button>
        <Button type='primary' onClick={handleEnsure}>
          {t('确定')}
        </Button>
      </Flex>
    </Box>
  )
}

export default OutputStorage
