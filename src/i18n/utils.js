export function detectUserLocales () {
  return [navigator.language, ...(navigator.languages || [])]
    .reduce((acc, locale) => {
      if (locale && !acc.includes(locale)) {
        acc.push(locale)
      }
      return acc
    }, [])
}
