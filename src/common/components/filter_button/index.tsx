import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { FormButton, Button } from '@gm-pc/react'

interface FilterButtonProps {
  onExport?: () => any
  loading?: boolean
}

const FilterButton: FC<FilterButtonProps> = (props) => {
  const { onExport, loading } = props
  return (
    <FormButton>
      <Button
        type='primary'
        htmlType='submit'
        className='gm-margin-right-10'
        disabled={loading}
      >
        {t('搜索')}
      </Button>
      {onExport && <Button onClick={onExport}>{t('导出')}</Button>}
    </FormButton>
  )
}

export default FilterButton
