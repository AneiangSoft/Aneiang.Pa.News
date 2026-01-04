window.hotnewsTheme = {
  set: (theme) => {
    try {
      document.documentElement.setAttribute('data-theme', theme || 'light');
    } catch { /* ignore */ }
  }
};

