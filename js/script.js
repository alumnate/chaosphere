document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 🔗 API CONFIGURATION
    // -------------------------------------------------------------
    // To host the frontend on GitHub Pages and backend via Ngrok:
    // 1. Run your Ngrok tunnel (e.g., `ngrok http 5000`)
    // 2. Paste the HTTPS forwarding URL below.
    // Example: window.CHAOSPHERE_API = 'https://1234-abcd.ngrok-free.app/api';
    // -------------------------------------------------------------
    // Placeholder for GitHub Pages + Ngrok:
    window.CHAOSPHERE_API_OVERRIDE = 'https://tumular-heedless-gail.ngrok-free.dev/api';
    // window.CHAOSPHERE_API = 'https://tumular-heedless-gail.ngrok-free.dev/api';
    // window.CHAOSPHERE_API = 'https://needle-preserve-bloom-testimony.trycloudflare.com/api';
    // Offline-only mode: no frontend <-> backend connectivity.
    // (function resolveApiBase() {
    //     const storedApi = localStorage.getItem('chaosphere-api');
    //     if (storedApi) {
    //         // window.CHAOSPHERE_API = storedApi;
    //         // return;
    //         const normalizedStored = storedApi.replace(/\/$/, '');
    //         window.CHAOSPHERE_API = normalizedStored.endsWith('/api')
    //             ? normalizedStored
    //             : `${normalizedStored}/api`;
    //         return;
    //     }
    //
    //     if (window.location.protocol === 'file:') {
    //         // window.CHAOSPHERE_API = 'https://tumular-heedless-gail.ngrok-free.dev/api';
    //         window.CHAOSPHERE_API = 'https://needle-preserve-bloom-testimony.trycloudflare.com/api';
    //         return;
    //     }
    //
    //     if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    //         window.CHAOSPHERE_API = `${window.location.origin}/api`;
    //         return;
    //     }
    //
    //     // window.CHAOSPHERE_API = 'https://tumular-heedless-gail.ngrok-free.dev/api';
    //     window.CHAOSPHERE_API = 'https://needle-preserve-bloom-testimony.trycloudflare.com/api';
    // })();
    // window.CHAOSPHERE_API = '';
    // // In-memory only state (no localStorage persistence).
    // window.CHAOSPHERE_STATE = {
    //     teamName: '',
    //     balance: 1000,
    //     amount: '',
    //     leaderboard: [
    //         { team_name: 'Team Polaris', balance: 1200 },
    //         { team_name: 'Team Nova', balance: 980 },
    //         { team_name: 'Team Orion', balance: 860 },
    //         { team_name: 'Team Atlas', balance: 640 }
    //     ]
    // };

    // Backend-connected mode: resolve API base from storage or hostname.
    // (function resolveApiBase() {
    //     const storedApi = localStorage.getItem('chaosphere-api');
    //     if (storedApi) {
    //         const normalizedStored = storedApi.replace(/\/$/, '');
    //         window.CHAOSPHERE_API = normalizedStored.endsWith('/api')
    //             ? normalizedStored
    //             : `${normalizedStored}/api`;
    //         return;
    //     }
    //
    //     if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    //         window.CHAOSPHERE_API = `${window.location.origin}/api`;
    //         return;
    //     }
    //
    //     window.CHAOSPHERE_API = `${window.location.origin}/api`;
    // })();

    // Local-first mode: always use localhost when running locally.
    (function resolveLocalApiBase() {
        if (window.CHAOSPHERE_API_OVERRIDE) {
            const normalizedOverride = window.CHAOSPHERE_API_OVERRIDE.replace(/\/$/, '');
            window.CHAOSPHERE_API = normalizedOverride.endsWith('/api')
                ? normalizedOverride
                : `${normalizedOverride}/api`;
            return;
        }

        if (window.location.protocol === 'file:'
            || window.location.hostname === 'localhost'
            || window.location.hostname === '127.0.0.1') {
            window.CHAOSPHERE_API = 'http://localhost:5000/api';
            return;
        }

        const storedApi = localStorage.getItem('chaosphere-api');
        if (storedApi) {
            const normalizedStored = storedApi.replace(/\/$/, '');
            window.CHAOSPHERE_API = normalizedStored.endsWith('/api')
                ? normalizedStored
                : `${normalizedStored}/api`;
            return;
        }

        window.CHAOSPHERE_API = `${window.location.origin}/api`;
    })();
    (function initPageLoader() {
        window.addEventListener('load', () => {
            const loader = document.querySelector('.page-loader');
            if (!loader) return;
            loader.classList.add('page-loader--hidden');
            setTimeout(() => {
                loader.setAttribute('aria-busy', 'false');
            }, 650);
        });
    })();

    (function injectGrainBg() {
        if (!document.querySelector('.grain-bg')) {
            const grain = document.createElement('div');
            grain.className = 'grain-bg';
            grain.innerHTML = '<div class="grain-bg__gradient"></div><div class="grain-bg__noise"></div>';
            document.body.prepend(grain);
        }
    })();

    /*
    (function initThemeToggle() {
        const stored = localStorage.getItem('chaosphere-theme');
        const theme = stored || 'dark';
        document.documentElement.setAttribute('data-theme', theme);

        const btn = document.createElement('button');
        btn.className = 'theme-toggle';
        btn.setAttribute('aria-label', 'Toggle theme');
        btn.innerHTML = `
            <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        `;

        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('chaosphere-theme', next);
        });
    })();
    */
    (function forceDarkTheme() {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('chaosphere-theme', 'dark');
    })();

    (function initAntigravityBackground() {
        const canvas = document.getElementById('antigravity-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let dpr = 1;
        let particles = [];
        let time = 0;
        /* const mouse = { x: -9999, y: -9999 }; */

        const settings = {
            count: 420,
            baseRadius: 1.2,
            speed: 0.15,
            magnetRadius: 140,
            fieldStrength: 0.12
        };

        /* const palette = [
            [122, 92, 255],
            [75, 243, 255],
            [232, 94, 255],
            [86, 170, 255]
        ]; */
        /* const palette = [
            [118, 110, 140],
            [110, 130, 150],
            [128, 118, 138],
            [102, 120, 138]
        ]; */
        /* const palette = [
            [20, 40, 75],
            [18, 32, 68],
            [14, 26, 58],
            [24, 46, 86]
        ]; */
        const palette = (document.body.classList.contains('pay-page') || document.body.classList.contains('confirm-page'))
            ? [
                [160, 45, 55],
                [140, 35, 50],
                [180, 60, 70],
                [120, 30, 45]
            ]
            : [
                [70, 160, 255],
                [40, 140, 255],
                [20, 110, 245],
                [90, 190, 255]
            ];

        function resizeCanvas() {
            dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function randomColor() {
            const [r, g, b] = palette[Math.floor(Math.random() * palette.length)];
            /* return `rgba(${r}, ${g}, ${b}, 0.85)`; */
            /* return `rgba(${r}, ${g}, ${b}, 0.35)`; */
            /* return `rgba(${r}, ${g}, ${b}, 0.6)`; */
            return (document.body.classList.contains('pay-page') || document.body.classList.contains('confirm-page'))
                ? `rgba(${r}, ${g}, ${b}, 0.3)`
                : `rgba(${r}, ${g}, ${b}, 0.45)`;
        }

        function createParticle() {
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * settings.speed,
                vy: (Math.random() - 0.5) * settings.speed,
                radius: settings.baseRadius + Math.random() * 1.6,
                color: randomColor(),
                offset: Math.random() * Math.PI * 2
            };
        }

        function initParticles() {
            particles = Array.from({ length: settings.count }, createParticle);
        }

        function updateParticle(particle) {
            /*
            const dx = particle.x - mouse.x;
            const dy = particle.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < settings.magnetRadius) {
                const force = (settings.magnetRadius - dist) / settings.magnetRadius;
                particle.vx += (dx / (dist || 1)) * force * settings.fieldStrength;
                particle.vy += (dy / (dist || 1)) * force * settings.fieldStrength;
            }
            */

            particle.x += particle.vx + Math.sin(time + particle.offset) * 0.1;
            particle.y += particle.vy + Math.cos(time + particle.offset) * 0.1;

            if (particle.x < -50 || particle.x > width + 50) particle.x = Math.random() * width;
            if (particle.y < -50 || particle.y > height + 50) particle.y = Math.random() * height;
        }

        function drawParticle(particle) {
            ctx.beginPath();
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            /* ctx.shadowBlur = 12; */
            /* ctx.shadowBlur = 6; */
            /* ctx.shadowBlur = 10; */
            ctx.shadowBlur = (document.body.classList.contains('pay-page') || document.body.classList.contains('confirm-page'))
                ? 4
                : 7;
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            time += 0.01;

            particles.forEach((particle) => {
                updateParticle(particle);
                drawParticle(particle);
            });

            requestAnimationFrame(animate);
        }

        resizeCanvas();
        initParticles();
        animate();

        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        /*
        window.addEventListener('mousemove', (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });
        */
    })();
});
