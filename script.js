(() => {
    'use strict';

    const header = document.getElementById('header');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    const overlay = document.getElementById('navOverlay');

    const setNavOpen = (open) => {
        nav.classList.toggle('is-open', open);
        hamburger.classList.toggle('is-open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
        document.body.classList.toggle('is-nav-open', open);
        if (overlay) {
            overlay.hidden = !open;
            overlay.classList.toggle('is-open', open);
        }
    };

    hamburger.addEventListener('click', () => {
        setNavOpen(!nav.classList.contains('is-open'));
    });

    overlay?.addEventListener('click', () => setNavOpen(false));

    nav.addEventListener('click', (e) => {
        if (!e.target.closest('a')) return;
        setNavOpen(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
            setNavOpen(false);
            hamburger.focus();
        }
    });

    // キャンペーン終了は「当月末 23:59:59」を締め切りとして毎月自動更新する
    const deadline = (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    })();
    const countdownTargets = [document.getElementById('countdown'), document.getElementById('countdownSp')];
    const pad = (n) => String(n).padStart(2, '0');
    const tickCountdown = () => {
        const diff = deadline - Date.now();
        const text = diff <= 0
            ? '終了しました'
            : `${Math.floor(diff / 86400000)}日 ${pad(Math.floor(diff / 3600000) % 24)}:${pad(Math.floor(diff / 60000) % 60)}:${pad(Math.floor(diff / 1000) % 60)}`;
        countdownTargets.forEach((el) => { if (el) el.textContent = text; });
    };
    tickCountdown();
    setInterval(tickCountdown, 1000);

    const rateDate = document.getElementById('rateDate');
    if (rateDate) {
        const now = new Date();
        rateDate.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 10:00 更新`;
    }

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal], .compare').forEach((el) => revealObserver.observe(el));

    const countUp = (el) => {
        const goal = Number(el.dataset.count);
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / 1400, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(goal * eased).toLocaleString('ja-JP');
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };
    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            countUp(entry.target);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.6 });
    document.querySelectorAll('.counter').forEach((el) => counterObserver.observe(el));

    document.querySelectorAll('.faq__q').forEach((btn) => {
        btn.addEventListener('click', () => {
            const panel = btn.nextElementSibling;
            const isOpen = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!isOpen));
            panel.style.maxHeight = isOpen ? '' : `${panel.scrollHeight}px`;
        });
    });

    const form = document.getElementById('form');
    const rules = {
        name: (v) => (v.trim() ? '' : 'お名前をご入力ください。'),
        tel: (v) => (/^0\d{8,12}$/.test(v.replace(/[-\s]/g, '')) ? '' : '電話番号を正しくご入力ください。'),
        category: (v) => (v ? '' : '品目をお選びください。')
    };

    const validateField = (field) => {
        const message = rules[field.name](field.value);
        const output = form.querySelector(`[data-error-for="${field.name}"]`);
        if (output) output.textContent = message;
        field.classList.toggle('is-error', Boolean(message));
        return !message;
    };

    form.addEventListener('input', (e) => {
        if (e.target.name in rules) validateField(e.target);
    });
    form.addEventListener('change', (e) => {
        if (e.target.name in rules) validateField(e.target);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fields = [...form.elements].filter((el) => el.name in rules);
        if (!fields.map(validateField).every(Boolean)) {
            form.querySelector('.is-error')?.focus();
            return;
        }
        form.querySelectorAll('input, select, textarea, button').forEach((el) => { el.disabled = true; });
        document.getElementById('formDone').hidden = false;
    });
})();
