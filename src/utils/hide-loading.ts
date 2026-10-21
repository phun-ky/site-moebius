/**
 * Remove the full-screen loading overlay that `index.html` starts with.
 */
export const hideLoading = (): void => {
  document.querySelector('.ph.loading')?.classList.remove('is-loading');
};
