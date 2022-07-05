import FilterButton from '@/common/components/filter_button'
import { usePagination } from '@gm-common/hooks'
import {
  BoxTable,
  Button,
  BoxTableInfo,
  Box,
  Form,
  FormItem,
  Input,
  Tip,
} from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import store from '../store'
import { t } from 'gm-i18n'
import TableTotalText from '@/common/components/table_total_text'
import { BatchActionDefault, Table } from '@gm-pc/table-x'
import { Sku } from 'gm_api/src/merchandise'
import { BatchUpdateSkuShelf } from 'gm_api/src/inventory'
import styled from 'styled-components'

export const Tag = styled.span`
  display: inline-block;
  padding: 2px;
  margin-left: 5px;
  color: var(--gm-color-primary);
  border: 1px solid var(--gm-color-primary);
  border-radius: 2px;
`

interface FilterProps {
  onSearch: () => any
}
const Filter: React.FC<FilterProps> = observer((props) => {
  const { onSearch } = props

  const handleChangeFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    store.changeFilter('q', event.target.value)
  }

  return (
    <Box hasGap>
      <Form onSubmit={onSearch} inline>
        <FormItem label={t('搜索')}>
          <Input
            value={store.filter.q}
            onChange={handleChangeFilter}
            placeholder={t('请输入商品编号或名称')}
          />
        </FormItem>
        <FilterButton />
      </Form>
    </Box>
  )
})

const List = observer((props) => {
  const { toggle, loading, run, pagination } = props
  return (
    <BoxTable
      pagination={pagination}
      style={{
        overflow: 'auto',
        height: '70%',
      }}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('商品数'),
                content: store.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={
        <>
          <Button onClick={() => toggle(false)} className='gm-margin-left-10'>
            {t('取消')}
          </Button>
        </>
      }
    >
      <Table<Sku>
        isBatchSelect
        id='sku_2'
        data={store.skuList.slice()}
        columns={[
          {
            Header: t('商品'),
            accessor: 'name',
            Cell: (cellProps) => {
              const { name, customize_code, shelf_id } = cellProps.original

              return (
                <div>
                  <p>
                    {name}
                    {shelf_id?.toString() ===
                      store.selectedShelf?.value?.toString() && (
                      <Tag>{t('已加')}</Tag>
                    )}
                  </p>
                  <p>{customize_code}</p>
                </div>
              )
            },
          },
          {
            Header: t('商品分类'),
            accessor: 'name',
            Cell: (cellProps) => {
              const { category1_id, category2_id, category3_id } =
                cellProps.original

              const categort1 = _.find(store.categoryList, [
                'category_id',
                category1_id,
              ])
              const categort2 = _.find(store.categoryList, [
                'category_id',
                category2_id,
              ])
              const categort3 = _.find(store.categoryList, [
                'category_id',
                category3_id,
              ])
              // 目前来说，商品直邮三层分类，先这么写，有时间优化
              return [categort1?.name, categort2?.name, categort3?.name]
                .filter(Boolean)
                .join('/')
            },
          },
        ]}
        keyField='sku_id'
        loading={loading}
        batchActions={[
          {
            children: <BatchActionDefault>{t('确认')}</BatchActionDefault>,
            onAction: (selected: string[], isSelectedAll: boolean) => {
              BatchUpdateSkuShelf({
                filter_params: isSelectedAll
                  ? _.pick(store.getFilter(), 'filter_params')
                  : {
                      sku_ids: selected as string[],
                      // paging: {
                      //   limit: 1,
                      // },
                    },
                shelf_id: store.selectedShelf.shelf_id ?? '0',
              })
                .then(() => {
                  Tip.success(t('批量设置默认货位成功'))
                  toggle(false)
                })
                .catch((error) => {
                  console.error(error)
                  Tip.danger(t('批量设置默认货位失败, 请重试'))
                })
            },
          },
        ]}
      />
    </BoxTable>
  )
})

const TableSku2 = observer((props) => {
  const { toggle } = store
  const { pagination, run, loading } = usePagination<any>(
    store.fetchSkuList as any,
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useEffect(() => {
    store.runOnChangeActiveCategory = run
  }, [run])

  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <Filter onSearch={run} />
      <List
        run={run}
        toggle={toggle}
        loading={loading}
        pagination={pagination}
      />
    </div>
  )
})

export default TableSku2
