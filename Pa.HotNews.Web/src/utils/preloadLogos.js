import { SOURCES } from '../config/newsUiConfig';

export function preloadSourceLogos({ theme } = {}) {
  try {
    const urls = new Set();

    for (const key of Object.keys(SOURCES || {})) {
      const cfg = SOURCES[key];
      const logo = cfg?.logo;
      if (!logo) continue;

      if (typeof logo === 'string') {
        urls.add(logo);
      } else if (logo && typeof logo === 'object') {
        if (theme && logo[theme]) urls.add(logo[theme]);
        if (logo.dark) urls.add(logo.dark);
        if (logo.light) urls.add(logo.light);
        if (logo.warm) urls.add(logo.warm);
      }
    }

    for (const url of urls) {
      try {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.src = url;
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
}
