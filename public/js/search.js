document.addEventListener('DOMContentLoaded', function() {
  const searchInputs = document.querySelectorAll('[data-search]');
  
  searchInputs.forEach(input => {
    let timeout = null;
    
    input.addEventListener('input', function() {
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        const searchTerm = this.value.trim();
        const searchType = this.dataset.search;
        const container = document.querySelector(this.dataset.target);
        
        if (searchTerm.length < 2) {
          // Якщо пошуковий запит закороткий, показуємо все
          document.querySelectorAll('.searchable-item').forEach(item => {
            item.style.display = '';
          });
          return;
        }
        
        if (searchType === 'wishlists') {
          searchWishlists(searchTerm, container);
        } else if (searchType === 'wishes') {
          searchWishes(searchTerm, container);
        }
      }, 300); // Затримка для оптимізації продуктивності
    });
  });
});

let searchTimeout;

function handleSearch(event) {
  const searchInput = event.target;
  const searchTerm = searchInput.value.trim();
  const container = document.querySelector(searchInput.dataset.target);
  const wishlistId = container.dataset.wishlistId;

  // Reset timeout
  clearTimeout(searchTimeout);

  // Чекаємо поки користувач закінчить вводити
  searchTimeout = setTimeout(async () => {
    // Отримуємо налаштування фільтрів
    const filters = {
      includePriority: document.getElementById('includePriority')?.checked || false,
      includeStatus: document.getElementById('includeStatus')?.checked || false,
      includePrice: document.getElementById('includePrice')?.checked || false,
      sortBy: document.getElementById('sortBy')?.value,
      sortOrder: document.getElementById('sortOrder')?.value
    };

    try {
      // Формуємо URL з параметрами
      const params = new URLSearchParams({
        q: searchTerm,
        ...filters
      });

      const response = await fetch(`/wishlists/${wishlistId}/wishes/search?${params}`);
      const data = await response.json();

      if (data.success) {
        updateWishesDisplay(data.wishes);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, 300);
}

function updateWishesDisplay(wishes) {
  const container = document.getElementById('wishesContainer');
  if (!container) return;

  // Оновлюємо відображення результатів
  container.innerHTML = wishes.length ? wishes.map(wish => `
    <div class="wish-card ${wish.status === 'completed' ? 'completed' : ''}">
      <h3>${wish.title}</h3>
      <p>${wish.description || ''}</p>
      <div class="wish-details">
        <span class="priority ${wish.priority}">${wish.priority}</span>
        <span class="price">${wish.price ? `${wish.price} ${wish.currency}` : ''}</span>
      </div>
    </div>
  `).join('') : '<p class="empty-state">Бажань не знайдено</p>';
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('[data-search="wishes"]');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
});

async function searchWishlists(term, container) {
  try {
    const response = await fetch(`/wishlists/search?q=${encodeURIComponent(term)}`);
    const data = await response.json();
    
    if (data.success) {
      updateWishlistsView(data.wishlists, container);
    }
  } catch (error) {
    console.error('Search error:', error);
  }
}

async function searchWishes(term, container) {
  try {
    const wishlistId = container.dataset.wishlistId;
    const response = await fetch(`/wishlists/${wishlistId}/wishes/search?q=${encodeURIComponent(term)}`);
    const data = await response.json();
    
    if (data.success) {
      updateWishesView(data.wishes, container);
    }
  } catch (error) {
    console.error('Search error:', error);
  }
}