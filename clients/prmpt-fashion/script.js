/* PRMPT Fashion — Interactive JavaScript */
document.addEventListener('DOMContentLoaded', () => {
    // Hide Preloader
    const loader = document.getElementById('fashionLoader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
        }, 1000);
    }

    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Collection Category Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    const collectionCards = document.querySelectorAll('.collection-card');
    if (filterBtns.length > 0 && collectionCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                collectionCards.forEach(card => {
                    const cat = card.getAttribute('data-category');
                    if (filter === 'all' || cat === filter) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Atelier Consultation Form Submission
    const atelierForm = document.getElementById('atelierForm');
    const atelierSuccess = document.getElementById('atelierSuccess');
    if (atelierForm) {
        atelierForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (atelierSuccess) {
                atelierForm.style.display = 'none';
                atelierSuccess.style.display = 'block';
            }
        });
    }
});
