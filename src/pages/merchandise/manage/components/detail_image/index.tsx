import React, { useRef, FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Image } from 'antd'
import { Flex } from '@gm-pc/react'
import classNames from 'classnames'
import './style.less'
import { LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons'
interface DetailsImage {
  width: number
  image: { src: string }[]
}

const DetailsImage: FC<DetailsImage> = observer(({ width, image }) => {
  const flexRef = useRef(null)
  const [transiation, setTransiation] = useState<number>(1)
  const [next, setNext] = useState<boolean>(false)
  const [prev, setPrev] = useState<boolean>(false)
  const [transform, setTransform] = useState<string>('')
  const [index, setIndex] = useState<number>(0)

  useEffect(() => {
    const nextParmas = (width * image.length) / (width * 3 * transiation) > 1
    if (nextParmas) {
      setNext(true)
    } else {
      setNext(false)
    }
    if (transiation === 1) {
      setPrev(false)
    } else {
      setPrev(true)
    }
  }, [transiation, image.length, width])

  const nextFn = () => {
    if (next) {
      setTransiation((transiation) => transiation + 1)
      setTransform('right')
    }
  }

  const prevFn = () => {
    if (prev) {
      setTransiation((transiation) => transiation - 1)
      setTransform('left')
    }
  }

  return (
    <div className='detail-image'>
      <Image
        className='preview-image image-border'
        width={196}
        height={183}
        src={image[index].src}
        preview={false}
      />
      {image.length > 1 && (
        <Flex justifyCenter alignCenter className='tw-mt-2'>
          <LeftCircleOutlined
            onClick={prevFn}
            className='tw-mr-1'
            style={{ color: prev ? '#000' : '#ccc' }}
          />
          <div
            style={{
              overflow: 'hidden',
              width: width * 3,
            }}
          >
            <div
              ref={flexRef}
              className={classNames({
                transformNext: transform === 'right' && transiation === 2,
                transformNext2: transform === 'right' && transiation === 3,
                transformPrev: transform === 'left' && transiation === 1,
                transformPrev2: transform === 'left' && transiation === 2,
              })}
              style={{
                width: width * image.length,
                height: width,
                overflow: 'hidden',
              }}
            >
              {image.map((item, key) => {
                return (
                  <Image
                    key={key}
                    onClick={() => setIndex(key)}
                    className={classNames(
                      key === index ? 'active-image-border' : 'image-border',
                    )}
                    width={width}
                    height={width}
                    src={item.src}
                    preview={false}
                  />
                )
              })}
            </div>
          </div>
          <RightCircleOutlined
            onClick={nextFn}
            className='tw-ml-1'
            style={{ color: next ? '#000' : '#ccc' }}
          />
        </Flex>
      )}
    </div>
  )
})
export default DetailsImage
