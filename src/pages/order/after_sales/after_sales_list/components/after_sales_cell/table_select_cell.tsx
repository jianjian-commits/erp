import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { KCTableSelect } from '@gm-pc/keyboard'
import store from '../../store/detail_store'
import globalStore from '@/stores/global'
interface Props {
  selected: any
  onSelect: (selected: any) => void
  onSearch?: (value: string) => void
}

const TableSelectCell: FC<Props> = observer((props) => {
  const { selected, onSelect, onSearch } = props
  const { sku_list } = store

  const columns = [
    {
      Header: t('商品编号'),
      accessor: 'customize_code',
      width: 140,
    },
    {
      Header: t('商品名'),
      accessor: 'name',
      width: 140,
      Cell: (cellProps) => {
        return <strong>{cellProps.original.name}</strong>
      },
    },
    {
      Header: t('分类'),
      accessor: 'category_name',
      width: 120,
      Cell: (cellProps) => {
        const { category_name } = cellProps.original
        return <div>{category_name || '-'}</div>
      },
    },
  ].filter(Boolean)
  return (
    <KCTableSelect
      style={{ width: '300px' }}
      data={sku_list}
      columns={columns}
      selected={selected}
      onSelect={onSelect}
      onSearch={onSearch}
      placeholder={t('请输入商品ID或商品名')}
    />
  )
})

export default TableSelectCell
