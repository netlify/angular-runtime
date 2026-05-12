// eslint-disable-next-line no-undef
export function getContext() {
  return typeof Netlify !== 'undefined' ? Netlify?.context : undefined
}
