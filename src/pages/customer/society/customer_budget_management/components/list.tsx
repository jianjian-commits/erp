import React, { useState } from 'react'
import {
  BoxTable,
  BoxTableInfo,
  Price,
  Flex,
  BoxTableProps,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Table, Column, TableXUtil } from '@gm-pc/table-x'
import { history } from '@/common/service'
import TableTotalText from '@/common/components/table_total_text'
import { observer } from 'mobx-react'
import { Button, Modal, Popover } from 'antd'
import Big from 'big.js'
import BatchImport from '../batch_import/index'
import store from '../store/listStore'
import HeaderTip from '@/common/components/header_tip'
import { ListOptions } from '../interface'
import { SELECT_SCHOOL_TYPE_MAP, TERM_OPTIONS_TYPE_MAP } from '../../../enum'
import _ from 'lodash'
import moment from 'moment'

const { OperationDetail, OperationCell, OperationDelete } = TableXUtil

const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const [visible, setVisible] = useState(false)
  const handleCreate = () => {
    history.push('/customer/society/customer_budget_management/create')
  }

  const toFixed = (b: Big | number | string) => {
    // b为NaN会导致报错
    if (Number.isNaN(b)) {
      return '-'
    }
    return Big(+b).toFixed(2)
  }

  const handleBatchImport = () => {
    setVisible(true)
  }

  const showBatchImportModal = () => {
    return (
      <Modal
        title={t('批量导入资金预算')}
        visible={visible}
        onCancel={() => {
          setVisible(false)
        }}
        maskClosable={false}
        footer={null}
      >
        <BatchImport
          handleVisible={(value: boolean) => {
            setVisible(value)
          }}
        />
      </Modal>
    )
  }

  const columns: Column<ListOptions>[] = [
    {
      Header: t('客户编码'),
      minWidth: 120,
      fixed: 'left',
      diyEnable: false,
      accessor: 'customized_code',
      id: 'customized_code',
    },
    {
      Header: t('客户名称'),
      minWidth: 120,
      diyEnable: false,
      accessor: 'name',
      id: 'name',
    },
    {
      Header: t('类型'),
      minWidth: 120,
      accessor: 'school_type',
      id: 'school_type',
      Cell: (cellProps) => {
        const {
          original: { school_type },
        } = cellProps
        return <span>{SELECT_SCHOOL_TYPE_MAP[school_type!] || '-'}</span>
      },
    },
    {
      Header: t('学期'),
      minWidth: 120,
      accessor: 'semester_type',
      id: 'semester_type',
      Cell: (cellProps) => {
        const {
          original: { semester_type },
        } = cellProps
        return <span>{TERM_OPTIONS_TYPE_MAP[semester_type!] || '-'}</span>
      },
    },
    {
      Header: t('餐次'),
      minWidth: 120,
      id: 'mealTimes',
      accessor: ({ mealTimes }) => {
        return `${mealTimes || '-'}`
      },
    },
    {
      Header: t('用餐人数'),
      minWidth: 120,
      id: 'mealTimesCount',
      accessor: ({ mealTimesCount }) => {
        return `${mealTimesCount || '-'}`
      },
    },
    {
      Header: (
        <HeaderTip
          header={t('每人计划餐数')}
          tip={t('仅计算按菜谱下单的次数')}
        />
      ),
      diyItemText: t('每人计划餐数'),
      minWidth: 120,
      id: 'budget_meals_per_person',
      accessor: ({ budget_meals_per_person }) => {
        return `${Big(+budget_meals_per_person).toFixed(0)}`
      },
    },
    {
      Header: (
        <HeaderTip header={t('计划总餐数')} tip={t('仅计算按菜谱下单的次数')} />
      ),
      diyItemText: t('计划总餐数'),
      minWidth: 120,
      accessor: 'plan_total_meal',
      id: 'plan_total_meal',
      Cell: (cellProps) => {
        //  计划总餐数  =  （每人计划餐数）  X  用餐人数
        const {
          original: { mealTimesCount, budget_meals_per_person },
        } = cellProps
        return (
          <span>
            {Big(+mealTimesCount || 0)
              .times(+budget_meals_per_person! || 0)
              .toFixed(0)}
          </span>
        )
      },
    },
    {
      Header: t('每人计划金额'),
      minWidth: 120,
      id: 'budget_money_per_person',
      accessor: ({ budget_money_per_person }) => {
        return `${toFixed(budget_money_per_person) + Price.getUnit()} `
      },
    },
    {
      Header: t('计划总金额'),
      minWidth: 120,
      accessor: 'plan_total_count',
      id: 'plan_total_count',
      Cell: (cellProps) => {
        // 计划总金额  =  （每人计划金额）  X  用餐人数
        const {
          original: { mealTimesCount, budget_money_per_person },
        } = cellProps
        return (
          <span>
            {Big(+mealTimesCount || 0)
              .times(+budget_money_per_person! || 0)
              .toFixed(2) + Price.getUnit()}
          </span>
        )
      },
    },
    {
      Header: t('餐标'),
      minWidth: 120,
      accessor: 'meal',
      id: 'meal',
      Cell: (cellProps) => {
        // 餐标  =  （每人计划金额）  /  （每人计划餐数）
        const {
          original: { budget_meals_per_person, budget_money_per_person },
        } = cellProps
        return (
          <span>
            {`${
              +budget_meals_per_person! !== 0
                ? Big(+budget_money_per_person! || 0)
                    .div(+budget_meals_per_person!)
                    .toFixed(2)
                : '0.00'
            }` + Price.getUnit()}
          </span>
        )
      },
    },
    {
      Header: (
        <HeaderTip
          header={t('已使用金额')}
          tip={t('仅计算按菜谱下单的销售金额')}
        />
      ),
      diyItemText: t('已使用金额'),
      minWidth: 120,
      id: 'order_price_sum',
      Cell: (cellProps) => {
        const {
          original: { order_price_sum, used_amount_list },
        } = cellProps
        return (
          <Popover
            placement='left'
            content={
              used_amount_list.length ? (
                <Flex column>
                  {_.map(used_amount_list, (item, index) => {
                    return (
                      <Flex justifyBetween alignCenter key={index}>
                        <span className='gm-margin-right-20'>
                          {moment(item.receive_time).format('YYYY-MM') || '-'}
                        </span>
                        <span className='gm-margin-left-20'>
                          {toFixed(+item.sale_price_sum || 0) + Price.getUnit()}
                        </span>
                      </Flex>
                    )
                  })}
                </Flex>
              ) : (
                <Flex alignCenter justifyCenter>
                  {t('暂无数据')}
                </Flex>
              )
            }
            title='金额使用详情'
            trigger='click'
          >
            <a
              className='gm-text-primary'
              style={{ textDecoration: 'underline' }}
              rel='noopener noreferrer'
            >
              {toFixed(+order_price_sum) + Price.getUnit()}
            </a>
          </Popover>
        )
      },
    },
    {
      Header: (
        <HeaderTip
          header={t('每人已使用餐数')}
          tip={t('仅计算按菜谱下单的次数')}
        />
      ),
      diyItemText: t('每人已使用餐数'),
      minWidth: 120,
      id: 'order_id_count',
      accessor: ({ order_id_count }) => {
        return `${order_id_count}`
      },
    },
    {
      Header: (
        <HeaderTip
          header={t('已使用总餐数')}
          tip={t('仅计算按菜谱下单的次数')}
        />
      ),
      diyItemText: t('已使用总餐数'),
      minWidth: 120,
      id: 'dinning_count',
      accessor: ({ dinning_count }) => {
        return `${dinning_count}`
      },
    },
    {
      Header: t('结余金额'),
      minWidth: 120,
      id: 'balance_amount',
      accessor: ({
        order_price_sum,
        budget_money_per_person,
        mealTimesCount,
      }) => {
        // 结余金额  = 计划总金额  -  已使用总金额
        const plan_total_count = Big(+mealTimesCount)
          .times(+budget_money_per_person! || 0)
          .toFixed(2)
        return (
          Big(+plan_total_count)
            .minus(+order_price_sum)
            .toFixed(2) + Price.getUnit()
        )
      },
    },
    {
      Header: t('每人结余餐数'),
      minWidth: 120,
      id: 'meals_per_person_surplus',
      accessor: ({ budget_meals_per_person, order_id_count }) => {
        // 每人结余餐数  =  每人计划餐数  -  每人已使用餐数
        return `${Big(+budget_meals_per_person || 0)
          .minus(+order_id_count)
          .toFixed(0)}`
      },
    },
    {
      Header: t('结余总餐数'),
      minWidth: 120,
      id: 'total_balance_meals',
      accessor: ({
        mealTimesCount,
        budget_meals_per_person,
        dinning_count,
      }) => {
        // 结余总餐数 = 计划总餐数 - 已使用总餐数
        const plan_total_meal = Big(+mealTimesCount)
          .times(+budget_meals_per_person! || 0)
          .toFixed(0)
        return `${Big(+plan_total_meal)
          .minus(+dinning_count)
          .toFixed(0)}`
      },
    },
    {
      Header: t('结余餐标'),
      minWidth: 120,
      id: 'balance_meal_mark',
      accessor: ({
        budget_money_per_person,
        budget_meals_per_person,
        order_id_count,
        order_price_sum,
        mealTimesCount,
      }) => {
        // 结余餐标 =  （结余金额/用餐人数）/（每人结余餐数）
        const balance_amount =
          (+mealTimesCount &&
            Big(+mealTimesCount || 0)
              .times(+budget_money_per_person! || 0)
              .minus(+order_price_sum)
              .div(+mealTimesCount)
              .toFixed(2)) ||
          0
        const meals_per_person_surplus = Big(+budget_meals_per_person || 0)
          .minus(+order_id_count)
          .toFixed(0)

        return (
          <span>
            {`${
              +meals_per_person_surplus !== 0
                ? Big(+balance_amount || 0)
                    .div(+meals_per_person_surplus || 0)
                    .toFixed(2)
                : '0.00'
            } ` + Price.getUnit()}
          </span>
        )
      },
    },
    {
      Header: t('操作'),
      minWidth: 100,
      diyEnable: false,
      fixed: 'right',
      id: 'option' as any,
      Cell: (cellProps) => {
        const {
          original: { budget_id, isExpired },
        } = cellProps
        return (
          <OperationCell>
            {!isExpired && (
              <OperationDetail
                onClick={() =>
                  history.push(
                    `/customer/society/customer_budget_management/update?budget_id=${budget_id}`,
                  )
                }
              />
            )}
            <OperationDelete
              title={t('确认删除')}
              onClick={() => store.deleteBudget(budget_id)}
            >
              {t('是否要删除该客户预算？')}
            </OperationDelete>
          </OperationCell>
        )
      },
    },
  ]
  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('资金预算计划数'),
                content: store.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={
        <>
          <Button type='primary' onClick={handleCreate}>
            {t('新建客户预算')}
          </Button>
          <Button onClick={handleBatchImport} className='gm-margin-left-5'>
            {t('批量导入')}
          </Button>
        </>
      }
    >
      <Table isDiy data={store.list} columns={columns} />
      {showBatchImportModal()}
    </BoxTable>
  )
}

export default observer(List)
