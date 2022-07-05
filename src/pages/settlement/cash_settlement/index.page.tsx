import React, { useEffect, FC } from 'react'
import { t } from 'gm-i18n'

const CashSettleMent: FC = () => {
  const from = 'ERP'
  useEffect(() => {
    const nextUrl = `${window.location.protocol}//${window.location.host}/reconcilia#/?from=${from}`

    window.open(nextUrl)
  }, [])
  return <>{t('爱农支付')}</>
}

export default CashSettleMent
