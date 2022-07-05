import React, { useEffect } from 'react'
import Header from '../bill/header'
import List from '../bill/list'

import store from '../bill/store'

const Create = () => {
  useEffect(() => {
    return () => {
      store.init()
    }
  }, [])

  return (
    <>
      <Header />
      <List />
    </>
  )
}

export default Create
