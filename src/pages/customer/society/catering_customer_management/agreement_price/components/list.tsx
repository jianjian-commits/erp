import globalStore from '@/stores/global'
import { BoxTable, BoxTableInfo, Button, BoxTableProps } from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Observer, observer } from 'mobx-react'
import React, { FC } from 'react'
import { Space } from 'antd'
import TableTotalText from '@/common/components/table_total_text'
import store, { PublicListItem } from '../store'
import { history } from '@/common/service'
import ProductImage from '@/common/components/product_image'
import TableTextOverflow from '@/common/components/table_text_overflow'
import {
  BasicPrice,
  BasicPriceItem,
  map_Sku_NotPackageSubSkuType,
} from 'gm_api/src/merchandise'
import { EditableText } from '@/common/components/editable_text'
import '../index.less'

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  run: () => Promise<any>
  paging: any
}

const List: FC<ListProps> = observer(({ run, paging, pagination }) => {
  const { list, customerId } = store
  const columns: Column<PublicListItem>[] = [
    {
      Header: t('商品图片'),
      Cell: (cellProps) => {
        const {
          original: {
            sku: { repeated_field },
          },
        } = cellProps
        const images = repeated_field?.images || []

        return (
          <ProductImage
            width='40px'
            height='40px'
            url={images[0] && images[0].path}
          />
        )
      },
    },
    {
      Header: t('商品名称'),
      headerSort: true,
      Cell: (cellProps) => {
        const {
          original: {
            sku: { name, sku_id },
          },
        } = cellProps
        return (
          <a
            onClick={() =>
              history.push(
                `/merchandise/manage/merchandise_list/detail?sku_id=${sku_id}`,
              )
            }
          >
            <TableTextOverflow text={name} />
          </a>
        )
      },
    },
    {
      Header: t('商品编码'),
      headerSort: true,
      Cell: (cellProps) => {
        const {
          original: {
            sku: { customize_code },
          },
        } = cellProps
        return <TableTextOverflow text={customize_code} />
      },
    },
    {
      Header: t('基本单位'),
      id: 'unit',
      Cell: (cellProps) => {
        const {
          row: {
            original: { basic_price },
          },
        } = cellProps
        if (basic_price.items.basic_price_items.length === 1) {
          return globalStore.getUnitName(
            basic_price.items.basic_price_items[0].fee_unit_price.unit_id,
          )
        } else {
          return ''
        }
      },
    },
    {
      Header: t('商品分类'),
      headerSort: true,
      Cell: (cellProps) => {
        const {
          original: {
            sku: { not_package_sub_sku_type },
          },
        } = cellProps

        if (not_package_sub_sku_type) {
          return map_Sku_NotPackageSubSkuType[not_package_sub_sku_type] || ''
        } else {
          return ''
        }
      },
    },
    {
      Header: t('报价(元)'),
      id: 'price',
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                row: {
                  original: { basic_price },
                },
              } = cellProps
              if (basic_price.items.basic_price_items.length === 1) {
                return (
                  <EditableText
                    value={
                      basic_price.items.basic_price_items[0].fee_unit_price.val
                    }
                    onChange={(val) => {
                      if (val < 0) return
                      store.updateBasicPrice({
                        basicPrice: basic_price,
                        basicPriceItem: basic_price.items.basic_price_items[0],
                        price: val.toString(),
                      })
                    }}
                  />
                )
              } else {
                return <></>
              }
            }}
          </Observer>
        )
      },
    },
    // 操作
    {
      Header: t('操作'),
      id: 'student_meal_customer_operator',
      diyItemText: t('操作'),
      diyEnable: false,
      Cell: (cellProps) => {
        return (
          <Space>
            <Button
              type='link'
              className='tw-p-0'
              onClick={async () => {
                await store.del(cellProps.row.original)
                run()
              }}
            >
              {t('删除')}
            </Button>
          </Space>
        )
      },
    },
  ]

  function subColumns(basicPrice: BasicPrice): Column<BasicPriceItem>[] {
    return [
      {
        Header: t(''),
        id: '+',
        width: 40,
        Cell: (cellProps) => <div />,
      },
      {
        Header: t(''),
        id: 'image',
        Cell: (cellProps) => <div />,
      },
      {
        Header: t(''),
        id: 'name',
        Cell: (cellProps) => <div />,
      },
      {
        Header: t(''),
        id: 'customize_code',
        Cell: (cellProps) => <div />,
      },
      {
        Header: t(''),
        id: 'unit',
        Cell: ({ original: { fee_unit_price } }) =>
          globalStore.getUnitName(fee_unit_price.unit_id),
      },
      {
        Header: t(''),
        id: 'not_package_sub_sku_type',
        Cell: (cellProps) => <div />,
      },
      {
        Header: t(''),
        id: 'price',
        Cell: ({ original: item, index }) => {
          return (
            <Observer>
              {() => {
                return (
                  <EditableText
                    value={item.fee_unit_price.val}
                    onChange={(val) => {
                      if (val < 0) return
                      store.updateBasicPrice({
                        basicPrice: store.list[index].basic_price,
                        basicPriceItem: item,
                        price: val.toString(),
                      })
                    }}
                  />
                )
              }}
            </Observer>
          )
        },
      },
      // 操作
      {
        Header: t(''),
        id: 'student_meal_customer_operator',
        Cell: ({ original, index, ...rest }) => {
          return (
            <Space>
              <Button
                type='link'
                className='tw-p-0'
                onClick={async () => {
                  await store.remove({
                    itemIndex: index,
                    basic_price: basicPrice,
                  })
                  run()
                }}
              >
                {t('移除')}
              </Button>
            </Space>
          )
        },
      },
    ]
  }

  return (
    <>
      <BoxTable
        pagination={pagination}
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('商品总数'),
                  content: paging.count,
                },
              ]}
            />
          </BoxTableInfo>
        }
        action={
          <>
            <Button
              type='default'
              className='gm-margin-left-10'
              onClick={() =>
                history.push(
                  `/customer/society/catering_customer_management/agreement_price/import?customer_id=${customerId!}`,
                )
              }
            >
              {t('批量导入')}
            </Button>
          </>
        }
      >
        <Table<PublicListItem>
          isDiy
          isSort
          id='agreement_price_list'
          columns={columns}
          data={list}
          keyField='customer_id'
          isExpand
          expanded={store.expanded}
          onExpand={(expanded) => (store.expanded = expanded)}
          SubComponent={(row) => {
            const { index } = row
            const basicPrice = store.list[index].basic_price
            const data = basicPrice.items.basic_price_items || []
            if (data.length <= 1) {
              return null
            }
            return (
              <Table<BasicPriceItem>
                className='special-price-sub-table'
                isSub
                data={data}
                columns={subColumns(basicPrice)}
              />
            )
          }}
        />
      </BoxTable>
    </>
  )
})

export default List
