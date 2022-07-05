import { t } from 'gm-i18n'
import React, {
  forwardRef,
  ChangeEvent,
  useImperativeHandle,
  useEffect,
} from 'react'
import { observer, Observer } from 'mobx-react'
import { FormPanel, Input } from '@gm-pc/react'
import { Form, Row, Col } from 'antd'
import { DataAddress } from '@gm-pc/business'
import { LocationMap, LocationData } from '@gm-common/map'
import globalStore from '@/stores/global'
import { BaseInfoProps } from '../../interface'
import store from '../store'

const formItemLayout = {
  labelCol: {
    xs: { span: 20 },
    sm: { span: 3 },
  },
  wrapperCol: {
    xs: { span: 20 },
    sm: { span: 3 },
  },
}

interface FromProps {
  validateFrom: () => any
}

const BaseInfo = observer(
  forwardRef<FromProps, BaseInfoProps>((props, ref) => {
    const [fromRef] = Form.useForm()
    const {
      schoolCustomer: {
        attrs: {
          // @ts-ignore
          addresses: [
            {
              address,
              city_id,
              district_id,
              street_id,
              geotag: { latitude, longitude },
            },
          ],
        },
        settlement,
      },
      mp_address,
      setSchoolCustomer,
      setStoreKey,
    } = store

    const { china_vat_invoice } = settlement!

    useEffect(() => {
      fromRef.setFieldsValue({
        company_name:
          store?.schoolCustomer?.settlement?.china_vat_invoice?.company_name!,
        financial_contact_name:
          store?.schoolCustomer?.settlement?.china_vat_invoice
            ?.financial_contact_name!,
        financial_contact_phone:
          store?.schoolCustomer?.settlement?.china_vat_invoice
            ?.financial_contact_phone!,
        city_ids: store.schoolCustomer.attrs?.addresses?.[0].city_id,
        address: store.schoolCustomer.attrs?.addresses?.[0].address,
        mp_address: store.mp_address,
      })
    }, [store.schoolCustomer, store.mp_address])
    const setLocation = (location: LocationData) => {
      setSchoolCustomer(
        'attrs.addresses[0].geotag.latitude',
        String(location.latitude),
      )
      setSchoolCustomer(
        'attrs.addresses[0].geotag.longitude',
        String(location.longitude),
      )
      setSchoolCustomer('attrs.addresses[0].address', location.address!)
      setStoreKey('mp_address', location.address!)
      fromRef.setFieldsValue({
        mp_address: location.address!,
        address: location.address!,
      })
      fromRef.validateFields(['mp_address'])
    }

    const validateFrom = () => {
      // 校验问题！
      return new Promise((resolve) => {
        fromRef
          .validateFields()
          .then(() => {
            resolve(true)
          })
          .catch(() => {
            resolve(false)
          })
      })
    }

    useImperativeHandle(ref, () => ({
      // 执行校验
      validateFrom,
    }))

    const city_ids = globalStore.stationInfo.attrs?.available_city_ids
    return (
      <FormPanel title={t('基础信息')}>
        <Form form={fromRef} {...formItemLayout}>
          <Form.Item
            label={t('学校名称')}
            name='company_name'
            rules={[{ required: true, message: t('请填写学校名称') }]}
          >
            <Observer>
              {() => {
                return (
                  <Input
                    className='from-input'
                    value={china_vat_invoice?.company_name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setSchoolCustomer(
                        'settlement.china_vat_invoice.company_name',
                        e.target.value,
                      )
                      setSchoolCustomer('name', e.target.value)
                      fromRef.setFieldsValue({ company_name: e.target.value })
                      fromRef.validateFields(['company_name'])
                    }}
                    type='text'
                    maxLength={30}
                  />
                )
              }}
            </Observer>
          </Form.Item>
          <Row>
            <Col span={12}>
              <Form.Item
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                dependencies={['financial_contact_name']}
                name='financial_contact_name'
                rules={[{ required: true, message: t('请填写联系人') }]}
                label={t('联系人')}
              >
                <Observer>
                  {() => {
                    return (
                      <Input
                        className='from-input'
                        value={china_vat_invoice?.financial_contact_name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setSchoolCustomer(
                            'settlement.china_vat_invoice.financial_contact_name',
                            e.target.value,
                          )
                          fromRef.setFieldsValue({
                            financial_contact_name: e.target.value,
                          })
                          fromRef.validateFields(['financial_contact_name'])
                        }}
                        type='text'
                        maxLength={30}
                      />
                    )
                  }}
                </Observer>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                rules={[{ required: true, message: t('请填写联系人电话') }]}
                label={t('联系人电话')}
                name='financial_contact_phone'
              >
                <Observer>
                  {() => {
                    return (
                      <Input
                        className='from-input'
                        value={china_vat_invoice?.financial_contact_phone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setSchoolCustomer(
                            'settlement.china_vat_invoice.financial_contact_phone',
                            e.target.value,
                          )
                          fromRef.setFieldsValue({
                            financial_contact_phone: e.target.value,
                          })
                          fromRef.validateFields(['financial_contact_phone'])
                        }}
                        maxLength={11}
                        type='text'
                      />
                    )
                  }}
                </Observer>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            required
            label={t('地理标签')}
            name='city_ids'
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('city_ids')) {
                    return Promise.resolve()
                  } else {
                    return Promise.reject(new Error(t('请填写地理标签')))
                  }
                },
              }),
            ]}
          >
            {city_ids && (
              <div className='form-input'>
                <DataAddress
                  city_ids={city_ids}
                  selected={
                    city_ids.includes(city_id)
                      ? {
                          city_id,
                          district_id,
                          street_id: street_id === '0' ? '' : street_id,
                        }
                      : {}
                  }
                  onlySelectLeaf
                  onSelect={(selected) => {
                    setSchoolCustomer(
                      'attrs.addresses[0].city_id',
                      selected?.city_id!,
                    )
                    setSchoolCustomer(
                      'attrs.addresses[0].district_id',
                      selected?.district_id!,
                    )
                    setSchoolCustomer(
                      'attrs.addresses[0].street_id',
                      selected?.street_id!,
                    )
                    fromRef.setFieldsValue({
                      city_ids: selected?.city_id,
                    })
                    fromRef.validateFields(['city_ids'])
                  }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item
            label={t('学校地址')}
            name='address'
            required
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('address')) {
                    return Promise.resolve()
                  } else {
                    return Promise.reject(new Error(t('请填写学校地址')))
                  }
                },
              }),
            ]}
          >
            <Observer>
              {() => {
                return (
                  <Input
                    style={{ width: '75vw' }}
                    className='from-input'
                    value={address}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setSchoolCustomer(
                        'attrs.addresses[0].address',
                        e.target.value,
                      )
                      fromRef.setFieldsValue({
                        address: e.target.value,
                      })
                      fromRef.validateFields(['address'])
                    }}
                    type='text'
                  />
                )
              }}
            </Observer>
          </Form.Item>
          <Form.Item
            label={t('地理位置')}
            required
            name='mp_address'
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('mp_address')) {
                    return Promise.resolve()
                  } else {
                    return Promise.reject(new Error(t('请填写地理位置!')))
                  }
                },
              }),
            ]}
          >
            <div style={{ width: '75vw', height: '45vh', fontSize: '12px' }}>
              <LocationMap
                defaultLocation={{
                  latitude,
                  longitude,
                  address: mp_address,
                }}
                onLocation={setLocation}
              />
            </div>
          </Form.Item>
        </Form>
      </FormPanel>
    )
  }),
)

export default BaseInfo
