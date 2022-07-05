/**
 * @description 新建商品-包材信息
 */
import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Col } from 'antd'
import { valueType } from 'antd/lib/statistic/utils'
import _ from 'lodash'
import { ListSkuV2, Sku_SkuType } from 'gm_api/src/merchandise'
import { FormItemInterface } from '@/pages/merchandise/manage/merchandise_list/create/type'
import FormItem from '@/pages/merchandise/manage/merchandise_list/components/form_item'
import store from '@/pages/merchandise/manage/merchandise_list/create/store'
import CalculateType from '@/pages/merchandise/manage/merchandise_list/create/bom_info/calculate_type'

interface BomInfoProps {
  setValues: (values: any) => void
}

const BomInfo: FC<BomInfoProps> = observer((props) => {
  const { formValue } = store
  const { setValues } = props

  const [packageList, setPackageList] = useState<any[]>([])

  useEffect(() => {
    // 避免调用两次
    const timeout = setTimeout(() => {
      getPackageList()
    }, 300)
    return () => clearTimeout(timeout)
  }, [])

  const getPackageList = () => {
    ListSkuV2({
      filter_params: { sku_type: Sku_SkuType.PACKAGE },
      paging: { limit: 999 },
    }).then((json) => {
      const { skus } = json.response
      if (skus) {
        const purchaserIndex = _.findIndex(
          skus,
          (item) => formValue.package_sku_id === item.sku_id,
        )
        if (purchaserIndex < 0) {
          setValues({
            ...formValue,
            package_sku_id: undefined,
          })
        }

        setPackageList(skus)
      }
    })
  }

  const bomInfoForm: FormItemInterface<valueType>[] = [
    {
      label: '包装材料',
      name: 'package_sku_id',
      id: 'package_sku_id',
      type: 'select',
      select: {
        placeholder: '请选择包装材料',
        options: packageList,
        showSearch: true,
        allowClear: true,
      },
      selectLabelName: 'name',
      selectValueName: 'sku_id',
    },
    {
      label: '换算方式',
      name: 'package_calculate_type',
      id: 'package_calculate_type',
      type: 'customer',
      customer: <CalculateType />,
    },
  ]
  return (
    <>
      {_.map(bomInfoForm, (formItem) => {
        const { id } = formItem
        return (
          <Col key={id} xs={24} sm={24} md={16} lg={12} xl={12}>
            <FormItem {...formItem} />
          </Col>
        )
      })}
    </>
  )
})

export default BomInfo
