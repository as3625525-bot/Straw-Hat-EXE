/**
 * Category Page - Individual Category Logic
 */

(function() {
  'use strict';

  // Get category ID from URL
  const categoryId = Utils.getUrlParam('id');

  // DOM Elements
  const elements = {
    // Header
    backBtn: document.getElementById('backBtn'),
    categoryEmoji: document.getElementById('categoryEmoji'),
    categoryName: document.getElementById('categoryName'),
    categoryStats: document.getElementById('categoryStats'),
    
    // Entry Form
    entryText: document.getElementById('entryText'),
    saveEntryBtn: document.getElementById('saveEntryBtn'),
    charCount: document.getElementById('charCount'),
    
    // Entries
    entriesList: document.getElementById('entriesList'),
    entryCount: document.getElementById('entryCount')
  };

  // Current category data
  let category = null;

  /**
   * Initialize the category page
   */
  function init() {
    // Initialize animations
    Animations.initBackground();

    // Check if user is logged in
    const user = Store.getUser();
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    // Get category data
    category = Store.getCategoryById(categoryId);
    if (!category) {
      Toast.error('Category not found');
      setTimeout(() => window.location.href = 'index.html', 1000);
      return;
    }

    // Render page
    renderHeader();
    renderEntries();
    bindEvents();

    // Animate page entrance
    document.querySelector('.page')?.classList.add('page-enter');
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Back button
    elements.backBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      Animations.pageTransition('index.html');
    });

    // Save entry
    elements.saveEntryBtn?.addEventListener('click', handleSaveEntry);
    
    // Ctrl+Enter to save
    elements.entryText?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSaveEntry();
      }
    });

    // Character count
    elements.entryText?.addEventListener('input', updateCharCount);

    // Add ripple to buttons
    document.querySelectorAll('.btn').forEach(btn => {
      Animations.addRipple(btn);
    });
  }

  /**
   * Render header
   */
  function renderHeader() {
    if (elements.categoryEmoji) {
      elements.categoryEmoji.textContent = category.emoji;
      elements.categoryEmoji.classList.add('float');
    }
    
    if (elements.categoryName) {
      elements.categoryName.textContent = category.name;
    }

    // Update page title
    document.title = `${category.name} - Progress Pro`;

    updateStats();
  }

  /**
   * Update stats
   */
  function updateStats() {
    const entries = Store.getEntriesByCategory(categoryId);
    const count = entries.length;

    if (elements.categoryStats) {
      elements.categoryStats.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
    }

    if (elements.entryCount) {
      elements.entryCount.textContent = count;
    }
  }

  /**
   * Update character count
   */
  function updateCharCount() {
    if (!elements.charCount || !elements.entryText) return;
    
    const count = elements.entryText.value.length;
    elements.charCount.textContent = `${count} characters`;
  }

  /**
   * Handle save entry
   */
  function handleSaveEntry() {
    const text = elements.entryText?.value.trim();

    if (!text) {
      Toast.error('Please write something first');
      Animations.shake(elements.entryText);
      elements.entryText?.focus();
      return;
    }

    const result = Store.addEntry(categoryId, text);

    if (result.success) {
      elements.entryText.value = '';
      updateCharCount();
      renderEntries();
      updateStats();
      
      // Animate button
      Animations.pop(elements.saveEntryBtn);
      
      Toast.success('Entry saved! 🎉');
    } else {
      Toast.error(result.message);
    }
  }

  /**
   * Render entries list
   */
  function renderEntries() {
    if (!elements.entriesList) return;

    const entries = Store.getEntriesByCategory(categoryId);

    if (entries.length === 0) {
      elements.entriesList.innerHTML = `
        <div class="empty-state">
          <div class="icon">📝</div>
          <h3>No entries yet</h3>
          <p>Start tracking your progress by adding your first entry above!</p>
        </div>
      `;
      return;
    }

    elements.entriesList.innerHTML = entries.map((entry, index) => `
      <div class="entry-card" data-id="${entry.id}" style="animation-delay: ${index * 0.05}s">
        <div class="content">${Utils.escapeHtml(entry.text)}</div>
        <div class="footer">
          <span class="date">
            <span>📅</span> ${Utils.formatRelativeDate(entry.createdAt)}
          </span>
          <button class="btn btn-danger delete-btn" data-id="${entry.id}">
            🗑️ Delete
          </button>
        </div>
      </div>
    `).join('');

    // Bind delete handlers
    elements.entriesList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => handleDeleteEntry(btn.dataset.id));
    });

    // Animate entries
    Animations.staggerChildren(elements.entriesList, 50);
  }

  /**
   * Handle delete entry
   */
  function handleDeleteEntry(entryId) {
    const card = elements.entriesList.querySelector(`[data-id="${entryId}"]`);
    
    if (card) {
      card.style.transform = 'translateX(100%)';
      card.style.opacity = '0';
      
      setTimeout(() => {
        Store.deleteEntry(entryId);
        renderEntries();
        updateStats();
        Toast.success('Entry deleted');
      }, 300);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
