// eslint-disable-next-line no-undef
export const getContext = () => (typeof Netlify !== 'undefined' ? Netlify?.context : undefined)
