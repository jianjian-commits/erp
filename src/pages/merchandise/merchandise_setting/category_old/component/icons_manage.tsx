import { t } from 'gm-i18n'
import React, { FC, createContext, useState } from 'react'
import { observer } from 'mobx-react'
import { Button, Flex, LoadingChunk, Modal, Tabs, Tip } from '@gm-pc/react'
import { forEach } from 'lodash'
import { IconsManagementOptions } from '../../../manage/interface'
import store from '../store'
import SystemIcons from './icons/system_icons'
import LocalIcons from './icons/local_icons'

export const defaultIconContext = createContext(null)

const { Provider } = defaultIconContext

const IconsManagement: FC<IconsManagementOptions> = observer(({ onOk }) => {
  const { icons, defaultIcon } = store
  const [active, changeActive] = useState(0)

  /** 待添加图标列表 */
  const [toAddIcons, changeToAddIcons] = useState([])
  /** 待删除图标列表 */
  const [toDeleteIcons, changeToDeleteIcons] = useState([])

  /** 设置默认 */
  const handleSetDefault = (value) => {
    // changeDefaultIcon(value)
  }

  /**
   * @param url {string}
   */
  const onDelete = (url: string): void => {
    const icon = icons.filter((icon) => icon.url !== url)
    // changeIcons(icon)
    if (url.match(/img.guanmai.cn/g)) {
      // 从后端拉去的图标
      toDeleteIcons.push(icons.find((icon) => icon.url === url))
      changeToDeleteIcons([...toDeleteIcons])
    }
    if (toAddIcons.some((icon) => icon.preview === url)) {
      // 待添加的图标
      const icon = toAddIcons.filter((icon) => icon.preview !== url)
      changeToAddIcons(icon)
    }
  }

  const onUpload = (image_file: string[]) => {
    if (image_file.some((image) => image.size > 300 * 1024)) {
      Tip.tip(t('上传的图标不能超过300kb'))
      return
    }
    forEach(image_file, (image) => {
      if (icons.filter((icon) => icon.type === 2).length === 50) {
        Tip.tip(t('上传本地图标不能超过50张'))
        return false
      }
      toAddIcons.push(image)
      icons.push({ url: image.preview, type: 2 })
    })
    changeToAddIcons([...toAddIcons])
    // changeIcons([...icons])
    return Promise.resolve(
      icons.filter((icon) => icon.type === 2).map((icon) => icon.url),
    )
  }

  /** 取消 */
  const handleCancel = () => {
    Modal.hide()
  }

  /** 保存系统图标 */
  const handleSaveSystemIcons = (): Promise<any> => {
    return store.changeDefaultIcon().then(() => {
      Tip.success(t('保存成功'))
      Modal.hide()
      onOk()
    })
  }

  /** 保存本地图标 */
  const handleSaveLocalIcons = () => {
    const addPromises = toAddIcons.map((icon) => store.addIcon(icon))
    const deletePromise = store.deleteIcon()
    return Promise.all([...addPromises, deletePromise]).then(() => {
      Tip.success(t('保存成功'))
      Modal.hide()
      onOk()
    })
  }

  return (
    <>
      <Tabs
        active={active}
        onChange={changeActive}
        tabs={[
          {
            text: t('系统图标'),
            value: '0',
            children: (
              <Provider value={defaultIcon}>
                <LoadingChunk>
                  <SystemIcons
                    icons={icons.filter((icon) => icon.type === 1)}
                    onSetDefault={handleSetDefault}
                  />
                </LoadingChunk>
              </Provider>
            ),
          },
          {
            text: t('本地图标'),
            value: '1',
            children: (
              <LocalIcons
                icons={icons
                  .filter((icon) => icon.type === 2)
                  .map((item) => item.url)}
                handleDelete={onDelete}
                handleUpload={onUpload}
              />
            ),
          },
        ]}
      />
      <Flex justifyEnd row className='gm-margin-top-10'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button
          type='primary'
          onClick={active ? handleSaveLocalIcons : handleSaveSystemIcons}
        >
          {t('保存')}
        </Button>
      </Flex>
    </>
  )
})

export default IconsManagement
