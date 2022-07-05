import { Column, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Customer } from 'gm_api/src/enterprise'
import React, { FC, useEffect, useState } from 'react'
import store from '../../store'

/**
 * 商户列表的属性
 */
interface MerchantTableProps {
  /** BOM的ID */
  bomId: string
}

/**
 * 商户列表栏的属性
 */
interface MerchantTableColumn {
  /** 商户名 */
  name: string
  /** 自定义编码 */
  customize_code: string
  /** 下级商户的数量 */
  child_number: number
}

/**
 * 商户列表的组件函数
 */
const MerchantTable: FC<MerchantTableProps> = ({ bomId }) => {
  /** 定义列表的栏 */
  const Columns: Column<MerchantTableColumn>[] = [
    {
      Header: t('公司名称'),
      accessor: 'name',
    },
    {
      Header: t('公司编码'),
      accessor: 'customized_code',
    },
    {
      Header: t('商户数'),
      accessor: 'child_number',
    },
  ]

  const [merchants, setMerchants] = useState<Customer[]>([])

  useEffect(() => {
    store.getRelatedCustomers(bomId).then((response) => {
      try {
        setMerchants(Object.values(response))
      } catch {
        setMerchants([])
      }
    })
  }, [])

  return <Table columns={Columns} data={merchants} />
}

export default MerchantTable
