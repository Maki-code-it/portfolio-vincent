document.addEventListener('DOMContentLoaded', () => {

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // ===== Theme (Light / Dark Liquid Glass) =====
    // The initial data-theme is set by an inline script in <head> to avoid a flash.
    const themeToggle = document.querySelector('.theme-toggle');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    let accentRGB = '10, 108, 255';

    function readAccent() {
        accentRGB = getComputedStyle(root).getPropertyValue('--accent-rgb').trim() || accentRGB;
    }

    function storedTheme() {
        try {
            const t = localStorage.getItem('theme');
            return (t === 'light' || t === 'dark') ? t : null;
        } catch (e) {
            return null;
        }
    }

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        if (themeToggle) {
            themeToggle.setAttribute('aria-checked', String(theme === 'dark'));
        }
        readAccent();
    }

    function setTheme(theme, persist) {
        if (!reduceMotion) {
            root.classList.add('theme-anim');
            clearTimeout(setTheme.timer);
            setTheme.timer = setTimeout(() => root.classList.remove('theme-anim'), 650);
        }
        applyTheme(theme);
        if (persist) {
            try { localStorage.setItem('theme', theme); } catch (e) { /* storage unavailable */ }
        }
    }

    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
        });
    }

    // Follow the OS setting until the visitor makes an explicit choice
    systemDark.addEventListener('change', (e) => {
        if (!storedTheme()) setTheme(e.matches ? 'dark' : 'light', false);
    });

    // ===== Mobile Menu Toggle =====
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', String(open));
        });

        // Close the menu after choosing an in-page link (e.g. projects.html#video-editing-projects)
        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    document.querySelectorAll('.nav-links a.active').forEach(a => a.setAttribute('aria-current', 'page'));

    // ===== Custom Cursor Animation =====
    const cursor = document.querySelector('.cursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursor && !cursor.classList.contains('visible')) {
            cursorX = mouseX;
            cursorY = mouseY;
            cursor.classList.add('visible');
        }
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        }
        requestAnimationFrame(animateCursor);
    }
    if (cursor && finePointer) animateCursor();

    // ===== Expand Cursor on Hover =====
    const hoverElements = document.querySelectorAll('a, .btn, .card, .hamburger, .theme-toggle, .pdf-close');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor && cursor.classList.add('expand'));
        el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('expand'));
    });

    // ===== Trail Canvas Effect (skipped for reduced motion / touch) =====
    const canvas = document.getElementById('neon-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    if (canvas && ctx && !reduceMotion && finePointer) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        let needsClear = false;
        const maxParticles = 50;

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
                this.life = 100;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= 2;
                if (this.size > 0.2) this.size -= 0.05;
            }

            draw() {
                ctx.fillStyle = `rgba(${accentRGB}, ${this.life / 100})`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = `rgb(${accentRGB})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        document.addEventListener('mousemove', (e) => {
            if (particles.length < maxParticles) {
                particles.push(new Particle(e.clientX, e.clientY));
            }
        });

        function animateParticles() {
            if (particles.length || needsClear) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                needsClear = particles.length > 0;

                for (let i = particles.length - 1; i >= 0; i--) {
                    particles[i].update();
                    particles[i].draw();

                    if (particles[i].life <= 0) {
                        particles.splice(i, 1);
                    }
                }
                if (particles.length) needsClear = true;
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        // ===== Resize Canvas on Window Resize =====
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // ===== Create Floating Background Particles =====
    function createFloatingParticles() {
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(particle);
        }
    }
    if (!reduceMotion) createFloatingParticles();

    // ===== Click Ripple Effect =====
    document.addEventListener('click', (e) => {
        if (reduceMotion) return;
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        ripple.style.width = '10px';
        ripple.style.height = '10px';
        ripple.style.borderRadius = '50%';
        ripple.style.border = `2px solid rgb(${accentRGB})`;
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9997';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.boxShadow = `0 0 14px rgba(${accentRGB}, 0.5)`;
        document.body.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});
