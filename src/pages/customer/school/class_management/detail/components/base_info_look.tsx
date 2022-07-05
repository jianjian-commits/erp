import { t } from 'gm-i18n'
import React, { forwardRef, ChangeEvent } from 'react'
import { observer } from 'mobx-react'
import {
  FormPanel,
  Form,
  FormItem,
  Input,
  FormBlock,
  Validator,
  Flex,
} from '@gm-pc/react'
import { DataAddress } from '@gm-pc/business'
import { LocationMap, LocationData } from '@gm-common/map'
import globalStore from '@/stores/global'
import { BaseInfoProps } from '../../interface'
import { Button } from 'antd'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import store from '../store'

const BaseInfoLook = observer(
  forwardRef<Form, BaseInfoProps>(({ is_look }, ref) => {
    const location = useGMLocation<{ customer_id: string }>()
    const {
      schoolCustomer: {
        attrs: {
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
    }

    const city_ids = globalStore.stationInfo.attrs?.available_city_ids

    const handleDetail = () => {
      history.push(
        `/customer/school/class_management/detail?customer_id=${location.query.customer_id}`,
      )
    }
    return (
      <FormPanel title={t('基础信息')}>
        <Form ref={ref} colWidth='400px' labelWidth='150px'>
          <FormBlock col={1}>
            <FormItem
              required
              label={t('学校名称')}
              validate={Validator.create([], china_vat_invoice?.company_name)}
            >
              <Flex className='gm-margin-top-5'>
                <span>{china_vat_invoice?.company_name}</span>
              </Flex>
            </FormItem>
          </FormBlock>

          <FormBlock col={2}>
            <FormItem
              required
              label={t('联系人')}
              validate={Validator.create(
                [],
                china_vat_invoice?.financial_contact_name,
              )}
            >
              <Flex className='gm-margin-top-5'>
                <span>{china_vat_invoice?.financial_contact_name}</span>
              </Flex>
            </FormItem>

            <FormItem
              required
              label={t('联系人电话')}
              validate={Validator.create(
                [],
                china_vat_invoice?.financial_contact_phone,
              )}
            >
              <Flex className='gm-margin-top-5'>
                <span>{china_vat_invoice?.financial_contact_phone}</span>
              </Flex>
            </FormItem>
          </FormBlock>
          <FormBlock col={1}>
            <FormItem
              required
              label={t('地理标签')}
              validate={Validator.create([], city_id!)}
            >
              {city_ids && (
                <DataAddress
                  disabled
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
                  }}
                />
              )}
            </FormItem>
          </FormBlock>
          <FormBlock col={1}>
            <FormItem
              required
              label={t('学校地址')}
              validate={Validator.create([], address!)}
            >
              <Flex className='gm-margin-top-5'>
                <span>{address}</span>
              </Flex>
            </FormItem>
          </FormBlock>
          <FormBlock col={1}>
            {/* <div style={{ width: '75vw', height: '45vh' }}> */}
            <FormItem
              required
              label={t('地理地址')}
              validate={Validator.create([], address!)}
            >
              <div style={{ width: '75vw', height: '45vh' }}>
                <LocationMap
                  disabled
                  defaultLocation={{
                    latitude,
                    longitude,
                    address: mp_address,
                  }}
                  onLocation={setLocation}
                />
              </div>
            </FormItem>
            {/* </div> */}
          </FormBlock>
        </Form>
        {is_look && (
          <Button
            onClick={handleDetail}
            className='base-info-btn'
            type='primary'
          >
            {t('编辑')}
          </Button>
        )}
      </FormPanel>
    )
  }),
)

export default BaseInfoLook
