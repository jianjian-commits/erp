import { t } from 'gm-i18n'
const searchDateTypes = [
  {
    text: t('按下单时间'),
    value: '1',
  },
  {
    text: t('按运营周期'),
    value: '2',
  },
  {
    text: t('按收货日期'),
    value: '3',
  },
]

const filterStatusList = [
  { value: '', text: t('全部状态') },
  { value: '1', text: t('等待分拣') },
  { value: '1', text: t('分拣中') },
  { value: '10', text: t('配送中') },
  { value: '15', text: t('已签收') },
]

const PRINT_STATUS = [
  { value: '', text: t('全部状态') },
  { value: '0', text: t('未打印') },
  { value: '1', text: t('已打印') },
]

export { searchDateTypes, filterStatusList, PRINT_STATUS }
