import React from 'react'
import { t } from 'gm-i18n'

/**
 * 删除报价单的提示
 */
export const DeleteQuotationTip = (props: {
  text?: string
  count?: number
}) => {
  const { text = t('这些报价单'), count } = props
  return (
    <>
      {count && (
        <span style={{ fontWeight: 600, marginRight: 8 }}>
          {t('已选条目')}：{count}
        </span>
      )}

      <span>{t(`您确定要删除${text}吗`)}</span>
      <div style={{ color: '#E04B20', marginTop: '4px', fontSize: '12px' }}>
        {t(
          '注意：删除报价单后，与删除报价单关联的客户无法正常下单，请尽快为客户绑定新的报价单',
        )}
      </div>
    </>
  )
}
