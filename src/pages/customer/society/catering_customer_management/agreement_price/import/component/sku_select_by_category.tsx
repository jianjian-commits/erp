import React, { FC, useEffect, useMemo, useState } from 'react'
import { Cascader } from 'antd'
import { DefaultOptionType } from 'antd/lib/cascader'
import { DataNode, DataOption } from '@/common/interface'
import { ListSkuV2 } from 'gm_api/src/merchandise'
import _ from 'lodash'
import { observer } from 'mobx-react'
import store from '../store'
import { pinyin } from '@gm-common/tool'

/**
 * @description treeData树形结构转换成 Cascader 级联组件格式
 */
export const formatCascaderData = (treeData: DataNode[]): DataOption[] => {
  if (treeData.length === 0) return []
  return treeData.map((item) => {
    return {
      value: item.value,
      label: item.title,
      children: formatCascaderData(item.children || []),
      isLeaf: false, // 必须
    }
  })
}

interface SkuSelectByCategoryProps {
  defaultValue?: string
  onChange?(skuId?: string, name?: string): void
}

interface SkuMapProps extends Partial<DataNode> {
  category1_id: string
  category2_id: string
}

/**
 * @description 根据商品一级、二级分类展示商品，同时支持商品文本搜索
 */

const SkuSelectByCategory: FC<SkuSelectByCategoryProps> = ({
  defaultValue,
  onChange,
}) => {
  defaultValue = useMemo(() => defaultValue, [defaultValue?.length])
  const list = store.category
  const [innerValue, setInnerValue] = useState<string[] | undefined>([])

  useEffect(() => {
    if (defaultValue?.length === 0 || defaultValue === '') {
      setInnerValue([])
    }
  }, [defaultValue?.length])

  /**
   *
   * @param category_id_or_sku_id 第三位是sku_id
   */
  const onInnerChange = (
    category_id_or_sku_id: string[],
    selectedOptions: DefaultOptionType[],
  ) => {
    if (
      selectedOptions &&
      selectedOptions[selectedOptions.length - 1]?.isLeaf
    ) {
      onChange &&
        onChange(
          category_id_or_sku_id[category_id_or_sku_id.length - 1], // sku_id
          selectedOptions[selectedOptions.length - 1]?.label + '', // sku_name
        )
      setInnerValue(category_id_or_sku_id)
    } else {
      setInnerValue([])
    }
  }

  /**
   * 本地数据筛选
   * @param inputValue
   * @param path
   * @returns
   */
  // @ts-ignore
  function filter(inputValue, path) {
    return path.some(
      // @ts-ignore
      (option) => {
        return (
          option!.label?.toLowerCase().indexOf(inputValue.toLowerCase()) > -1 || // 名字检索
          option!.alias?.toLowerCase().indexOf(inputValue.toLowerCase()) > -1 || // 别名检索
          pinyin(option!.label || option!.alias)
            ?.toLowerCase()
            .indexOf(inputValue.toLowerCase()) > -1
        )
      },
    )
  }

  /**
   * 根据一级、二级分类去拉商品信息
   * @param selectedOptions
   * @param q
   */
  const fetchMerchandises = async (
    selectedOptions: DefaultOptionType[],
    q?: string,
  ) => {
    const isCategory1_id = selectedOptions?.length === 1
    const isCategory2_id = selectedOptions?.length === 2

    const {
      response: { skus },
    } = await ListSkuV2({
      filter_params: {
        q,
        on_sale: 0,
        on_shelf: 1,
        sku_type: 2,
        // customer_id: customer_id,
        category1_id: isCategory1_id
          ? selectedOptions[0]?.value + ''
          : undefined,
        category2_id: isCategory2_id
          ? selectedOptions[1]?.value + ''
          : undefined,
      },
      paging: { limit: 999 },
    })

    // 搜索返回，根据商品的一级/二级分类，放回到list的结构
    if (q) {
      const skuMap = new Map<string, SkuMapProps>() // useless
      const qResult = _.map(skus, (item) => {
        const skuMapItem = {
          value: item.sku_id || '',
          label: `${item.name}` || '',
          alias: item.repeated_field?.alias.toString(),
          children: [],
          isLeaf: true,
          // 临时寄存
          category1_id: item?.category1_id || '',
          category2_id: item?.category2_id || '',
        }
        skuMap.set(item.sku_id!, skuMapItem)
        return skuMapItem
      }).reverse()

      const skuCate12IdRevertToTree = _.map(list, (item) => {
        _.each(qResult, (sku) => {
          // 一级分类相等
          if (sku.category1_id === item.value) {
            if (!item.children?.length) {
              item.children = [_.omit(sku, ['category1_id', 'category2_id'])]
            } else {
              // 是商品
              if (
                // @ts-ignore isLeaf === true 是商品，否则是二级分类
                item.children[0].isLeaf &&
                _.findIndex(item.children, (c) => c.value === sku.value) === -1 // 不存在这个商品才添加
              ) {
                item.children = [
                  ...item.children,
                  _.omit(sku, ['category1_id', 'category2_id']),
                ]

                // 是二级分类
              } else {
                _.each(item.children, (v) => {
                  if (
                    sku.category2_id === v.value &&
                    _.findIndex(v.children, (c) => c.value === sku.value) === -1 // 不存在这个商品才添加
                  ) {
                    v.children = [
                      ...v.children!,
                      _.omit(sku, ['category1_id', 'category2_id']),
                    ]
                  }
                })
              }
            }
          }
        })

        return item
      })
      store.updateCategory(skuCate12IdRevertToTree)
    }

    const noSku = [
      {
        value: '',
        label: '暂无商品',
        disabled: true,
        children: [],
      },
    ]
    // 选择了一级分类
    if (isCategory1_id) {
      const Cate1IdAddSkusToTree = _.map(list, (i) => {
        if (
          i.value === selectedOptions[0]?.value + '' &&
          // @ts-ignore
          (!i.children?.length || (i.children?.length && i.children[0].isLeaf))
        ) {
          if (skus?.length) {
            i.children = _.map(skus, (item) => {
              return {
                value: item.sku_id || '',
                label: item?.name || '',
                alias: item.repeated_field?.alias.toString(),
                children: [],
                isLeaf: true,
              }
            }).reverse()
          } else {
            i.children = noSku
          }
        }
        return i
      })
      store.updateCategory(Cate1IdAddSkusToTree)
    } else {
      // 选择了二级分类
      const Cate2IdAddSkusToTree = _.map(list, (i) => {
        if (i.children?.length) {
          _.each(i.children, (v) => {
            if (v.value === selectedOptions[1]?.value + '') {
              if (skus?.length) {
                v.children = _.map(skus, (item) => {
                  return {
                    value: item.sku_id || '',
                    label: item?.name || '',
                    alias: item.repeated_field?.alias.toString(),
                    children: [],
                    isLeaf: true,
                  }
                }).reverse()
              } else {
                v.children = noSku
              }
            }
          })
        }
        return i
      })
      store.updateCategory(Cate2IdAddSkusToTree)
    }
  }

  return (
    <Cascader
      options={list}
      showArrow
      changeOnSelect
      className='tw-ml-2'
      expandTrigger='hover'
      placement='bottomLeft'
      placeholder='请选择商品'
      // @ts-ignore
      onChange={onInnerChange}
      value={innerValue}
      displayRender={(label: string[]) => {
        return label[label.length - 1]
      }}
      showSearch={{ filter }}
      loadData={_.debounce((selectedOptions: DefaultOptionType[]) => {
        if (selectedOptions.length) {
          fetchMerchandises(selectedOptions)
        }
      }, 600)}
      onSearch={_.debounce((value) => fetchMerchandises([], value), 1000)} // 防抖
      style={{
        width: 170,
      }}
    />
  )
}

export default observer(SkuSelectByCategory)
