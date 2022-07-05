import { t } from 'gm-i18n'
export interface Enum {
  value: string
  text: string
}
export const importType: Enum[] = [
  {
    value: '1',
    text: t('批量导入新建'),
  },
  {
    value: '2',
    text: t('批量导入修改'),
  },
]
