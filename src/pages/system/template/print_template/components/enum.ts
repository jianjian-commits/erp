import { t } from 'gm-i18n'
export const deliveryType = [t('账户配送单'), t('商户配送单')]

export const templateTypObj: Record<string, string[]> = {
  7: [t('账户配送单'), t('商户配送单')],
  11: [t('净菜生产'), t('熟食生产'), t('包装')],
}
