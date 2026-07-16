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
            } else if (translations['en'] && translations['en'][key]) {
                el.innerHTML = translations['en'][key];
            } else {
                const defaultEn = el.getAttribute('data-default-en');
                if (defaultEn) {
                    el.innerHTML = defaultEn;
                }
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
        if (window.scrollY > 100) {
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

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.getAttribute('data-tab'); // 'all', 'vm', 'bare'
            const currentCards = document.querySelectorAll('.server-card');
            
            currentCards.forEach(card => {
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
            specs: [],
            inquiryType: card.getAttribute('id') === 'card-hardware-upgrade' ? '#업그레이드' : '#서버신청'
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

    const openServiceInquiryModal = (cardId, fallbackTitle) => {
        // Service to Translation Key mapping
        const serviceGuideKeys = {
            'card-feature-proxmox': 'guide_proxmox',
            'card-feature-raid': 'guide_raid',
            'card-feature-lb': 'guide_lb',
            'card-feature-dr': 'guide_dr',
            'card-feature-ids': 'guide_ids',
            'card-feature-audit': 'guide_audit',
            'card-domain-reg': 'guide_domreg',
            'card-domain-dns': 'guide_domdns',
            'card-domain-whois': 'guide_domwhois',
            'card-domain-lock': 'guide_domlock'
        };

        const keyPrefix = serviceGuideKeys[cardId];
        const dict = translations[currentLang] || translations['en'];
        const dictEn = translations['en'];
        
        // Dynamic Fallback to English if current selected language lacks translation keys
        const title = (keyPrefix && dict[`${keyPrefix}_title`]) ? dict[`${keyPrefix}_title`] : 
                      ((keyPrefix && dictEn[`${keyPrefix}_title`]) ? dictEn[`${keyPrefix}_title`] : fallbackTitle);
        const titleEn = (keyPrefix && dictEn[`${keyPrefix}_title`]) ? dictEn[`${keyPrefix}_title`] : fallbackTitle;
        const desc = (keyPrefix && dict[`${keyPrefix}_desc`]) ? dict[`${keyPrefix}_desc`] : 
                     ((keyPrefix && dictEn[`${keyPrefix}_desc`]) ? dictEn[`${keyPrefix}_desc`] : '');
        const descEn = (keyPrefix && dictEn[`${keyPrefix}_desc`]) ? dictEn[`${keyPrefix}_desc`] : '';

        currentSelectedServer = {
            name: title,
            nameEn: titleEn,
            price: currentLang === 'ko' ? '맞춤 솔루션 상담' : (currentLang === 'ja' ? '個別相談' : 'Custom Consulting'),
            specs: [],
            isServiceMode: true,
            serviceDescEn: descEn,
            inquiryType: cardId.startsWith('card-feature-') ? '#매니지드' : '#도메인'
        };

        // Render Beginner Guide Text instead of Spec Badges
        modalSpecsSummary.innerHTML = `<div class="modal-beginner-guide-text">${desc}</div>`;
        modalSpecsSummary.classList.add('info-text-mode');

        // Set Title & Price
        modalServerName.innerText = title;
        modalServerPrice.innerText = currentSelectedServer.price;

        // Hide Hardware upgrade options form-group
        const upgradeFormGroup = document.querySelector('.upgrade-options-grid').closest('.form-group');
        if (upgradeFormGroup) {
            upgradeFormGroup.style.display = 'none';
        }

        // Set direct consult message helper
        const msgField = document.getElementById('inquiry-message');
        if (msgField) {
            msgField.value = currentLang === 'ko' ? `[${title}] 기술에 관해 상세 가이드 및 도입 견적 상담을 신청합니다.` : 
                           (currentLang === 'ja' ? `[${title}] 技術について、初心者向けガイドおよび見積もり相談を希望します。` : 
                           `I would like to request consulting and custom pricing details regarding [${titleEn}].`);
        }

        // Open Modal
        inquiryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeInquiryModal = () => {
        inquiryModal.classList.remove('active');
        document.body.style.overflow = '';
        formInquiry.reset();
        
        // Restore specs box layout
        modalSpecsSummary.classList.remove('info-text-mode');
        
        // Restore Hardware options form-group visibility
        const upgradeFormGroup = document.querySelector('.upgrade-options-grid').closest('.form-group');
        if (upgradeFormGroup) {
            upgradeFormGroup.style.display = '';
        }
        
        // Clear message field values
        const msgField = document.getElementById('inquiry-message');
        if (msgField) {
            msgField.value = '';
        }
    };

    // Attach Event Listeners via Event Delegation on Server Grid container
    const serverMainGrid = document.getElementById('server-main-grid');
    if (serverMainGrid) {
        serverMainGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.server-btn');
            if (btn) {
                e.preventDefault();
                const card = btn.closest('.server-card');
                if (card) {
                    openInquiryModal(card);
                }
            }
        });
    }

    // Attach Event Listeners to Managed Services and Domains Cards
    document.querySelectorAll('#managed-services-grid .service-item-card, #domains-services-grid .domain-feature-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const cardId = card.getAttribute('id');
            const cardTitle = card.querySelector('h3').innerText;
            openServiceInquiryModal(cardId, cardTitle);
        });
    });

    // Attach Event Listener to consultation button
    const upgradeConsultBtn = document.getElementById('btn-upgrade-consult');
    if (upgradeConsultBtn) {
        upgradeConsultBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Mock a custom hardware upgrade request card object
            const dummyCard = document.createElement('div');
            dummyCard.setAttribute('id', 'card-hardware-upgrade');
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

        let messageText = '';
        if (currentSelectedServer.isServiceMode) {
            messageText = `🔔 [Betom IDC 신규 서비스 문의]

💻 신청 서비스: ${currentSelectedServer.nameEn}
💰 예상 비용: ${currentSelectedServer.price}

⚙️ 초보자용 가이드 정보 (Guide Details):
• ${currentSelectedServer.serviceDescEn}

👤 고객 연락처: ${contact}

💬 추가 요청 사항:
${message ? message : '없음'}`;
        } else {
            // Formulate Markdown-like Telegram Message body using forced English values for specs & server names
            const specDetails = currentSelectedServer.specs.map(s => `• ${s.labelEn}: ${s.valEn}`).join('\n');
            
            messageText = `🔔 [Betom IDC 신규 구축 문의]

💻 신청 서버: ${currentSelectedServer.nameEn}
💰 월간 요금: ${currentSelectedServer.price}

⚙️ 기본 사양 정보:
${specDetails}

👤 고객 연락처: ${contact}

🛠️ 추가 하드웨어 옵션:
${selectedUpgrades.length > 0 ? selectedUpgrades.join(', ') : '선택 없음'}

💬 추가 요청 사항:
${message ? message : '없음'}`;
        }

        // Clean and build search-friendly hashtags for easy filtering
        const cleanHashtag = (str) => {
            if (!str) return '';
            return '#' + str.replace(/[^a-zA-Z0-9\s가-힣]/g, '').trim().replace(/\s+/g, '_');
        };

        const typeTag = currentSelectedServer.inquiryType || '#기타문의';
        const serverTag = cleanHashtag(currentSelectedServer.nameEn);
        const upgradeTags = selectedUpgrades.map(item => cleanHashtag(item)).join(' ');
        const finalTags = `${typeTag} ${serverTag} ${upgradeTags}`.trim().replace(/\s+/g, ' ');
        
        messageText += `\n\n📌 검색태그:\n${finalTags}`;

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

    // ==========================================
    // 8. Dynamic Server Config Loading & Rendering (USDT Pricing)
    // ==========================================
    const loadServers = async () => {
        try {
            const response = await fetch('data/servers.json');
            if (!response.ok) throw new Error('Failed to load server configurations.');
            const servers = await response.json();
            
            const serverGrid = document.getElementById('server-main-grid');
            if (!serverGrid) return;
            
            serverGrid.innerHTML = ''; // Clear fallback hardcoded HTML
            
            servers.forEach(server => {
                const popularClass = server.popular ? 'popular' : '';
                const recommendedBadge = server.popular ? `<div class="recommended-badge" data-i18n="srv_recommended">RECOMMENDED</div>` : '';
                
                const cardHtml = `
                    <div class="server-card ${popularClass}" data-category="${server.category}" id="${server.id}">
                        ${recommendedBadge}
                        <div class="server-name" data-i18n="${server.title_i18n}" data-default-en="${server.title_default_en || ''}"></div>
                        <p class="server-desc" data-i18n="${server.desc_i18n}" data-default-en="${server.desc_default_en || ''}"></p>
                        <div class="server-price">
                            <span class="price-amount">${server.price}</span>
                            <span class="price-currency"> USDT / mo</span>
                        </div>
                        <div class="server-specs">
                            ${server.specs.map(spec => `
                                <div class="spec-item">
                                    <span class="spec-label">${spec.label}</span>
                                    <span class="spec-val" data-i18n="${spec.val_i18n}" data-default-en="${spec.val_default_en || ''}"></span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="crypto-tag"><i class="fa-brands fa-bitcoin"></i> <span data-i18n="srv_crypto">Cryptocurrency accepted</span></div>
                        <button class="btn ${server.popular ? 'btn-primary' : 'btn-secondary'} server-btn" id="${server.btn_id}">
                            <i class="fa-solid fa-arrow-right"></i> <span data-i18n="srv_btn_deploy">Contact for Deploy</span>
                        </button>
                    </div>
                `;
                serverGrid.insertAdjacentHTML('beforeend', cardHtml);
            });
            
            // Re-apply translations to dynamically populated DOM elements
            applyTranslations(currentLang);
            
        } catch (err) {
            console.error('Error fetching servers.json config:', err);
        }
    };

    loadServers();
});
