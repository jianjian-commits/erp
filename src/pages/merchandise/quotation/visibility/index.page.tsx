import { t } from 'gm-i18n'
import React, { ChangeEvent, FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import store from './store'
import {
  FormItem,
  FormBlock,
  BoxForm,
  Button,
  FormButton,
  BoxTable,
  BoxTableInfo,
  Select,
} from '@gm-pc/react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import TableTotalText from '@/common/components/table_total_text'
import { history } from '@/common/service'
import _ from 'lodash'
import moment from 'moment'
import { rulesetTypes } from '../../enum'

const { OperationHeader, OperationCell, OperationDetail, OperationDelete } =
  TableXUtil

const RuleSetList: FC = observer(() => {
  const {
    list,
    filter: { q, state },
    pagination,
  } = store

  useEffect(() => {
    store.getList()
  }, [])

  const handleSearch = (): void => {
    console.log('handleSearch')
  }

  const handleExport = (): void => {
    console.log('handleExport')
  }

  const handleChangeState = (value: any): void => {
    store.changeFilter('state', value)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value, name } = event.target
    store.changeFilter(name, value)
  }

  const columns: Column[] = [
    {
      Header: t('不可见规则ID'),
      accessor: 'rule_set_display_id',
      id: 'rule_set_display_id',
    },
    {
      Header: t('不可见规则名称'),
      accessor: 'rule_set_name',
      id: 'rule_set_name',
    },
    {
      Header: t('关联报价单'),
      accessor: 'quotation_name',
      id: 'quotation_name',
    },
    {
      Header: t('状态'),
      accessor: 'state',
      id: 'state',
      Cell: ({ original: { state } }) => (
        <span>{_.find(rulesetTypes, (t) => t.value === state).text}</span>
      ),
    },
    {
      Header: t('创建时间'),
      accessor: 'create_time',
      id: 'create_time',
      Cell: ({ original: { create_time } }) => (
        <span>{moment(create_time).format('YYYY-MM-DD')}</span>
      ),
    },
    {
      Header: OperationHeader,
      accessor: 'operation',
      Cell: (cellProps) => (
        <OperationCell>
          <OperationDetail
            onClick={() =>
              history.push(
                `/merchandise/quotation/visibility/detail?id=${cellProps.original.rule_set_id}`,
              )
            }
          />
          <OperationDelete
            title={t('确认删除')}
            onClick={() => store.deleteRuleSet(cellProps.original.rule_set_id)}
          >
            {t('是否要删除该不可见规则？')}
          </OperationDelete>
        </OperationCell>
      ),
    },
  ]

  return (
    <>
      <BoxForm labelWidth='80px' onSubmit={handleSearch}>
        <FormBlock col={3}>
          <FormItem label={t('状态筛选')} col={1}>
            <Select
              data={rulesetTypes}
              value={state}
              onChange={handleChangeState}
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              className='form-control'
              name='q'
              type='text'
              placeholder={t('输入商户信息或不可见规则名称搜索')}
              value={q || ''}
              onChange={handleInputChange}
            />
          </FormItem>
        </FormBlock>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
          <Button className='gm-margin-left-10' onClick={handleExport}>
            {t('导出')}
          </Button>
        </FormButton>
      </BoxForm>

      <BoxTable
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('商品总数'),
                  content: pagination.count,
                },
              ]}
            />
          </BoxTableInfo>
        }
        action={
          <Button
            type='primary'
            onClick={() =>
              history.push('/merchandise/quotation/visibility/detail')
            }
          >
            {t('新建不可见规则')}
          </Button>
        }
      >
        <Table columns={columns} data={list.slice()} />
      </BoxTable>
    </>
  )
})

export default RuleSetList
