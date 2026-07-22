/* NHM Museum — Interactive JavaScript */
document.addEventListener('DOMContentLoaded', () => {
    // Hide Preloader
    const loader = document.getElementById('museumLoader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
        }, 1200);
    }

    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Exhibition Category Filters (if present)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const exhibitCards = document.querySelectorAll('.exhibit-card');
    if (filterBtns.length > 0 && exhibitCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                exhibitCards.forEach(card => {
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

    // Ticket Booking Form Submission
    const ticketForm = document.getElementById('ticketForm');
    const bookingSuccess = document.getElementById('bookingSuccess');
    if (ticketForm) {
        ticketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (bookingSuccess) {
                ticketForm.style.display = 'none';
                bookingSuccess.style.display = 'block';
            }
        });
    }
});
