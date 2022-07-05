import React, { FC } from 'react'
import classNames from 'classnames'
import { Flex, FlipNumber } from '@gm-pc/react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { BulletinOptions } from '../interface'

const Bulletin: FC<BulletinOptions> = ({ flip, className, options }) => {
  let { tName, yName, tAcount, yAcount, tLink, yLink } = options
  tAcount = Number(tAcount)
  return (
    <Flex
      column
      flex
      className={classNames('gm-padding-10', className)}
      style={{
        borderRadius: '7px',
        fontFamily: 'Helvetica',
      }}
    >
      <div className='gm-text-bold gm-text-14'>{tName}</div>
      {/* 1. 传了flip,使用<Flip />
          2. 传了tLink,tLink以http开头，使用<a />标签包裹，否则用<Link />组件
      */}
      {flip ? (
        tLink ? (
          _.startsWith(tLink, 'http') ? (
            <a
              href={tLink}
              target='_blank'
              rel='noopener noreferrer'
              className='gm-text-white gm-flex gm-text-bold'
              style={{ fontSize: '34px', textDecoration: 'none' }}
            >
              {/* FlipNumber 不能传负数，所以取相反数，自己处理负号 */}
              <span>{tAcount < 0 ? '-' : null}</span>
              <FlipNumber
                to={tAcount < 0 ? -tAcount : tAcount}
                decimal={2}
                delay={500}
              />
            </a>
          ) : (
            <Link
              className='gm-text-white gm-flex gm-text-bold'
              style={{ fontSize: '34px', textDecoration: 'none' }}
              to={tLink}
            >
              <span>{tAcount < 0 ? '-' : null}</span>
              <FlipNumber
                to={tAcount < 0 ? -tAcount : tAcount}
                decimal={2}
                delay={500}
              />
            </Link>
          )
        ) : (
          <Flex
            className='gm-text-bold'
            style={{ fontSize: '34px', textDecoration: 'none' }}
          >
            <span>{tAcount < 0 ? '-' : null}</span>
            <FlipNumber
              to={tAcount < 0 ? -tAcount : tAcount}
              decimal={2}
              delay={500}
            />
          </Flex>
        )
      ) : tLink ? (
        <Link
          className='gm-text-white gm-text-bold'
          to={tLink}
          style={{ fontSize: '34px', textDecoration: 'none' }}
        >
          {tAcount}
        </Link>
      ) : (
        <div className='gm-text-bold' style={{ fontSize: '34px' }}>
          {tAcount}
        </div>
      )}
      <Flex justifyBetween className='gm-margin-top-20'>
        <div>{yName}</div>
        {yLink ? (
          _.startsWith(yLink, 'http') ? (
            <a
              href={yLink}
              target='_blank'
              rel='noopener noreferrer'
              className='gm-text-white gm-text-14'
              style={{ textDecoration: 'none', fontFamily: 'Helvetica' }}
            >
              {yAcount}
            </a>
          ) : (
            <Link
              to={yLink}
              className='gm-text-white gm-text-14'
              style={{ textDecoration: 'none', fontFamily: 'Helvetica' }}
            >
              {yAcount}
            </Link>
          )
        ) : (
          <div className='gm-text-14' style={{ fontFamily: 'Helvetica' }}>
            {yAcount}
          </div>
        )}
      </Flex>
    </Flex>
  )
}

export default Bulletin
