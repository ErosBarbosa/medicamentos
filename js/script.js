/**
 * Hórus Medicamentos - Core Logic
 * Handles data fetching, state management, and UI rendering.
 */

const STATE = {
    medicamentos: [],
    filtered: [],
    categories: new Set(),
    filter: {
        search: '',
        category: ''
    }
};

const ELEMENTS = {
    container: document.getElementById('medicamentosContainer'),
    searchInput: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    totalDisplay: document.getElementById('totalMedicamentos'),
    categoryDisplay: document.getElementById('categoriaAtual'),
    noResults: document.getElementById('noResults'),
    themeToggle: document.getElementById('themeToggle'),
    notification: document.getElementById('notification'),
    clearSearch: document.getElementById('clearSearch')
};

// --- Initialization ---

async function init() {
    try {
        await fetchMedicamentos();
        setupEventListeners();
        loadTheme();
        renderCategories();
        updateUI();
    } catch (error) {
        console.error("Falha ao inicializar:", error);
        showError("Erro ao carregar dados. Se estiver usando localmente, use um servidor local (Live Server).");
    }
}

async function fetchMedicamentos() {
    const response = await fetch('data/medicamentos.json');
    if (!response.ok) throw new Error('Network response was not ok');
    
    // Check if the data is inside a property or is the array itself
    const data = await response.json();
    STATE.medicamentos = Array.isArray(data) ? data : (data.medicamentos || []);
    STATE.filtered = [...STATE.medicamentos];
    
    // Extract Categories
    STATE.medicamentos.forEach(med => {
        if (med.categoria) STATE.categories.add(med.categoria);
    });
}

// --- UI Rendering ---

function renderCategories() {
    const options = Array.from(STATE.categories).sort();
    const fragment = document.createDocumentFragment();
    
    options.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        fragment.appendChild(option);
    });
    
    ELEMENTS.categoryFilter.appendChild(fragment);
}

function updateUI() {
    filterMedicamentos();
    renderMedicamentos();
    updateStats();
}

function filterMedicamentos() {
    const searchTerm = STATE.filter.search.toLowerCase();
    const categoryTerm = STATE.filter.category;

    STATE.filtered = STATE.medicamentos.filter(med => {
        const matchSearch = 
            (med.nome && med.nome.toLowerCase().includes(searchTerm)) || 
            (med.codigo && med.codigo.toLowerCase().includes(searchTerm)) ||
            (med.categoria && med.categoria.toLowerCase().includes(searchTerm));
        
        const matchCategory = 
            categoryTerm === '' || med.categoria === categoryTerm;

        return matchSearch && matchCategory;
    });
}

function renderMedicamentos() {
    ELEMENTS.container.innerHTML = '';

    if (STATE.filtered.length === 0) {
        ELEMENTS.noResults.classList.remove('hidden');
        ELEMENTS.container.classList.add('hidden'); // Hide grid to let empty state center
        return;
    }

    ELEMENTS.noResults.classList.add('hidden');
    ELEMENTS.container.classList.remove('hidden');

    const fragment = document.createDocumentFragment();
    
    // Limit rendering for performance if too many items, or implementing virtual scrolling
    // For now, render first 50 or all if filtered
    const limit = STATE.filtered.length > 200 ? 50 : STATE.filtered.length; 
    const itemsToRender = STATE.filtered.slice(0, limit);

    itemsToRender.forEach(med => {
        const card = document.createElement('div');
        card.className = 'card glass';
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${formatName(med.nome)}</h3>
                <span class="card-badge">${med.codigo}</span>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <span class="info-label">Apresentação</span>
                    <span class="info-value">${med.apresentacao || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Categoria</span>
                    <span class="info-value">${med.categoria || 'Geral'}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-copy" onclick="copyToClipboard('${med.codigo}')">
                    <i class="far fa-copy"></i> Copiar Código
                </button>
            </div>
        `;
        
        fragment.appendChild(card);
    });

    ELEMENTS.container.appendChild(fragment);

    // If we cut off results, maybe show a "Show more" indicator (omitted for now for simplicity)
}

function updateStats() {
    ELEMENTS.totalDisplay.textContent = STATE.filtered.length;
    ELEMENTS.categoryDisplay.textContent = STATE.filter.category || 'Todas';
    
    // Animate numbers simple
    ELEMENTS.totalDisplay.classList.add('pop');
    setTimeout(() => ELEMENTS.totalDisplay.classList.remove('pop'), 300);
}

// --- Utilities ---

function formatName(name) {
    if (!name) return 'Sem Nome';
    // Title Case (optional, keeping original uppercase usually better for medicines but let's just trim)
    return name.trim();
}

/**
 * Copies code to clipboard and shows toast
 * Made global to be accessible from HTML onclick
 */
window.copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showNotification();
    } catch (err) {
        console.error('Falha ao copiar:', err);
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        textArea.remove();
        showNotification();
    }
};

function showNotification() {
    const toast = ELEMENTS.notification;
    toast.classList.add('show');
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 500);
    }, 3000);
}

function showError(msg) {
    ELEMENTS.container.innerHTML = `<div class="error-msg" style="grid-column: 1/-1; text-align: center; color: var(--danger); padding: 2rem;">${msg}</div>`;
}

// --- Event Handlers ---

function setupEventListeners() {
    // Search with debounce
    let timeout;
    ELEMENTS.searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            STATE.filter.search = e.target.value;
            updateUI();
        }, 300);
    });

    // Category Filter
    ELEMENTS.categoryFilter.addEventListener('change', (e) => {
        STATE.filter.category = e.target.value;
        updateUI();
    });
    
    // Clear Search Button
    if(ELEMENTS.clearSearch) {
        ELEMENTS.clearSearch.addEventListener('click', () => {
             STATE.filter.search = '';
             STATE.filter.category = '';
             ELEMENTS.searchInput.value = '';
             ELEMENTS.categoryFilter.value = '';
             updateUI();
        });
    }

    // Theme Toggle
    ELEMENTS.themeToggle.addEventListener('click', toggleTheme);
}

// --- Theme Management ---

function loadTheme() {
    const savedTheme = localStorage.getItem('horus_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('horus_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = ELEMENTS.themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);
