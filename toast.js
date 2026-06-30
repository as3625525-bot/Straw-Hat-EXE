/**
 * Toast - Notification System
 */

const Toast = {
  container: null,

  /**
   * Initialize toast container
   */
  init() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);
  },

  /**
   * Show toast notification
   */
  show(message, type = 'success', duration = 4000) {
    this.init();

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="icon">${icons[type] || icons.info}</span>
      <span class="message">${message}</span>
      <button class="close" aria-label="Close">&times;</button>
    `;

    // Close button handler
    toast.querySelector('.close').addEventListener('click', () => this.hide(toast));

    this.container.appendChild(toast);

    // Auto hide
    if (duration > 0) {
      setTimeout(() => this.hide(toast), duration);
    }

    return toast;
  },

  /**
   * Hide toast with animation
   */
  hide(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.classList.add('hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  },

  /**
   * Shorthand methods
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  },

  error(message, duration) {
    return this.show(message, 'error', duration);
  },

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  },

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Toast;
} else {
  window.Toast = Toast;
}
