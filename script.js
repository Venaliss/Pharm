// Глобальные переменные
let cart = JSON.parse(localStorage.getItem('pharmacyCart')) || [];
let products = [];
let symptoms = [];
let selectedSymptoms = [];

// DOM элементы
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const searchModalClose = document.getElementById('searchModalClose');
const searchInput = document.getElementById('searchInput');
const searchSubmit = document.getElementById('searchSubmit');
const searchResults = document.getElementById('searchResults');

const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const cartModalClose = document.getElementById('cartModalClose');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const totalPrice = document.getElementById('totalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');

const catalogGrid = document.getElementById('catalogGrid');
const catalogLoading = document.getElementById('catalogLoading');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const catalogSearch = document.getElementById('catalogSearch');

const symptomsGrid = document.getElementById('symptomsGrid');
const selectedSymptomsDiv = document.getElementById('selectedSymptoms');
const selectedSymptomsList = document.getElementById('selectedSymptomsList');
const findMedicinesBtn = document.getElementById('findMedicinesBtn');
const medicinesResults = document.getElementById('medicinesResults');
const medicinesResultsGrid = document.getElementById('medicinesResultsGrid');

const productModal = document.getElementById('productModal');
const productModalClose = document.getElementById('productModalClose');
const productModalTitle = document.getElementById('productModalTitle');
const productModalContent = document.getElementById('productModalContent');

const contactForm = document.getElementById('contactForm');

// Данные о симптомах
const symptomsData = [
    { id: 1, name: 'Головная боль', category: 'pain' },
    { id: 2, name: 'Температура', category: 'fever' },
    { id: 3, name: 'Кашель', category: 'cold' },
    { id: 4, name: 'Насморк', category: 'cold' },
    { id: 5, name: 'Боль в горле', category: 'cold' },
    { id: 6, name: 'Тошнота', category: 'stomach' },
    { id: 7, name: 'Изжога', category: 'stomach' },
    { id: 8, name: 'Боль в животе', category: 'stomach' },
    { id: 9, name: 'Бессонница', category: 'sleep' },
    { id: 10, name: 'Стресс', category: 'stress' },
    { id: 11, name: 'Усталость', category: 'vitamins' },
    { id: 12, name: 'Боль в суставах', category: 'pain' },
    { id: 13, name: 'Аллергия', category: 'allergy' },
    { id: 14, name: 'Высокое давление', category: 'heart' },
    { id: 15, name: 'Боль в сердце', category: 'heart' }
];

// Функция для создания изображения с fallback
function createProductImage(imagePath, productName) {
    return `
        <div class="product-image">
            <img src="${imagePath}" alt="${productName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="product-image-fallback" style="display: none;">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
            </div>
        </div>
    `;
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProducts();
    renderSymptoms();
    updateCartDisplay();
});

// Инициализация приложения
function initializeApp() {
    console.log('Аптека "Здоровье" инициализирована');
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Модальные окна
    searchBtn.addEventListener('click', () => showModal(searchModal));
    searchModalClose.addEventListener('click', () => hideModal(searchModal));
    cartBtn.addEventListener('click', () => showModal(cartModal));
    cartModalClose.addEventListener('click', () => hideModal(cartModal));
    productModalClose.addEventListener('click', () => hideModal(productModal));

    // Поиск
    searchSubmit.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Каталог
    categoryFilter.addEventListener('change', filterProducts);
    sortFilter.addEventListener('change', filterProducts);
    catalogSearch.addEventListener('input', debounce(filterProducts, 300));

    // Корзина
    checkoutBtn.addEventListener('click', checkout);

    // Форма обратной связи
    contactForm.addEventListener('submit', handleContactForm);

    // Закрытие модальных окон по клику вне их
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });

    // Закрытие checkoutModal по клику вне окна
    window.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            hideModal(checkoutModal);
        }
    });
}

// Загрузка продуктов (имитация API)
async function loadProducts() {
    try {
        showLoading(true);
        console.log('Начинаем загрузку продуктов...');
        
        // Загружаем данные из JSON файла
        const response = await fetch('./data.json');
        console.log('Ответ сервера:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        products = data.medicines;
        console.log('✅ Загружено лекарств из JSON:', products.length);
        renderProducts(products);
        showLoading(false);
    } catch (error) {
        console.error('❌ Ошибка загрузки продуктов:', error);
        showLoading(false);
        showError('Не удалось загрузить каталог товаров. Используем встроенные данные.');
        
        // Fallback: используем встроенные данные
        products = getFallbackProducts();
        console.log('📦 Используем fallback данные:', products.length, 'лекарств');
        renderProducts(products);
    }
}

// Fallback данные для случаев, когда JSON недоступен
function getFallbackProducts() {
    return [
        {
            id: 1,
            name: 'Парацетамол',
            description: 'Обезболивающее и жаропонижающее средство',
            price: 150,
            category: 'pain',
            symptoms: ['Головная боль', 'Температура', 'Боль в суставах'],
            usage: 'Принимать по 1-2 таблетки до 4 раз в день. Не превышать дозировку.',
            contraindications: 'Индивидуальная непереносимость, тяжелые заболевания печени',
            image: 'images/paracetamol.jpg',
            popularity: 95
        },
        {
            id: 2,
            name: 'Ибупрофен',
            description: 'Противовоспалительное и обезболивающее средство',
            price: 200,
            category: 'pain',
            symptoms: ['Головная боль', 'Боль в суставах', 'Температура'],
            usage: 'По 1 таблетке 3-4 раза в день после еды',
            contraindications: 'Язвенная болезнь, беременность, детский возраст до 12 лет',
            image: 'images/ibuprofen.jpg',
            popularity: 88
        },
        {
            id: 3,
            name: 'Аспирин',
            description: 'Ацетилсалициловая кислота для разжижения крови',
            price: 120,
            category: 'heart',
            symptoms: ['Высокое давление', 'Боль в сердце'],
            usage: 'По 1 таблетке в день для профилактики тромбозов',
            contraindications: 'Язвенная болезнь, гемофилия, детский возраст',
            image: 'images/aspirin.jpg',
            popularity: 75
        },
        {
            id: 4,
            name: 'Амоксициллин',
            description: 'Антибиотик широкого спектра действия',
            price: 350,
            category: 'antibiotics',
            symptoms: ['Боль в горле', 'Температура'],
            usage: 'По 1 капсуле 3 раза в день. Курс лечения 7-10 дней',
            contraindications: 'Аллергия на пенициллины, беременность',
            image: 'images/amoxicillin.jpg',
            popularity: 82
        },
        {
            id: 5,
            name: 'Лоратадин',
            description: 'Антигистаминный препарат от аллергии',
            price: 180,
            category: 'allergy',
            symptoms: ['Аллергия'],
            usage: '1 таблетка в день независимо от приема пищи',
            contraindications: 'Беременность, кормление грудью, детский возраст до 2 лет',
            image: 'images/loratadine.jpg',
            popularity: 90
        },
        {
            id: 6,
            name: 'Омепразол',
            description: 'Ингибитор протонной помпы для лечения изжоги',
            price: 280,
            category: 'stomach',
            symptoms: ['Изжога', 'Боль в животе'],
            usage: '1 капсула в день утром натощак',
            contraindications: 'Беременность, детский возраст, индивидуальная непереносимость',
            image: 'images/omeprazole.jpg',
            popularity: 85
        },
        {
            id: 7,
            name: 'Витамин C',
            description: 'Аскорбиновая кислота для укрепления иммунитета',
            price: 90,
            category: 'vitamins',
            symptoms: ['Усталость', 'Температура'],
            usage: '1-2 таблетки в день во время еды',
            contraindications: 'Индивидуальная непереносимость',
            image: 'images/vitamin-c.jpg',
            popularity: 92
        },
        {
            id: 8,
            name: 'Мелатонин',
            description: 'Гормон сна для нормализации сна',
            price: 220,
            category: 'sleep',
            symptoms: ['Бессонница'],
            usage: '1 таблетка за 30 минут до сна',
            contraindications: 'Беременность, кормление грудью, аутоиммунные заболевания',
            image: 'images/melatonin.jpg',
            popularity: 78
        },
        {
            id: 9,
            name: 'Валериана',
            description: 'Успокоительное средство растительного происхождения',
            price: 110,
            category: 'stress',
            symptoms: ['Стресс', 'Бессонница'],
            usage: '1-2 таблетки 3 раза в день',
            contraindications: 'Индивидуальная непереносимость',
            image: 'images/valerian.jpg',
            popularity: 80
        },
        {
            id: 10,
            name: 'Активированный уголь',
            description: 'Энтеросорбент для очищения организма',
            price: 80,
            category: 'stomach',
            symptoms: ['Тошнота', 'Боль в животе'],
            usage: '1 таблетка на 10 кг веса 3-4 раза в день',
            contraindications: 'Язвенная болезнь, кровотечения ЖКТ',
            image: 'images/activated-charcoal.jpg',
            popularity: 87
        },
        {
            id: 11,
            name: 'Цитрамон',
            description: 'Комбинированный препарат от головной боли',
            price: 95,
            category: 'pain',
            symptoms: ['Головная боль'],
            usage: '1-2 таблетки при необходимости, не более 4 раз в день',
            contraindications: 'Язвенная болезнь, гипертония, беременность',
            image: 'images/citramon.jpg',
            popularity: 83
        },
        {
            id: 12,
            name: 'Фурацилин',
            description: 'Антисептик для полоскания горла',
            price: 60,
            category: 'cold',
            symptoms: ['Боль в горле'],
            usage: '1 таблетка на стакан теплой воды, полоскать 3-4 раза в день',
            contraindications: 'Индивидуальная непереносимость',
            image: 'images/furacilin.jpg',
            popularity: 76
        },
        {
            id: 13,
            name: 'Називин',
            description: 'Сосудосуживающие капли от насморка',
            price: 140,
            category: 'cold',
            symptoms: ['Насморк'],
            usage: '1-2 капли в каждую ноздрю 2-3 раза в день',
            contraindications: 'Атрофический ринит, детский возраст до 1 года',
            image: 'images/nazivin.jpg',
            popularity: 89
        },
        {
            id: 14,
            name: 'Мукалтин',
            description: 'Отхаркивающее средство от кашля',
            price: 70,
            category: 'cold',
            symptoms: ['Кашель'],
            usage: '1-2 таблетки 3 раза в день перед едой',
            contraindications: 'Язвенная болезнь, индивидуальная непереносимость',
            image: 'images/mukaltin.jpg',
            popularity: 81
        },
        {
            id: 15,
            name: 'Магний B6',
            description: 'Витаминный комплекс для нервной системы',
            price: 320,
            category: 'vitamins',
            symptoms: ['Стресс', 'Усталость'],
            usage: '1 таблетка 2 раза в день во время еды',
            contraindications: 'Почечная недостаточность, индивидуальная непереносимость',
            image: 'images/magnesium-b6.jpg',
            popularity: 86
        }
    ];
}

// Отображение продуктов
function renderProducts(productsToRender) {
    if (!productsToRender || productsToRender.length === 0) {
        catalogGrid.innerHTML = '<p class="no-products">Товары не найдены</p>';
        return;
    }

    catalogGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-id="${product.id}">
            ${createProductImage(product.image, product.name)}
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price} ₽</div>
                <div class="product-actions">
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        В корзину
                    </button>
                    <button class="view-details" onclick="showProductDetails(${product.id})">
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Фильтрация и сортировка продуктов
function filterProducts() {
    let filteredProducts = [...products];
    
    // Фильтр по категории
    const category = categoryFilter.value;
    if (category) {
        filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    // Поиск по названию
    const searchTerm = catalogSearch.value.toLowerCase();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Сортировка
    const sortBy = sortFilter.value;
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'popular':
            filteredProducts.sort((a, b) => b.popularity - a.popularity);
            break;
    }
    
    renderProducts(filteredProducts);
}

// Отображение симптомов
function renderSymptoms() {
    symptomsGrid.innerHTML = symptomsData.map(symptom => `
        <button class="symptom-btn" data-id="${symptom.id}" onclick="toggleSymptom(${symptom.id})">
            ${symptom.name}
        </button>
    `).join('');
}

// Переключение симптома
function toggleSymptom(symptomId) {
    const symptom = symptomsData.find(s => s.id === symptomId);
    const symptomBtn = document.querySelector(`[data-id="${symptomId}"]`);
    
    if (selectedSymptoms.find(s => s.id === symptomId)) {
        // Удалить симптом
        selectedSymptoms = selectedSymptoms.filter(s => s.id !== symptomId);
        symptomBtn.classList.remove('selected');
    } else {
        // Добавить симптом
        selectedSymptoms.push(symptom);
        symptomBtn.classList.add('selected');
    }
    
    updateSelectedSymptoms();
}

// Обновление отображения выбранных симптомов
function updateSelectedSymptoms() {
    if (selectedSymptoms.length === 0) {
        selectedSymptomsDiv.style.display = 'none';
        medicinesResults.style.display = 'none';
        return;
    }
    
    selectedSymptomsDiv.style.display = 'block';
    selectedSymptomsList.innerHTML = selectedSymptoms.map(symptom => `
        <span class="selected-symptom-tag">
            ${symptom.name}
            <button class="remove-symptom" onclick="removeSymptom(${symptom.id})">&times;</button>
        </span>
    `).join('');
}

// Удаление симптома
function removeSymptom(symptomId) {
    selectedSymptoms = selectedSymptoms.filter(s => s.id !== symptomId);
    const symptomBtn = document.querySelector(`[data-id="${symptomId}"]`);
    if (symptomBtn) {
        symptomBtn.classList.remove('selected');
    }
    updateSelectedSymptoms();
}

// Поиск лекарств по симптомам
function findMedicinesBySymptoms() {
    if (selectedSymptoms.length === 0) {
        alert('Выберите хотя бы один симптом');
        return;
    }
    
    const selectedSymptomNames = selectedSymptoms.map(s => s.name);
    const recommendedMedicines = products.filter(product => 
        product.symptoms.some(symptom => selectedSymptomNames.includes(symptom))
    );
    
    if (recommendedMedicines.length === 0) {
        medicinesResultsGrid.innerHTML = '<p>По выбранным симптомам лекарства не найдены</p>';
    } else {
        medicinesResultsGrid.innerHTML = recommendedMedicines.map(product => `
            <div class="product-card" data-id="${product.id}">
                ${createProductImage(product.image, product.name)}
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${product.price} ₽</div>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart(${product.id})">
                            В корзину
                        </button>
                        <button class="view-details" onclick="showProductDetails(${product.id})">
                            Подробнее
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    medicinesResults.style.display = 'block';
}

// Добавление в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
    showNotification(`${product.name} добавлен в корзину`);
}

// Обновление корзины
function updateCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        cartTotal.style.display = 'none';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price} ₽</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="cart-item-quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = `${total} ₽`;
    cartTotal.style.display = 'block';
}

// Обновление количества товара
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }
    
    saveCart();
    updateCartDisplay();
}

// Обновление отображения корзины
function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    updateCart();
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('pharmacyCart', JSON.stringify(cart));
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    hideModal(cartModal);
    showModal(document.getElementById('checkoutModal'));
}

// Обработка формы оформления заказа
const checkoutForm = document.getElementById('checkoutForm');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutModalClose = document.getElementById('checkoutModalClose');

checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Имитация оформления заказа
    alert('Спасибо за заказ! Мы свяжемся с вами для подтверждения.');
    cart = [];
    saveCart();
    updateCartDisplay();
    hideModal(checkoutModal);
});

checkoutModalClose.addEventListener('click', function() {
    hideModal(checkoutModal);
});

// Поиск
function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    const results = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.symptoms.some(symptom => 
            symptom.toLowerCase().includes(query.toLowerCase())
        )
    );
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p>По вашему запросу ничего не найдено</p>';
    } else {
        searchResults.innerHTML = results.map(product => `
            <div class="search-result-item" onclick="showProductDetails(${product.id}); hideModal(searchModal);">
                <div class="search-result-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="search-result-fallback" style="display: none;">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                    </div>
                </div>
                <div class="search-result-content">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <span class="search-result-price">${product.price} ₽</span>
                </div>
            </div>
        `).join('');
    }
}

// Показать детали продукта
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    productModalTitle.textContent = product.name;
    productModalContent.innerHTML = `
        <div class="product-details">
            <div class="product-details-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="product-details-fallback" style="display: none;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                </div>
            </div>
            <div class="product-details-info">
                <h4>${product.name}</h4>
                <div class="product-details-price">${product.price} ₽</div>
                <p class="product-details-description">${product.description}</p>
                <div class="product-details-usage">
                    <h5>Применение:</h5>
                    <p>${product.usage}</p>
                </div>
                <div class="product-details-usage">
                    <h5>Противопоказания:</h5>
                    <p>${product.contraindications}</p>
                </div>
                <div class="product-details-actions">
                    <button class="add-to-cart" onclick="addToCart(${product.id}); hideModal(productModal);">
                        Добавить в корзину
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(productModal);
}

// Показать модальное окно
function showModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Скрыть модальное окно
function hideModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Показать/скрыть загрузку
function showLoading(show) {
    catalogLoading.style.display = show ? 'block' : 'none';
}

// Показать ошибку
function showError(message) {
    console.error(message);
    // Можно заменить на более красивое уведомление
}

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Обработка формы обратной связи
function handleContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !message) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Имитация отправки формы
    alert('Спасибо за обращение! Мы свяжемся с вами в ближайшее время.');
    contactForm.reset();
}

// Плавная прокрутка к секции
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Debounce функция
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Привязка функций к глобальной области
window.addToCart = addToCart;
window.showProductDetails = showProductDetails;
window.toggleSymptom = toggleSymptom;
window.removeSymptom = removeSymptom;
window.updateQuantity = updateQuantity;
window.scrollToSection = scrollToSection;

// Привязка кнопки поиска лекарств
findMedicinesBtn.addEventListener('click', findMedicinesBySymptoms);

// Добавление CSS анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .product-image {
        position: relative;
        height: 200px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    
    .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .product-image:hover img {
        transform: scale(1.05);
    }
    
    .product-image-fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 3rem;
    }
    
    .search-result-item {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .search-result-item:hover {
        background: #f9fafb;
    }
    
    .search-result-image {
        width: 60px;
        height: 60px;
        background: #f3f4f6;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    
    .search-result-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .search-result-fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
    }
    
    .search-result-content {
        flex: 1;
    }
    
    .search-result-content h4 {
        margin: 0 0 0.5rem 0;
        color: #1f2937;
    }
    
    .search-result-content p {
        margin: 0 0 0.5rem 0;
        color: #6b7280;
        font-size: 0.875rem;
    }
    
    .search-result-price {
        color: #10b981;
        font-weight: 600;
    }
    
    .product-details-image {
        position: relative;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        overflow: hidden;
    }
    
    .product-details-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .product-details-fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 4rem;
    }
`;
document.head.appendChild(style); 