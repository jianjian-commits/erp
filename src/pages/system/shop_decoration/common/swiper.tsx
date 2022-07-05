import React, {
  useState,
  useRef,
  useEffect,
  FC,
  FunctionComponent,
} from 'react'
import _ from 'lodash'
import { Flex, FlexProps } from '@gm-pc/react'
import styled from 'styled-components'
import { SwiperProps } from './interface'

const Swiper: FC<SwiperProps> = ({
  size,
  delay,
  width,
  renderItem,
  className,
  onClick,
}) => {
  const [animaTime, setAnimaTime] = useState('0.5s')
  const [currentIndex, setCurrentIndex] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (currentIndex >= size) {
      // 取消动画，趁别人不注意切换到第一个
      setAnimaTime('0s')
      setCurrentIndex(0)
      delay = 0
    } else {
      setAnimaTime('0.5s')
    }

    if (size > 1) {
      timer.current = setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
      }, delay)
    }

    return () => {
      clearTimeout(timer.current as ReturnType<typeof setInterval>)
    }
  }, [currentIndex, size])

  return (
    <div
      style={{ width }}
      className={`gm-overflow-hidden ${className}`}
      onClick={onClick}
    >
      <Slider
        $animaTime={animaTime}
        $currentIndex={currentIndex}
        $styleWidth={width}
      >
        {_.map(_.range(size), (v, i) => {
          return (
            <div key={i} style={{ width }}>
              {renderItem(v)}
            </div>
          )
        })}
        {size > 1 && (
          <div style={{ width, display: 'inline-block' }}>{renderItem(0)}</div>
        )}
      </Slider>
    </div>
  )
}

interface SliderProps extends FlexProps {
  $animaTime: string
  $styleWidth: number
  $currentIndex: number
}

const Slider: FunctionComponent<SliderProps> = styled(Flex)`
  transition: all ${(props: SliderProps) => props.$animaTime};
  transform: ${(props: SliderProps) =>
    `translate3d(${-props.$currentIndex * props.$styleWidth}px, 0, 0)`};
  white-space: 'nowrap';
`

export default Swiper
