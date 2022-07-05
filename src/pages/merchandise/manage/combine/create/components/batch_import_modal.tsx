import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
  Key,
} from 'react'
import { observer } from 'mobx-react'
import { Modal, Alert, Button } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import { BatchRefProps } from '../interface'
import SelectTable, {
  SelectTableRef,
  Pagination,
} from '@/common/components/select_table'
import TableTextOverflow from '@/common/components/table_text_overflow'
import store, { TableConfigInterface } from '../store'

import _ from 'lodash'
import {
  Ingredient,
  ListSkuV2,
  ListSkuV2Request,
  Sku,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'
import { getSkuUnitList } from '@/pages/merchandise/manage/combine/util'
import { getRandomId } from '@/pages/merchandise/util'
import ProductImage from '@/common/components/product_image'
import { DataNode } from 'antd/lib/tree'
import { getCategoryName } from '@/common/util'

interface BatchImportModalProps {
  fieldsValue: { sku: Ingredient[] }
  setFieldsValue: (value: Ingredient[]) => void
  defaultSelectedRows: Sku[]
  defaultSelectedRowKeys: string[]
}

const BatchImportModal = observer(
  forwardRef<BatchRefProps, BatchImportModalProps>((props, modalRef) => {
    const { setTableSkuList, setTableFormConfig } = store

    const {
      fieldsValue,
      setFieldsValue,
      defaultSelectedRows,
      defaultSelectedRowKeys,
    } = props

    const selectTableRef = useRef<SelectTableRef<any>>(null)

    const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
    const [totalCount, setTotalCount] = useState<number>(0)
    const [categoryMap, setCategoryMap] = useState<{ [key: string]: DataNode }>(
      {},
    )

    useImperativeHandle(modalRef, () => ({
      setIsModalVisible,
    }))

    useEffect(() => {
      setTotalCount(defaultSelectedRowKeys.length)
    }, [defaultSelectedRowKeys])

    useEffect(() => {
      return () => {
        setTotalCount(0)
      }
    }, [])

    /** 获取商品列表 */
    const fetchList = (paging: Pagination, values?: any) => {
      let filter_params = {
        q: '',
        category_id: undefined,
        sku_type: Sku_SkuType.NOT_PACKAGE,
      }
      if (values) {
        const { q, categories } = values
        filter_params = {
          ...filter_params,
          q,
          category_id: categories && categories[categories.length - 1],
        }
      }

      const req: ListSkuV2Request = {
        filter_params,
        paging,
        sort_by: { field: 6, desc: true },
      }

      return ListSkuV2(req).then((json) => {
        const { paging, skus = [], category_map = {} } = json.response
        setCategoryMap(category_map)
        return { list: skus, count: paging.count }
      })
    }

    /** 获取数量提示 */
    const getTipsCount = (rowKeys: Key[]) => {
      const count = defaultSelectedRowKeys.length + rowKeys.length
      setTotalCount(count > 10 ? 10 : count)
    }

    /** 取消 */
    const handleCancel = () => {
      setIsModalVisible(false)
    }

    /** 确定 */
    const handleOk = () => {
      const formFields: Ingredient[] = []
      const skuList: Sku[] = []
      const tableConfig: TableConfigInterface[] = []
      if (selectTableRef.current) {
        const { selectedRows } = selectTableRef.current
        // 去除相同的sku
        const rows = _.uniqBy(
          [..._.cloneDeep(defaultSelectedRows), ...selectedRows],
          (item) => item.sku_id,
        )
        _.map(rows, (rowItem) => {
          let fieldItem: Ingredient = {
            sku_id: rowItem.sku_id,
            ratio: '',
            order_unit_id: rowItem.base_unit_id,
          }
          const rowFieldValue = _.find(
            fieldsValue.sku,
            (item) => item.sku_id === rowItem.sku_id,
          )

          if (rowFieldValue) {
            fieldItem = rowFieldValue
          }

          formFields.push(fieldItem)
          const sku = rowItem
          skuList.push(sku)
          const unitList = getSkuUnitList(sku)

          let unitName = ''
          if (fieldItem.order_unit_id) {
            const unitItme = _.find(
              unitList,
              (item) => item.unit_id === fieldItem.order_unit_id,
            )
            unitName = unitItme?.text || ''
          }

          tableConfig.push({
            key: getRandomId(),
            skuOptions: [sku],
            unitList,
            unitName,
            on_sale: !!sku.on_sale,
          })
        })
      }

      setFieldsValue(formFields)
      setTableSkuList(skuList)
      setTableFormConfig(tableConfig)
      handleCancel()
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
        key: 'category_id',
        dataIndex: 'category_id',
        render: (text) => {
          const name = getCategoryName(categoryMap, text)

          return <TableTextOverflow text={name} />
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
          title={t('批量添加商品')}
          width={1300}
          visible={isModalVisible}
          okText={t('确定')}
          onOk={handleOk}
          cancelText={t('取消')}
          onCancel={handleCancel}
        >
          <Alert
            className='tw-mb-3'
            message={t(
              `注意：组合商品已选${totalCount}个商品，本次最多只能添加${
                10 - totalCount
              }个商品。`,
            )}
            type='info'
            showIcon
          />
          <SelectTable<Sku, any>
            tableRef={selectTableRef}
            rowKey='sku_id'
            limitCount={10 - defaultSelectedRowKeys.length}
            selectCountWarning='子商品数量已到上限，无法继续添加'
            selectedKey='name'
            columns={columns}
            onSearch={fetchList}
            onSelect={getTipsCount}
            disabledList={defaultSelectedRowKeys}
            filter={[
              {
                name: 'categories',
                placeholder: t('全部分类'),
                type: 'categoryCascader',
              },
              {
                name: 'q',
                placeholder: t('请输入商品名称/别名/编码'),
                type: 'input',
              },
            ]}
          />
        </Modal>
      </>
    )
  }),
)
export default BatchImportModal
