import React from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import {
  Modal,
  BoxTable,
  BoxTableInfo,
  Button,
  UploaderFile,
  BoxTableProps,
} from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import moment from 'moment'
import TableTotalText from '@/common/components/table_total_text'
import store from '../store'
import { uploadQiniuFile } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import { ImportInquiryPrice } from 'gm_api/src/purchase'
import BatchImport from './import'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import Big from 'big.js'
import { BasicPrice_Source } from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'

const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const { list } = store

  const handleHide = () => {
    Modal.hide()
  }

  const handleSubmit = (file: UploaderFile) => {
    return uploadQiniuFile(
      FileType.FILE_TYPE_ENTERPRISE_CUSTOMER_IMPORT,
      file,
    ).then(async (json) => {
      await ImportInquiryPrice({ excel_url: json.data.url })
      globalStore.showTaskPanel('1')
      return null
    })
  }

  const handleClick = () => {
    Modal.render({
      size: 'md',
      title: t('批量导入询价'),
      children: <BatchImport onCancel={handleHide} onSubmit={handleSubmit} />,
    })
  }
  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <Observer>
            {() => (
              <TableTotalText
                data={[
                  {
                    label: t('询价记录'),
                    content: store.summary.count,
                  },
                ]}
              />
            )}
          </Observer>
        </BoxTableInfo>
      }
      action={
        <PermissionJudge
          permission={Permission.PERMISSION_PURCHASE_IMPORT_INQUIRY_PRICE}
        >
          <Button type='primary' onClick={handleClick}>
            {t('导入询价')}
          </Button>
        </PermissionJudge>
      }
    >
      <Table
        data={list.slice()}
        columns={[
          {
            Header: t('询价时间'),
            id: 'update_time',
            accessor: (d: any) =>
              moment(new Date(+d.update_time)).format('YYYY-MM-DD HH:mm'),
          },
          {
            Header: t('商品编码'),
            accessor: 'sku.customize_code',
          },
          {
            Header: t('商品名称'),
            accessor: 'sku.name',
          },
          // {
          //   Header: t('规格名'),
          //   id: 'ssu.name',
          //   accessor: (d: any) => {
          //     return d.ssu?.name || '-'
          //   },
          // },
          // {
          //   Header: t('规格'),
          //   accessor: 'spec',
          // },
          { Header: t('采购单位'), accessor: 'category_name' },
          {
            Header: t('分类'),
            accessor: 'category_name',
          },
          {
            Header: t('供应商'),
            accessor: 'supplier',
            Cell: (props) => {
              return props.original?.supplier?.name || '-'
            },
          },
          {
            Header: t('询价价格(采购单位)'),
            accessor: 'unit_price',
            width: 150,
            Cell: (props) => {
              if (props.original?.unit_price) {
                return Big(props.original?.unit_price).toFixed(2)
              } else {
                return '-'
              }
            },
          },
          // {
          //   Header: t('询价价格（包装单位）'),
          //   accessor: 'pack_price',
          //   width: 150,
          //   Cell: (props) => {
          //     if (props.original?.pack_price) {
          //       return Big(props.original?.pack_price).toFixed(2)
          //     } else {
          //       return '-'
          //     }
          //   },
          // },
          {
            Header: t('产地'),
            accessor: (d) => d.repeated_field.origin_place || '-',
          },
          {
            Header: t('描述'),
            accessor: (d) => d.remark || '-',
          },
          {
            Header: t('询价人'),
            accessor: (d: any) => d.creator?.name || '-',
          },
          {
            Header: t('询价来源'),
            accessor: (d) =>
              d.source === BasicPrice_Source.PURCHASE_APP
                ? '采购小程序'
                : d.source === BasicPrice_Source.STATION
                ? '后台导入'
                : '-',
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(List)
