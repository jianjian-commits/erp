import React, { FC, useState, useEffect, Key } from 'react'
import { observer } from 'mobx-react'
import { Form, Button } from 'antd'
import { t } from 'gm-i18n'
import { gmHistory as history } from '@gm-common/router'
import CategoryFilterFrame from '@/pages/merchandise/components/category_filter_frame'
import { FormItemInterface } from '@/pages/merchandise/manage/merchandise_list/create/type'
import FormItem from '@/pages/merchandise/manage/merchandise_list/components/form_item'
import MerchandiseTable from './list/component/merchandise_table'
import store, { initFilter } from './list/store'
import {
  ExportSkuV2,
  ExportSkuV2Request,
  list_Sku_NotPackageSubSkuType,
  Sku_NotPackageSubSkuType,
} from 'gm_api/src/merchandise'
import './style.less'
import globalStore from '@/stores/global'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

const MerchandiseList: FC = observer(() => {
  const {
    filter,
    setFilter,
    clearStore,
    categoryMap,
    categoryTreeData,
    dataloading,
    listSkuReqFilter,
  } = store

  /** 筛选Form */
  const [filterForm] = Form.useForm()
  /** 搜索框取值 */
  const [searchText, setSearchText] = useState<string>('')

  useEffect(() => {
    return () => {
      clearStore()
    }
  }, [])

  /** 搜索数据改变 */
  const filterValueChange = (changedValues: any, allValues: any) => {
    if (changedValues.q || changedValues.q === '') {
      setSearchText(changedValues.q)
      return
    }

    setFilter({ ...filter, ...allValues })
  }
  /** 类型树改变 */
  const onTreeDataChange = (value: Key[]) => {
    const newData = {
      ...filter,
      category_ids: value,
    }
    setFilter(newData)
    filterForm.setFieldsValue(newData)
  }
  /** 重置筛选数据 */
  const clearFilter = () => {
    if (dataloading) return
    filterForm.setFieldsValue(initFilter)
    setSearchText('')
    setFilter()
  }
  /** 导入 */
  const handleImport = () => {
    history.push('/merchandise/manage/merchandise_list/import')
  }

  /** 导出 */
  const handleExport = () => {
    const params: ExportSkuV2Request = {
      list_sku_v2_request: { ...listSkuReqFilter, paging: { limit: 1000 } },
    }

    if (globalStore.isLite) {
      params.need_fields = [
        'CustomizeCode', // 商品编码，必须放在首位
        'Name', // 商品名称
        'Alias', // 商品别名
        'CategoryName', // 商品分类
        'BaseUnitName', // 基本单位
        'StandardPrice', // 标准售价（轻巧版）
        'Cost', // 成本价（轻巧版）
        'OnSale', // 销售状态
        'SupplierId', // 默认供应商
      ]
    }
    ExportSkuV2(params).then((res) => {
      globalStore.showTaskPanel()
    })
  }

  /** 新建商品 */
  const addMerchandise = () => {
    history.push('/merchandise/manage/merchandise_list/create')
  }

  /** 输入框搜索按钮 */
  const onSearch = () => {
    if (dataloading) return
    setFilter({
      ...filter,
      q: searchText,
    })
  }

  /** 筛选部分配置 */
  const filterConfig: FormItemInterface<any>[] = [
    {
      name: 'on_sale',
      id: 'on_sale',
      type: 'select',
      select: {
        options: [
          {
            text: t('全部状态'),
            value: 0,
          },
          {
            text: t('在售'),
            value: 1,
          },
          {
            text: t('停售'),
            value: 2,
          },
        ],
      },
      selectLabelName: 'text',
      selectValueName: 'value',
    },
    {
      name: 'not_package_sub_sku_type',
      id: 'not_package_sub_sku_type',
      type: 'select',
      select: {
        options: [
          {
            text: '全部类型',
            value: Sku_NotPackageSubSkuType.SNPST_UNSPECIFIED,
          },
          ...list_Sku_NotPackageSubSkuType,
        ],
      },
      hide: globalStore.isLite,
      selectLabelName: 'text',
      selectValueName: 'value',
    },
    {
      name: 'q',
      id: 'q',
      type: 'inputSearch',
      inputSearch: {
        placeholder: '请输入商品名称/别名/编码',
        enterButton: '搜索',
        onSearch: onSearch,
      },
    },
  ].filter((f) => !f.hide)

  return (
    <CategoryFilterFrame
      filterItem={
        <>
          {filterConfig.map((item) => {
            if (item.select) {
              item.select.style = { minWidth: 167 }
            }
            return <FormItem noStyle key={item.id} {...item} />
          })}
          <div onClick={clearFilter} className='clear-button'>
            {t('清空')}
          </div>
        </>
      }
      extraRight={
        <>
          <Button onClick={handleImport}>{t('导入')}</Button>
          <Button onClick={handleExport}>{t('导出')}</Button>
          <PermissionJudge
            permission={
              Permission.PERMISSION_MERCHANDISE_CREATE_NOT_PACKAGE_SKU_SSU
            }
          >
            <Button type='primary' onClick={addMerchandise}>
              {t('新建')}
            </Button>
          </PermissionJudge>
        </>
      }
      table={<MerchandiseTable categoryTreeData={categoryTreeData} />}
      formProps={{
        onValuesChange: filterValueChange,
        form: filterForm,
        initialValues: initFilter,
      }}
      onTreeValueChange={onTreeDataChange}
      categoryTreeData={categoryTreeData}
      categoryMap={categoryMap}
    />
  )
})

export default MerchandiseList
