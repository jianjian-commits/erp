import { t } from 'gm-i18n'
import React, { FC, useState, useRef } from 'react'
import { Form, Tip, Input, Button } from '@gm-pc/react'
import _ from 'lodash'
import { isNumberCombination } from '@/common/util'
import { ScanSearchType } from '../../interface'
interface Props {
  onSearch: ScanSearchType
}

const ScanInput: FC<Props> = (props) => {
  const [barcode, setBarcode] = useState<string>('')
  const isTipRef = useRef<boolean>(false)
  const isSearchRef = useRef<boolean>(false)

  const afterFunc = (isSuccess: boolean) => {
    isTipRef.current = false
    isSearchRef.current = false
    if (isSuccess) {
      Tip.success(t(`订单${barcode}已回单`))
      setBarcode('')
    }
  }

  const handleSearchByBarcode = () => {
    if (!barcode && !isNumberCombination(barcode)) {
      return Tip.danger(t('规格条码仅支持数字组成'))
    }
    isSearchRef.current = true

    props.onSearch(barcode, afterFunc)
    return null
  }

  const handleChangeBarcode = (val: React.ChangeEvent<HTMLInputElement>) => {
    const value = val.target.value
    if (isTipRef.current) {
      // 因为扫码枪是一个个字符返回的，所以这里只需要提醒一次就好
      return
    }

    if (isSearchRef.current) {
      Tip.danger(t('当前扫码任务执行中，请稍后再试'))
      isTipRef.current = true
      return
    }

    setBarcode(value)
  }

  return (
    <Form inline onSubmit={handleSearchByBarcode} className='gm-padding-5'>
      <Input
        // maxLength={13}
        value={barcode}
        className='form-control input-sm'
        name='barcode'
        autoFocus
        autoComplete='off'
        style={{ width: '200px' }}
        placeholder={t('请扫描订单号')}
        onChange={handleChangeBarcode}
      />

      <Button type='primary' htmlType='submit'>
        {t('回单')}
      </Button>
    </Form>
  )
}

export default ScanInput
