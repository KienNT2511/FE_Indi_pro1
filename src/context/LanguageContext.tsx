import { translations, type Lang } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setLang as setLangAction } from '../store/slices/language/languageSlice'

export function useLanguage() {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => state.language.lang)

  return {
    lang,
    setLang: (next: Lang) => dispatch(setLangAction(next)),
    t: translations[lang],
  }
}
