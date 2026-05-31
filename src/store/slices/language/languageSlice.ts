import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Lang } from '../../../i18n'
import type { LanguageState } from './type'

const STORAGE_KEY = 'app_lang'

function getSavedLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'en' || saved === 'vi' ? saved : 'vi'
}

const languageSlice = createSlice({
  name: 'language',
  initialState: { lang: getSavedLang() } as LanguageState,
  reducers: {
    setLang: (state, action: PayloadAction<Lang>) => {
      state.lang = action.payload
      localStorage.setItem(STORAGE_KEY, action.payload)
    },
  },
})

export const { setLang } = languageSlice.actions
export default languageSlice.reducer
