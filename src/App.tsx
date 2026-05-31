import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import { useAppDispatch } from './store/hooks'
import { initAuth } from './store/slices/auth/authSlice'
import AppRouter from './router'

function AppBootstrap() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(initAuth())
  }, [dispatch])
  return <AppRouter />
}

export default function App() {
  return (
    <Provider store={store}>
      <AppBootstrap />
    </Provider>
  )
}
