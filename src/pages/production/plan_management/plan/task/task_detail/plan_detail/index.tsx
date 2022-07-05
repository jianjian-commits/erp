import { Column, Table } from '@gm-pc/table-x'
import React, { useMemo, FC } from 'react'
import moment from 'moment'
import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import HeaderTip from '@/common/components/header_tip'
import store, { TaskSsu } from '../store'
import { observer } from 'mobx-react'
import globalStore from '@/stores/global'
import { toFixed } from '@/pages/production/util'

interface Props {
  is_pack: boolean
}

const Plan: FC<Props> = ({ is_pack }) => {
  const { tasks } = store
  const columns = useMemo(
    (): Column<TaskSsu>[] => [
      { Header: t('需求编号'), accessor: 'serial_no' },
      {
        Header: t('计划交期'),
        accessor: 'delivery_time',
        Cell: (cellProps) => {
          const { delivery_time } = cellProps.original!
          return moment(new Date(+delivery_time!)).format('YYYY-MM-DD')
        },
      },
      {
        Header: t('生产成品'),
        accessor: 'sku_name',
        hide: is_pack,
        Cell: (cellProps) => {
          const { sku_name } = cellProps.original!
          return sku_name
        },
      },
      // {
      //   Header: (
      //     <HeaderTip
      //       header={
      //         <Flex column alignCenter>
      //           <span>{t('计划包装数')}</span>
      //           <span>{t('(基本单位)')}</span>
      //         </Flex>
      //       }
      //     />
      //   ),
      //   accessor: 'pack_amount',
      //   hide: !is_pack,
      //   Cell: (cellProps) => {
      //     const { plan_amount, base_unit_id } = cellProps.original!
      //     return toFixed(plan_amount) + globalStore.getUnitName(base_unit_id!)
      //   },
      // },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column alignCenter>
                <span>{t(`计划${is_pack ? '包装' : '生产'}数`)}</span>
                <span>{`(${is_pack ? '包装' : '基本'}单位)`}</span>
              </Flex>
            }
          />
        ),
        accessor: 'amount',
        Cell: (cellProps) => {
          const { plan_amount, base_unit_id, ssuInfo } = cellProps.original!
          const name = is_pack
            ? ssuInfo.ssu?.unit.name
            : globalStore.getUnitName(base_unit_id!)
          return toFixed(plan_amount || '0') + name
        },
      },
    ],
    [],
  )

  return <Table data={tasks!.slice()} columns={columns} border />
}

export default observer(Plan)
