import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { ImgUploader } from '@gm-pc/react'
import { LocalIconsOptions } from '../../../../manage/interface'

const LocalIcons: FC<LocalIconsOptions> = ({
  icons,
  handleUpload,
  handleDelete,
}) => {
  const handleChange = (value: string[]) => {
    const [difference] = value
      .concat(icons)
      .filter((icon) => !value.includes(icon))
    if (difference) {
      handleDelete(difference)
    }
  }

  return (
    <div style={{ padding: '12px' }}>
      <ImgUploader
        contentSize={{
          width: '40px',
          height: '40px',
        }}
        data={icons}
        accept='image/*'
        multiple
        onChange={handleChange}
        onUpload={handleUpload}
      />
      <div className='gm-margin-top-20' style={{ color: '#8c8a8a' }}>
        {t('说明：')}
        <ol className='gm-padding-left-15 gm-margin-top-10'>
          <li style={{ marginBottom: '10px' }}>
            {t('推荐尺寸80*80，小于300K，最多可上传50张本地图标；')}
          </li>
          <li>
            {t('若图标删除时正在被使用，系统会自动将分类图标更换为默认图标。')}
          </li>
        </ol>
      </div>
    </div>
  )
}

export default LocalIcons
