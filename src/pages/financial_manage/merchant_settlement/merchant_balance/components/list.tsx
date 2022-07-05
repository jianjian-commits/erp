import React, { FC, useMemo } from 'react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  Modal,
  BoxTable,
  BoxTableInfo,
  Checkbox,
  Price,
  BoxTableProps,
} from '@gm-pc/react'
import Big from 'big.js'
import store from '../store'
import { ListOptions } from '../interface'
import { ACCOUNT_TYPE } from '../enum'
import OperationModal from './operation_modal'

const { OperationHeader, OperationCell, OperationIcon } = TableXUtil

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  onFetchList?: () => any
}

const List: FC<ListProps> = observer(({ pagination }) => {
  const { list, is_check_zero } = store

  // 充值
  const handleToRecharge = (
    data: {
      company_code: string
      company_name: string
      balance: string
      target_id: string
    },
    index: number,
    type: 'RECHARGE' | 'DEDUCTION',
  ) => {
    const handleSave = () => {
      store.updateAccountBalance(index, type)
    }
    const handleCancel = () => {
      Modal.hide()
    }
    Modal.render({
      children: (
        <OperationModal
          onCancel={handleCancel}
          onOK={handleSave}
          data={data}
          type={type}
        />
      ),
      size: 'md',
      title: type === 'RECHARGE' ? t('充值') : t('扣款'),
      onHide: Modal.hide,
    })
  }

  const _columns: Column<ListOptions>[] = useMemo(() => {
    return [
      {
        Header: t('公司编号'),
        accessor: 'company_code',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { company_code },
          } = cellProps
          return <div>{company_code || '-'}</div>
        },
      },
      {
        Header: t('公司名称'),
        accessor: 'company_name',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { company_name },
          } = cellProps
          return <div>{company_name || '-'}</div>
        },
      },
      {
        Header: t('账户类型'),
        accessor: 'type',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { account_type },
          } = cellProps
          return <div>{ACCOUNT_TYPE[account_type!] || '-'}</div>
        },
      },
      {
        Header: t('余额'),
        accessor: 'balance',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { balance },
          } = cellProps
          return Big(Number(balance) || 0).toFixed(2) + Price.getUnit() || '-'
        },
      },
      {
        Header: OperationHeader,
        accessor: 'operation',
        width: 180,
        diyEnable: false,
        diyItemText: t('操作'),
        Cell: (cellProps) => {
          const {
            original: { company_code, company_name, balance, target_id },
            index,
          } = cellProps
          return (
            <OperationCell>
              <OperationIcon
                tip={t('充值')}
                onClick={() =>
                  handleToRecharge(
                    {
                      company_code: company_code!,
                      company_name: company_name!,
                      balance: balance!,
                      target_id: target_id!,
                    },
                    index,
                    'RECHARGE',
                  )
                }
              >
                <span className='gm-text-primary gm-cursor'>
                  {/* <SVGMoney /> */}
                  {t('充值')}
                </span>
              </OperationIcon>
              <OperationIcon
                tip={t('扣款')}
                onClick={() =>
                  handleToRecharge(
                    {
                      company_code: company_code!,
                      company_name: company_name!,
                      balance: balance!,
                      target_id: target_id!,
                    },
                    index,
                    'DEDUCTION',
                  )
                }
              >
                <span className='gm-text-primary gm-cursor gm-margin-left-10'>
                  {t('扣款')}
                </span>
              </OperationIcon>
              <OperationIcon tip={t('查看余额流水')}>
                <a
                  href={`#/financial_manage/merchant_settlement/merchant_balance/balance_turnover?company_code=${company_code}&company_name=${company_name}&company_id=${target_id}`}
                  className='gm-text-primary gm-cursor gm-margin-left-10'
                  rel='noopener noreferrer'
                >
                  {t('余额流水')}
                </a>
              </OperationIcon>
            </OperationCell>
          )
        },
      },
    ]
  }, [])

  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <Checkbox
            checked={is_check_zero}
            onChange={() => {
              store.setChecked()
              store.doRequest()
            }}
          >
            {t('不显示余额为0的公司')}
          </Checkbox>
        </BoxTableInfo>
      }
    >
      <Table
        isDiy
        id='merchant_balance_id'
        keyField='company_id'
        columns={_columns}
        data={list}
      />
    </BoxTable>
  )
})

export default List
