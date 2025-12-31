/**
 * KATE stage LASH - Main JavaScript
 * Luxury Beauty Salon Website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initLoading();
    initAOS();
    initHeader();
    initHamburger();
    initSmoothScroll();
    initMenuTabs();
    initVoiceSlider();
    initParallax();
    initVideoBackground();
});

/**
 * Loading Screen
 */
function initLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    const body = document.body;

    body.classList.add('loading');

    // Hide loading screen after animation completes
    window.addEventListener('load', function() {
        setTimeout(function() {
            loadingScreen.classList.add('hidden');
            body.classList.remove('loading');
        }, 2200); // Wait for loading animation to complete
    });

    // Fallback: Hide loading screen after 4 seconds max
    setTimeout(function() {
        if (!loadingScreen.classList.contains('hidden')) {
            loadingScreen.classList.add('hidden');
            body.classList.remove('loading');
        }
    }, 4000);
}

/**
 * Initialize AOS (Animate On Scroll)
 */
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            disable: 'mobile'
        });
    }
}

/**
 * Header Scroll Effect
 */
function initHeader() {
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        const scrollY = window.scrollY;

        if (scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
}

/**
 * Hamburger Menu
 */
function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on nav links
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    navMenu.addEventListener('click', function(e) {
        if (e.target === navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    const header = document.getElementById('header');

    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Menu Category Tabs
 */
function initMenuTabs() {
    const tabs = document.querySelectorAll('.menu-tab');
    const categories = document.querySelectorAll('.menu-category');

    if (tabs.length === 0) return;

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');

            // Update active tab
            tabs.forEach(function(t) {
                t.classList.remove('active');
            });
            this.classList.add('active');

            // Show target category
            categories.forEach(function(category) {
                category.classList.remove('active');
                if (category.id === targetCategory) {
                    category.classList.add('active');
                }
            });

            // Reinitialize AOS for new content
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        });
    });
}

/**
 * Voice (Testimonials) Slider
 */
function initVoiceSlider() {
    const track = document.querySelector('.voice-track');
    const cards = document.querySelectorAll('.voice-card');
    const prevBtn = document.querySelector('.voice-btn.prev');
    const nextBtn = document.querySelector('.voice-btn.next');

    if (!track || cards.length === 0) return;

    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    const totalCards = cards.length;

    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function updateSlider() {
        const cardWidth = cards[0].offsetWidth;
        const gap = 24; // var(--space-xl) = 2rem = 32px, but gap is slightly less
        const translateX = -currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(${translateX}px)`;
    }

    function nextSlide() {
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        updateSlider();
    }

    function prevSlide() {
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
        updateSlider();
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // Auto-slide every 5 seconds
    let autoSlide = setInterval(nextSlide, 5000);

    // Pause auto-slide on hover
    track.addEventListener('mouseenter', function() {
        clearInterval(autoSlide);
    });

    track.addEventListener('mouseleave', function() {
        autoSlide = setInterval(nextSlide, 5000);
    });

    // Handle resize
    window.addEventListener('resize', function() {
        cardsPerView = getCardsPerView();
        currentIndex = Math.min(currentIndex, Math.max(0, totalCards - cardsPerView));
        updateSlider();
    });

    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(autoSlide);
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        autoSlide = setInterval(nextSlide, 5000);
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
}

/**
 * Parallax Effect for Decorative Elements
 */
function initParallax() {
    const decoElements = document.querySelectorAll('.deco-circle');

    if (decoElements.length === 0) return;

    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;

        decoElements.forEach(function(el, index) {
            const speed = 0.1 + (index * 0.05);
            const yPos = scrollY * speed;
            el.style.transform = `translate(${index % 2 === 0 ? yPos * 0.1 : -yPos * 0.1}px, ${yPos}px)`;
        });

        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

/**
 * Video Background Handler
 */
function initVideoBackground() {
    const video = document.getElementById('hero-video');

    if (!video) return;

    // Ensure video plays on mobile
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    // Try to play video
    const playPromise = video.play();

    if (playPromise !== undefined) {
        playPromise.catch(function() {
            // Auto-play was prevented, show poster image instead
            video.style.display = 'none';
        });
    }

    // Pause video when not in viewport (for performance)
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                video.play();
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.25 });

    observer.observe(video);

    // Handle visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            video.pause();
        } else {
            const rect = video.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                video.play();
            }
        }
    });
}

/**
 * Lazy Loading for Images (if needed)
 */
function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(function(img) {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    } else {
        // Fallback to IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }
}

/**
 * Gallery Lightbox (Placeholder for future implementation)
 */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(function(item) {
        item.addEventListener('click', function() {
            // Lightbox implementation would go here
            console.log('Gallery item clicked - lightbox would open');
        });
    });
}

/**
 * Counter Animation for Statistics (if needed)
 */
function animateCounter(element, target, duration) {
    let start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const current = Math.floor(easeProgress * target);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }

    requestAnimationFrame(updateCounter);
}

/**
 * Form Validation (for future contact form)
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;

    inputs.forEach(function(input) {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }

        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                input.classList.add('error');
            }
        }

        // Phone validation (Japanese format)
        if (input.type === 'tel' && input.value) {
            const phoneRegex = /^[0-9\-+\s()]*$/;
            if (!phoneRegex.test(input.value)) {
                isValid = false;
                input.classList.add('error');
            }
        }
    });

    return isValid;
}

/**
 * Utility: Debounce Function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = function() {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle Function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(function() {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Accessibility: Reduce Motion Check
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Apply reduced motion preferences
if (prefersReducedMotion()) {
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-base', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
    document.documentElement.style.setProperty('--transition-slower', '0ms');
}

/**
 * Scroll to Top Button (optional enhancement)
 */
function initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollBtn.setAttribute('aria-label', 'ページトップへ戻る');
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', debounce(function() {
        if (window.scrollY > 600) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }, 100), { passive: true });

    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize scroll to top if needed
// initScrollToTop();
