import React, { useEffect, useState } from 'react'
import { Flex, FormPanel, TimeSpanPicker, Tip } from '@gm-pc/react'
import { Button } from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  GetEshopSettings,
  EshopSettings,
  UpdateEshopSettings,
} from 'gm_api/src/preference'
import { MToDate, dateTMM } from '@/common/util'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

const ServiceManageMent = () => {
  const [submitLoading, setSubmitLoading] = useState(false)
  const [settings, setSettings] = useState<EshopSettings>({
    eshop_settings_id: '',
  })
  const [time, setTime] = useState<Date>()

  useEffect(() => {
    GetEshopSettings().then((res) => {
      const settings = res.response.eshop_settings
      console.log(settings, 'aa')
      setSettings(settings)
      settings.absence_rule?.times !== '' &&
        setTime(MToDate(_.toNumber(settings.absence_rule?.times)))
    })
  }, [])

  const handleSave = () => {
    setSubmitLoading(true)
    const eshop_settings = {
      ...settings,
      absence_rule: {
        ...settings.absence_rule,
        times: dateTMM(time!),
      },
    }
    UpdateEshopSettings({ eshop_settings })
      .then(() => {
        Tip.success(t('保存成功'))
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }
  return (
    <div>
      <FormPanel title={t('请假时间')}>
        <Flex justifyStart alignCenter className='tw-ml-2'>
          <div>{t('当日')}</div>
          <TimeSpanPicker
            style={{ width: '100px' }}
            date={time!}
            onChange={(date: Date) => setTime(date)}
          />
          <div>{t('前可申请取消第二日及以后（当前订餐周期内）的餐次')}</div>
        </Flex>
      </FormPanel>

      <ButtonGroupFixed
        onCancel={() => {
          history.go(-1)
        }}
        ButtonNode={
          <>
            <Button
              type='primary'
              onClick={handleSave}
              loading={submitLoading}
              disabled={
                !globalStore.hasPermission(
                  Permission.PERMISSION_PREFERENCE_UPDATE_ESHOP_SETTINGS,
                )
              }
            >
              {t('保存')}
            </Button>
          </>
        }
      />
    </div>
  )
}

export default ServiceManageMent
