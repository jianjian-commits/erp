import { t } from 'gm-i18n'
import React, { FC, ChangeEvent, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  BoxForm,
  BoxTable,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  Input,
  Flex,
  Confirm,
  Tip,
} from '@gm-pc/react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { usePagination } from '@gm-common/hooks'
import { CustomerLabel } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { setTitle } from '@gm-common/tool'

import store from './store'

const { OperationHeader, OperationDelete, OperationCell } = TableXUtil

const RouteManagement: FC = observer(() => {
  const { search_text, handleSearchText, fetchList } = store
  const { pagination, run } = usePagination<any>(fetchList, {
    defaultPaging: {
      need_count: true,
    },
  })
  const handleSearch = (): void => {
    run()
  }
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleSearchText(event.target.value)
  }
  const handleDelete = (id: string) => {
    store.delCustomerLabel(id).then(
      () => {
        run()
        return Tip.success(t('删除成功'))
      },
      () => {
        return Tip.danger(t('删除失败'))
      },
    )
  }

  useEffect(() => {
    setTitle(t('客户标签管理'))
  }, [])

  useEffect(() => {
    run()
  }, [])

  const columns: Column<CustomerLabel>[] = [
    {
      Header: t('标签名称'),
      accessor: 'name',
    },
    {
      Header: OperationHeader,
      id: 'customer_label_operator',
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => (
              <OperationCell>
                <OperationDelete
                  title={t('警告')}
                  onClick={() =>
                    handleDelete(cellProps.original.customer_label_id)
                  }
                >
                  {t('确认删除标签') + `${cellProps.original.name}？`}
                </OperationDelete>
              </OperationCell>
            )}
          </Observer>
        )
      },
    },
  ]
  return (
    <>
      <BoxForm onSubmit={handleSearch}>
        <FormBlock col={3}>
          <FormItem label={t('搜索')}>
            <Input
              placeholder={t('搜索商户标签名称')}
              value={search_text}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(e)
              }
            />
          </FormItem>
        </FormBlock>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
        </FormButton>
      </BoxForm>
      <BoxTable
        action={
          <>
            <Button
              type='primary'
              onClick={() => {
                Confirm({
                  children: <CreateLabel />,
                  title: '新建标签',
                }).then(() => {
                  if (store.labelName) {
                    store.createCustomerLabel().then(() => run())
                  } else {
                    Tip.danger(t('标签名称不能为空！'))
                  }
                  return null
                })
              }}
            >
              {t('新建标签')}
            </Button>
          </>
        }
        pagination={pagination}
      >
        <Table data={store.list} columns={columns} />
      </BoxTable>
    </>
  )
})
const CreateLabel: FC = observer(() => {
  const handleChangeLabelName = (event: ChangeEvent<HTMLInputElement>) => {
    store.handleLabelName(_.trim(event.target.value))
    // Modal.hide()
  }
  return (
    <Flex column className='gm-padding-10'>
      <Flex>
        <Flex justifyCenter alignCenter>
          {t('标签名称')}:&nbsp;
          <div className='gm-margin-left-10'>
            <Input
              type='text'
              placeholder={t('标签名称')}
              value={store.labelName}
              onChange={handleChangeLabelName}
              maxLength={30}
            />
          </div>
        </Flex>
      </Flex>
    </Flex>
  )
})

export default RouteManagement
