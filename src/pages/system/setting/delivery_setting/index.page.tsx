/*
 * @Description: 配送设置
 */
import React, { useRef, useEffect } from 'react'
import {
  FormPanel,
  Form,
  FormItem,
  FormGroup,
  Tip,
  Flex,
  Switch,
} from '@gm-pc/react'
import globalStore from '@/stores/global'
import { observer } from 'mobx-react'

import RegionSelect from './components/region_select'
import store from './store'
import AddSubButton from './components/add_sub_button'

import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'

const DeliverySetting = observer(() => {
  const { delivery_settings } = store
  const formRef = useRef<Form>(null)

  const handelSubmit = () => {
    const city_ids = store.collectCityIds()
    if (city_ids.length === 0) {
      Tip.danger('请填写至少一个可配送城市')
      return
    }
    store
      .submitForm(globalStore.userInfo.station_id!, city_ids)
      .then(() => Tip.success('编辑成功'))
  }

  useEffect(() => {
    const group_id = globalStore.userInfo.group_id!
    const station_id = globalStore.userInfo.station_id!
    store.init()
    Promise.all([
      store
        .getCountryId(group_id)
        .then((country_id: string) => store.getProvinceList(country_id)),
      store.getCityIds(station_id).then((city_ids: string[]) => {
        if (city_ids.length === 0) {
          return []
        }
        return store.getCityListByCityId(city_ids)
      }),
    ]).then((value) => {
      const [provinces, cities] = value
      return store.sortRegionSelectData(provinces, cities)
    })
  }, [])

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_DELIVERY_UPDATE_DELIVER_SETTINGS,
        )
      }
      formRefs={[formRef]}
      onSubmit={handelSubmit}
    >
      <Form ref={formRef} labelWidth='166px' colWidth='800px' hasButtonInGroup>
        <FormPanel title='配送范围设置'>
          <FormItem label='可配送城市' required>
            {store.regionSelectData.map((data, index) => {
              return (
                <Flex alignCenter justifyStart key={index} className='tw-mb-2'>
                  <RegionSelect
                    provinceData={data.provinceData}
                    provinceValue={data.provinceValue}
                    cityValue={data.cityValue}
                    onProvinceChange={(value: string) => {
                      store.updateRegionSelectData(
                        index,
                        'provinceValue',
                        value,
                      )
                    }}
                    onCityChange={(value: string) => {
                      store.updateRegionSelectData(index, 'cityValue', value)
                    }}
                  />
                  <AddSubButton
                    onAddRow={() => store.addRegionSelectData(index)}
                    onDeleteRow={() => store.delRegionSelectData(index)}
                  />
                </Flex>
              )
            })}
          </FormItem>
        </FormPanel>
        <FormPanel title={t('配送设置')}>
          <Form ref={formRef} labelWidth='166px' hasButtonInGroup disabledCol>
            <FormItem label={t('强制司机拍照签收')}>
              <Switch
                checked={delivery_settings?.is_driver_signing_image}
                onChange={store.toggle}
                on={t('开启')}
                off={t('关闭')}
                style={{ width: '70px' }}
                className='gm-margin-top-5'
              />
              <div className='gm-text-desc gm-margin-top-5'>
                {t('开启后，司机修改订单为已签收时，都必须进行拍照上传')}
              </div>
            </FormItem>
            <FormItem label={t('电子签名')}>
              <Switch
                checked={delivery_settings?.need_write_signature}
                onChange={store.toggleSign}
                on={t('开启')}
                off={t('关闭')}
                style={{ width: '70px' }}
                className='gm-margin-top-5'
              />
              <div className='gm-text-desc gm-margin-top-5'>
                {t('开启后，司机修改订单为已签收时，都必须进行电子签名')}
              </div>
            </FormItem>
            { delivery_settings?.need_write_signature && <FormItem label={t('追加电子签名')}>
              <Switch
                checked={!delivery_settings?.forbid_update_signature}
                onChange={store.toggleUpdateSign}
                on={t('开启')}
                off={t('关闭')}
                style={{ width: '70px' }}
                className='gm-margin-top-5'
              />
              <div className='gm-text-desc gm-margin-top-5'>
                {t('开启后，司机端可对订单的签名信息进行追加签名')}
              </div>
            </FormItem> }
          </Form>
        </FormPanel>
      </Form>
    </FormGroup>
  )
})

export default DeliverySetting
