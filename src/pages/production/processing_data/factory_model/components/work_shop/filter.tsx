import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Input, Button } from '@gm-pc/react'

interface Props {
  onSearch(text: string): void
}

const Filter: FC<Props> = observer(({ onSearch }) => {
  const [search_text, setSearchText] = useState<string>('')

  const handleClick = () => {
    onSearch(search_text.trim())
  }

  return (
    <>
      <Input
        className='gm-margin-lr-10'
        style={{ width: '250px' }}
        value={search_text}
        placeholder={t('请输入工序编号或名称')}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <Button type='primary' htmlType='submit' onClick={handleClick}>
        {t('定位')}
      </Button>
    </>
  )
})

export default Filter
