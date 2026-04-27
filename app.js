document.addEventListener('DOMContentLoaded', () => {
    const campContainer = document.getElementById('camp-container');
    const loadingEl = document.getElementById('loading');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    let allCamps = [];

    // Fetch JSON data
    fetch('./tainan_summer_camps_2026.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            allCamps = data.camps;
            loadingEl.style.display = 'none';
            renderCamps(allCamps);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            loadingEl.innerHTML = `
                <div style="text-align: center; color: #ef4444; max-width: 400px;">
                    <svg style="width: 48px; height: 48px; margin: 0 auto 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <p style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem;">無法讀取 JSON 檔案</p>
                    <p style="font-size: 0.9rem; color: #94a3b8;">如果你直接在瀏覽器開啟 HTML (file://)，基於安全限制無法讀取本地 JSON。<br><br>請使用 <b>VS Code Live Server</b> 或是透過終端機執行 <code>python3 -m http.server</code> 來啟動本地伺服器觀看。</p>
                </div>
            `;
        });

    // SVG Icons
    const icons = {
        calendar: '<svg class="info-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>',
        location: '<svg class="info-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
        user: '<svg class="info-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>',
        zoom: '<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>'
    };

    // Render camps
    function renderCamps(camps) {
        campContainer.innerHTML = '';
        
        if (camps.length === 0) {
            campContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">沒有找到符合條件的營隊</p>';
            return;
        }

        camps.forEach(camp => {
            const card = document.createElement('div');
            card.className = 'camp-card';

            // Check if there's an image
            let imageHTML = '';
            let imagePath = '';
            
            if (camp.representative_image && camp.representative_image.file_name) {
                // Try to use the local images folder
                imagePath = `./images/${camp.representative_image.file_name}`;
                imageHTML = `
                    <div class="card-img-wrapper" onclick="openLightbox('${imagePath}', '${camp.name}')">
                        <img src="${imagePath}" alt="${camp.name}" class="card-img" onerror="this.onerror=null; this.src='${camp.representative_image.source_url}';">
                        <div class="zoom-hint">${icons.zoom}</div>
                    </div>
                `;
            } else {
                imageHTML = `
                    <div class="card-img-wrapper">
                        <div class="card-placeholder">無圖片資訊</div>
                    </div>
                `;
            }

            // Generate tags
            const tagsHTML = camp.category.slice(0, 3).map(cat => `<span class="tag">${cat}</span>`).join('');

            // Format price
            let priceHTML = '';
            if (camp.price.amount_twd === 0) {
                priceHTML = '<span class="price free">免費</span>';
            } else if (camp.price.amount_twd === null) {
                priceHTML = '<span class="price" style="color:var(--text-secondary); font-size:1rem;">詳見官網</span>';
            } else {
                priceHTML = `<span class="price">NT$ ${camp.price.amount_twd.toLocaleString()}</span>`;
            }

            // Price note (if exists)
            const originalPrice = camp.price.original_amount_twd ? `<span style="text-decoration:line-through; font-size:0.8rem; color:var(--text-secondary); margin-left:0.5rem;">原價 NT$ ${camp.price.original_amount_twd.toLocaleString()}</span>` : '';

            card.innerHTML = `
                ${imageHTML}
                <div class="card-tags">${tagsHTML}</div>
                
                <div class="card-content">
                    <h3 class="card-title">${camp.name}</h3>
                    <div class="card-organizer">${camp.organizer}</div>
                    
                    <div class="card-info">
                        <div class="info-row">
                            ${icons.calendar}
                            <span>${camp.dates[0]} ${camp.dates.length > 1 ? '<br>...等多梯次' : ''}</span>
                        </div>
                        <div class="info-row">
                            ${icons.location}
                            <span>${camp.location.venue}</span>
                        </div>
                        <div class="info-row">
                            ${icons.user}
                            <span>${camp.target_age}</span>
                        </div>
                    </div>
                    
                    <p class="card-desc">${camp.description}</p>
                    
                    <div class="card-footer">
                        <div>
                            ${priceHTML} ${originalPrice}
                        </div>
                        <a href="${camp.source_url}" target="_blank" class="action-link" rel="noopener noreferrer">
                            查看詳情
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                    </div>
                </div>
            `;
            
            campContainer.appendChild(card);
        });
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter data
            const filterValue = btn.getAttribute('data-filter');
            if (filterValue === 'all') {
                renderCamps(allCamps);
            } else {
                const filtered = allCamps.filter(camp => {
                    if (filterValue === '兒童營') {
                        // For "other categories" basically items that don't match the main ones
                        const mainCategories = ['戶外冒險', '科技', 'STEAM', '運動', '手作', '烘焙', '3D列印'];
                        return camp.category.some(cat => !mainCategories.includes(cat) && (cat.includes('兒童') || cat.includes('國小') || cat.includes('品格')));
                    }
                    return camp.category.some(cat => cat.includes(filterValue) || (filterValue === '科技' && cat.includes('STEAM')));
                });
                renderCamps(filtered);
            }
        });
    });

    // Lightbox Logic
    window.openLightbox = (imgSrc, caption) => {
        lightboxImg.src = imgSrc;
        lightboxCaption.textContent = caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        setTimeout(() => {
            lightboxImg.src = '';
        }, 400); // Wait for transition
    };

    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});
