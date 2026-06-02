document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 🔗 API CONFIGURATION & GATEWAY STATUS
    // -------------------------------------------------------------
    window.isPaymentGatewayOnline = true;

    (function resolveApiBase() {
        if (window.CHAOSPHERE_CONFIG && window.CHAOSPHERE_CONFIG.API_BASE_URL) {
            let api = window.CHAOSPHERE_CONFIG.API_BASE_URL;
            api = api.replace(/\/$/, '');
            window.CHAOSPHERE_API = api.endsWith('/api') ? api : `${api}/api`;
        } else {
            window.CHAOSPHERE_API = 'http://localhost:5000/api';
        }
    })();

    (function initGatewayStatusUI() {
        const overlay = document.createElement('div');
        overlay.id = 'gateway-offline-overlay';
        overlay.className = 'gateway-offline-overlay';
        overlay.innerHTML = `
            <div class="gateway-offline-card">
                <div class="gateway-offline-icon">
                    <span class="status-dot offline-dot" aria-hidden="true"></span>
                </div>
                <h2>Payment Gateway Offline</h2>
                <p>Transactions are currently unavailable.<br>Please try again later.</p>
            </div>
        `;
        document.body.appendChild(overlay);

        const style = document.createElement('style');
        style.textContent = `
            .gateway-offline-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(10, 10, 15, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.4s ease;
            }
            .gateway-offline-overlay.is-visible {
                opacity: 1;
                pointer-events: all;
            }
            .gateway-offline-card {
                background: linear-gradient(145deg, rgba(30, 20, 25, 0.9), rgba(15, 10, 12, 0.9));
                border: 1px solid rgba(255, 60, 60, 0.2);
                border-radius: 16px;
                padding: 2.5rem;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 60, 60, 0.1);
                max-width: 400px;
                width: 90%;
            }
            .gateway-offline-icon {
                margin-bottom: 1.5rem;
            }
            .gateway-offline-icon .status-dot {
                display: inline-block;
                width: 16px; height: 16px;
                background: #ff5555;
                border-radius: 50%;
                box-shadow: 0 0 15px #ff5555;
                animation: pulse-red 2s infinite;
            }
            @keyframes pulse-red {
                0% { box-shadow: 0 0 0 0 rgba(255, 85, 85, 0.7); }
                70% { box-shadow: 0 0 0 15px rgba(255, 85, 85, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 85, 85, 0); }
            }
            .gateway-offline-card h2 {
                color: #ff5555;
                margin: 0 0 1rem;
                font-size: 1.5rem;
                letter-spacing: -0.02em;
            }
            .gateway-offline-card p {
                color: rgba(255, 255, 255, 0.7);
                margin: 0;
                line-height: 1.5;
                font-size: 1rem;
            }
            
            .gateway-online-indicator {
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: rgba(20, 25, 20, 0.8);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(80, 255, 120, 0.2);
                padding: 10px 16px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 9998;
                font-family: var(--font-mono, 'JetBrains Mono', monospace);
                font-size: 0.85rem;
                color: #84f1b5;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.4s ease, transform 0.4s ease;
                pointer-events: none;
            }
            .gateway-online-indicator.is-visible {
                opacity: 1;
                transform: translateY(0);
            }
            .gateway-online-indicator .status-dot {
                display: inline-block;
                width: 8px; height: 8px;
                background: #84f1b5;
                border-radius: 50%;
                box-shadow: 0 0 8px #84f1b5;
            }
        `;
        document.head.appendChild(style);

        const onlineIndicator = document.createElement('div');
        onlineIndicator.id = 'gateway-online-indicator';
        onlineIndicator.className = 'gateway-online-indicator';
        onlineIndicator.innerHTML = `
            <span class="status-dot"></span>
            <span>Payment Gateway Online</span>
        `;
        document.body.appendChild(onlineIndicator);
    })();

    window.checkGatewayStatus = async function() {
        if (!window.CHAOSPHERE_API) return false;
        try {
            const response = await fetch(`${window.CHAOSPHERE_API}/health`, { method: 'GET' });
            window.isPaymentGatewayOnline = response.ok;
        } catch (e) {
            window.isPaymentGatewayOnline = false;
        }
        
        const isLeaderboard = window.location.pathname.includes('leaderboard.html');
        const overlay = document.getElementById('gateway-offline-overlay');
        const onlineIndicator = document.getElementById('gateway-online-indicator');
        
        if (!isLeaderboard) {
            if (window.isPaymentGatewayOnline) {
                if (overlay) overlay.classList.remove('is-visible');
                if (onlineIndicator) onlineIndicator.classList.add('is-visible');
                document.querySelectorAll('button:not(.pin-display)').forEach(btn => {
                    if (btn.dataset.offlineDisabled === 'true') {
                        btn.disabled = false;
                        btn.dataset.offlineDisabled = 'false';
                    }
                });
            } else {
                if (overlay) overlay.classList.add('is-visible');
                if (onlineIndicator) onlineIndicator.classList.remove('is-visible');
                document.querySelectorAll('button:not(.pin-display)').forEach(btn => {
                    if (!btn.disabled) {
                        btn.disabled = true;
                        btn.dataset.offlineDisabled = 'true';
                    }
                });
            }
        }
        return window.isPaymentGatewayOnline;
    };

    window.checkGatewayStatus();
    setInterval(window.checkGatewayStatus, 10000);
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
