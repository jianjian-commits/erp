import { toFixed } from '@/common/util'
import ProductionUnitTip from '@/pages/merchandise/components/production_unit_tip'
import MaterialCost from '@/pages/merchandise/manage/components/materialCost'
import EllipsesText from '@/pages/production/bom_management/components/bom_list/components/ellipsed_text'
import { MaterialItem } from '@/pages/production/bom_management/components/create_bom/interface'
import { Flex, Price, Tooltip } from '@gm-pc/react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { map_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import { BomType } from 'gm_api/src/production'
import { observer, Observer } from 'mobx-react'
import React, { FC, useMemo, useState } from 'react'
import store from '../store'
import CellQuantity from './cell_quantity'
import CellSkuName from './cell_sku_name'
import CellUnit from './cell_unit'
import _ from 'lodash'
import { message } from 'antd'

/**
 * BOM原料表格的属性
 */
interface Props {
  /** BOM的种类 */
  type?: BomType
}

const { TABLE_X, OperationHeader, OperationCell, EditOperation } = TableXUtil

/**
 * BOM原料表格的组件函数
 */
const BomMaterial: FC<Props> = observer(({ type }) => {
  const {
    materialList,
    bomDetail: { showYield },
  } = store
  const isClean = type === BomType.BOM_TYPE_CLEANFOOD

  const [sortNum, setSortNum] = useState(1)

  const handleSort = (data: MaterialItem[]) => {
    setSortNum((v) => v + 1)
    // 不允许移动最后一项
    if (!data.slice(-1)[0].isFinishedProduct) {
      message.error(t('无法调整成品位置'))
      return
    }
    store.updateSortMaterialList(data as MaterialItem[])
  }

  /**
   * 处理增加行的事件
   * 新增原料
   */
  const handleAddRow = () => {
    store.addNewMaterial()
  }

  /**
   * 处理删除行的事件
   * 删除原料
   * @param {number} index 删除行的编号
   */
  const handleDelRow = (index: number) => {
    store.delMaterial(index)
  }

  /**
   * 定义表格的栏
   */
  const columns: Column<MaterialItem>[] = useMemo(
    () => [
      {
        Header: 'BOM配比',
        fixed: 'left',
        width: 100,
        Cell: ({ original: { isFinishedProduct }, index }) => {
          return index === 0 ? t('原料') : isFinishedProduct ? t('成品') : ''
        },
      },
      {
        Header: OperationHeader,
        id: 'index' as any,
        fixed: 'left',
        width: TABLE_X.WIDTH_OPERATION,
        show: !isClean,
        Cell: ({ original: { isFinishedProduct }, index }) => {
          return !isFinishedProduct ? (
            <OperationCell>
              <EditOperation
                onAddRow={handleAddRow}
                onDeleteRow={
                  store.materialList.length === 2
                    ? undefined
                    : () => handleDelRow(index)
                }
              />
            </OperationCell>
          ) : null
        },
      },
      {
        Header: t('商品名称'),
        accessor: 'sku_id',
        minWidth: 180,
        isKeyboard: true,
        Cell: ({ index }) => {
          return (
            <Observer>
              {() => {
                const {
                  bomDetail: { selectedSku },
                  materialList,
                } = store
                const { isFinishedProduct } = materialList[index]
                return !isFinishedProduct ? (
                  <CellSkuName sku={materialList[index]} index={index} />
                ) : (
                  <EllipsesText text={selectedSku?.text ?? '-'} />
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: <Flex>{t('商品数量')}</Flex>,
        accessor: 'quantity',
        isKeyboard: true,
        minWidth: 100,
        show: !isClean,
        Cell: ({ original, index }) => {
          return (
            <Observer>
              {() => {
                const { materialList, bomDetail } = store
                const { isFinishedProduct } = materialList[index]
                return type === BomType.BOM_TYPE_PACK && isFinishedProduct ? (
                  <div>{toFixed(+bomDetail.quantity, 2)}</div>
                ) : (
                  <CellQuantity index={index} data={original} type='quantity' />
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: <ProductionUnitTip />,
        accessor: 'unit_ids',
        isKeyboard: true,
        minWidth: 100,
        Cell: ({ original, index }) => {
          // 各自的相同单位type列表选择
          return (
            <Observer>
              {() =>
                isClean && original.isFinishedProduct ? (
                  <span>-</span>
                ) : (
                  <CellUnit index={index} sku={original} isClean={isClean} />
                )
              }
            </Observer>
          )
        },
      },
      {
        Header: t('商品类型'),
        accessor: 'not_package_sub_sku_type',
        minWidth: 100,
        Cell: ({ original: { not_package_sub_sku_type } }) => {
          return (
            <Observer>
              {() => {
                return (
                  <span>
                    {map_Sku_NotPackageSubSkuType[not_package_sub_sku_type!] ||
                      '-'}
                  </span>
                )
              }}
            </Observer>
          )
        },
      },

      {
        Header: <MaterialCost />,
        accessor: 'material_cost',
        minWidth: 100,
        Cell: ({ original: { isFinishedProduct }, index }) => {
          return (
            <Observer>
              {() => {
                const { material_cost, unit_ids } = store.materialList[index]
                return isFinishedProduct ? (
                  <div>
                    {store.productCost
                      ? store.productCost + Price.getUnit()
                      : '-'}
                  </div>
                ) : (
                  <div>
                    {material_cost
                      ? material_cost.val +
                        Price.getUnit() +
                        '/' +
                        _.find(unit_ids, { value: material_cost.unit_id })?.name
                      : '-'}
                  </div>
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('商品BOM'),
        accessor: 'not_package_sub_sku_type',
        width: 170,
        Cell: ({ original: { materialBom, isFinishedProduct } }) => {
          return (
            <Observer>
              {() => {
                return !isFinishedProduct && materialBom ? (
                  <EllipsesText text={materialBom.name}>
                    <a
                      href={`#/production/bom_management/${'produce'}/detail?revision=${
                        materialBom.revision
                      }&bom_id=${materialBom.bom_id}&sku_id=${
                        materialBom.sku_id
                      }`}
                      target='_blank'
                      rel='noreferrer'
                    >
                      {materialBom.name}
                    </a>
                  </EllipsesText>
                ) : (
                  <span>-</span>
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: (
          <Flex>
            {t('熟出成率')}
            <Tooltip
              className='gm-padding-lr-5 gm-text-14'
              popup={
                <div className='gm-padding-5' style={{ width: '450px' }}>
                  <div>
                    {t(
                      '指商品经过熟化操作后的重量，用户录入，非必填项；默认展示商品默认BOM的熟出成率',
                    )}
                  </div>
                </div>
              }
            />
          </Flex>
        ),
        show: showYield && type === BomType.BOM_TYPE_PRODUCE,
        accessor: 'quantity',
        isKeyboard: true,
        minWidth: 100,
        Cell: ({ original, index }) => {
          return (
            <Observer>
              {() =>
                !original.isFinishedProduct ? (
                  <CellQuantity
                    index={index}
                    data={original}
                    type='cook_yield_rate'
                  />
                ) : (
                  <div>-</div>
                )
              }
            </Observer>
          )
        },
      },
      {
        Header: (
          <Flex>
            {t('单位熟重数量')}
            <Tooltip
              className='gm-padding-lr-5 gm-text-14'
              popup={
                <div className='gm-padding-5' style={{ width: '450px' }}>
                  <div>
                    {t('指商品经过熟化操作后的重量，用户录入，非必填项')}
                  </div>
                </div>
              }
            />
          </Flex>
        ),
        show: showYield && type === BomType.BOM_TYPE_PRODUCE,
        accessor: 'quantity',
        isKeyboard: true,
        minWidth: 100,
        Cell: ({ original, index }) => {
          return (
            <Observer>
              {() =>
                !original.isFinishedProduct ? (
                  <CellQuantity
                    index={index}
                    data={original}
                    type='cooked_quantity'
                  />
                ) : (
                  <div>-</div>
                )
              }
            </Observer>
          )
        },
      },
    ],
    [showYield, type],
  )
  return (
    <Table
      key={sortNum}
      isSort
      isEdit
      isKeyboard
      id='bom_materials_list'
      tiled
      columns={columns}
      data={materialList.slice()}
      onAddRow={handleAddRow}
      className='gm-margin-bottom-10'
      style={{ marginLeft: 40 }}
      onSortChange={(data) => handleSort(data as MaterialItem[])}
      keyField='sortNum'
    />
  )
})

export default BomMaterial
