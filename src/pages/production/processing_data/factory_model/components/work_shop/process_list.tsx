import globalStore from '@/stores/global'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { ProcessTemplate } from 'gm_api/src/production'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import store from '../../store'

interface Props {
  data: ProcessTemplate[]
}

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

const ProcessList: FC<Props> = observer(({ data }) => {
  const { current_modal } = store
  const { current_selected_modal, processes } = current_modal

  const handleDeleteProcessOfModal = (process_template_id: string) => {
    // 过滤掉删除的工序
    const new_processes = _.map(
      _.filter(processes, (p) => p.process_template_id !== process_template_id),
      (v) => v.process_template_id,
    )

    // 更新一下当前值
    store.updateProcessesOfProcessor(new_processes)
  }

  return (
    <Table<any>
      data={data.slice()}
      style={{ maxHeight: 'calc(100% - 60px)' }}
      columns={[
        {
          Header: t('工序编号/工序名称'),
          id: 'process_data',
          Cell: (cellProps) => {
            const { name, customized_code } = cellProps.original
            return (
              <div>
                {customized_code}/{name}
              </div>
            )
          },
        },
        {
          Header: OperationHeader,
          id: 'operator',
          Cell: (cellProps) => {
            // 当前为车间，只展示工序，不能删除
            const { process_template_id } = cellProps.original

            if (
              !globalStore.hasPermission(
                Permission.PERMISSION_PRODUCTION_UPDATE_PROCESSOR,
              ) ||
              current_selected_modal.parent_id === '0'
            ) {
              return <div className='gm-text-left'>-</div>
            }

            return (
              <OperationCell>
                <OperationDelete
                  title={t('确认删除')}
                  onClick={() =>
                    handleDeleteProcessOfModal(process_template_id)
                  }
                >
                  {t('是否要删除工序？')}
                </OperationDelete>
              </OperationCell>
            )
          },
        },
      ]}
    />
  )
})

export default ProcessList
