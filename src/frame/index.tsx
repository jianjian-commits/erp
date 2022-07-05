import React from 'react'
import ErrorBoundary from './error'
import { Router, Redirect } from 'react-router-dom'
import { AutoRouter, gmHistory } from '@gm-common/router'
import { configure } from 'mobx'
import getNavConfig, { getNavRouteMap } from '@/frame/navigation'
import App from './app'
import Bootstrap from '@/frame/bootstrap'
import { LayoutRoot } from '@gm-pc/react/src/index'

// mobx 严格模式
configure({ enforceActions: 'always' })

const AppRoute = React.memo(() => (
  <App>
    <ErrorBoundary>
      <AutoRouter navConfig={getNavConfig()} navRouteMap={getNavRouteMap()}>
        {[
          <Redirect exact from='/' to='/home' key='/' />,
          <Redirect exact from='/login' to='/home' key='/login' />,
        ]}
      </AutoRouter>
    </ErrorBoundary>
  </App>
))

const Root = () => (
  <ErrorBoundary>
    <Router history={gmHistory}>
      <Bootstrap>
        <AppRoute />
      </Bootstrap>
      <LayoutRoot />
    </Router>
  </ErrorBoundary>
)

export default Root
