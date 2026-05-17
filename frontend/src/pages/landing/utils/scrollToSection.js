export function scrollToSection(id, options = {}) {
  const element = document.getElementById(id)

  if (!element) return

  const offset = options.offset ?? 92

  const top =
    element.getBoundingClientRect().top +
    window.pageYOffset -
    offset

  window.scrollTo({
    top,
    behavior: 'smooth'
  })

  window.history.pushState(null, '', `#${id}`)
}