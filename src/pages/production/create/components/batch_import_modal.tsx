import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react'
import { Modal } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import SelectTable, {
  SelectTableRef,
  Pagination,
} from '@/common/components/select_table'
import TableTextOverflow from '@/common/components/table_text_overflow'

import _ from 'lodash'
import { Sku } from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'

import ProductImage from '@/common/components/product_image'
import { ListBom, ListBomRequest } from 'gm_api/src/production'
import { Filters_Bool } from 'gm_api/src/common'

interface BatchImportModalProps {
  defaultSelectedRowKeys: string[]
  onOk: (data: any) => void
}

const BatchImportModal = forwardRef<any, BatchImportModalProps>(
  (props, modalRef) => {
    const { onOk, defaultSelectedRowKeys } = props
    const [visible, setVisible] = useState(false)

    const selectTableRef = useRef<SelectTableRef<any>>(null)

    useImperativeHandle(modalRef, () => ({ setVisible }))

    const fetchList = (paging: Pagination, values?: any) => {
      const { q, categories } = values || { q: '', categories: undefined }
      const req: ListBomRequest = {
        category_ids: categories?.slice(-1),
        list_sku_v2_request: q
          ? {
              filter_params: { q },
              paging: { all: true },
            }
          : undefined,
        paging,
        need_sku_infos: true,
        request_data: 1024,
        is_default: Filters_Bool.TRUE,
      }

      return ListBom({ ...req }).then((json) => {
        const { paging, boms, sku_infos } = json.response!
        const data = _.map(boms, (v) => {
          const { sku, category_infos } = sku_infos?.[v.sku_id]!
          return {
            ...sku,
            value: sku?.sku_id,
            sku_name: sku?.name,
            category_name: _.map(category_infos, (v) => v.category_name).join(
              '/',
            ),
            customize_code: sku?.customize_code,
            bomInfo: v,
          }
        })
        return { list: data, count: paging.count }
      })
    }

    const handleCancel = () => {
      setVisible(false)
    }

    const handleOk = () => {
      onOk(selectTableRef.current)
    }

    const columns: ColumnType<Sku>[] = [
      {
        title: t('商品图片'),
        key: 'image',
        dataIndex: 'image',
        render: (_, record) => {
          const { repeated_field } = record
          const images = repeated_field?.images || []
          return <ProductImage url={images[0] && images[0].path} />
        },
      },
      {
        title: t('商品名称'),
        key: 'name',
        dataIndex: 'name',
        render: (text) => <TableTextOverflow text={text} />,
      },
      {
        title: t('商品编码'),
        key: 'customize_code',
        dataIndex: 'customize_code',
        render: (text) => <TableTextOverflow text={text} />,
      },
      {
        title: t('商品分类'),
        render: (text) => {
          return <TableTextOverflow text={text.category_name} />
        },
      },
      {
        title: t('基本单位'),
        key: 'base_unit_id',
        dataIndex: 'base_unit_id',
        width: 150,
        render: (text) => globalStore.getUnitName(text) || '-',
      },
    ]

    return (
      <>
        <Modal
          destroyOnClose
          visible={visible}
          title={t('批量添加商品')}
          width={1300}
          okText={t('确定')}
          onOk={handleOk}
          cancelText={t('取消')}
          onCancel={handleCancel}
        >
          <SelectTable
            tableRef={selectTableRef}
            rowKey='sku_id'
            selectedKey='name'
            columns={columns}
            onSearch={fetchList}
            disabledList={defaultSelectedRowKeys}
            filter={[
              {
                name: 'categories',
                placeholder: t('全部分类'),
                type: 'categoryCascader',
              },
              {
                name: 'q',
                placeholder: t('请输入商品名称/编码'),
                type: 'input',
              },
            ]}
          />
        </Modal>
      </>
    )
  },
)

export default BatchImportModal
