import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../slices/auth/authSlice'
import languageReducer from '../slices/language/languageSlice'

export const rootReducer = combineReducers({
  auth: authReducer,
  language: languageReducer,
})
