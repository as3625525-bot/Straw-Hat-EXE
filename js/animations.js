/**
 * Animations - Animation Controllers
 */

const Animations = {
  _bgInitialized: false,

  initBackground() {
    // FIX: Guard against duplicate initialization (e.g. called twice on same page)
    if (this._bgInitialized) return;
    this._bgInitialized = true;

    const bg = document.createElement('div');
    bg.className = 'bg-animated';
    bg.innerHTML = `
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    `;
    document.body.prepend(bg);

    const grid = document.createElement('div');
    grid.className = 'grid-lines';
    document.body.prepend(grid);

    const particles = document.createElement('div');
    particles.className = 'particles';
    for (let i = 0; i < 10; i++) {
      particles.innerHTML += '<div class="particle"></div>';
    }
    document.body.prepend(particles);
  },

  addRipple(element) {
    // FIX: Don't add multiple ripple listeners to the same element
    if (element._rippleAdded) return;
    element._rippleAdded = true;
    element.classList.add('ripple');
    element.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top  = (e.clientY - rect.top)  + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  },

  staggerChildren(parent, delay) {
    delay = delay || 100;
    const children = parent.children;
    Array.from(children).forEach((child, index) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(20px)';
      setTimeout(() => {
        child.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      }, index * delay);
    });
  },

  animateCounter(element, target, duration) {
    duration = duration || 1000;
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target) || increment === 0) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current);
      }
    }, 16);
  },

  observeElements(selector, animationClass) {
    animationClass = animationClass || 'slide-up';
    const elements = document.querySelectorAll(selector);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    elements.forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  },

  async pageTransition(url) {
    const main = document.querySelector('main') || document.body;
    main.classList.add('page-exit');
    await new Promise(resolve => setTimeout(resolve, 300));
    window.location.href = url;
  },

  shake(element) {
    if (!element) return;
    element.style.animation = 'none';
    element.offsetHeight; // reflow
    element.style.animation = 'shake 0.5s ease-in-out';
  },

  pop(element) {
    if (!element) return;
    element.classList.add('pop');
    setTimeout(() => element.classList.remove('pop'), 300);
  },

  typewriter(element, text, speed) {
    speed = speed || 50;
    element.textContent = '';
    let i = 0;
    return new Promise(resolve => {
      const timer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }
};

// FIX: Only inject shake keyframes once
if (!document.getElementById('animations-shake-style')) {
  const style = document.createElement('style');
  style.id = 'animations-shake-style';
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Animations;
} else {
  window.Animations = Animations;
}
