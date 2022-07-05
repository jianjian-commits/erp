import { t } from 'gm-i18n'
import React, { ChangeEvent, forwardRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  FormPanel,
  Form,
  FormItem,
  Input,
  FormBlock,
  Select,
} from '@gm-pc/react'
import _ from 'lodash'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'
import { DataAddress, CodeInput } from '@gm-pc/business'
import { LocationMap, LocationData } from '@gm-common/map'
import { history } from '@/common/service'
import {
  Select_GroupUser,
  Select_CustomerLabel,
  MoreSelect_ServicePeriod,
} from 'gm_api/src/enterprise/pc'
import { MoreSelect_QuotationV2 } from '@/common/components'
import globalStore from '@/stores/global'
import { Quotation_Status, Quotation_Type } from 'gm_api/src/merchandise'
import { SELECT_SCHOOL_TYPE } from '../../type'
import Select_WareHouse_Default from '@/common/components/select_warehouse'
import { message } from 'antd'

interface OperationProps {
  store: any
}
interface CustomerDetailLocationQuery {
  quotation_id: string
  create_group_user_id: string
  sales_group_user_id: string
  service_period_id: string
  customer_label_id: string
  type: string
}

const OperationInfo = observer(
  forwardRef<Form, OperationProps>(({ store }, ref) => {
    const {
      childCustomer: {
        name,
        customized_code,
        create_group_user_id,
        sales_group_user_id,
        school_type,
        attrs: {
          addresses: [
            {
              receiver,
              phone,
              address,
              city_id,
              district_id,
              street_id,
              geotag: { latitude, longitude },
            },
          ],
        },
        warehouse_id,
      },
      mp_address,
      quotation_ids,
      service_period_ids,
      setChildCustomer,
      viewType,
      listServicePeriod,
      quotationList,
      salesManagerList,
      createManagerList,
      setStoreKey,
      customer_label,
      setParentCustomer,
      // setWarehouseList,
      // hasWarehouseAuth,
    } = store
    const location = useGMLocation<CustomerDetailLocationQuery>()
    const { type } = location.query
    useEffect(() => {
      viewType === 'Update' && getInfo()
    }, [quotationList, salesManagerList, createManagerList])
    // 不想写重复逻辑 把信息从url带过来
    const getInfo = () => {
      // 报价单
      const quotation_id = JSON.parse(location.query.quotation_id)
      const quotationSelected = _.find(
        quotationList,
        (item) => item.value === quotation_id,
      )
      setStoreKey('quotation_ids', quotationSelected ? [quotationSelected] : [])
      // 运营周期
      const service_period_ids = JSON.parse(location.query.service_period_id)
      const servicePeriodSelected: MoreSelectDataItem<string>[] = []
      _.forEach(listServicePeriod, (item) => {
        if (service_period_ids.includes(item.value)) {
          servicePeriodSelected.push(item)
        }
      })
      setStoreKey(
        'service_period_ids',
        servicePeriodSelected.length ? servicePeriodSelected : [],
      )
      // 销售经理
      const create_group_user_id = JSON.parse(
        location.query.create_group_user_id || '',
      )
      const create_group_user_selected = _.find(
        salesManagerList,
        (item) => item.value === create_group_user_id,
      )
      setChildCustomer(
        'create_group_user_id',
        create_group_user_selected?.value,
      )
      // 开户经理
      const sales_group_user_id = JSON.parse(
        location.query.sales_group_user_id || '',
      )
      const sales_group_user_selected = _.find(
        salesManagerList,
        (item) => item.value === sales_group_user_id,
      )
      setChildCustomer('sales_group_user_id', sales_group_user_selected?.value)

      // 客户标签
      const customer_label_id = JSON.parse(
        location.query.customer_label_id || '',
      )
      setStoreKey('customer_label', customer_label_id)
    }

    const setLocation = (location: LocationData) => {
      setChildCustomer(
        'attrs.addresses[0].geotag.latitude',
        String(location.latitude),
      )
      setChildCustomer(
        'attrs.addresses[0].geotag.longitude',
        String(location.longitude),
      )
      setChildCustomer('attrs.addresses[0].address', location.address)
      setStoreKey('mp_address', location.address)
    }

    const _handleToLabel = () => {
      history.push('/customer/label')
    }

    const toQuotationDetail = () => {
      if (quotation_ids[0]?.value) {
        const {
          value,
          original: { type },
        } = quotation_ids[0]
        history.push(
          `/merchandise/price_manage/customer_quotation/detail?quotation_id=${value}&type=${type}`,
        )
        window.scrollTo(0, 0)
      } else {
        message.warning(t('请选择报价单'))
      }
    }

    return (
      <FormPanel title={t('营运信息')}>
        <Form ref={ref} colWidth='400px' labelWidth='150px'>
          <FormBlock col={2}>
            <FormItem required label={t('客户名称')}>
              <Input
                className='form-control'
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setChildCustomer('name', e.target.value.trim())
                }}
                type='text'
                maxLength={30}
              />
            </FormItem>

            <FormItem required label={t('客户编码')}>
              <CodeInput
                name='customize_code'
                maxLength={30}
                value={customized_code}
                needTextChange={type !== 'updateCustomer'}
                text={name}
                onChange={(value: string) => {
                  setChildCustomer('customized_code', value.trim())
                }}
              />
            </FormItem>
            {!globalStore.isLite && (
              <>
                <FormItem label={t('客户标签')}>
                  <>
                    <Select_CustomerLabel
                      all={{ value: '', text: t('未分配标签') }}
                      value={customer_label}
                      onChange={(value: string) =>
                        setStoreKey('customer_label', value)
                      }
                    />
                    <span
                      className='b-customer-label-span'
                      onClick={_handleToLabel}
                    >
                      {t('管理标签')}
                    </span>
                  </>
                </FormItem>
                <FormItem label={t('学校类型')}>
                  <Select
                    value={school_type}
                    data={SELECT_SCHOOL_TYPE}
                    onChange={(value) => setChildCustomer('school_type', value)}
                  />
                </FormItem>
                <FormItem label={t('报价单')}>
                  <>
                    <MoreSelect_QuotationV2
                      selected={
                        quotation_ids[0]
                          ? quotation_ids[0]
                          : {
                              text: t('未选择报价单'),
                              value: undefined,
                            }
                      }
                      // eslint-disable-next-line react/jsx-handler-names
                      onSelect={(select: MoreSelectDataItem<string>[]) => {
                        console.log('select', select)
                        setStoreKey('quotation_ids', select ? [select] : [])
                      }}
                      getName={(item) => item.inner_name!}
                      params={{
                        filter_params: {
                          quotation_status: Quotation_Status.STATUS_VALID,
                          parent_quotation_ids: ['0'],
                          quotation_types: [
                            Quotation_Type.WITHOUT_TIME,
                            Quotation_Type.PERIODIC,
                          ],
                        },
                        // is_active: Filters_Bool.TRUE,
                        statuses: [3],
                        type: Quotation_Type.WITHOUT_TIME,
                      }}
                    />
                    {!_.isEmpty(quotation_ids) && (
                      <span
                        className='b-customer-label-span'
                        onClick={toQuotationDetail}
                      >
                        {t('去管理')}
                      </span>
                    )}
                  </>
                </FormItem>
                <FormItem required label={t('运营时间')}>
                  <MoreSelect_ServicePeriod
                    multiple
                    selected={service_period_ids}
                    onSelect={(select: MoreSelectDataItem<string>[]) =>
                      setStoreKey('service_period_ids', select || [])
                    }
                    getName={(item) => item.name || ''}
                  />
                </FormItem>
                <FormItem label={t('开户经理')}>
                  <Select_GroupUser
                    all={{ value: '0', text: t('未选择') }}
                    value={create_group_user_id}
                    onChange={(value: string) =>
                      setChildCustomer('create_group_user_id', value)
                    }
                  />
                </FormItem>
                <FormItem label={t('销售经理')}>
                  <Select_GroupUser
                    all={{ value: '0', text: t('未选择') }}
                    value={sales_group_user_id}
                    onChange={(value: string) =>
                      setChildCustomer('sales_group_user_id', value)
                    }
                  />
                </FormItem>
              </>
            )}
            <FormItem required={!globalStore.isLite} label={t('收货人')}>
              <Input
                className='form-control'
                value={receiver}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setChildCustomer(
                    'attrs.addresses[0].receiver',
                    e.target.value.trim(),
                  )
                }}
                type='text'
                maxLength={30}
              />
            </FormItem>

            <FormItem required={!globalStore.isLite} label={t('收货人电话')}>
              <Input
                className='form-control'
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setChildCustomer(
                    'attrs.addresses[0].phone',
                    e.target.value.trim(),
                  )
                }}
                type='text'
                maxLength={11}
              />
            </FormItem>
            {!globalStore.isLite && (
              <FormItem required label={t('地理标签')}>
                {globalStore.stationInfo.attrs?.available_city_ids && (
                  <DataAddress
                    city_ids={
                      globalStore.stationInfo.attrs?.available_city_ids!
                    }
                    selected={
                      globalStore.stationInfo.attrs?.available_city_ids.includes(
                        city_id,
                      )
                        ? {
                            city_id,
                            district_id,
                            street_id: street_id === '0' ? '' : street_id,
                          }
                        : {}
                    }
                    onlySelectLeaf
                    onSelect={(selected) => {
                      setChildCustomer(
                        'attrs.addresses[0].city_id',
                        selected?.city_id,
                      )
                      setChildCustomer(
                        'attrs.addresses[0].district_id',
                        selected?.district_id,
                      )
                      setChildCustomer(
                        'attrs.addresses[0].street_id',
                        selected?.street_id,
                      )
                    }}
                  />
                )}
              </FormItem>
            )}
            {globalStore.isOpenMultWarehouse && (
              <FormItem required label={t('发货仓库')}>
                <Select_WareHouse_Default
                  // getListData={setWarehouseList}
                  onChange={(value) => {
                    setChildCustomer('warehouse_id', value)
                    setParentCustomer('warehouse_id', value)
                  }}
                  params={{ all: true }}
                  value={warehouse_id}
                />
              </FormItem>
            )}
          </FormBlock>
          <FormBlock col={1}>
            <FormItem required={!globalStore.isLite} label={t('收货地址')}>
              <Input
                style={{ width: '80vw' }}
                className='form-control'
                value={address}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setChildCustomer('attrs.addresses[0].address', e.target.value)
                }
                type='text'
                maxLength={100}
              />
            </FormItem>
            <FormItem required={!globalStore.isLite} label={t('地理位置')}>
              <div style={{ width: '80vw', height: '45vh' }}>
                <LocationMap
                  defaultLocation={{
                    latitude: latitude || '',
                    longitude: longitude || '',
                    address: mp_address || '',
                  }}
                  onLocation={setLocation}
                />
              </div>
            </FormItem>
          </FormBlock>
        </Form>
      </FormPanel>
    )
  }),
)

export default OperationInfo
