/**
 * Home Page - Main Dashboard Logic
 */

(function() {
  'use strict';

  const elements = {
    loginSection:      document.getElementById('loginSection'),
    dashboardSection:  document.getElementById('dashboardSection'),
    usernameInput:     document.getElementById('usernameInput'),
    loginBtn:          document.getElementById('loginBtn'),
    logoutBtn:         document.getElementById('logoutBtn'),
    userAvatar:        document.getElementById('userAvatar'),
    userName:          document.getElementById('userName'),
    streakCount:       document.getElementById('streakCount'),
    statTotal:         document.getElementById('statTotal'),
    statToday:         document.getElementById('statToday'),
    statWeek:          document.getElementById('statWeek'),
    statCategories:    document.getElementById('statCategories'),
    categoriesGrid:    document.getElementById('categoriesGrid'),
    addCategoryBtn:    document.getElementById('addCategoryBtn'),
    modalBackdrop:     document.getElementById('modalBackdrop'),
    modal:             document.getElementById('modal'),
    modalClose:        document.getElementById('modalClose'),
    newCategoryInput:  document.getElementById('newCategoryInput'),
    createCategoryBtn: document.getElementById('createCategoryBtn')
  };

  function init() {
    Animations.initBackground();
    const user = Store.getUser();
    if (user) {
      showDashboard(user);
    } else {
      showLogin();
    }
    bindEvents();
  }

  function bindEvents() {
    elements.loginBtn?.addEventListener('click', handleLogin);
    elements.usernameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
    elements.logoutBtn?.addEventListener('click', handleLogout);
    elements.addCategoryBtn?.addEventListener('click', openModal);
    elements.modalClose?.addEventListener('click', closeModal);
    elements.modalBackdrop?.addEventListener('click', closeModal);
    elements.createCategoryBtn?.addEventListener('click', handleCreateCategory);
    elements.newCategoryInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCreateCategory();
      if (e.key === 'Escape') closeModal();
    });
    document.querySelectorAll('.btn').forEach(btn => Animations.addRipple(btn));
  }

  function showLogin() {
    if (elements.loginSection) {
      elements.loginSection.style.display = 'block';
      elements.loginSection.style.opacity = '1';
      elements.loginSection.style.transform = '';
    }
    if (elements.dashboardSection) {
      elements.dashboardSection.style.display = 'none';
    }
    setTimeout(() => elements.usernameInput?.focus(), 100);
  }

  function showDashboard(user) {
    if (elements.loginSection) {
      elements.loginSection.style.display = 'none';
    }
    if (elements.dashboardSection) {
      elements.dashboardSection.style.display = 'block';
      elements.dashboardSection.style.opacity = '1';
      elements.dashboardSection.style.transform = '';
    }
    if (elements.userAvatar) elements.userAvatar.textContent = Utils.getInitials(user.name);
    if (elements.userName)   elements.userName.textContent = user.name;
    updateStreak();
    updateStats();
    renderCategories();
    setTimeout(() => {
      if (elements.categoriesGrid) Animations.staggerChildren(elements.categoriesGrid, 80);
    }, 200);
  }

  function handleLogin() {
    const name = elements.usernameInput?.value.trim();
    if (!name) {
      Toast.error('Please enter your name');
      Animations.shake(elements.usernameInput);
      elements.usernameInput?.focus();
      return;
    }
    Store.setUser(name);
    const user = Store.getUser();
    if (elements.loginSection) {
      elements.loginSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      elements.loginSection.style.opacity = '0';
      elements.loginSection.style.transform = 'translateY(-20px)';
    }
    setTimeout(() => {
      showDashboard(user);
      Toast.success('Welcome, ' + name + '! 🎉');
    }, 300);
  }

  function handleLogout() {
    Store.removeUser();
    if (elements.dashboardSection) {
      elements.dashboardSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      elements.dashboardSection.style.opacity = '0';
      elements.dashboardSection.style.transform = 'translateY(20px)';
    }
    setTimeout(() => {
      if (elements.dashboardSection) {
        elements.dashboardSection.style.transition = '';
        elements.dashboardSection.style.opacity = '';
        elements.dashboardSection.style.transform = '';
      }
      showLogin();
      Toast.success('See you soon! 👋');
    }, 300);
  }

  function updateStreak() {
    const streak = Store.getStreak();
    if (elements.streakCount) Animations.animateCounter(elements.streakCount, streak, 500);
  }

  function updateStats() {
    const stats = Store.getStats();
    if (elements.statTotal)      Animations.animateCounter(elements.statTotal,      stats.total,      800);
    if (elements.statToday)      Animations.animateCounter(elements.statToday,      stats.today,      600);
    if (elements.statWeek)       Animations.animateCounter(elements.statWeek,       stats.week,       700);
    if (elements.statCategories) Animations.animateCounter(elements.statCategories, stats.categories, 500);
  }

  function renderCategories() {
    if (!elements.categoriesGrid) return;
    const categories = Store.getCategories();
    elements.categoriesGrid.innerHTML = categories.map(cat => {
      const entryCount = Store.getEntryCountByCategory(cat.id);
      return `
        <a href="category.html?id=${cat.id}" class="category-card" data-id="${cat.id}">
          <span class="emoji">${cat.emoji}</span>
          <span class="name">${Utils.escapeHtml(cat.name)}</span>
          <span class="entry-count">
            <span>📝</span> ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}
          </span>
        </a>
      `;
    }).join('');

    elements.categoriesGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        Animations.pageTransition(card.getAttribute('href'));
      });
    });
  }

  function openModal() {
    elements.modalBackdrop?.classList.add('active');
    elements.modal?.classList.add('active');
    if (elements.newCategoryInput) {
      elements.newCategoryInput.value = '';
      setTimeout(() => elements.newCategoryInput.focus(), 100);
    }
  }

  function closeModal() {
    elements.modalBackdrop?.classList.remove('active');
    elements.modal?.classList.remove('active');
  }

  function handleCreateCategory() {
    const name = elements.newCategoryInput?.value.trim();
    if (!name) {
      Toast.error('Please enter a category name');
      Animations.shake(elements.newCategoryInput);
      return;
    }
    const result = Store.addCategory(name);
    if (result.success) {
      closeModal();
      renderCategories();
      updateStats();
      setTimeout(() => {
        const newCard = elements.categoriesGrid.querySelector('[data-id="' + result.category.id + '"]');
        if (newCard) {
          Animations.pop(newCard);
          newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      Toast.success('Category "' + name + '" created! ✨');
    } else {
      Toast.error(result.message);
      Animations.shake(elements.newCategoryInput);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
