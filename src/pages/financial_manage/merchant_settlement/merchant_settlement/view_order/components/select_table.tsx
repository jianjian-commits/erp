import React, { FC, useState } from 'react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex, BoxTable, BoxTableInfo, Price, Button } from '@gm-pc/react'
import moment from 'moment'
import _ from 'lodash'
import TableTotalText from '@/common/components/table_total_text'
import store from '../store'

interface Props {
  selectIds: string[]
  ensureFunc: (selected: string) => void
  cancelFunc: () => void
}

const SelectTable: FC<Props> = observer((props) => {
  const { ensureFunc, cancelFunc, selectIds } = props

  const [selected, setSelected] = useState<any[]>([])

  const { settlement_list, list } = store

  const selectedData = _.find(list, (item) => item?.order_id! === selectIds![0])

  const handleEnsure = () => {
    ensureFunc(selected![0])
  }

  const _columns = [
    {
      id: 'create_time',
      Header: t('建单日期'),
      minWidth: 120,
      accessor: (d: any) => {
        return moment(new Date(+d.create_time!)).format('YYYY-MM-DD HH:mm:ss')
      },
    },
    {
      Header: t('对账单号'),
      minWidth: 120,
      accessor: 'settle_sheet_serial_no',
    },
    {
      id: 'total_price',
      Header: t('单据总金额'),
      minWidth: 80,
      accessor: (d: any) => {
        return <Price value={Number(+d.total_price!)} />
      },
    },
  ]

  return (
    <div className='gm-padding-left-10 gm-padding-right-10'>
      <p className='gm-padding-top-5'>
        {t('当前公司已有')}
        <span className='gm-color-primary'>{`${settlement_list.length}个`}</span>
        {t('待提交的对账单，请选择要加入的对账单')}
      </p>
      <BoxTable
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('公司名称'),
                  content: selectedData?.company! || '-',
                },
                {
                  label: t('结款周期'),
                  content: selectedData?.credit_type! || '-',
                },
              ]}
            />
          </BoxTableInfo>
        }
      >
        <Table
          isSelect
          style={{ maxHeight: '500px' }}
          data={settlement_list.slice()}
          keyField='settle_sheet_id'
          selected={selected}
          onSelect={setSelected}
          selectType='radio'
          columns={_columns}
        />
      </BoxTable>

      <Flex className='gm-margin-top-10' justifyEnd>
        <Button className='gm-margin-right-5' onClick={cancelFunc}>
          {t('取消')}
        </Button>
        <Button
          type='primary'
          onClick={handleEnsure}
          disabled={selected.length === 0}
        >
          {t('确认')}
        </Button>
      </Flex>
    </div>
  )
})

export default SelectTable
