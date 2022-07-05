import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Button, Flex, Checkbox } from '@gm-pc/react'
import { useBoolean } from '@/common/hooks'

interface Props {
  ssuIds: string[]
  onClick: () => Promise<any>
  onCancle: () => void
}

const DeleteSsuInBatch: FC<Props> = ({ onClick, onCancle }) => {
  const { state, toggle } = useBoolean(false)

  const handleCancle = () => {
    onCancle()
  }

  const handleDelete = () => {
    onClick()
    handleCancle()
  }

  return (
    <Flex column>
      <p>{t('是否批量删除选中的商品，批量删除后无法恢复')}</p>
      <Flex>
        <Checkbox
          checked={state}
          onChange={() => {
            toggle()
          }}
        >
          <span>{t('我已知晓上述风险，确认删除')}</span>
        </Checkbox>
      </Flex>
      <Flex justifyEnd className='gm-text-right'>
        <Button className='gm-margin-right-10' onClick={handleCancle}>
          {t('取消')}
        </Button>
        <Button type='primary' onClick={handleDelete} disabled={!state}>
          {t('确定')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default DeleteSsuInBatch
