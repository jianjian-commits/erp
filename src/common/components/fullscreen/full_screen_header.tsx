import { gmHistory as history } from '@gm-common/router'
import classNames from 'classnames'
import React, { ReactNode, useEffect, useState } from 'react'
import styled from 'styled-components'
import SvgNext from 'svg/next.svg'

export interface FullScreenHeader {
  title: string | ReactNode
  leftSubtitle?: string
  rightSubtitle?: string
  className?: string
  exitText: string | ReactNode
}

const FullScreenHeader = ({
  title,
  leftSubtitle,
  rightSubtitle,
  className,
  exitText = '退出投屏',
}: FullScreenHeader) => {
  const [active, setActive] = useState(false)
  useEffect(() => {
    setActive(true)
  }, [])

  // 退出投屏
  const onExit = () => {
    history.go(-1)
  }

  return (
    <Wrapper
      className={classNames(
        'gm-position-relative',
        {
          active,
        },
        className,
      )}
    >
      <div className='mask'>
        <div
          className='gm-flex gm-flex-none'
          style={{
            width: '100px',
            height: '30px',
            position: 'absolute',
            right: '20px',
            padding: '0 10px',
            boxSizing: 'border-box',
          }}
        >
          <div className='b-border-content b-padding'>
            <div className='b-angle-border b-left-top-border' />
            <div className='b-angle-border b-right-top-border' />
            <div className='b-angle-border b-left-bottom-border' />
            <div className='b-angle-border b-right-bottom-border' />
            <div
              className='gm-flex gm-flex-justify-center gm-flex-align-center gm-text-white gm-cursor'
              style={{ width: '85px', height: '30px' }}
              onClick={onExit}
            >
              {exitText}&nbsp;
              <SvgNext />
            </div>
          </div>
        </div>
      </div>
      <div className='wing2 wing'>
        <div className='block' />
        <div className='text'>{leftSubtitle}</div>
      </div>
      <div className='brush2'>
        <div className='text2'>{title}</div>
        <div className='bg' />

        <div className='corner1' />
        <div className='corner2' />
      </div>
      <div className='wing1 wing'>
        <div className='block' />
        <div className='text'>{rightSubtitle}</div>
      </div>
    </Wrapper>
  )
}

export default FullScreenHeader

const Wrapper = styled.div.attrs(() => {
  const corners = [1, 2].map((index) => {
    const left = index === 2
    return `
      .corner${index} {
        transition: all 1s ease 0.4s;
        opacity: 0;
        transform: ${
          left ? 'translate3d(-15px, -10px, 0)' : 'translate3d(15px, 10px, 0)'
        };
        position: absolute;
        width: 30px;
        height: 3px;
        top: 0;
        ${left ? 'left: -26px' : 'right: -26px'};
        border-radius: 2px;
        background: ${
          left
            ? `linear-gradient(
          50deg,
          rgba(107, 162, 250, 1),
          rgba(0, 0, 0, 0)
        )`
            : `linear-gradient(
          50deg,
          rgba(0, 0, 0, 0),
          rgba(107, 162, 250, 1)
        )`
        };
        &::after {
          content: '';
          position: absolute;
          border-radius: 2px;
          width: 40px;
          height: 3px;
          background: ${
            left
              ? `linear-gradient(
            50deg,
            rgba(107, 162, 250, 1),
            rgba(0, 0, 0, 0)
          )`
              : `linear-gradient(
            50deg,
            rgba(0, 0, 0, 0),
            rgba(107, 162, 250, 1)
          )`
          };
          transform: rotateZ(${left ? '78deg' : '-78deg'});
          transform-origin: ${left ? 'left' : 'right'};
          ${left ? 'left: 1px' : 'right: 1px'};
          top: -1px;
        }
      }
    `
  })
  return {
    corners,
    brush2_common: `
      left: 50%;
      width: 70%;
      height: 3px;
      background: linear-gradient(
        to right,
        rgba(0, 0, 0, 0),
        rgba(65, 191, 225, 0.55) 50%,
        rgba(0, 0, 0, 0)
      );

      transform: translateX(-50%) scaleX(0);
      transition: all 1s ease 0.5s;
    `,
  }
})`
  display: flex;
  justify-content: center;
  .brush2 {
    padding: 10px 70px;
    position: relative;
    z-index: 2;
    margin: 0 33px;
    &::before {
      content: '';
      position: absolute;
      bottom: 0px;
      ${(props) => props.brush2_common}
    }
    &::after {
      content: '';
      position: absolute;
      top: 0px;
      ${(props) => props.brush2_common}
    }

    .text2 {
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 1) 50%,
        rgba(83 247 255 / 50%)
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      transform: translate3d(0, 8px, 0);
      transition: all 1s ease 0.5s;
      opacity: 0;
    }

    .bg {
      content: '';
      z-index: -1;
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      background: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0),
        #408aff 50%,
        rgba(0, 0, 0, 0)
      );

      opacity: 0;
      transition: all 1s ease 0.5s;
    }

    ${(props) => props.corners}
  }
  .wing {
    width: 30%;
    height: 36px;
    position: relative;
    border: 2px solid #367cf6;
  }
  .wing1 {
    opacity: 0;
    transition: all 1s ease 0.5s;
    transform: translate3d(5%, 0, 0) skew(-11deg);
  }
  .wing .block {
    position: absolute;
    width: 45px;
    height: 100%;
  }
  .wing1:after {
    content: '';
    position: absolute;
    left: 15px;
    bottom: 0;
    height: 70%;
    width: 100%;
    background-color: #2d59a4;
  }
  .wing1 .text {
    content: '';
    font-size: 14px;
    margin-left: 20px;
    color: #ffff;
    position: absolute;
    transform: skew(11deg);
    z-index: 11;
    left: 15px;
    bottom: 0;
    height: 70%;
    line-height: 25px;
    width: 100%;
  }
  .wing1 .block {
    left: 15px;
    background: radial-gradient(
        circle farthest-corner at 120% 0%,
        rgba(31, 36, 90, 1) 20%,
        transparent
      ),
      linear-gradient(90deg, rgb(15 159 255) 4px, transparent 0);
    background-size: 100% 100%, 8px 20px;
  }

  .wing2::after {
    content: '';
    position: absolute;
    right: 15px;
    bottom: 0;
    height: 70%;
    width: 100%;
    background-color: #2d59a4;
  }

  .wing2 {
    opacity: 0;
    transition: all 1s ease 0.5s;
    transform: translate3d(-5%, 0, 0) skew(11deg);
  }
  .wing2 .text {
    content: '';
    font-size: 14px;
    margin-right: 20px;
    color: #ffff;
    position: absolute;
    transform: skew(-11deg);
    z-index: 11;
    right: 15px;
    bottom: 0;
    height: 70%;
    line-height: 25px;
    width: 100%;
    text-align: right;
  }
  .wing2 .block {
    right: 15px;
    background: radial-gradient(
        circle farthest-corner at -20% 0%,
        rgba(31, 36, 90, 1) 20%,
        transparent
      ),
      linear-gradient(90deg, rgb(15 159 255) 4px, transparent 0);
    background-size: 100% 100%, 8px 20px;
  }

  .mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    background: linear-gradient(to left, #0e1137 15%, transparent 25%),
      linear-gradient(to right, #0e1137 15%, transparent 25%);
  }

  // --------------- 动画 -----------------
  &.active {
    .brush2 {
      &::before {
        transform: translateX(-50%);
      }

      &::after {
        transform: translateX(-50%);
      }

      .text2 {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }

      .bg {
        opacity: 1;
      }
    }

    .wing1 {
      opacity: 1;
      transform: skew(-11deg);
    }
    .wing2 {
      opacity: 1;
      transform: skew(11deg);
    }

    .corner1 {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
    .corner2 {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
`
