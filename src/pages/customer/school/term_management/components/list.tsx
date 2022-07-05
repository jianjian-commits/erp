import React from 'react'
import { Table, Column, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { BoxTable, BoxTableInfo } from '@gm-pc/react'
import { history } from '@/common/service'
import { observer, Observer } from 'mobx-react'
import TableTotalText from '@/common/components/table_total_text'
import type { TermItemProps } from '../store/storeList'
import { formatDate } from '@/common/util'
import moment from 'moment'
import { DatePicker, Select, Button } from 'antd'
import Action from './action'
import storeList from '../store/storeList'
import { TERM_OPTIONS_TYPE, TERM_OPTIONS_TYPE_MAP } from '../../../enum'

const { RangePicker } = DatePicker

const List = () => {
  const handleCreate = () => {
    history.push('/customer/school/term_management/create')
  }

  const columns: Column<TermItemProps>[] = [
    {
      Header: t('序号'),
      minWidth: 120,
      id: 'index' as any,
      accessor: (_, index) => index + 1,
    },
    {
      Header: t('学年'),
      minWidth: 120,
      id: 'year',
      accessor: 'year',
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                index,
                original: { year, isEditing },
              } = cellProps
              if (!isEditing) {
                return <span>{year}</span>
              }
              return (
                <DatePicker
                  onChange={(_, dateString) => {
                    storeList.updateTermItem(index, 'year', dateString)
                  }}
                  value={moment(year)}
                  picker='year'
                  size='small'
                  allowClear={false}
                  style={{
                    height: 30,
                    width: 100,
                  }}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('学期'),
      minWidth: 120,
      accessor: 'semester_type',
      id: 'semester_type',
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                index,
                original: { semester_type, isEditing },
              } = cellProps
              if (!isEditing) {
                return (
                  <span>{TERM_OPTIONS_TYPE_MAP[semester_type!] || '-'}</span>
                )
              }
              return (
                <Select
                  style={{
                    width: 120,
                  }}
                  options={TERM_OPTIONS_TYPE}
                  value={semester_type}
                  onChange={(value: number) => {
                    storeList.updateTermItem(index, 'semester_type', value)
                  }}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('起止日期'),
      minWidth: 180,
      accessor: 'start_time',
      id: 'start_time',
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                index,
                original: { start_time, end_time, isEditing },
              } = cellProps
              if (!isEditing) {
                return (
                  <div>{`${formatDate(
                    moment(+start_time!).toDate(),
                  )}~${formatDate(moment(+end_time!).toDate())}`}</div>
                )
              }
              return (
                <RangePicker
                  value={[moment(+start_time!), moment(+end_time!)]}
                  onChange={(date) => {
                    if (date) {
                      storeList.updateTermItem(
                        index,
                        'start_time',
                        +moment(date[0]!).startOf('d') + '',
                      )
                      storeList.updateTermItem(
                        index,
                        'end_time',
                        +moment(date[1]!).endOf('d') + '',
                      )
                    }
                  }}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: TableXUtil.OperationHeader,
      id: 'operation' as any,
      minWidth: 120,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                index,
                original: { isEditing },
              } = cellProps

              return <Action index={index} isEditing={isEditing} />
            }}
          </Observer>
        )
      },
    },
  ]
  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('学期总数'),
                content: storeList.termList.length,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={
        <Button type='primary' onClick={handleCreate}>
          {t('新建学期')}
        </Button>
      }
    >
      <Table data={storeList.termList} columns={columns} />
    </BoxTable>
  )
}

export default observer(List)
