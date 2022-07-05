import React from 'react'
import { observer } from 'mobx-react'
import { Carousel } from 'antd'
import carousel1 from '@/img/carousel1.png'
import carousel2 from '@/img/carousel2.png'
function ApplicationCarousel() {
  return (
    <Carousel autoplay autoplaySpeed={7000}>
      <img src={carousel1} />
      <img src={carousel2} />
    </Carousel>
  )
}

export default observer(ApplicationCarousel)
