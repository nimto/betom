document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. i18n Translation Engine
    // ==========================================
    // Map language codes to flag file names
    const langFlags = {
        en: 'us.svg',
        ko: 'kr.svg',
        ja: 'jp.svg',
        zh_tw: 'tw.svg',
        zh_cn: 'cn.svg'
    };

    // Get active language (default to English)
    let currentLang = localStorage.getItem('lang') || 'en';

    // Apply translations function
    const applyTranslations = (lang) => {
        if (!translations[lang]) return;
        
        const dict = translations[lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.innerHTML = dict[key];
            }
        });

        // Update document lang attribute for CSS font overrides
        document.documentElement.setAttribute('lang', lang);

        // Update all flag images in document (Desktop & Mobile)
        document.querySelectorAll('.current-lang-flag-img').forEach(img => {
            if (langFlags[lang]) {
                img.src = `assets/flags/${langFlags[lang]}`;
                img.alt = lang.toUpperCase();
            }
        });
        
        // Save to LocalStorage
        localStorage.setItem('lang', lang);
    };

    // Toggle dropdowns for all language selectors (Desktop & Mobile)
    const langSelectors = document.querySelectorAll('.lang-selector');
    
    langSelectors.forEach(selector => {
        const btn = selector.querySelector('.lang-btn');
        const dropdown = selector.querySelector('.lang-dropdown');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close other dropdowns first
            langSelectors.forEach(other => {
                if (other !== selector) {
                    other.querySelector('.lang-dropdown').classList.remove('active');
                }
            });
            
            dropdown.classList.toggle('active');
        });
    });

    // Close all language selectors when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.lang-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });

    // Listen to all dropdown link selections (Desktop & Mobile)
    document.querySelectorAll('.lang-dropdown a[data-lang]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedLang = link.getAttribute('data-lang');
            currentLang = selectedLang;
            
            applyTranslations(selectedLang);
            
            // Close all dropdowns
            document.querySelectorAll('.lang-dropdown').forEach(d => d.classList.remove('active'));
        });
    });

    // Initial Translation Load
    applyTranslations(currentLang);

    // ==========================================
    // 2. Off-canvas Navigation & Mobile Menu Overlay
    // ==========================================
    const hamburger = document.getElementById('btn-mobile-nav');
    const navMenu = document.getElementById('main-nav-menu');
    const closeOffcanvas = document.getElementById('btn-offcanvas-close');
    const menuOverlay = document.getElementById('menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    const openMenu = () => {
        navMenu.classList.add('active');
        hamburger.classList.add('active');
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Disable scroll on body when menu open
    };

    const closeMenu = () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scroll
    };

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    closeOffcanvas.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // ==========================================
    // 3. Navigation Scroll Effect
    // ==========================================
    const header = document.querySelector('header');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // Active Navigation Links on Scroll
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    });

    // ==========================================
    // 4. Theme Toggle (Dark / Light) - Multi Button support
    // ==========================================
    const storedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', storedTheme);

    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    
    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme = 'dark';
            
            if (currentTheme === 'dark') {
                newTheme = 'light';
            }
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    });

    // ==========================================
    // 5. Server Specs Tab Filter Switcher (All / VM / Bare)
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const serverCards = document.querySelectorAll('.server-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.getAttribute('data-tab'); // 'all', 'vm', 'bare'
            
            serverCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (targetTab === 'all' || category === targetTab) {
                    card.style.display = 'flex';
                    // Trigger reflow to restart fade animation
                    card.style.animation = 'none';
                    card.offsetHeight; // Reflow
                    card.style.animation = 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ==========================================
    // 6. Server Inquiry Modal & Telegram Bot Integration (Secure Serverless)
    // ==========================================
    const inquiryModal = document.getElementById('inquiry-modal');
    const closeModalBtn = document.getElementById('btn-modal-close');
    const modalServerName = document.getElementById('modal-server-name');
    const modalServerPrice = document.getElementById('modal-server-price');
    const modalSpecsSummary = document.getElementById('modal-specs-summary');
    const formInquiry = document.getElementById('form-inquiry');

    let currentSelectedServer = {};

    const openInquiryModal = (card) => {
        // Collect server details
        const serverNameEl = card.querySelector('.server-name');
        const serverNameKey = serverNameEl ? serverNameEl.getAttribute('data-i18n') : null;
        const serverNameEn = (serverNameKey && translations['en'][serverNameKey]) ? translations['en'][serverNameKey] : (serverNameEl ? serverNameEl.innerText : 'Unknown Server');
        const serverName = serverNameEl ? serverNameEl.innerText : 'Unknown Server';
        
        const serverPriceAmount = card.querySelector('.price-amount') ? card.querySelector('.price-amount').innerText : 'Custom Estimate';
        const serverPricePeriod = card.querySelector('.price-currency') ? card.querySelector('.price-currency').innerText : '';
        
        currentSelectedServer = {
            name: serverName,
            nameEn: serverNameEn,
            price: `${serverPriceAmount}${serverPricePeriod}`,
            specs: []
        };

        // Collect Specs
        const specItems = card.querySelectorAll('.server-specs .spec-item');
        modalSpecsSummary.innerHTML = ''; // Reset specs box
        
        specItems.forEach(item => {
            const labelEl = item.querySelector('.spec-label');
            const valEl = item.querySelector('.spec-val');
            
            const labelKey = labelEl ? labelEl.getAttribute('data-i18n') : null;
            const valKey = valEl ? valEl.getAttribute('data-i18n') : null;
            
            // Map raw English dictionary values for Telegram telemetry report
            const labelEn = (labelKey && translations['en'][labelKey]) ? translations['en'][labelKey] : (labelEl ? labelEl.innerText : '');
            const valEn = (valKey && translations['en'][valKey]) ? translations['en'][valKey] : (valEl ? valEl.innerText : '');
            
            const label = labelEl ? labelEl.innerText : '';
            const val = valEl ? valEl.innerText : '';
            
            currentSelectedServer.specs.push({ label, val, labelEn, valEn });

            // Render spec badge inside modal
            const specBadge = document.createElement('div');
            specBadge.className = 'modal-spec-badge';
            specBadge.innerHTML = `${label}: <strong>${val}</strong>`;
            modalSpecsSummary.appendChild(specBadge);
        });

        // Set Title & Price
        modalServerName.innerText = serverName;
        modalServerPrice.innerText = currentSelectedServer.price;

        // Open Modal
        inquiryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeInquiryModal = () => {
        inquiryModal.classList.remove('active');
        document.body.style.overflow = '';
        formInquiry.reset();
    };

    // Attach Event Listeners to Server Cards deployment buttons
    document.querySelectorAll('.server-card .server-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.server-card');
            openInquiryModal(card);
        });
    });

    // Attach Event Listener to consultation button
    const upgradeConsultBtn = document.getElementById('btn-upgrade-consult');
    if (upgradeConsultBtn) {
        upgradeConsultBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Mock a custom hardware upgrade request card object
            const dummyCard = document.createElement('div');
            dummyCard.innerHTML = `
                <div class="server-name">HP DL360 Hardware Upgrade Option</div>
                <div class="price-amount">Custom Estimate</div>
                <div class="price-currency"></div>
                <div class="server-specs">
                    <div class="spec-item"><span class="spec-label">Target Hardware</span><span class="spec-val">HP DL360 Servers</span></div>
                    <div class="spec-item"><span class="spec-label">Consult Type</span><span class="spec-val">Hardware Customization</span></div>
                </div>
            `;
            openInquiryModal(dummyCard);
        });
    }

    closeModalBtn.addEventListener('click', closeInquiryModal);
    
    // Close Modal on backdrop click
    inquiryModal.addEventListener('click', (e) => {
        if (e.target === inquiryModal) {
            closeInquiryModal();
        }
    });

    // Form Submit handling (Dual-Mode Telegram Bot Notification & Fallback)
    formInquiry.addEventListener('submit', async (e) => {
        e.preventDefault();

        const contact = document.getElementById('inquiry-contact').value;
        const message = document.getElementById('inquiry-message').value;
        
        // Collect checked upgrades
        const selectedUpgrades = [];
        document.querySelectorAll('input[name="upgrades"]:checked').forEach(cb => {
            selectedUpgrades.push(cb.value);
        });

        // Formulate Markdown-like Telegram Message body using forced English values for specs & server names
        const specDetails = currentSelectedServer.specs.map(s => `• ${s.labelEn}: ${s.valEn}`).join('\n');
        
        const messageText = `🔔 [Betom IDC 신규 구축 문의]

💻 신청 서버: ${currentSelectedServer.nameEn}
💰 월간 요금: ${currentSelectedServer.price}

⚙️ 기본 사양 정보:
${specDetails}

👤 고객 연락처: ${contact}

🛠️ 추가 하드웨어 옵션:
${selectedUpgrades.length > 0 ? selectedUpgrades.join(', ') : '선택 없음'}

💬 추가 요청 사항:
${message ? message : '없음'}`;

        const dict = translations[currentLang] || translations['en'];

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Multi-language button names mapping
        const confirmBtnLabel = currentLang === 'ko' ? '확인' : (currentLang === 'ja' ? '確認' : (currentLang === 'zh_tw' ? '確認' : (currentLang === 'zh_cn' ? '确认' : 'Confirm')));
        const errorBtnLabel = currentLang === 'ko' ? '텔레그램 상담 연동' : (currentLang === 'ja' ? 'Telegramサポートへ' : (currentLang === 'zh_tw' ? '轉向Telegram諮詢' : (currentLang === 'zh_cn' ? '转向Telegram咨询' : 'Open Telegram Support')));

        // Securely call Netlify Serverless Function (No API token or Chat ID is exposed on client-side!)
        try {
            const response = await fetch('/api/send-inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({ message: messageText })
            });

            const resData = await response.json();
            
            if (response.ok && resData.success) {
                // Success SweetAlert2 Notification
                Swal.fire({
                    title: currentLang === 'ko' ? '전송 완료' : (currentLang === 'ja' ? '送信完了' : (currentLang === 'zh_tw' ? '傳送成功' : (currentLang === 'zh_cn' ? '发送成功' : 'Success!'))),
                    text: dict.modal_success || "Inquiry successfully sent!",
                    icon: 'success',
                    background: isDark ? '#0c0f1d' : '#ffffff',
                    color: isDark ? '#f3f4f6' : '#0f172a',
                    confirmButtonColor: '#00f2fe',
                    confirmButtonText: confirmBtnLabel,
                    customClass: {
                        popup: 'betom-swal2-popup'
                    }
                });
                closeInquiryModal();
                return;
            } else {
                console.error("Serverless API responded with error:", resData);
            }
        } catch (err) {
            console.error("Network error sending message through serverless API:", err);
        }

        // Fallback: Redirect to direct t.me link with prepopulated message text
        Swal.fire({
            title: currentLang === 'ko' ? '알림' : (currentLang === 'ja' ? '通知' : (currentLang === 'zh_tw' ? '提示' : (currentLang === 'zh_cn' ? '提示' : 'Notice'))),
            text: dict.modal_error || "Sending via Telegram bot failed. Redirecting to direct support chat...",
            icon: 'warning',
            background: isDark ? '#0c0f1d' : '#ffffff',
            color: isDark ? '#f3f4f6' : '#0f172a',
            confirmButtonColor: '#9b51e0',
            confirmButtonText: errorBtnLabel,
            customClass: {
                popup: 'betom-swal2-popup'
            }
        }).then(() => {
            const encodedText = encodeURIComponent(messageText);
            window.open(`https://t.me/betom_mike?text=${encodedText}`, '_blank');
            closeInquiryModal();
        });
    });

    // ==========================================
    // 7. Scroll Reveal Animation
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load
});
