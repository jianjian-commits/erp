import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex, Input, Modal, Button } from '@gm-pc/react'
import _ from 'lodash'

import { BannersType } from '../interface'
import SVGDelete from '@/svg/delete_shop_module.svg'
import SVGArrowTop from '@/svg/arrow_top.svg'
import SVGArrowBottom from '@/svg/arrow_bottom.svg'
import BannerModal from './banner_modal'
import { Shop_Type } from 'gm_api/src/preference'
import './style.less'

export interface ItemProps {
  imageUrl: string
  link: string
  index: number
  max: number
  onChange(index: number, value: string): void
  onDelete(index: number): void
  onTop(index: number): void
  onBottom(index: number): void
}

const Item: FC<ItemProps> = ({
  imageUrl,
  index,
  link,
  max,
  onChange,
  onDelete,
  onTop,
  onBottom,
}) => {
  return (
    <Flex className='banner-item gm-margin-tb-10'>
      <img className='banner-item-img' src={imageUrl} />
      <Flex column flex className='gm-margin-left-10'>
        <div className='gm-margin-bottom-10'>{t('设置链接')}</div>
        <Input
          type='text'
          value={link}
          onChange={(e) => onChange(index, e.target.value)}
        />
      </Flex>
      <div className='banner-item-close' onClick={() => onDelete(index)}>
        <SVGDelete style={{ width: '20px', height: '20px' }} />
      </div>
      <div className='banner-item-util'>
        <Button disabled={index === 0} onClick={() => onTop(index)}>
          <SVGArrowTop />
        </Button>
        <Button disabled={index === max - 1} onClick={() => onBottom(index)}>
          <SVGArrowBottom />
        </Button>
      </div>
    </Flex>
  )
}

export interface BannerPartProps {
  shopType: Shop_Type
  data: BannersType[]
  onChange(banners: BannersType[]): void
}

const BannerPart: FC<BannerPartProps> = ({ data, onChange, shopType }) => {
  const handleDelete = (index: number) => {
    onChange(_.remove(data, (_, i) => i !== index))
  }

  const handleTop = (index: number) => {
    const newList = _.cloneDeep(data)
    const pre = newList[index]
    newList[index] = newList[index - 1]
    newList[index - 1] = pre
    onChange(newList)
  }

  const handleBottom = (index: number) => {
    const newList = _.cloneDeep(data)
    const pre = newList[index]
    newList[index] = newList[index + 1]
    newList[index + 1] = pre
    onChange(newList)
  }

  const handleChange = (index: number, value: string) => {
    const newData = _.cloneDeep(data)
    newData[index] = {
      ...newData[index],
      link: value,
    }
    onChange(newData)
  }

  const handleModal = () => {
    Modal.render({
      title: t('添加图片'),
      size: 'lg',
      children: (
        <BannerModal shopType={shopType} data={data} onChange={onChange} />
      ),
      onHide: Modal.hide,
    })
  }

  return (
    <div>
      <div className='gm-text-desc'>
        <div className='gm-margin-tb-5'>
          {t(
            '1.最多可上传4张图片，图片大小请不要超过300kb，推荐尺寸720x320，请保证每张图的尺寸一致，支持jpg/png/gif格式',
          )}
        </div>
        <div>
          {t(
            '2.根据运营需求，可设置跳转链接，设置后点击轮播图可跳转至该链接。如不需跳转则不用填写',
          )}
        </div>
      </div>
      <div className='gm-margin-tb-10'>{t('添加图片：')}</div>
      {_.map(data, (v, i) => (
        <Item
          key={i}
          imageUrl={v.image?.url || ''}
          link={v.link || ''}
          index={i}
          max={data.length}
          onChange={handleChange}
          onDelete={handleDelete}
          onTop={handleTop}
          onBottom={handleBottom}
        />
      ))}
      {data.length < 4 && (
        <Flex
          column
          alignCenter
          justifyCenter
          className='banner-item gm-cursor gm-margin-tb-10'
          onClick={handleModal}
        >
          <div className='banner-item-title gm-margin-tb-10'>
            + {t('添加一个背景图')}
          </div>
          <div className='gm-text-desc'>{t('建议尺寸：720x320像素')}</div>
        </Flex>
      )}
    </div>
  )
}

export default BannerPart
