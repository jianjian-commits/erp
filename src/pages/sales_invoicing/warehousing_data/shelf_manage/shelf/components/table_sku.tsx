import React, { useEffect, FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxTable,
  Button,
  BoxTableInfo,
  Box,
  Form,
  FormItem,
  Input,
} from '@gm-pc/react'
import _ from 'lodash'
import { TableXUtil, Table } from '@gm-pc/table-x'
import TableTotalText from '@/common/components/table_total_text'
import store from '../store'
import { Sku, UpdateSkuShelf } from 'gm_api/src/merchandise'
import { usePagination } from '@gm-common/hooks'
import FilterButton from '@/common/components/filter_button'

interface FilterProps {
  onSearch: () => any
}
const Filter: FC<FilterProps> = observer((props) => {
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

const TableSku = (props: any) => {
  const { toggle } = store

  const { pagination, run } = usePagination<any>(store.fetchSkuList as any, {
    defaultPaging: {
      need_count: true,
    },
  })

  useEffect(() => {
    store.runOnChangeActiveShelf = run
  }, [run])

  const handleDelete = (id: string, run: Function) => {
    UpdateSkuShelf({
      sku_id: id,
      shelf_id: '0',
    }).then(() => {
      run()
    })
  }

  return (
    <>
      <Filter onSearch={run} />
      <BoxTable
        pagination={pagination}
        style={{
          overflow: 'auto',
          height: '85%',
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
          <Button
            disabled={!store.selectedShelf.is_leaf}
            type='primary'
            onClick={() => toggle(true)}
            className='gm-margin-left-10'
          >
            {t('添加')}
          </Button>
        }
      >
        <Table<Sku>
          data={store.skuList.slice()}
          columns={[
            {
              Header: t('商品编号/名称'),
              accessor: 'name',
              Cell: (cellProps) => {
                const { name, customize_code } = cellProps.original

                return `${customize_code}/${name}`
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
            {
              Header: TableXUtil.OperationHeader,
              width: 80,
              id: 'op',
              Cell: (cellProps) => {
                const { sku_id } = cellProps.original

                return (
                  <TableXUtil.OperationCell>
                    <TableXUtil.OperationDelete
                      disabled={false}
                      title={t('警告')}
                      onClick={() => handleDelete(sku_id, run)}
                    >
                      {/* {t(
                      '确定删除此 sku 吗',
                    )} */}
                    </TableXUtil.OperationDelete>
                  </TableXUtil.OperationCell>
                )
              },
            },
          ]}
        />
      </BoxTable>
    </>
  )
}

export default observer(TableSku)
