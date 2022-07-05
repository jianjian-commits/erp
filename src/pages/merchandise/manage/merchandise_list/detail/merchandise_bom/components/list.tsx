import TableTextOverflow from '@/common/components/table_text_overflow'
import { history } from '@/common/service'
import HintComponent from '@/pages/merchandise/components/hint'
import { TableList, TableListColumn } from '@gm-pc/business'
import { Card, Space, Tag } from 'antd'
import { t } from 'gm-i18n'
import { BomType, map_BomType } from 'gm_api/src/production'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import store from '../store'

const ListV2: FC = observer(() => {
  const { list, filter, getBomList } = store

  const toDetail = (
    type: number,
    revision: string,
    bom_id: string,
    sku_id: string,
  ) => {
    const isPack = type === BomType.BOM_TYPE_PACK
    history.push(
      `/production/bom_management/${
        isPack ? 'pack' : 'produce'
      }/detail?revision=${revision}&bom_id=${bom_id}&sku_id=${sku_id}&isPack=${isPack}`,
    )
  }

  const columns: TableListColumn[] = [
    {
      Header: t('BOM名称'),
      id: 'name',
      accessor: 'name',
      minWidth: 200,
      Cell: (cellProps) => {
        const {
          name,
          isDefault,
          haveDeleteMaterial,
          revision,
          type,
          bom_id,
          sku_id,
        } = cellProps.original
        return (
          <Space>
            <a onClick={() => toDetail(type, revision, bom_id, sku_id)}>
              <TableTextOverflow text={t(name)} />
            </a>{' '}
            {isDefault && (
              <Tag color='blue' className='tw-w-9 tw-text-center'>
                {t('默认')}
              </Tag>
            )}
            {haveDeleteMaterial && (
              <HintComponent type='1' content={t('该bom下有物料已被删除')} />
            )}
          </Space>
        )
      },
    },
    {
      Header: t('BOM编码'),
      id: 'customized_code',
      accessor: 'customized_code',
      minWidth: 100,
    },
    {
      Header: t('BOM类型'),
      id: 'type',
      accessor: 'type',
      minWidth: 100,
      Cell: (cellProps) => {
        const { type } = cellProps.original
        return t(map_BomType[type])
      },
    },
    {
      Header: t('工序'),
      id: 'step',
      accessor: 'process',
      minWidth: 100,
      Cell: ({ original }) => (
        <TableTextOverflow text={original?.processTemplateName!} />
      ),
    },
    {
      Header: t('原料'),
      id: 'material',
      accessor: 'material',
      minWidth: 100,
      Cell: ({ original }) => (
        <TableTextOverflow
          text={_.map(original.materials, (v) => v.name).join(',')}
        />
      ),
    },
  ]

  return (
    <Card className='gm-site-card-border-less-wrapper-165'>
      <TableList
        id='bom_list'
        keyField='bom_id'
        data={list}
        filter={filter}
        service={getBomList}
        columns={columns}
        isUpdateEffect={false}
        headerProps={{ hidden: true }}
        paginationOptions={{
          paginationKey: 'merchandise_bom_list',
          defaultPaging: { need_count: true },
        }}
      />
    </Card>
  )
})

export default ListV2
