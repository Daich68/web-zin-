class PoemRenderer {
    constructor() {
        this.container = document.getElementById('poems-container');
        this.loadingIndicator = document.querySelector('.loading-indicator');
        this.scrollToTopBtn = document.getElementById('scroll-to-top');
        this.poems = [];
        this.currentPage = 1;
        this.poemsPerPage = 5;
        this.isLoading = false;
        this.setupScrollToTop();
        this.setupScrollHandling();
    }

    async init() {
        try {
            const response = await fetch('poems.json');
            const data = await response.json();
            this.poems = data.poems;
            this.renderPoems();
            this.setupInfiniteScroll();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading poems:', error);
            this.showError();
        }
    }

    createPoemElement(poem) {
        const article = document.createElement('article');
        article.className = `poem-container ${poem.layout}-layout`;
        
        article.innerHTML = `
            <div class="poem" data-poem-id="${poem.id}" data-lang="ru">
                <h2 class="poem-title">${poem.title}</h2>
                <div class="poem-content">
                    ${poem.content.map(line => `<p>${line}</p>`).join('')}
                </div>
                <div class="poem-info">
                    <div class="poet-info">
                        <span class="poet-name">— ${poem.author}</span>
                        <span class="poem-date">${poem.date}</span>
                    </div>
                </div>
                <div class="poem-tags">
                    ${poem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        const poemElement = article.querySelector('.poem');
        poemElement.addEventListener('click', () => this.togglePoemLanguage(poem, poemElement));

        return article;
    }

    togglePoemLanguage(poem, element) {
        const isRussian = element.getAttribute('data-lang') === 'ru';
        
        // Подготавливаем новый контент
        const newTitle = isRussian ? poem.titleKo : poem.title;
        const newContent = isRussian ? poem.contentKo : poem.content;
        
        // Добавляем класс для анимации
        element.style.opacity = '0';
        
        setTimeout(() => {
            // Обновляем язык
            element.setAttribute('data-lang', isRussian ? 'ko' : 'ru');
            
            // Обновляем контент
            element.querySelector('.poem-title').textContent = newTitle;
            element.querySelector('.poem-content').innerHTML = 
                newContent.map(line => `<p>${line}</p>`).join('');
            
            // Показываем обновленный контент
            element.style.opacity = '1';
        }, 300);
    }

    renderPoems(append = false) {
        const start = (this.currentPage - 1) * this.poemsPerPage;
        const end = start + this.poemsPerPage;
        const poemsToRender = this.poems.slice(start, end);

        if (!append) {
            this.container.innerHTML = '';
        }

        const fragment = document.createDocumentFragment();

        poemsToRender.forEach(poem => {
            const poemElement = this.createPoemElement(poem);
            fragment.appendChild(poemElement);
        });

        this.container.appendChild(fragment);
    }

    setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if (this.isLoading) return;

            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 500) {
                this.loadMorePoems();
            }
        });
    }

    async loadMorePoems() {
        if (this.currentPage * this.poemsPerPage >= this.poems.length) return;

        this.isLoading = true;
        this.showLoading();

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.currentPage++;
        this.renderPoems(true);
        this.isLoading = false;
        this.hideLoading();
    }

    showLoading() {
        this.loadingIndicator.style.display = 'block';
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }

    showError() {
        this.container.innerHTML = `
            <div class="error-message">
                <p>Error loading poems. Please try again later.</p>
            </div>
        `;
    }

    setupScrollToTop() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset || document.documentElement.scrollTop;
            if (scrolled > window.innerHeight) {
                this.scrollToTopBtn.classList.add('visible');
            } else {
                this.scrollToTopBtn.classList.remove('visible');
            }
        });

        this.scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    setupScrollHandling() {
        let lastScrollTime = 0;
        const scrollCooldown = 500; // Задержка между скроллами в мс

        window.addEventListener('wheel', (e) => {
            const now = Date.now();
            if (now - lastScrollTime < scrollCooldown) {
                e.preventDefault();
                return;
            }

            const sections = [
                document.querySelector('.site-header'),
                ...Array.from(document.querySelectorAll('.poem-container')),
                document.querySelector('footer')
            ];

            const currentSection = sections.find(section => {
                const rect = section.getBoundingClientRect();
                return rect.top <= 50 && rect.bottom > 50;
            });

            if (!currentSection) return;

            const currentIndex = sections.indexOf(currentSection);
            const direction = e.deltaY > 0 ? 1 : -1;
            const targetIndex = currentIndex + direction;

            if (targetIndex >= 0 && targetIndex < sections.length) {
                e.preventDefault();
                sections[targetIndex].scrollIntoView({ behavior: 'smooth' });
                lastScrollTime = now;
            }
        }, { passive: false });

        // Обработка клавиш
        window.addEventListener('keydown', (e) => {
            const now = Date.now();
            if (now - lastScrollTime < scrollCooldown) return;

            const sections = [
                document.querySelector('.site-header'),
                ...Array.from(document.querySelectorAll('.poem-container')),
                document.querySelector('footer')
            ];

            const currentSection = sections.find(section => {
                const rect = section.getBoundingClientRect();
                return rect.top <= 50 && rect.bottom > 50;
            });

            if (!currentSection) return;

            const currentIndex = sections.indexOf(currentSection);
            let targetIndex = currentIndex;

            switch(e.key) {
                case 'ArrowDown':
                case 'PageDown':
                    targetIndex++;
                    break;
                case 'ArrowUp':
                case 'PageUp':
                    targetIndex--;
                    break;
                default:
                    return;
            }

            if (targetIndex >= 0 && targetIndex < sections.length) {
                e.preventDefault();
                sections[targetIndex].scrollIntoView({ behavior: 'smooth' });
                lastScrollTime = now;
            }
        });
    }
}

// Initialize the poem renderer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const poemRenderer = new PoemRenderer();
    poemRenderer.init();
});
