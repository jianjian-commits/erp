import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Button, Card, Form, Row, Col, Tag } from 'antd'
import store from '../store'
import { t } from 'gm-i18n'
import DetailsImage from '@/pages/merchandise/manage/components/detail_image/index'
import productDefaultImg from '@/img/product-default-gm.png'
import { useGMLocation } from '@gm-common/router'
import './../style.less'
import globalStore from '@/stores/global'
import { history } from '@/common/service'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

interface MerchandiseIntroProps {
  sku_id: string
}

interface FormConfigItem {
  label: string
  name: string
  /** 轻巧版用，轻巧版下只有visible为True 的字段才显示 */
  visible?: boolean
  /** 只有轻巧版才展示的字段 */
  onlyLiteVisible?: boolean
}

const MerchandiseIntro: FC<MerchandiseIntroProps> = observer(() => {
  const location = useGMLocation<{ sku_id: string }>()
  const { sku_id } = location.query
  const { sku, getMerchandiseInfo } = store

  useEffect(() => {
    getMerchandiseInfo(sku_id)
  }, [])
  const merchandiseBlockList = [
    {
      title: '基本信息',
      id: '#basic_id',
      child: 'basic',
    },
    {
      title: '供应链信息',
      id: '#supply_id',
      child: 'supply',
    },
    {
      title: '包材信息',
      id: '#packaging_id',
      child: 'packaging',
      hide: globalStore.isLite,
    },
    {
      title: '财务信息',
      id: '#finance_id',
      child: 'finance',
      hide: globalStore.isLite,
    },
  ].filter((f) => !f.hide)

  const hideItemList: string[] = [
    'second_base_unit',
    'custom_unit_1',
    'custom_unit_2',
    'custom_unit_3',
  ]

  const merchandiseFormConfig: { [key: string]: FormConfigItem[] } = {
    // 基本信息
    basic: [
      {
        label: '商品名称',
        name: 'name',
        visible: globalStore.isLite,
      },
      {
        label: '商品编码',
        name: 'customize_code',
        visible: globalStore.isLite,
      },
      {
        label: '条形码',
        name: 'bar_code',
        visible: !globalStore.isLite,
      },
      {
        label: '商品别名',
        name: 'alias',
        visible: globalStore.isLite,
      },
      {
        label: '商品分类',
        name: 'categories',
        visible: globalStore.isLite,
      },
      {
        label: '商品类型',
        name: 'not_package_sub_sku_type',
      },
      {
        label: '分拣类型',
        name: 'sorting_type',
      },
      {
        label: '基本单位',
        name: 'base_unit',
        visible: globalStore.isLite,
      },
      {
        label: '标准售价',
        name: 'basic_price',
        // 只有轻巧版才展示
        onlyLiteVisible: true,
      },
      {
        label: '成本价',
        name: 'cost',
        // 只有轻巧版才展示
        onlyLiteVisible: true,
      },
      {
        label: '辅助单位',
        name: 'second_base_unit',
      },
      {
        label: '自定义单位1',
        name: 'custom_unit_1',
      },
      {
        label: '自定义单位2',
        name: 'custom_unit_2',
      },
      {
        label: '自定义单位3',
        name: 'custom_unit_3',
      },
      // 没找到对应字段
      {
        label: '库存单位',
        name: 'inventory_unit',
      },
      {
        label: '生产单位',
        name: 'product_unit',
      },
      {
        label: '采购单位',
        name: 'purchase_unit',
      },
      {
        label: '商品图片',
        name: 'merchandise_pic',
        visible: globalStore.isLite,
      },
      {
        label: '销售状态',
        name: 'on_sale',
        visible: globalStore.isLite,
      },
      {
        label: '商品描述',
        name: 'desc',
        visible: globalStore.isLite,
      },
    ],

    // 供应链信息
    supply: [
      // {
      //   label: '销售库存',
      //   name: 'sale_stocks',
      // },
      // TODO：提示换行，没找到对应字段
      {
        label: '库存采购',
        name: 'merchandise_inventory_procurement',
      },
      // 没有对应字段
      {
        label: '供应商协作',
        name: 'supplier_cooperate_model_type',
      },
      {
        label: '默认供应商',
        name: 'supplier_id',

        visible: globalStore.isLite,
      },
      {
        label: '默认采购员',
        name: 'purchaser_id',
      },
      {
        label: '默认货位',
        name: 'shelf_id',
      },
      {
        label: '损耗比例',
        name: 'loss_ratio',
      },
      {
        label: '保质期',
        name: 'expiry_date',
      },
    ],

    // 包材信息
    packaging: [
      {
        label: '包装材料',
        name: 'package_sku_id',
      },
      {
        label: '换算方式',
        name: 'package_calculate_type',
      },
      {
        label: '数量',
        name: 'package_num',
      },
    ],

    // 财务信息
    finance: [
      {
        label: '商品税收分类',
        name: 'finance_category',
      },
      {
        label: '销项税率',
        name: 'tax',
      },
      {
        label: '进项税率',
        name: 'input_tax',
      },
    ],
  }

  const editMerchandise = () => {
    history.push(`/merchandise/manage/merchandise_list/create?sku_id=${sku_id}`)
  }

  return (
    <>
      {_.map(merchandiseBlockList, (blockItem) => {
        const { id, title, child } = blockItem
        return (
          <Card
            title={<span style={{ fontSize: '14px' }}>{title}</span>}
            bordered={false}
            key={id}
            extra={
              child === 'basic' && (
                <PermissionJudge
                  permission={
                    Permission.PERMISSION_MERCHANDISE_UPDATE_NOT_PACKAGE_SKU_SSU
                  }
                >
                  <Button type='primary' onClick={editMerchandise}>
                    {t('编辑')}
                  </Button>
                </PermissionJudge>
              )
            }
          >
            <Row style={{ maxWidth: 1350 }}>
              {child === 'basic' && (
                <div className='basic-image'>
                  {sku.image && sku.image.length ? (
                    <DetailsImage width={50} image={sku.image} />
                  ) : (
                    <img
                      style={{
                        width: '196px',
                        height: '183px',
                        marginLeft: '16px',
                      }}
                      src={productDefaultImg}
                    />
                  )}
                </div>
              )}
              <Col offset={5} span={17}>
                <Row>
                  {_.map(
                    merchandiseFormConfig[child].filter((f) =>
                      // 轻巧版的字段显示隐藏，轻巧版下只有visible的字段显示
                      globalStore.isLite
                        ? f.visible || f.onlyLiteVisible
                        : !f.onlyLiteVisible,
                    ),
                    (formItem) => {
                      const { name, label } = formItem
                      if (name !== 'merchandise_pic') {
                        return (
                          (!hideItemList.includes(name!) || sku[name!]) && (
                            <Col span={name === 'desc' ? 24 : 12} key={name}>
                              <Form.Item
                                label={label}
                                labelAlign='right'
                                labelCol={{ span: name === 'desc' ? 4 : 8 }}
                                wrapperCol={{
                                  span: name === 'desc' ? 20 : 16,
                                }}
                              >
                                {name === 'on_sale' ? (
                                  <Tag
                                    color={sku[name] ? '#87d068' : '#ccc'}
                                    style={{
                                      display: 'inline-block',
                                      margin: '0 0 6px 6px',
                                    }}
                                  >
                                    {sku[name] ? t('在售') : t('停售')}
                                  </Tag>
                                ) : (
                                  sku[name] || '-'
                                )}
                              </Form.Item>
                            </Col>
                          )
                        )
                      }
                    },
                  )}
                </Row>
              </Col>
            </Row>
          </Card>
        )
      })}
    </>
  )
})

export default MerchandiseIntro
