import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

export interface ContainerProps {
  children?: any
  className?: any
}

const Container = ({ children, className }: ContainerProps) => {
  return <Wrapper className={className}>{children}</Wrapper>
}

Container.propTypes = {
  className: PropTypes.string,
}
export default Container

const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
  background: radial-gradient(50% 100%, rgb(1 5 49), rgb(2 8 74));
  background-size: 100% 100%;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;
    background: radial-gradient(50% 100%, rgb(20 23 70 / 95%), rgb(2 7 74)),
      linear-gradient(180deg, rgb(255 255 255 / 40%) 2px, transparent 0),
      linear-gradient(90deg, rgb(15 159 255 / 40%) 2px, transparent 0);
    background-size: 100% 100%, 20px 20px, 20px 20px;
  }
`
