export function getContext() {
  // eslint-disable-next-line no-undef
  return typeof Netlify !== 'undefined' ? Netlify?.context : undefined
}
