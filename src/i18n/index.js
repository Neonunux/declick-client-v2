import Vue from 'vue'
import VueI18n from 'vue-i18n'

import * as messages from './messages'
import { detectUserLocales } from './utils'

Vue.use(VueI18n)

const locales = detectUserLocales()
const defaultLocale = 'en'
const selectedLocale = locales.find(locale => locale in messages) || defaultLocale

export default new VueI18n({
	locale: selectedLocale,
	messages,
})
