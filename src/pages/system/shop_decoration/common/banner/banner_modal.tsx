import React, { FC, useState } from 'react'
import { Button, Flex, Uploader, Modal, UploaderFile } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import classNames from 'classnames'

import './style.less'
import SVGDelete from '@/svg/delete_shop_module.svg'
import { BannerModalProps, ImageType } from '../interface'
import { uploadQiniuImage, getImages } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import { useLoad } from '@/common/hooks'
import {
  ListShopBanner,
  CreateShopBanner,
  DeleteShopBanner,
} from 'gm_api/src/preference'

export interface ImageListType {
  value: string
  image: ImageType
}

// todo: 暂时先弄我的图片分类
const sortList = [
  {
    text: t('我的图片'),
    value: 0,
  },
]

const BannerModal: FC<BannerModalProps> = ({
  data,
  disabledSelected,
  onChange,
  shopType,
}) => {
  const [refImage, setRefImage] = useState<HTMLDivElement | null>(null)
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState<number | null>(0)
  const [images, setImages] = useState<ImageListType[]>([])
  const [selected, setSelected] = useState<string[]>([])

  useLoad(
    () => {
      getBanner(offset)
    },
    { current: refImage },
  )

  const getBanner = (offset?: number) => {
    offset = offset || 0
    const limit = 10
    ListShopBanner({ paging: { offset, limit }, type: shopType }).then(
      (json) => {
        const { shop_banners, paging } = json.response
        if (paging.has_more) {
          setOffset(offset! + limit)
        }
        const res = _.map(shop_banners, (v) => ({
          value: v.shop_banner_id,
          image: getImages(v.banner?.image ? [v.banner?.image] : [])[0],
        }))
        const data =
          offset === 0 ? res : _.unionBy([...images, ...res], (v) => v.value)
        setImages(data)
        return json
      },
    )
  }

  const handleSelect = (banner: ImageListType) => {
    setSelected(_.xor(selected, [banner.value]))
  }

  const handleCancel = () => {
    Modal.hide()
  }

  const handleSubmit = () => {
    // 过滤数据
    let newData = _.map(
      _.filter(images, (v) => _.includes(selected, v.value)),
      (v) => ({ image: v.image }),
    )
    newData = [...data, ...newData]
    onChange(newData)
    Modal.hide()
  }

  const handleUpload = (files: UploaderFile[]) => {
    if (files.length) {
      uploadQiniuImage(
        FileType.FILE_TYPE_PREFERENCE_BANNER_IMAGE,
        _.head(files) as UploaderFile,
      ).then((json) => {
        return addBanner(json.data)
      })
    }
  }

  const addBanner = (data: ImageType) => {
    CreateShopBanner({
      shop_banner: {
        banner: {
          image: data,
        },
      },
    }).then(() => {
      // 上传完，更新数据
      return getBanner()
    })
  }

  const HandleDelete = (id: string) => {
    DeleteShopBanner({
      shop_banner_id: id,
    }).then(() => {
      // 删除完，更新数据
      return getBanner()
    })
  }

  const isMax = data.length + selected.length >= 4
  return (
    <div className='banner-modal'>
      <Flex alignCenter>
        <Uploader onUpload={handleUpload} accept='image/*'>
          <Button type='primary'>{t('本地上传')}</Button>
        </Uploader>
        <div className='gm-margin-left-20'>
          {t(
            '推荐尺寸：720*320，小于300kb，最多上传100张本地图片，上传成功的图片在“我的图片”下管理。',
          )}
        </div>
      </Flex>
      <Flex className='gm-margin-top-10'>
        <Flex className='banner-modal-left gm-border gm-overflow-y' column>
          {_.map(sortList, (v) => (
            <div
              key={v.value}
              className={classNames('banner-modal-left-item', {
                'banner-modal-left-item-active': sort === v.value,
              })}
              onClick={() => setSort(v.value)}
            >
              {v.text}
            </div>
          ))}
        </Flex>
        <Flex
          flex
          alignContentStart
          wrap
          className='gm-overflow-y gm-border banner-modal-right'
        >
          {_.map(images, (v, i) => (
            <div
              ref={setRefImage}
              key={v.value + i}
              className={classNames('banner-modal-right-item', {
                'banner-modal-right-item-active': _.includes(selected, v.value),
              })}
              onClick={() => {
                if (
                  !_.includes(disabledSelected, v.value) &&
                  (!isMax || _.includes(selected, v.value))
                ) {
                  handleSelect(v)
                }
              }}
            >
              {(_.includes(disabledSelected, v.value) ||
                (isMax && !_.includes(selected, v.value))) && (
                <div className='banner-modal-right-item-mask' />
              )}
              <div
                className='banner-modal-right-item-close'
                onClick={() => HandleDelete(v.value)}
              >
                <SVGDelete style={{ width: '20px', height: '20px' }} />
              </div>
              <img src={v.image?.url} />
            </div>
          ))}
        </Flex>
      </Flex>
      <Flex className='gm-margin-top-20' justifyCenter>
        <Button className='gm-margin-right-20' onClick={handleCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' onClick={handleSubmit}>
          {t('确认')}
        </Button>
      </Flex>
    </div>
  )
}

export default BannerModal
