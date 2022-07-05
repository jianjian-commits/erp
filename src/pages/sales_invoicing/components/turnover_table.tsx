import React, { FC, useMemo, useState } from 'react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Flex, ListDataItem, MoreSelect } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'

import { ListSku } from 'gm_api/src/merchandise'
import { formatSkuList, formatSsuList } from '../util'
import { ComSkuItem } from '../interface'
import globalStore from '@/stores/global'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'
import { ProductDetail } from '../sales_invoicing_type'
import { defaultProductDetail } from '../receipt_base_data'

const { OperationHeader, EditOperation, TABLE_X } = TableXUtil

interface NameProps {
  index: number
  data: ProductDetail
  onChange: (index: number, changeData: { [key: string]: any }) => void
}

const NameCell: FC<NameProps> = observer((props) => {
  const { index, data, onChange } = props

  const { sku_id, sku_name } = data

  const [skuList, setSkuList] = useState<ListDataItem<string>[]>([])

  const handleSelect = (selected: ComSkuItem) => {
    if (selected) {
      const skuBaseUnit = globalStore.getUnit(selected.sku?.base_unit_id!)
      const targetSsu = formatSsuList(
        selected._originalData.ssu_infos!,
        skuBaseUnit!,
      )[0]
      onChange(index, {
        ...selected,
        sku_name: selected.name,
        sku_id: selected.sku_id,
        category_id_1: selected.category_id_1,
        category_id_2: selected.category_id_2,
        category_name_1: selected.category_name_1,
        category_name_2: selected.category_name_2,
        spu_id: selected.spu_id,
        // 默认选择第一个ssu
        ssu_base_unit_id: targetSsu.ssu_base_unit_id,
        ssu_unit_id: targetSsu.ssu_unit_id,

        unit_id: selected.value,

        ssu_base_unit_rate: targetSsu.ssu_base_unit_rate,
        ssu_unit_rate: targetSsu.ssu_unit_rate,
      })
    } else {
      onChange(index, { ...defaultProductDetail })
    }
  }

  const handleSearch = (value: string) => {
    if (_.trim(value)) {
      ListSku({
        q: value,
        paging: { limit: 999 },
        sku_type: 1,
        request_data: 1024 + 256,
      }).then((json) => {
        setSkuList(formatSkuList(json.response.sku_infos!))

        return json
      })
    }
  }

  let selected

  if (sku_id && sku_name) {
    selected = {
      value: sku_id,
      text: sku_name,
    }
  }

  return (
    <Flex row alignCenter>
      <MoreSelect
        style={{
          width: TABLE_X.WIDTH_SEARCH,
        }}
        data={skuList}
        selected={selected}
        onSelect={handleSelect}
        onSearch={handleSearch}
        placeholder={t('请输入周转物名搜索')}
        renderListFilter={(data) => {
          return data
        }}
      />
    </Flex>
  )
})

interface Props {
  data: ProductDetail[]
  onChange: (index: number, changeData: { [key: string]: any }) => void
  onAdd: () => void
  onDel: (index: number) => void
  type: 'add' | 'detail'
}

const TurnoverTable: FC<Props> = observer((props) => {
  const { data, type, onAdd, onDel, onChange } = props

  const _columns: Column[] = useMemo(() => {
    return [
      {
        Header: OperationHeader,
        accessor: 'action',
        show: type === 'add',
        hide: type !== 'add',
        fixed: 'left',
        width: TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                return (
                  <EditOperation
                    onAddRow={onAdd}
                    onDeleteRow={
                      data.length > 1 ? () => onDel(cellProps.index) : undefined
                    }
                  />
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('周转物名称'),
        accessor: 'name',
        Cell: (cellProps) => {
          return type === 'add' ? (
            <NameCell
              onChange={onChange}
              index={cellProps.index}
              data={cellProps.original}
            />
          ) : (
            cellProps.original.sku_name
          )
        },
      },
      {
        Header: t('数量'),
        accessor: 'ssu_base_quantity',
        Cell: (cellProps) => {
          return type === 'add' ? (
            <Observer>
              {() => {
                const {
                  index,
                  original: { ssu_base_quantity },
                } = cellProps
                return (
                  <PrecisionInputNumber
                    precisionType='salesInvoicing'
                    value={ssu_base_quantity}
                    onChange={(value: any) =>
                      onChange(index, {
                        ssu_base_quantity: value,
                        ssu_quantity: value,
                      })
                    }
                  />
                )
              }}
            </Observer>
          ) : (
            cellProps.original.ssu_base_quantity
          )
        },
      },
      { Header: t('最后操作人'), accessor: 'operator_name' },
    ]
  }, [])
  return <Table isEdit data={data} columns={_columns} />
})

export default TurnoverTable
