import { AppointTimeSettingType } from '@/pages/production/create/interface'
import { t } from 'gm-i18n'
import { AppointTimeSettings_Type } from 'gm_api/src/preference'

export const AppointTimeSettingsTypeArray: AppointTimeSettingType[] = [
  {
    value: AppointTimeSettings_Type.CLEANFOOD_PRODUCE_TIME_BEFORE_PACK,
    text: t('单品BOM'),
  },
  {
    value: AppointTimeSettings_Type.PRODUCE_TIME_BEFORE_PACK,
    text: t('组合BOM'),
  },
  {
    value: AppointTimeSettings_Type.PROCESSED_PACK_TIME_BEFORE_ORDER_RECV,
    text: t('包装BOM'),
  },
]
