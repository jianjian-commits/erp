import { TimeType } from 'gm_api/src/device'
import { FrequencyType, FrequencyValueType } from './interface'
import { t } from 'gm-i18n'

const FrequencyValue: FrequencyValueType = {
  oneSecond: 1,
  fiveSecond: 5,
  tenSecond: 10,
  oneMinute: 60,
  fiveMinute: 360,
  tenMinute: 600,
  free: Infinity,
}

const FrequencySelect: FrequencyType[] = [
  {
    value: FrequencyValue.oneSecond,
    text: t('1秒'),
    strategy_frequency: 1,
    time_type: TimeType.TIMETYPE_SECOND,
  },
  {
    value: FrequencyValue.fiveSecond,
    text: t('5秒'),
    strategy_frequency: 5,
    time_type: TimeType.TIMETYPE_SECOND,
  },
  {
    value: FrequencyValue.tenSecond,
    text: t('10秒'),
    strategy_frequency: 10,
    time_type: TimeType.TIMETYPE_SECOND,
  },
  {
    value: FrequencyValue.oneMinute,
    text: t('1分'),
    strategy_frequency: 1,
    time_type: TimeType.TIMETYPE_MINUTE,
  },
  {
    value: FrequencyValue.fiveMinute,
    text: t('5分'),
    strategy_frequency: 5,
    time_type: TimeType.TIMETYPE_MINUTE,
  },
  {
    value: FrequencyValue.tenMinute,
    text: t('10分'),
    strategy_frequency: 10,
    time_type: TimeType.TIMETYPE_MINUTE,
  },
  {
    value: FrequencyValue.free,
    text: t('自定义'),
    strategy_frequency: 1,
    time_type: TimeType.TIMETYPE_SECOND,
  },
]

export { FrequencySelect, FrequencyValue }
