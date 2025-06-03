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
          // Якщо пошуковий запит закороткий, підвантажуємо всі бажання AJAX-ом
          if (searchType === 'wishes') {
            const wishlistId = container.dataset.wishlistId;
            fetch(`/wishlists/${wishlistId}/wishes/search?q=`)
              .then(res => res.json())
              .then(data => {
                if (data.success) updateWishesDisplay(data.wishes);
              });
          } else if (searchType === 'wishlists') {
            fetch('/wishlists/search?q=')
              .then(res => res.json())
              .then(data => {
                if (data.success) updateWishlistsView(data.wishlists, container);
              });
          }
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

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    const sortSelect = document.getElementById('sortSelect');
    const sortValue = sortSelect ? sortSelect.value : 'created_desc';
    const [sortBy, sortOrderRaw] = sortValue.split('_');
    const sortOrder = sortOrderRaw === 'desc' ? 'desc' : 'asc';

    try {
      const params = new URLSearchParams({
        q: searchTerm,
        sortBy: sortBy || 'created',
        sortOrder: sortOrder || 'desc'
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
  const addWishCard = document.getElementById('addWishCard');
  if (!container) return;

  // Перевіряємо, чи є активний пошук (завжди беремо актуальне поле)
  const searchInput = document.querySelector('[data-search="wishes"]');
  const isSearching = searchInput && searchInput.value.trim().length > 0;

  // Ховаємо картку додавання бажання під час будь-якого пошуку
  if (addWishCard) addWishCard.style.display = isSearching ? 'none' : '';

  if (!wishes.length) {
    container.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-dashed border-purple-200 min-h-[20rem]">
        <div class="flex items-center justify-center w-16 h-16 mb-6 bg-purple-50 rounded-full">
          <!-- Іконка fa-box-open Font Awesome -->
          <i class="fa-solid fa-box-open text-purple-300 text-4xl"></i>
        </div>
        <div class="text-xl font-semibold text-purple-600 mb-2">Ой, нічого не знайшлось.</div>
        <div class="text-gray-400 mb-1 text-center">Можливо, інше формулювання допоможе</div>
      </div>
    `;
    return;
  }

  container.innerHTML = wishes.map(wish => `
    <div class="relative group hover:shadow-md hover:border-purple-300 transition-colors duration-200">
      <div class="absolute top-4 right-4 z-10">
        <button onclick="event.preventDefault(); event.stopPropagation(); toggleWishMenu('${wish.id}')"
          class="p-2 text-gray-400 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        <div id="wishMenu${wish.id}"
          class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100">
          <div class="py-1">
            <button onclick="openEditWishModal(
              '${wish.id}',
              '${wish.title.replace(/'/g, '&#39;')}',
              '${(wish.description || '').replace(/'/g, '&#39;')}',
              '${wish.price || ''}',
              '${wish.currency || ''}',
              '${wish.priority || ''}',
              '${wish.link || ''}',
              '${wish.image_url || ''}'
            ); toggleWishMenu('${wish.id}');"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-3">
              <i class="fa-regular fa-pen-to-square text-purple-400"></i>
              Редагувати
            </button>
            <button
              onclick="openCompleteWishModal('${wish.id}', '${wish.title.replace(/'/g, '&#39;')}'); toggleWishMenu('${wish.id}');"
              class="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-3">
              <i class="fa-solid fa-wand-magic-sparkles text-purple-500"></i>
              Виконати бажання
            </button>
            <button
              onclick="openDeleteWishModal('/wishlists/${container.dataset.wishlistId}/wishes/${wish.id}/delete'); toggleWishMenu('${wish.id}');"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
              <i class="fa-regular fa-trash-can text-red-500"></i>
              Видалити
            </button>
          </div>
        </div>
      </div>
      <a href="/wishlists/${container.dataset.wishlistId}/wishes/${wish.id}" class="block">
        <div class="bg-white rounded-xl border border-gray-100 hover:border-purple-300 transition-colors duration-200 h-80 flex flex-col justify-between relative overflow-hidden group">
          <div class="w-full h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
            ${wish.image_url
              ? `<img src="${wish.image_url}" alt="${wish.title}" class="w-full h-full object-cover" loading="lazy">`
              : `<svg class="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>`}
          </div>
          <div class="flex flex-col justify-end flex-grow p-5">
            <h3 class="text-base font-semibold text-gray-900 mb-2 line-clamp-2 mt-2 flex items-center gap-2">
              ${wish.title}
            </h3>
            <div class="flex items-center justify-between mt-auto pt-2">
              ${wish.price && wish.price !== 0 && wish.price !== ''
                ? `<div class="text-sm text-gray-400 font-normal">
                      ${Math.round(wish.price)} <span class="text-xs">${wish.currency || 'UAH'}</span>
                    </div>`
                : ''}
              <span class="text-xs text-gray-400">
                ${wish.created_at ? new Date(wish.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }) : ''}
              </span>
            </div>
          </div>
        </div>
      </a>
    </div>
  `).join('');
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
      updateWishesDisplay(data.wishes, container); // було updateWishesView
    }
  } catch (error) {
    console.error('Search error:', error);
  }
}