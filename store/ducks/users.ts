import { ofType } from 'redux-observable';
import { interval, of } from 'rxjs';
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';
import { request } from 'universal-rxjs-ajax';

export const FETCH_USER = 'FETCH_USER'
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS'
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE'
export const START_FETCHING_USERS = 'START_FETCHING_USERS'
export const STOP_FETCHING_USERS = 'STOP_FETCHING_USERS'

export const startFetchingUsers = () => ({
  type: START_FETCHING_USERS,
})
export const stopFetchingUsers = () => ({
  type: STOP_FETCHING_USERS,
})
export const fetchUser = (isServer = false) => ({
  type: FETCH_USER,
  payload: { isServer },
})
export const fetchUserSuccess = (response, isServer) => ({
  type: FETCH_USER_SUCCESS,
  payload: { response, isServer },
})

export const fetchUserFailure = (error, isServer) => ({
  type: FETCH_USER_FAILURE,
  payload: { error, isServer },
})

export const usersEpic = (action$, state$) =>
  action$.pipe(
    ofType(START_FETCHING_USERS),
    mergeMap((action) => {
      return interval(5000).pipe(
        map((x) => fetchUser()),
        takeUntil(
          action$.ofType(STOP_FETCHING_USERS, FETCH_USER_FAILURE)
        )
      )
    })
  )

export const userEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_USER),
    mergeMap((action: any) =>
      request({
        url: `https://jsonplaceholder.typicode.com/users/${state$.value.users.nextUserId}`,
      }).pipe(
        map((response) =>
          fetchUserSuccess(response.response, action.payload.isServer)
        ),
        catchError((error) =>
          of(
            fetchUserFailure(
              error.xhr.response,
              action.payload.isServer
            )
          )
        )
      )
    )
  )

// REDUCER
const STATE: any = {
  nextUserId: 1,
  character: {},
  isFetchedOnServer: false,
  error: null,
}

export const users = (state: any = STATE, action) => switchState(state, action)

const switchState = (state: any, { type, payload }) => {
  const cases = {
    [FETCH_USER_SUCCESS]: () => ({
      ...state,
      character: payload.response,
      isFetchedOnServer: payload.isServer,
      nextUserId: state.nextUserId + 1,
    }),
    [FETCH_USER_FAILURE]: () => ({
      ...state,
      error: payload.error,
      isFetchedOnServer: payload.isServer,
    }),
    'default': () => (state)
  }

  return (cases[type] || cases['default'])()
}
