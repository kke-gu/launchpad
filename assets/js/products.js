// 상품 관리 JavaScript

// 상품 데이터 저장소 (로컬 스토리지 사용)
const PRODUCTS_STORAGE_KEY = 'growth_launchpad_products';

// 상품 데이터 가져오기
function getProducts() {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 상품 데이터 저장하기
function saveProducts(products) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

// 제안서 파일 삭제 여부 플래그
let proposalFileRemoved = false;

// 상품 리스트 렌더링
function renderProducts() {
    const products = getProducts();
    const container = document.getElementById('product-list');
    
    if (!container) {
        // product-list 요소가 없으면 조용히 반환 (다른 페이지에서 실행된 경우)
        return;
    }
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 3rem;">등록된 상품이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <article class="product-card">
            <div class="product-card-header">
                <h2>${escapeHtml(product.name)}</h2>
                <div class="product-card-actions-inline">
                    ${product.proposalFile ? 
                        `<a href="#" class="btn-icon-only btn-icon-with-label" onclick="downloadFile('${escapeHtml(product.proposalFile)}'); return false;" title="제안서">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 2C3.44772 2 3 2.44772 3 3V13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V5.5L9.5 2H4Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                                <path d="M9 2V6H13" stroke="currentColor" stroke-width="1.5" fill="none"/>
                                <path d="M5 9H11M5 11H11" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                            <span class="btn-icon-label">제안서</span>
                        </a>` : ''}
                    <div class="dropdown-menu-container">
                        <button type="button" class="btn-icon-only" onclick="toggleDropdown(${product.id})" title="메뉴">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="4" r="1.5" fill="currentColor"/>
                                <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                                <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
                            </svg>
                        </button>
                        <div class="dropdown-menu" id="dropdown-${product.id}" style="display: none;">
                            <button type="button" onclick="editProduct(${product.id}); closeDropdown(${product.id});">수정</button>
                            <button type="button" onclick="deleteProduct(${product.id}); closeDropdown(${product.id});">삭제</button>
                        </div>
                    </div>
                </div>
            </div>
            <p class="product-card-desc">${escapeHtml(product.description || '')}</p>
            <div class="product-card-actions">
                ${product.basicAreas && product.basicAreas.length > 0 ? 
                    product.basicAreas.map(area => 
                        `<a href="${escapeHtml(area.url)}" target="_blank" class="btn small btn-basic">${escapeHtml(area.buttonName)}</a>`
                    ).join('') : ''}
                <a href="quote.html?productId=${product.id}&productName=${encodeURIComponent(product.name)}" class="btn small primary btn-quote">견적 작성</a>
            </div>
            ${(product.demoAreas && product.demoAreas.length > 0) || (product.caseAreas && product.caseAreas.length > 0) ? `
                <div class="product-card-section">
                    ${product.demoAreas && product.demoAreas.length > 0 ? `
                        <div class="product-card-section-item">
                            <span class="product-card-section-title">데모</span>
                            <div class="product-card-section-content">
                                ${product.demoAreas.map(area => 
                                    `<a href="${escapeHtml(area.url)}" target="_blank" class="btn small secondary btn-demo" 
                                        data-demo-id="${escapeHtml(area.id)}" 
                                        data-demo-password="${escapeHtml(area.password)}"
                                        onclick="openDemo(event, '${escapeHtml(area.url)}', '${escapeHtml(area.id)}', '${escapeHtml(area.password)}')">${escapeHtml(area.buttonName)}</a>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${product.caseAreas && product.caseAreas.length > 0 ? `
                        <div class="product-card-section-item">
                            <span class="product-card-section-title">고객사례</span>
                            <div class="product-card-section-content">
                                <select class="product-card-select" onchange="if(this.value) window.open(this.value, '_blank')">
                                    <option value="">선택하세요</option>
                                    ${product.caseAreas.map(area => 
                                        `<option value="${escapeHtml(area.url)}">${escapeHtml(area.customerName)}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </article>
    `).join('');
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 상품 ID 생성
function generateProductId() {
    return Date.now();
}

// 모달 열기
function openModal(isEdit = false, productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    title.textContent = isEdit ? '상품 수정' : '상품 등록';
    form.reset();
    document.getElementById('product-id').value = productId || '';
    
    // 동적 영역 초기화
    document.getElementById('basic-areas').innerHTML = '';
    document.getElementById('demo-areas').innerHTML = '';
    document.getElementById('case-areas').innerHTML = '';
    document.getElementById('proposal-file-name').style.display = 'none';

    // 제안서 파일 플래그 초기화 및 삭제 버튼 숨김
    proposalFileRemoved = false;
    const proposalRemoveBtn = document.getElementById('btn-remove-proposal');
    if (proposalRemoveBtn) {
        proposalRemoveBtn.style.display = 'none';
    }
    
    // 수정 모드인 경우 데이터 로드
    if (isEdit && productId) {
        const products = getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            loadProductData(product);
        }
    }
    
    modal.style.display = 'flex';
}

// 상품 데이터 로드
function loadProductData(product) {
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-description').value = product.description || '';
    
    // 제안서 파일이 있고 실제로 값이 있는 경우에만 표시
    if (product.proposalFile && product.proposalFile.trim() !== '') {
        const proposalDisplay = document.getElementById('proposal-file-name');
        const proposalRemoveBtn = document.getElementById('btn-remove-proposal');

        if (proposalDisplay) {
            proposalDisplay.textContent = product.proposalFile.trim();
            proposalDisplay.style.display = 'block';
        }
        if (proposalRemoveBtn) {
            proposalRemoveBtn.style.display = 'inline-block';
        }

        // 기존 파일이 있는 상태에서 시작하므로 삭제 플래그는 false
        proposalFileRemoved = false;
    } else {
        // 제안서 파일이 없는 경우 명시적으로 숨김
        const proposalDisplay = document.getElementById('proposal-file-name');
        const proposalRemoveBtn = document.getElementById('btn-remove-proposal');
        
        if (proposalDisplay) {
            proposalDisplay.textContent = '';
            proposalDisplay.style.display = 'none';
        }
        if (proposalRemoveBtn) {
            proposalRemoveBtn.style.display = 'none';
        }
        
        proposalFileRemoved = false;
    }
    
    // 기본 영역
    if (product.basicAreas && product.basicAreas.length > 0) {
        product.basicAreas.forEach(area => {
            addBasicArea(area.buttonName, area.url);
        });
    }
    
    // 데모 영역
    if (product.demoAreas && product.demoAreas.length > 0) {
        product.demoAreas.forEach(area => {
            addDemoArea(area.buttonName, area.url, area.id, area.password);
        });
    }
    
    // 고객 사례 영역
    if (product.caseAreas && product.caseAreas.length > 0) {
        product.caseAreas.forEach(area => {
            addCaseArea(area.customerName, area.url);
        });
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// 기본 영역 추가
function addBasicArea(buttonName = '', url = '') {
    const container = document.getElementById('basic-areas');
    const index = container.children.length;
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.innerHTML = `
        <div class="dynamic-item-header">
            <span class="dynamic-item-title">기본 영역 ${index + 1}</span>
            <button type="button" class="dynamic-item-remove" onclick="this.parentElement.parentElement.remove()">삭제</button>
        </div>
        <div class="dynamic-item-fields double">
            <div class="form-group" style="margin-bottom: 0;">
                <label>버튼명</label>
                <input type="text" class="form-input" name="basic-button-${index}" value="${escapeHtml(buttonName)}" placeholder="예: 요금표">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>URL</label>
                <input type="url" class="form-input" name="basic-url-${index}" value="${escapeHtml(url)}" placeholder="https://...">
            </div>
        </div>
    `;
    container.appendChild(item);
}

// 데모 영역 추가
function addDemoArea(buttonName = '', url = '', id = '', password = '') {
    const container = document.getElementById('demo-areas');
    const index = container.children.length;
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.innerHTML = `
        <div class="dynamic-item-header">
            <span class="dynamic-item-title">데모 영역 ${index + 1}</span>
            <button type="button" class="dynamic-item-remove" onclick="this.parentElement.parentElement.remove()">삭제</button>
        </div>
        <div class="dynamic-item-fields quad">
            <div class="form-group" style="margin-bottom: 0;">
                <label>버튼명</label>
                <input type="text" class="form-input" name="demo-button-${index}" value="${escapeHtml(buttonName)}" placeholder="예: 데모 체험">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>URL</label>
                <input type="url" class="form-input" name="demo-url-${index}" value="${escapeHtml(url)}" placeholder="https://...">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>아이디</label>
                <input type="text" class="form-input" name="demo-id-${index}" value="${escapeHtml(id)}" placeholder="아이디">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>패스워드</label>
                <input type="password" class="form-input" name="demo-password-${index}" value="${escapeHtml(password)}" placeholder="패스워드">
            </div>
        </div>
    `;
    container.appendChild(item);
}

// 고객 사례 영역 추가
function addCaseArea(customerName = '', url = '') {
    const container = document.getElementById('case-areas');
    const index = container.children.length;
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.innerHTML = `
        <div class="dynamic-item-header">
            <span class="dynamic-item-title">고객 사례 ${index + 1}</span>
            <button type="button" class="dynamic-item-remove" onclick="this.parentElement.parentElement.remove()">삭제</button>
        </div>
        <div class="dynamic-item-fields double">
            <div class="form-group" style="margin-bottom: 0;">
                <label>고객사명</label>
                <input type="text" class="form-input" name="case-name-${index}" value="${escapeHtml(customerName)}" placeholder="예: ㈜맑은소프트">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>URL</label>
                <input type="url" class="form-input" name="case-url-${index}" value="${escapeHtml(url)}" placeholder="https://...">
            </div>
        </div>
    `;
    container.appendChild(item);
}

// 상품 수정
function editProduct(id) {
    openModal(true, id);
}

// 상품 삭제
function deleteProduct(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
    renderProducts();
}

// 파일 다운로드 (임시)
function downloadFile(fileName) {
    alert(`파일 다운로드: ${fileName}`);
    // 실제 파일 다운로드 로직 구현 필요
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    if (!window.checkLogin || !window.checkLogin()) {
        return;
    }
    
    // products.html 페이지가 아닌 경우 실행하지 않음
    const productListContainer = document.getElementById('product-list');
    if (!productListContainer) {
        return;
    }
    
    // 상품 등록 버튼
    const addProductBtn = document.getElementById('btn-add-product');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openModal(false);
        });
    }
    
    // 모달 닫기
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    const cancelBtn = document.getElementById('btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // 기본 영역 추가 버튼
    const addBasicBtn = document.getElementById('btn-add-basic');
    if (addBasicBtn) {
        addBasicBtn.addEventListener('click', () => {
            addBasicArea();
        });
    }
    
    // 데모 영역 추가 버튼
    const addDemoBtn = document.getElementById('btn-add-demo');
    if (addDemoBtn) {
        addDemoBtn.addEventListener('click', () => {
            addDemoArea();
        });
    }
    
    // 고객 사례 영역 추가 버튼
    const addCaseBtn = document.getElementById('btn-add-case');
    if (addCaseBtn) {
        addCaseBtn.addEventListener('click', () => {
            addCaseArea();
        });
    }
    
    // 폼 제출
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const productId = formData.get('id') || generateProductId();
        const productName = formData.get('name');
        
        if (!productName) {
            alert('상품명을 입력해주세요.');
            return;
        }
        
        // 기본 영역 수집
        const basicAreas = [];
        const basicItems = document.querySelectorAll('#basic-areas .dynamic-item');
        basicItems.forEach((item, index) => {
            const buttonName = item.querySelector(`input[name="basic-button-${index}"]`)?.value || '';
            const url = item.querySelector(`input[name="basic-url-${index}"]`)?.value || '';
            if (buttonName || url) {
                basicAreas.push({ buttonName, url });
            }
        });
        
        // 데모 영역 수집
        const demoAreas = [];
        const demoItems = document.querySelectorAll('#demo-areas .dynamic-item');
        demoItems.forEach((item, index) => {
            const buttonName = item.querySelector(`input[name="demo-button-${index}"]`)?.value || '';
            const url = item.querySelector(`input[name="demo-url-${index}"]`)?.value || '';
            const id = item.querySelector(`input[name="demo-id-${index}"]`)?.value || '';
            const password = item.querySelector(`input[name="demo-password-${index}"]`)?.value || '';
            if (buttonName || url) {
                demoAreas.push({ buttonName, url, id, password });
            }
        });
        
        // 고객 사례 영역 수집
        const caseAreas = [];
        const caseItems = document.querySelectorAll('#case-areas .dynamic-item');
        caseItems.forEach((item, index) => {
            const customerName = item.querySelector(`input[name="case-name-${index}"]`)?.value || '';
            const url = item.querySelector(`input[name="case-url-${index}"]`)?.value || '';
            if (customerName || url) {
                caseAreas.push({ customerName, url });
            }
        });
        
        // 제안서 파일
        const proposalFileInput = document.getElementById('product-proposal-file');
        let proposalFile = '';
        if (proposalFileInput.files.length > 0) {
            proposalFile = proposalFileInput.files[0].name;
            // 실제 파일 업로드 로직 구현 필요
        } else {
            // 수정 모드에서, 삭제되지 않은 경우에만 기존 파일명 유지
            const proposalDisplay = document.getElementById('proposal-file-name');
            const existingFileName = proposalDisplay ? proposalDisplay.textContent.trim() : '';
            if (existingFileName && existingFileName !== '' && !proposalFileRemoved) {
                proposalFile = existingFileName;
            } else {
                proposalFile = '';
            }
        }
        
        // 상품 데이터 구성
        const product = {
            id: parseInt(productId),
            name: productName,
            description: formData.get('description') || '',
            proposalFile: proposalFile,
            basicAreas: basicAreas,
            demoAreas: demoAreas,
            caseAreas: caseAreas
        };
        
        // 저장
        const products = getProducts();
        const existingIndex = products.findIndex(p => p.id === product.id);
        
        if (existingIndex >= 0) {
            products[existingIndex] = product;
        } else {
            products.push(product);
        }
        
        saveProducts(products);
        renderProducts();
        closeModal();
        });
    }
    
    // 제안서 파일 선택 시
    const proposalInput = document.getElementById('product-proposal-file');
    const proposalDisplay = document.getElementById('proposal-file-name');
    const proposalRemoveBtn = document.getElementById('btn-remove-proposal');

    if (proposalInput && proposalDisplay && proposalRemoveBtn) {
        proposalInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name || '';
            if (fileName) {
                proposalDisplay.textContent = fileName;
                proposalDisplay.style.display = 'block';
                proposalRemoveBtn.style.display = 'inline-block';

                // 새 파일을 선택하면 삭제 플래그는 해제
                proposalFileRemoved = false;
            } else {
                proposalDisplay.textContent = '';
                proposalDisplay.style.display = 'none';
                proposalRemoveBtn.style.display = 'none';

                // 선택된 파일이 없으면 삭제된 상태로 간주
                proposalFileRemoved = true;
            }
        });

        // 제안서 파일 삭제 버튼
        proposalRemoveBtn.addEventListener('click', function() {
            proposalInput.value = '';
            proposalDisplay.textContent = '';
            proposalDisplay.style.display = 'none';
            proposalRemoveBtn.style.display = 'none';

            // 사용자가 명시적으로 삭제한 경우
            proposalFileRemoved = true;
        });
    }
    
    // 초기 상품 리스트 렌더링
    renderProducts();
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown-menu-container')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
});

// 데모 열기 (아이디/패스워드 포함)
function openDemo(event, url, id, password) {
    event.preventDefault();
    if (id && password) {
        const message = `데모 접속 정보\n아이디: ${id}\n패스워드: ${password}\n\n이 정보를 복사하여 사용하세요.`;
        if (confirm(message + '\n\n페이지를 열까요?')) {
            window.open(url, '_blank');
        }
    } else {
        window.open(url, '_blank');
    }
}

// 드롭다운 메뉴 토글
function toggleDropdown(productId) {
    const dropdown = document.getElementById(`dropdown-${productId}`);
    const isVisible = dropdown.style.display === 'block';
    
    // 모든 드롭다운 닫기
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
    });
    
    // 현재 드롭다운 토글
    if (!isVisible) {
        dropdown.style.display = 'block';
    }
}

// 드롭다운 메뉴 닫기
function closeDropdown(productId) {
    const dropdown = document.getElementById(`dropdown-${productId}`);
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// 전역 함수로 노출
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.downloadFile = downloadFile;
window.openDemo = openDemo;
window.toggleDropdown = toggleDropdown;
window.closeDropdown = closeDropdown;

