class HackerDashboard {
    constructor() {
        this.startTime = Date.now();
        this.stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
        this.currentDate = new Date();
        this.currentLunarDate = new Date();
        this.todos = this.loadTodos();
        this.init();
    }

    init() {
        this.updateClocks();
        this.fetchWeatherData();
        this.fetchCryptoData();
        this.fetchGoldData();
        this.fetchStockData();
        this.generateCalendar();
        this.generateLunarCalendar();
        this.renderTodos();
        this.updateTodoBadge();
        this.setupEventListeners();
        
        // Set up intervals for real-time updates
        setInterval(() => this.updateClocks(), 1000);
        setInterval(() => this.fetchWeatherData(), 300000); // 5 minutes
        setInterval(() => this.fetchCryptoData(), 300000); // 5 minutes
        setInterval(() => this.fetchGoldData(), 300000); // 5 minutes
        setInterval(() => this.fetchStockData(), 300000); // 5 minutes
    }

    updateClocks() {
        // Houston time (Central Time - UTC-6)
        const houstonTime = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"});
        const houstonDate = new Date(houstonTime);
        
        const houstonTimeString = houstonDate.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const houstonDateString = houstonDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).toUpperCase();

        document.getElementById('mainTime').textContent = houstonTimeString;
        document.getElementById('mainDate').textContent = houstonDateString;

        // Saigon time (Indochina Time - UTC+7)
        const saigonTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"});
        const saigonDate = new Date(saigonTime);
        
        const saigonTimeString = saigonDate.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const saigonDateString = saigonDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).toUpperCase();

        document.getElementById('vnTime').textContent = saigonTimeString;
        document.getElementById('vnDate').textContent = saigonDateString;
    }

    updateSystemInfo() {
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
        
        const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            uptimeElement.textContent = uptimeString;
        }

        const lastUpdate = new Date().toLocaleTimeString('en-US', { hour12: false });
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = lastUpdate;
        }
    }


    async fetchWeatherData() {
        try {
            console.log('[WEATHER] Fetching weather data...');
            const response = await fetch('/api/weather');
            if (!response.ok) throw new Error('Weather API failed');
            
            const data = await response.json();
            console.log('[WEATHER] Data received:', data);
            
            const tempElement = document.getElementById('temperature');
            const descElement = document.getElementById('weatherDesc');
            const humidityElement = document.getElementById('humidity');
            const windElement = document.getElementById('windSpeed');
            
            if (tempElement) tempElement.textContent = `${Math.round(data.main.temp)}°F`;
            if (descElement) descElement.textContent = data.weather[0].description.toUpperCase();
            if (humidityElement) humidityElement.textContent = `${data.main.humidity}%`;
            if (windElement) windElement.textContent = `${Math.round(data.wind.speed)} mph`;
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError('weather', 'WEATHER DATA UNAVAILABLE');
        }
    }

    async fetchCryptoData() {
        try {
            console.log('[CRYPTO] Fetching crypto data...');
            const response = await fetch('/api/crypto');
            if (!response.ok) throw new Error('Crypto API failed');
            
            const data = await response.json();
            console.log('[CRYPTO] Data received:', data);
            
            // Bitcoin
            const btcPriceElement = document.getElementById('btcPrice');
            const btcChangeElement = document.getElementById('btcChange');
            
            if (btcPriceElement && data.bitcoin) {
                const btcPrice = data.bitcoin.usd;
                const btcChange = data.bitcoin.usd_24h_change;
                btcPriceElement.textContent = `$${btcPrice.toLocaleString()}`;
                this.updateChangeElement('btcChange', btcChange);
            }

            // Ethereum
            const ethPriceElement = document.getElementById('ethPrice');
            const ethChangeElement = document.getElementById('ethChange');
            
            if (ethPriceElement && data.ethereum) {
                const ethPrice = data.ethereum.usd;
                const ethChange = data.ethereum.usd_24h_change;
                ethPriceElement.textContent = `$${ethPrice.toLocaleString()}`;
                this.updateChangeElement('ethChange', ethChange);
            }
        } catch (error) {
            console.error('Crypto fetch error:', error);
            this.showError('crypto', 'CRYPTO DATA UNAVAILABLE');
        }
    }

    async fetchGoldData() {
        try {
            console.log('[GOLD] Fetching gold data...');
            const response = await fetch('/api/gold');
            if (!response.ok) throw new Error('Gold API failed');
            
            const data = await response.json();
            console.log('[GOLD] Data received:', data);
            
            const goldPriceElement = document.getElementById('goldPrice');
            const goldChangeElement = document.getElementById('goldChange');
            
            if (goldPriceElement && data && data.price) {
                goldPriceElement.textContent = `$${data.price.toFixed(2)}`;
                
                if (goldChangeElement) {
                    if (data.change !== undefined) {
                        goldChangeElement.textContent = `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%`;
                        goldChangeElement.className = `price-change ${data.change >= 0 ? 'positive' : 'negative'}`;
                    } else {
                        goldChangeElement.textContent = 'N/A';
                    }
                }
            }
        } catch (error) {
            console.error('Gold fetch error:', error);
            this.showError('gold', 'GOLD DATA UNAVAILABLE');
        }
    }

    async fetchStockData() {
        console.log('[STOCK] Fetching stock data...');
        const stockList = document.getElementById('stockList');
        if (!stockList) {
            console.error('[STOCK] stockList element not found');
            return;
        }
        
        // Add loading placeholder to maintain height during fetch
        stockList.innerHTML = '<div class="loading-placeholder">Loading stocks...</div>';

        // Clear loading placeholder before adding new items
        stockList.innerHTML = '';

        for (const symbol of this.stockSymbols) {
            try {
                console.log(`[STOCK] Fetching ${symbol}...`);
                const response = await fetch(`/api/stocks/${symbol}`);
                if (!response.ok) throw new Error(`Stock API failed for ${symbol}`);
                
                const data = await response.json();
                console.log(`[STOCK] ${symbol} data:`, data);
                const quote = data['Global Quote'];
                
                if (quote) {
                    const price = parseFloat(quote['05. price']);
                    const change = parseFloat(quote['09. change']);
                    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
                    
                    const stockItem = document.createElement('div');
                    stockItem.className = 'stock-item';
                    stockItem.innerHTML = `
                        <span class="stock-symbol">${symbol}</span>
                        <span class="stock-price">$${price.toFixed(2)}</span>
                        <span class="stock-change ${changePercent >= 0 ? 'positive' : 'negative'}">
                            ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%
                        </span>
                    `;
                    stockList.appendChild(stockItem);
                }
            } catch (error) {
                console.error(`Stock fetch error for ${symbol}:`, error);
                const stockItem = document.createElement('div');
                stockItem.className = 'stock-item';
                stockItem.innerHTML = `
                    <span class="stock-symbol">${symbol}</span>
                    <span class="stock-price">ERROR</span>
                    <span class="stock-change">N/A</span>
                `;
                stockList.appendChild(stockItem);
            }
        }
    }

    updateChangeElement(elementId, change) {
        const element = document.getElementById(elementId);
        const changeValue = change.toFixed(2);
        element.textContent = `${change >= 0 ? '+' : ''}${changeValue}%`;
        element.className = `crypto-change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    showError(section, message) {
        console.error(`[${section.toUpperCase()}] ${message}`);
        
        const errorElements = {
            weather: 'weatherInfo',
            crypto: 'cryptoInfo', 
            gold: 'goldInfo',
            stock: 'stockList'
        };
        
        const elementId = errorElements[section];
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = `<div class="error">${message}</div>`;
            }
        }
    }

    setupEventListeners() {
        const stockInput = document.getElementById('stockInput');
        stockInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const symbol = stockInput.value.trim().toUpperCase();
                if (symbol && !this.stockSymbols.includes(symbol)) {
                    this.stockSymbols.push(symbol);
                    this.fetchStockData();
                    stockInput.value = '';
                }
            }
        });

        // Add click-to-remove functionality for stock items
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('stock-symbol')) {
                const symbol = e.target.textContent;
                if (this.stockSymbols.length > 1) { // Keep at least one stock
                    this.stockSymbols = this.stockSymbols.filter(s => s !== symbol);
                    this.fetchStockData();
                }
            }
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        // Calendar navigation
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        
        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.generateCalendar();
            });
        }
        
        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.generateCalendar();
            });
        }

        // Lunar calendar navigation
        const prevLunarMonth = document.getElementById('prevLunarMonth');
        const nextLunarMonth = document.getElementById('nextLunarMonth');
        
        if (prevLunarMonth) {
            prevLunarMonth.addEventListener('click', () => {
                this.currentLunarDate.setMonth(this.currentLunarDate.getMonth() - 1);
                this.generateLunarCalendar();
            });
        }
        
        if (nextLunarMonth) {
            nextLunarMonth.addEventListener('click', () => {
                this.currentLunarDate.setMonth(this.currentLunarDate.getMonth() + 1);
                this.generateLunarCalendar();
            });
        }

        // Todo form submission
        const todoForm = document.getElementById('todoForm');
        if (todoForm) {
            todoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTodo();
            });
        }
    }

    generateCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonth = document.getElementById('currentMonth');
        
        if (!calendarGrid || !currentMonth) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month display
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                           'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        currentMonth.textContent = `${monthNames[month]} ${year}`;

        // Clear previous calendar
        calendarGrid.innerHTML = '';

        // Add day headers
        const dayHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-header';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Highlight today
            if (year === today.getFullYear() && 
                month === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    // Lunar calendar conversion functions
    solarToLunar(solarDate) {
        // Accurate Vietnamese lunar calendar conversion
        const year = solarDate.getFullYear();
        const month = solarDate.getMonth() + 1;
        const day = solarDate.getDate();
        const inputDate = new Date(year, month - 1, day);
        
        // For 2025, use accurate reference point: 11/09/2025 = 20/7 lunar
        if (year === 2025) {
            const referenceDate = new Date(2025, 8, 11); // Sep 11, 2025
            const referenceLunar = { month: 7, day: 20 };
            
            // Calculate days difference from reference
            const daysDiff = Math.floor((inputDate - referenceDate) / (1000 * 60 * 60 * 24));
            
            // Start from reference lunar date and add/subtract days
            let resultMonth = referenceLunar.month;
            let resultDay = referenceLunar.day + daysDiff;
            let resultYear = 2025;
            
            // Adjust for month boundaries (using 29.5 days average per lunar month)
            while (resultDay > 30) {
                resultDay -= 30;
                resultMonth++;
            }
            while (resultDay < 1) {
                resultDay += 30;
                resultMonth--;
            }
            
            // Handle year boundary
            if (resultMonth > 12) {
                resultYear++;
                resultMonth -= 12;
            } else if (resultMonth < 1) {
                resultYear--;
                resultMonth += 12;
            }
            
            return {
                year: resultYear,
                month: resultMonth,
                day: resultDay
            };
        }
        
        // Fallback for other years - simplified calculation
        const tetDates = {
            2024: new Date(2024, 1, 10), // Feb 10, 2024
            2025: new Date(2025, 0, 29), // Jan 29, 2025
            2026: new Date(2026, 1, 17), // Feb 17, 2026
        };
        
        let fallbackYear = year;
        const tetDate = tetDates[year] || new Date(year, 1, 10);
        
        if (inputDate < tetDate) {
            fallbackYear = year - 1;
        }
        
        const daysSinceTet = Math.floor((inputDate - tetDate) / (1000 * 60 * 60 * 24));
        
        let fallbackMonth, fallbackDay;
        if (daysSinceTet < 0) {
            const prevTetDate = tetDates[year - 1] || new Date(year - 1, 1, 10);
            const daysSincePrevTet = Math.floor((inputDate - prevTetDate) / (1000 * 60 * 60 * 24));
            fallbackMonth = Math.floor(daysSincePrevTet / 29.5) + 1;
            fallbackDay = (daysSincePrevTet % 29) + 1;
        } else {
            fallbackMonth = Math.floor(daysSinceTet / 29.5) + 1;
            fallbackDay = (daysSinceTet % 29) + 1;
        }
        
        fallbackMonth = Math.max(1, Math.min(12, fallbackMonth));
        fallbackDay = Math.max(1, Math.min(30, fallbackDay));
        
        return {
            year: fallbackYear,
            month: fallbackMonth,
            day: fallbackDay
        };
    }

    getLunarYearName(year) {
        const heavenlyStems = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
        const earthlyBranches = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
        const zodiacAnimals = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Heo'];
        
        const stemIndex = (year - 4) % 10;
        const branchIndex = (year - 4) % 12;
        
        return {
            stem: heavenlyStems[stemIndex],
            branch: earthlyBranches[branchIndex],
            animal: zodiacAnimals[branchIndex]
        };
    }

    getMoonPhase(date) {
        // More accurate moon phase calculation based on lunar cycle
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        
        // Calculate days since a known new moon (Jan 1, 2000 was close to new moon)
        const knownNewMoon = new Date(2000, 0, 6);
        const currentDate = new Date(year, month, day);
        const daysSinceKnownNewMoon = Math.floor((currentDate - knownNewMoon) / (1000 * 60 * 60 * 24));
        
        // Lunar cycle is approximately 29.53 days
        const lunarCycle = 29.53;
        const phasePosition = (daysSinceKnownNewMoon % lunarCycle) / lunarCycle;
        
        const phases = [
            { icon: '🌑', name: 'Trăng Mới', min: 0, max: 0.0625 },
            { icon: '🌒', name: 'Trăng Khuyết Đầu', min: 0.0625, max: 0.1875 },
            { icon: '🌓', name: 'Trăng Bán Nguyệt Đầu', min: 0.1875, max: 0.3125 },
            { icon: '🌔', name: 'Trăng Khuyết To Đầu', min: 0.3125, max: 0.4375 },
            { icon: '🌕', name: 'Trăng Tròn', min: 0.4375, max: 0.5625 },
            { icon: '🌖', name: 'Trăng Khuyết To Cuối', min: 0.5625, max: 0.6875 },
            { icon: '🌗', name: 'Trăng Bán Nguyệt Cuối', min: 0.6875, max: 0.8125 },
            { icon: '🌘', name: 'Trăng Khuyết Cuối', min: 0.8125, max: 1.0 }
        ];
        
        for (let phase of phases) {
            if (phasePosition >= phase.min && phasePosition < phase.max) {
                return phase;
            }
        }
        return phases[0];
    }

    generateLunarCalendar() {
        const lunarGrid = document.getElementById('lunarGrid');
        const currentLunarMonth = document.getElementById('currentLunarMonth');
        const lunarToday = document.getElementById('lunarToday');
        const lunarYear = document.getElementById('lunarYear');
        const lunarZodiac = document.getElementById('lunarZodiac');
        const moonPhase = document.getElementById('moonPhase');
        const moonPhaseName = document.getElementById('moonPhaseName');
        
        if (!lunarGrid || !currentLunarMonth) return;

        const year = this.currentLunarDate.getFullYear();
        const month = this.currentLunarDate.getMonth();
        
        // Update lunar month display
        const lunarMonthNames = ['Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
                               'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Chạp'];
        currentLunarMonth.textContent = `${lunarMonthNames[month]} ${year}`;

        // Update lunar info for today
        const today = new Date();
        const todayLunar = this.solarToLunar(today);
        const yearInfo = this.getLunarYearName(year);
        const moonInfo = this.getMoonPhase(today);
        
        if (lunarToday) lunarToday.textContent = `${lunarMonthNames[todayLunar.month - 1]}, Ngày ${todayLunar.day}`;
        if (lunarYear) lunarYear.textContent = `Năm ${yearInfo.stem} ${yearInfo.branch}`;
        if (lunarZodiac) lunarZodiac.textContent = `Tuổi ${yearInfo.animal}`;
        if (moonPhase) moonPhase.textContent = moonInfo.icon;
        if (moonPhaseName) moonPhaseName.textContent = moonInfo.name;

        // Clear previous calendar
        lunarGrid.innerHTML = '';

        // Add day headers
        const dayHeaders = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-header';
            header.textContent = day;
            lunarGrid.appendChild(header);
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'lunar-day empty';
            lunarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'lunar-day';
            
            const solarDate = new Date(year, month, day);
            const lunarInfo = this.solarToLunar(solarDate);
            
            // Solar date (small)
            const solarSpan = document.createElement('div');
            solarSpan.className = 'solar-date';
            solarSpan.textContent = day;
            
            // Lunar date
            const lunarSpan = document.createElement('div');
            lunarSpan.className = 'lunar-date';
            lunarSpan.textContent = lunarInfo.day;
            
            dayElement.appendChild(solarSpan);
            dayElement.appendChild(lunarSpan);

            // Check for special lunar days (mùng 1 và 15)
            if (lunarInfo.day === 1 || lunarInfo.day === 15) {
                dayElement.classList.add('special');
                
                // Update lunar date display to show month/day format
                lunarSpan.textContent = `${lunarInfo.day}/${lunarInfo.month}`;
            }

            // Highlight today
            if (year === today.getFullYear() && 
                month === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }

            lunarGrid.appendChild(dayElement);
        }
    }

    switchTab(tabName) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Add active class to clicked tab and corresponding panel
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Generate calendar when switching to calendar tab
        if (tabName === 'calendar') {
            this.generateCalendar();
            this.generateLunarCalendar();
        }
        
        // Render todos when switching to todo tab
        if (tabName === 'todo') {
            this.renderTodos();
        }
    }

    // Todo Management Functions
    loadTodos() {
        const stored = localStorage.getItem('bdashboard-todos');
        return stored ? JSON.parse(stored) : [];
    }

    saveTodos() {
        localStorage.setItem('bdashboard-todos', JSON.stringify(this.todos));
    }

    addTodo() {
        const contentInput = document.getElementById('todoContent');
        const dueDateInput = document.getElementById('todoDueDate');
        const prioritySelect = document.getElementById('todoPriority');

        const content = contentInput.value.trim();
        if (!content) return;

        const todo = {
            id: Date.now().toString(),
            content: content,
            dueDate: dueDateInput.value || null,
            priority: prioritySelect.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.renderTodos();
        this.updateTodoBadge();

        // Clear form
        contentInput.value = '';
        dueDateInput.value = '';
        prioritySelect.value = 'medium';
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateTodoBadge();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.renderTodos();
        this.updateTodoBadge();
    }

    formatDate(dateString) {
        if (!dateString) return null;
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hôm nay';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Ngày mai';
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    }

    renderTodos() {
        const todoItems = document.getElementById('todoItems');
        const todoStats = document.getElementById('todoStats');
        
        if (!todoItems) return;

        if (this.todos.length === 0) {
            todoItems.innerHTML = '<div class="empty-state">There are no tasks!</div>';
            if (todoStats) todoStats.textContent = '0 tasks';
            return;
        }

        // Sort todos: incomplete first, then by priority, then by due date
        const sortedTodos = [...this.todos].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        todoItems.innerHTML = sortedTodos.map(todo => {
            const formattedDate = this.formatDate(todo.dueDate);
            const priorityText = {
                high: 'High',
                medium: 'Normal', 
                low: 'Low'
            };

            return `
                <div class="todo-item ${todo.completed ? 'completed' : ''}">
                    <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                         onclick="dashboard.toggleTodo('${todo.id}')"></div>
                    <div class="todo-main">
                        <div class="todo-content">${todo.content}</div>
                        <div class="todo-meta">
                            ${formattedDate ? `<div class="todo-due-date">📅 ${formattedDate}</div>` : ''}
                            <div class="todo-priority priority-${todo.priority}">
                                ⚡ ${priorityText[todo.priority]}
                            </div>
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="delete-btn" onclick="dashboard.deleteTodo('${todo.id}')">DELETE</button>
                    </div>
                </div>
            `;
        }).join('');

        // Update stats
        if (todoStats) {
            const completed = this.todos.filter(t => t.completed).length;
            const total = this.todos.length;
            todoStats.textContent = `${completed}/${total} completed`;
        }
    }

    updateTodoBadge() {
        const todoBadge = document.getElementById('todoBadge');
        if (!todoBadge) return;

        const incompleteTasks = this.todos.filter(todo => !todo.completed).length;
        
        if (incompleteTasks === 0) {
            todoBadge.classList.add('hidden');
        } else {
            todoBadge.classList.remove('hidden');
            todoBadge.textContent = incompleteTasks;
        }
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new HackerDashboard();
});

// Add some hacker-style console messages
console.log('%c[SYSTEM] BDashboard Initialized', 'color: #00ff41; font-family: monospace;');
console.log('%c[INFO] All systems operational', 'color: #00ff41; font-family: monospace;');
console.log('%c[TIP] Click on stock symbols to remove them', 'color: #888; font-family: monospace;');
