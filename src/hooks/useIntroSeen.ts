const KEY = 'shakir.intro.v1'

export function introSeen(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('intro') === '1') return false
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    /* ignore */
  }
}
