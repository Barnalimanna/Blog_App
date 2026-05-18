const normalizeEditorLinks = (html) => {
  if (!html) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = doc.querySelectorAll('a');

  links.forEach((link) => {
    let href = link.getAttribute('href')?.trim();
    const text = link.textContent?.trim();

    if (!href && !text) return;

    if (!href) {
      href = text;
    }

    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#')
    ) {
      return;
    }

    if (href.includes('.') && !href.includes(' ') && !href.startsWith('/')) {
      link.setAttribute('href', `https://${href}`);
      return;
    }

    const query = encodeURIComponent(href || text);
    link.setAttribute('href', `https://www.google.com/search?q=${query}`);
  });

  return doc.body.innerHTML;
};

export default normalizeEditorLinks;