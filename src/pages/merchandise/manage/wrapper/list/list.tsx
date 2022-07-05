import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { Observer, observer } from 'mobx-react'
import store from '../store'
import { TableXUtil } from '@gm-pc/table-x'
import { gmHistory as history } from '@gm-common/router'
import productDefaultImg from '@/img/product-default-gm.png'
import { TableList, TableListColumn } from '@gm-pc/business'
import { message, Modal } from 'antd'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { getCategoryNames, getUnitItem } from '@/pages/merchandise/util'
import { Sku } from 'gm_api/src/merchandise/types'
import { DeleteSkuTip } from '@/pages/merchandise/components/common'
import { DeleteSkuV2 } from 'gm_api/src/merchandise'
import ProductImage from '@/common/components/product_image'
import classNames from 'classnames'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import '../../../style.less'
const { OperationHeader } = TableXUtil

const List: FC = observer(() => {
  /** 跳转到包材详细页 */
  const handleDetail = (sku_id: string) => {
    history.push(`/merchandise/manage/wrapper/sku_detail?sku_id=${sku_id}`)
  }

  /**
   * 单个删除报价单
   * @param record 当前行数据
   */
  const handleDeleteSku = (record: Sku) => {
    console.log(record)
    const { name = '-', sku_id } = record
    Modal.confirm({
      title: t('删除商品'),
      okType: 'danger',
      content: <DeleteSkuTip text={name} />,
      onOk() {
        DeleteSkuV2({ sku_id }).then(() => {
          message.success(t('删除成功'))
          store.fetchList()
        })
      },
    })
  }

  /** 表格列 */
  const columns = [
    {
      Header: t('商品图片'),
      id: 'images',
      minWidth: 120,
      Cell: (cellProps) => {
        const { repeated_field } = cellProps.original
        // 图片路径
        const images = repeated_field?.images || []

        return (
          <ProductImage
            width='40px'
            height='40px'
            url={images[0] && images[0].path}
          />
        )
      },
    },
    {
      Header: t('商品'),
      id: 'name',
      minWidth: 120,
      Cell: (cellProps) => {
        const { name, customize_code, sku_id } = cellProps.original
        return (
          <a
            className={classNames('gm-cursor', {
              merchandise_a_disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_UPDATE_PACKAGE_SKU_SSU,
              ),
            })}
            style={{ textDecoration: 'underline' }}
            onClick={() => handleDetail(sku_id)}
          >
            <TableTextOverflow text={name} />
            <br />
            <TableTextOverflow text={customize_code} />
          </a>
        )
      },
    },
    {
      Header: t('分类'),
      id: 'category_id',
      accessor: 'category_id',
      minWidth: 120,
      Cell: (cellProps) => {
        const { value } = cellProps
        return (
          <Observer>
            {() => {
              return (
                // 包裹一层div是为了纠正TableTextOverflow组件的气泡对齐位置
                <div>
                  <TableTextOverflow
                    text={getCategoryNames(store.treeDataMap, value)}
                  />
                </div>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('基本单位'),
      accessor: 'base_unit_id',
      minWidth: 120,
      id: 'base_unit_id',
      Cell: (cellProps) => {
        const unit_id = cellProps.value
        return getUnitItem(unit_id)?.name || '-'
      },
    },
    {
      Header: t('货值'),
      accessor: 'package_price',
      id: 'package_price',
      minWidth: 120,
      Cell: (cellProps) => {
        const { package_price, base_unit_id } = cellProps.original
        if (!package_price) return '-'
        return package_price + '元/' + getUnitItem(base_unit_id)?.name
      },
    },
    {
      id: 'operation',
      Header: OperationHeader,
      width: TableXUtil.TABLE_X.WIDTH_OPERATION,
      Cell: (cellProps) => (
        <a
          className={classNames({
            merchandise_a_disabled: !globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_DELETE_PACKAGE_SKU_SSU,
            ),
          })}
          type='link'
          onClick={() => handleDeleteSku(cellProps.original)}
        >
          {t('删除')}
        </a>
      ),
    },
  ] as TableListColumn<Sku>[]

  const tableId = 'manage_wrapper_list'

  return (
    <div className='gm-site-card-border-less-wrapper-114'>
      <TableList<Sku>
        headerProps={{ hidden: true }}
        isUpdateEffect={false}
        id={tableId}
        keyField='quotation_id'
        service={store.getList}
        filter={store.filter}
        columns={columns}
        paginationOptions={{
          paginationKey: tableId,
          defaultPaging: { need_count: true },
        }}
      />
    </div>
  )
})

export default List
