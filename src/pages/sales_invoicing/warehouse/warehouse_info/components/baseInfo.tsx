import React, { ChangeEvent, useEffect, useMemo, forwardRef } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import {
  FormPanel,
  Form,
  FormItem,
  Input,
  FormBlock,
  TextArea,
  Checkbox,
  Switch,
} from '@gm-pc/react'
import { CodeInput } from '@gm-pc/business'
import { t } from 'gm-i18n'
import { LocationMap, LocationData } from '@gm-common/map'

interface AccountProps {
  store: any
}

const BaseInfo = observer(
  forwardRef<Form, AccountProps>(({ store }, ref) => {
    const {
      createParams: {
        name,
        customized_code,
        contact,
        phone,
        remark,
        is_default,
        geotag: { latitude, longitude },
        address,
        warehouse_id,
      },
      isSwitch,
      setSwitch,
      changeCreareParams,
    } = store

    useEffect(() => {
      setSwitch(is_default)
    }, [is_default, setSwitch])

    const setLocation = (location: LocationData) => {
      changeCreareParams('geotag', {
        latitude: `${location.latitude}`,
        longitude: `${location.longitude}`,
        address: `${location.address}`,
      })
      changeCreareParams('address', location.address)
    }

    const handleChange = (
      e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
      type: string,
    ) => {
      changeCreareParams(type, _.trim(e.target.value))
    }

    const isDisabled = useMemo(() => {
      // 必须是已创建且已是默认，则不能选择
      if (warehouse_id && is_default) {
        return true
      } else if (warehouse_id && !is_default) {
        return false
      } else {
        return false
      }
    }, [isSwitch])

    return (
      <FormPanel title={t('基本信息')}>
        <Form ref={ref} colWidth='400px' labelWidth='150px'>
          <FormBlock col={2}>
            <FormItem required label={t('仓库名称')}>
              <Input
                className='form-control'
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleChange(e, 'name')
                }
                type='text'
                placeholder={t('仓库名称限1-15字')}
                maxLength={15}
              />
            </FormItem>
            <FormItem required label={t('仓库编码')}>
              <CodeInput
                name='customized_code'
                className='form-control'
                value={customized_code}
                text={name}
                needTextChange
                onChange={(value: string) => {
                  changeCreareParams('customized_code', value)
                }}
                maxLength={30}
              />
            </FormItem>
          </FormBlock>
          <FormBlock col={3}>
            <FormItem required label={t('联系人')}>
              <Input
                className='form-control'
                value={contact}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleChange(e, 'contact')
                }
                type='text'
                maxLength={30}
              />
            </FormItem>
            <FormItem required label={t('联系方式')}>
              <Input
                className='form-control'
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleChange(e, 'phone')
                }
                type='text'
                maxLength={30}
              />
            </FormItem>
            <FormItem required label={t('设为默认仓')}>
              <Switch
                disabled={isDisabled}
                checked={isSwitch}
                onChange={(value) => {
                  setSwitch(value)
                  // changeCreareParams('is_default', value)
                }}
              />
            </FormItem>
            <FormItem required label={t('地理位置')}>
              <div style={{ width: '80vw', height: '45vh' }}>
                <LocationMap
                  defaultLocation={{
                    latitude: latitude || '',
                    longitude: longitude || '',
                    address: address || '',
                  }}
                  location={{
                    latitude: latitude || '',
                    longitude: longitude || '',
                    address: address || '',
                  }}
                  onLocation={setLocation}
                />
              </div>
            </FormItem>
          </FormBlock>
          <FormBlock col={2}>
            <FormItem label={t('备注')}>
              <TextArea
                value={remark}
                maxLength={30}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange(e, 'remark')
                }
              />
            </FormItem>
          </FormBlock>
        </Form>
      </FormPanel>
    )
  }),
)

export default BaseInfo
