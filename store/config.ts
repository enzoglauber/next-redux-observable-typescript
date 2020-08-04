import { applyMiddleware, combineReducers, compose } from 'redux';
import { createLogger } from 'redux-logger';
import { combineEpics, createEpicMiddleware, Epic } from 'redux-observable';

import { userEpic, users, usersEpic } from './ducks/users';

// DEVTOOLS
export const composeEnhancers = typeof window != 'undefined' && window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

// EPICS
export const rootEpic: Epic = combineEpics(
  usersEpic,
  userEpic
)

// REDUCERS
export const createReducers = () => combineReducers({
  users
})

// MIDDLEWARES
export const createMiddleware = () => {
  const epicMiddleware = createEpicMiddleware()
  const logger = createLogger({ collapsed: true }) // log every action to see what's happening behind the scenes.
  const reduxMiddleware = composeEnhancers(
    applyMiddleware(epicMiddleware, logger)
  )
  return { epicMiddleware, reduxMiddleware }
}
