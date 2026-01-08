export const THEME_COOKIE_NAME = 'ui-theme'
export const THEME_STORAGE_KEY = 'ui-theme'
export const THEME_OPTIONS = ['light', 'dark', 'system'] as const
export type ThemeOption = (typeof THEME_OPTIONS)[number]
