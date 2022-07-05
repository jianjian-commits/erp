import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { Card, Row, Col, Tag, Table, Spin, Button } from 'antd'
import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import '../../style.less'
import store from '@/pages/merchandise/manage/combine/detail/store'
import globalStore from '@/stores/global'
import { history } from '@/common/service'
import { Ingredient } from 'gm_api/src/merchandise'
import { getSkuUnitList } from '@/pages/merchandise/manage/combine/util'
import { useGMLocation } from '@gm-common/router'
import productDefaultImg from '@/img/product-default-gm.png'
import _ from 'lodash'
import DetailsImage from '@/pages/merchandise/manage/components/detail_image/index'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'

const MerchandiseInfo = observer(() => {
  const location = useGMLocation<{ sku_id: string }>()
  const { sku_id } = location.query
  const { sku, image, ingredientMap, introLoading, setSkuId, getSku } = store

  useEffect(() => {
    setSkuId(sku_id)
    getSku(sku_id)
  }, [])

  /** 子商品详情 */
  const toSkuDetail = (id: string) => {
    history.push(`/merchandise/manage/merchandise_list/detail?sku_id=${id}`)
  }

  /** 编辑 */
  const toUpdate = () => {
    history.push(`/merchandise/manage/combine/create?sku_id=${sku_id}`)
  }

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Ingredient) => {
        const { sku_id } = record
        const sku = ingredientMap[sku_id!]
        return <a onClick={() => toSkuDetail(sku_id!)}>{t(sku.name || '-')}</a>
      },
    },
    {
      title: '数量',
      dataIndex: 'ratio',
      key: 'ratio',
      render: (text: string, record: Ingredient) => {
        const { sku_id, ratio, order_unit_id } = record
        const sku = ingredientMap[sku_id!]
        const unitList = getSkuUnitList(sku)
        const unitObj = _.find(unitList, (unitItem) => {
          return unitItem.unit_id === order_unit_id
        })
        let count = '-'
        if (ratio && unitObj?.text) {
          count = `${ratio}${unitObj.name}`
        }
        return t(count)
      },
    },
  ]

  return (
    <div className='gm-table-height'>
      {introLoading ? (
        <div className='merchandise-form merchandise-loading'>
          <Spin size='large' tip={t('加载中...')} />
        </div>
      ) : (
        <>
          <Card
            title={
              <span className='tw-font-bold tw-text-sm'>{t('商品介绍')}</span>
            }
            bordered={false}
            extra={
              <PermissionJudge
                permission={Permission.PERMISSION_PRODUCTION_UPDATE_COMBINE_SSU}
              >
                <Button type='primary' onClick={() => toUpdate()}>
                  {t('编辑')}
                </Button>
              </PermissionJudge>
            }
          >
            <Row style={{ minHeight: 300 }}>
              <div className='basic-image'>
                {image.length ? (
                  <DetailsImage width={50} image={image} />
                ) : (
                  <img
                    style={{ width: '150px', height: '150px' }}
                    src={productDefaultImg}
                  />
                )}
              </div>

              <Col offset={5} span={17}>
                <Row className='tw-mt-2'>
                  <Flex wrap className='tw-w-full'>
                    <Col span={12} className='tw-h-10 tw-leading-10'>
                      <Flex alignStart className='tw-w-full'>
                        <span className='tw-w-1/3 tw-inline-block tw-text-right'>
                          {t(`组合商品名称:`)}
                        </span>
                        <span className='tw-ml-2 tw-w-2/3 tw-inline-block tw-break-words'>
                          {t(sku.name || '-')}
                        </span>
                      </Flex>
                    </Col>
                    <Col span={12} className='tw-h-10 tw-leading-10'>
                      <Flex alignStart className='tw-w-full'>
                        <span className='tw-w-1/3 tw-inline-block tw-text-right'>
                          {t(`组合商品编码:`)}
                        </span>
                        <span className='tw-ml-2 tw-w-2/3 tw-inline-block tw-break-words'>
                          {t(sku.customize_code || '-')}
                        </span>
                      </Flex>
                    </Col>
                    <Col span={12} className='tw-h-10 tw-leading-10 tw-mt-2'>
                      <Flex alignStart className='tw-w-full'>
                        <span className='tw-w-1/3 tw-inline-block tw-text-right'>
                          {t(`下单单位:`)}
                        </span>
                        <span className='tw-ml-2 tw-w-2/3 tw-inline-block tw-break-words'>
                          {t(globalStore.getUnitName(sku.base_unit_id) || '-')}
                        </span>
                      </Flex>
                    </Col>
                    <Col span={12} className='tw-h-10 tw-leading-10 tw-mt-2'>
                      <Flex alignStart className='tw-w-full'>
                        <span className=' tw-w-1/3 tw-inline-block tw-text-right'>
                          {t(`销售状态:`)}
                        </span>
                        <span className='tw-w-2/3 tw-inline-block tw-break-words'>
                          {sku.on_sale ? (
                            <Tag
                              color='#87d068'
                              className='tw-w-9 tw-text-center'
                            >
                              {t('在售')}
                            </Tag>
                          ) : (
                            <Tag
                              color='#eee'
                              className='tw-w-9 tw-text-center'
                              style={{ color: '#626262' }}
                            >
                              {t('停售')}
                            </Tag>
                          )}
                        </span>
                      </Flex>
                    </Col>
                    <Col span={12} className='tw-h-10 tw-leading-10 tw-mt-1'>
                      <Flex alignStart className='tw-w-full'>
                        <span className='tw-align-middle tw-w-1/3 tw-inline-block tw-text-right'>
                          {t(`商品描述:`)}
                        </span>
                        <span className='tw-ml-2 tw-w-2/3 tw-inline-block tw-break-words'>
                          {t(sku.desc || '-')}
                        </span>
                      </Flex>
                    </Col>
                  </Flex>
                </Row>
              </Col>
            </Row>
          </Card>
          <Card
            title={
              <span className='tw-font-bold tw-text-sm'>{t('组成商品')}</span>
            }
            bordered={false}
          >
            <Row>
              <Col offset={5} span={3} className='tw-text-right tw-mt-2 '>
                <span>{t('组合明细：')}</span>
              </Col>
              <Col span={16}>
                <Table
                  className='table-nomoral-border'
                  pagination={false}
                  columns={columns}
                  key='sku_id'
                  rowKey='sku_id'
                  dataSource={sku.ingredients?.ingredients || []}
                />
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  )
})
export default MerchandiseInfo
