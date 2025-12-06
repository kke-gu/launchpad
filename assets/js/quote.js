// 견적서 관리 JavaScript

// 고객사 정보 저장소 (로컬 스토리지 사용)
const CUSTOMERS_STORAGE_KEY = 'growth_launchpad_customers';
const QUOTES_STORAGE_KEY = 'growth_launchpad_quotes';
const QUOTE_TEMPLATES_STORAGE_KEY = 'growth_launchpad_quote_templates';

// 천단위 콤마 추가 함수
function addCommas(value) {
    if (!value) return '';
    const numStr = String(value).replace(/,/g, '');
    if (!numStr || isNaN(numStr)) return value;
    return Number(numStr).toLocaleString('ko-KR');
}

// 천단위 콤마 제거 함수
function removeCommas(value) {
    if (!value) return '';
    return String(value).replace(/,/g, '');
}

// 고객사 정보 가져오기
function getCustomers() {
    const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 고객사 정보 저장하기
function saveCustomers(customers) {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
}

// 고객사 정보 추가/업데이트
function saveCustomer(customerData) {
    const customers = getCustomers();
    const existingIndex = customers.findIndex(c => c.companyName === customerData.companyName);
    
    if (existingIndex >= 0) {
        customers[existingIndex] = customerData;
    } else {
        customers.push(customerData);
    }
    
    saveCustomers(customers);
}

// 고객사 정보 불러오기
function loadCustomer(companyName) {
    const customers = getCustomers();
    const customer = customers.find(c => c.companyName === companyName);
    
    if (customer) {
        document.getElementById('customer-company').value = customer.companyName || '';
        document.getElementById('customer-contact-name').value = customer.contactName || '';
        document.getElementById('customer-position').value = customer.position || '';
        document.getElementById('customer-phone').value = customer.phone || '';
        document.getElementById('customer-email').value = customer.email || '';
        
        // 사용 목적 체크박스
        // 먼저 모든 체크박스 해제
        document.querySelectorAll('input[name="purpose"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // 저장된 사용 목적 체크
        if (customer.purposes && Array.isArray(customer.purposes)) {
            customer.purposes.forEach(purpose => {
                const checkboxes = document.querySelectorAll(`input[name="purpose"][value="${escapeHtml(purpose)}"]`);
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                });
            });
        }
        
        // 재견적 여부 체크박스
        const requoteCheckbox = document.getElementById('is-requote');
        if (requoteCheckbox) {
            requoteCheckbox.checked = customer.isRequote || false;
        }
    }
}

// 고객사 검색 모달 열기
function openCustomerSearchModal(searchTerm = '') {
    const modal = document.getElementById('customer-search-modal');
    const searchInput = document.getElementById('customer-search-input');
    
    if (searchTerm) {
        searchInput.value = searchTerm;
    } else {
        searchInput.value = '';
    }
    
    modal.style.display = 'flex';
    searchCustomers(searchTerm);
    
    // 검색 입력창에 포커스
    setTimeout(() => {
        searchInput.focus();
    }, 100);
}

// 고객사 검색 모달 닫기
function closeCustomerSearchModal() {
    const modal = document.getElementById('customer-search-modal');
    modal.style.display = 'none';
}

// 고객사 검색 및 리스트 렌더링
function searchCustomers(searchTerm = '') {
    const customers = getCustomers();
    const quotes = getQuotes();
    const container = document.getElementById('customer-list-container');
    const emptyMessage = document.getElementById('customer-list-empty');
    
    if (!container) return;
    
    // 검색어로 필터링
    let filteredCustomers = customers;
    if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        filteredCustomers = customers.filter(customer => 
            customer.companyName.toLowerCase().includes(term) ||
            (customer.contactName && customer.contactName.toLowerCase().includes(term)) ||
            (customer.phone && customer.phone.includes(term)) ||
            (customer.email && customer.email.toLowerCase().includes(term))
        );
    }
    
    // 리스트 렌더링
    if (filteredCustomers.length === 0) {
        container.innerHTML = '';
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
        container.innerHTML = filteredCustomers.map(customer => {
            // 해당 고객사로 등록된 견적서 건수 계산
            const quoteCount = quotes.filter(quote => 
                quote.customer && quote.customer.companyName === customer.companyName
            ).length;
            
            return `
            <div class="customer-list-item" data-company-name="${escapeHtml(customer.companyName)}">
                <div class="customer-list-item-main">
                    <h3 class="customer-list-item-name">
                        ${escapeHtml(customer.companyName)}
                        <span class="customer-quote-count">(${quoteCount}건)</span>
                    </h3>
                    ${customer.contactName ? `<p class="customer-list-item-contact">${escapeHtml(customer.contactName)}${customer.position ? ` · ${escapeHtml(customer.position)}` : ''}</p>` : ''}
                    ${customer.phone ? `<p class="customer-list-item-info">연락처: ${escapeHtml(customer.phone)}</p>` : ''}
                    ${customer.email ? `<p class="customer-list-item-info">이메일: ${escapeHtml(customer.email)}</p>` : ''}
                    ${customer.purposes && customer.purposes.length > 0 ? `<p class="customer-list-item-info">사용 목적: ${customer.purposes.map(p => escapeHtml(p)).join(', ')}</p>` : ''}
                </div>
                <button type="button" class="btn primary btn-select-customer">선택</button>
            </div>
        `;
        }).join('');
        
        // 선택 버튼 이벤트 리스너 추가
        container.querySelectorAll('.btn-select-customer').forEach(btn => {
            btn.addEventListener('click', function() {
                const item = this.closest('.customer-list-item');
                const companyName = item.getAttribute('data-company-name');
                selectCustomer(companyName);
            });
        });
    }
}

// 고객사 선택
function selectCustomer(companyName) {
    loadCustomer(companyName);
    closeCustomerSearchModal();
}

// 견적서 ID 생성
function generateQuoteId() {
    return Date.now();
}

// 견적서 저장
function saveQuote(quoteData) {
    const quotes = getQuotes();
    const existingIndex = quotes.findIndex(q => q.id === quoteData.id);
    
    if (existingIndex >= 0) {
        quotes[existingIndex] = quoteData;
    } else {
        quotes.push(quoteData);
    }
    
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
}

// 견적서 목록 가져오기
function getQuotes() {
    const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 기존 견적서 데이터 로드 (수정용)
function loadQuoteForEdit(quoteId) {
    const quotes = getQuotes();
    const quote = quotes.find(q => q.id === quoteId);
    
    if (!quote) {
        alert('견적서를 찾을 수 없습니다.');
        return;
    }
    
    // 견적서 ID 설정
    const quoteIdInput = document.getElementById('quote-id');
    if (quoteIdInput) {
        quoteIdInput.value = quote.id;
    }
    
    // 고객사 정보
    if (quote.customer) {
        document.getElementById('customer-company').value = quote.customer.companyName || '';
        document.getElementById('customer-contact-name').value = quote.customer.contactName || '';
        document.getElementById('customer-position').value = quote.customer.position || '';
        document.getElementById('customer-phone').value = quote.customer.phone || '';
        document.getElementById('customer-email').value = quote.customer.email || '';
        
        // 사용 목적 체크박스
        if (quote.customer.purposes && Array.isArray(quote.customer.purposes)) {
            quote.customer.purposes.forEach(purpose => {
                const checkbox = document.querySelector(`input[name="purpose"][value="${purpose}"]`);
                if (checkbox) checkbox.checked = true;
            });
        } else if (quote.purpose) {
            // purpose가 문자열인 경우 (구분자로 분리)
            const purposes = quote.purpose.split(',').map(p => p.trim());
            purposes.forEach(purpose => {
                const checkbox = document.querySelector(`input[name="purpose"][value="${purpose}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // 재견적 여부
        const requoteCheckbox = document.getElementById('is-requote');
        if (requoteCheckbox) {
            requoteCheckbox.checked = quote.isRequote || false;
        }
    }
    
    // 견적서 정보
    document.getElementById('quote-recipient').value = quote.recipient || '';
    document.getElementById('quote-reference').value = quote.reference || '';
    document.getElementById('quote-title-input').value = quote.quoteTitle ? quote.quoteTitle.replace('[임시저장] ', '') : '';
    document.getElementById('quote-date').value = quote.quoteDate || '';
    document.getElementById('quote-payment-info').value = quote.paymentInfo || '';
    document.getElementById('quote-deposit-info').value = quote.depositInfo || '';
    document.getElementById('quote-manager-name').value = quote.managerName || '';
    document.getElementById('quote-manager-position').value = quote.managerPosition || '';
    document.getElementById('quote-manager-phone').value = quote.managerPhone || '';
    document.getElementById('quote-manager-email').value = quote.managerEmail || '';
    document.getElementById('quote-validity').value = quote.validity || '';
    
    // 견적 항목
    if (quote.items && quote.items.length > 0) {
        const tbody = document.getElementById('quote-items-body');
        const mobileContainer = document.getElementById('quote-items-mobile');
        
        if (tbody) {
            tbody.innerHTML = '';
        }
        if (mobileContainer) {
            mobileContainer.innerHTML = '';
        }
        
        quote.items.forEach(item => {
            addQuoteItem(item);
        });
    }
    
    // 계약 총액 업데이트
    updateQuoteTotal();
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 견적 항목 ID 생성
let quoteItemIdCounter = 0;
function generateQuoteItemId() {
    return ++quoteItemIdCounter;
}

// 드래그 앤 드롭을 위한 전역 변수
let draggedRow = null;

// 견적 항목 추가
function addQuoteItem(item = null, tbodyId = 'quote-items-body') {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    const id = item ? item.id : generateQuoteItemId();
    const isMobile = window.innerWidth <= 768;
    
    // 모바일에서는 카드 형태로 추가
    if (isMobile && (tbodyId === 'quote-items-body' || tbodyId === 'template-edit-items-body')) {
        if (tbodyId === 'quote-items-body') {
            return addQuoteItemMobile(item, id);
        } else if (tbodyId === 'template-edit-items-body') {
            return addQuoteItemMobile(item, id, 'template-edit-items-mobile');
        }
    }
    
    const row = document.createElement('tr');
    row.className = 'quote-item-row';
    row.setAttribute('data-item-id', id);
    row.draggable = false; // 행 전체 드래그 비활성화
    
    row.innerHTML = `
        <td class="drag-handle-cell" data-label="순서">
            <div class="drag-handle" title="드래그하여 순서 변경" draggable="true">
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg" pointer-events="none">
                    <rect x="1" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                    <rect x="5" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                    <rect x="9" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                </svg>
            </div>
        </td>
        <td data-label="구분">
            <textarea class="form-input form-input-auto-resize" name="item-category-${id}" placeholder="구분" rows="1">${item ? escapeHtml(item.category || '') : ''}</textarea>
        </td>
        <td data-label="세부 항목">
            <textarea class="form-input form-input-auto-resize" name="item-detail-${id}" placeholder="세부 항목" rows="1">${item ? escapeHtml(item.detail || '') : ''}</textarea>
        </td>
        <td data-label="기본계약기간(월)">
            <input type="text" class="form-input form-input-small" name="item-period-${id}" value="${item ? (item.period || '') : ''}" placeholder="월 또는 텍스트 입력">
        </td>
        <td data-label="수량">
            <input type="number" class="form-input form-input-small" name="item-quantity-${id}" value="${item ? (item.quantity || '') : ''}" placeholder="수량" min="0" step="0.1">
        </td>
        <td data-label="단가">
            <input type="text" class="form-input form-input-small item-price" name="item-price-${id}" value="${item ? (item.price ? addCommas(item.price) : '') : ''}" placeholder="단가" data-item-id="${id}">
        </td>
        <td data-label="공급가액">
            <input type="text" class="form-input form-input-small item-amount" name="item-amount-${id}" value="${item ? (item.amount ? addCommas(item.amount) : '') : ''}" placeholder="공급가액" data-item-id="${id}">
        </td>
        <td data-label="비고">
            <textarea class="form-input form-input-auto-resize" name="item-note-${id}" placeholder="비고" rows="1">${item ? escapeHtml(item.note || '') : ''}</textarea>
        </td>
        <td data-label="작업">
            <div class="quote-item-actions">
                <button type="button" class="btn-icon-only btn-add-item-below" title="아래에 항목 추가">+</button>
                <button type="button" class="btn-icon-only btn-delete-item" title="삭제">×</button>
            </div>
        </td>
    `;
    
    tbody.appendChild(row);
    
    // 이벤트 리스너 추가
    const isTemplateItem = tbodyId === 'template-items-body' || tbodyId === 'template-edit-items-body';
    attachQuoteItemEvents(row, id, isTemplateItem);
    
    return row;
}

// 모바일용 견적 항목 카드 추가
function addQuoteItemMobile(item = null, id = null, containerId = 'quote-items-mobile') {
    const mobileContainer = document.getElementById(containerId);
    if (!mobileContainer) return null;
    
    if (!id) {
        id = item ? item.id : generateQuoteItemId();
    }
    
    const card = document.createElement('div');
    card.className = 'quote-item-card-mobile';
    card.setAttribute('data-item-id', id);
    
    card.innerHTML = `
        <div class="quote-item-card-mobile-header">
            <div class="quote-item-card-mobile-title">견적 항목</div>
            <div class="quote-item-card-mobile-actions">
                <button type="button" class="btn-icon-only btn-add-item-below" title="아래에 항목 추가">+</button>
                <button type="button" class="btn-icon-only btn-delete-item" title="삭제">×</button>
            </div>
        </div>
        <div class="quote-item-card-mobile-field">
            <label>구분</label>
            <textarea class="form-input form-input-auto-resize" name="item-category-${id}" placeholder="구분을 입력하세요" rows="2">${item ? escapeHtml(item.category || '') : ''}</textarea>
        </div>
        <div class="quote-item-card-mobile-field">
            <label>세부 항목</label>
            <textarea class="form-input form-input-auto-resize" name="item-detail-${id}" placeholder="세부 항목을 입력하세요" rows="2">${item ? escapeHtml(item.detail || '') : ''}</textarea>
        </div>
        <div class="quote-item-card-mobile-row">
            <div class="quote-item-card-mobile-field">
                <label>기본계약기간(월)</label>
                <input type="text" class="form-input" name="item-period-${id}" value="${item ? (item.period || '') : ''}" placeholder="월 또는 텍스트">
            </div>
            <div class="quote-item-card-mobile-field">
                <label>수량</label>
                <input type="number" class="form-input" name="item-quantity-${id}" value="${item ? (item.quantity || '') : ''}" placeholder="수량" min="0" step="0.1">
            </div>
        </div>
        <div class="quote-item-card-mobile-row">
            <div class="quote-item-card-mobile-field">
                <label>단가</label>
                <input type="text" class="form-input item-price" name="item-price-${id}" value="${item ? (item.price ? addCommas(item.price) : '') : ''}" placeholder="단가" data-item-id="${id}">
            </div>
            <div class="quote-item-card-mobile-field">
                <label>공급가액</label>
                <input type="text" class="form-input item-amount" name="item-amount-${id}" value="${item ? (item.amount ? addCommas(item.amount) : '') : ''}" placeholder="공급가액" data-item-id="${id}">
            </div>
        </div>
        <div class="quote-item-card-mobile-field">
            <label>비고</label>
            <textarea class="form-input form-input-auto-resize" name="item-note-${id}" placeholder="비고를 입력하세요" rows="2">${item ? escapeHtml(item.note || '') : ''}</textarea>
        </div>
        <div class="quote-item-card-mobile-footer">
            <button type="button" class="btn secondary btn-add-item-below-footer">아래에 항목 추가</button>
            <button type="button" class="btn ghost btn-delete-item-footer">삭제</button>
        </div>
    `;
    
    mobileContainer.appendChild(card);
    
    // 이벤트 리스너 추가
    attachQuoteItemEventsMobile(card, id);
    
    return card;
}

// 모바일용 견적 항목 이벤트 리스너
function attachQuoteItemEventsMobile(card, id) {
    // 삭제 버튼 (헤더)
    const deleteBtn = card.querySelector('.btn-delete-item');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('이 항목을 삭제하시겠습니까?')) {
                card.remove();
                updateQuoteTotal();
            }
        });
    }
    
    // 삭제 버튼 (하단)
    const deleteBtnFooter = card.querySelector('.btn-delete-item-footer');
    if (deleteBtnFooter) {
        deleteBtnFooter.addEventListener('click', () => {
            if (confirm('이 항목을 삭제하시겠습니까?')) {
                card.remove();
                updateQuoteTotal();
            }
        });
    }
    
    // 아래에 항목 추가 버튼 (헤더)
    const addBelowBtn = card.querySelector('.btn-add-item-below');
    if (addBelowBtn) {
        addBelowBtn.addEventListener('click', () => {
            const newCard = addQuoteItemMobile();
            if (newCard && card.nextSibling) {
                card.parentNode.insertBefore(newCard, card.nextSibling);
            } else if (newCard) {
                card.parentNode.appendChild(newCard);
            }
        });
    }
    
    // 아래에 항목 추가 버튼 (하단)
    const addBelowBtnFooter = card.querySelector('.btn-add-item-below-footer');
    if (addBelowBtnFooter) {
        addBelowBtnFooter.addEventListener('click', () => {
            const newCard = addQuoteItemMobile();
            if (newCard && card.nextSibling) {
                card.parentNode.insertBefore(newCard, card.nextSibling);
            } else if (newCard) {
                card.parentNode.appendChild(newCard);
            }
        });
    }
    
    // 단가 입력 시 공급가액 자동 계산
    const priceInput = card.querySelector('.item-price');
    const amountInput = card.querySelector('.item-amount');
    const quantityInput = card.querySelector('input[name="item-quantity-' + id + '"]');
    const periodInput = card.querySelector('input[name="item-period-' + id + '"]');
    
    function calculateAmount() {
        const price = parseFloat(removeCommas(priceInput.value)) || 0;
        const quantity = parseFloat(quantityInput.value) || 0;
        const amount = price * quantity;
        if (amountInput) {
            amountInput.value = addCommas(amount);
        }
        updateQuoteTotal();
    }
    
    if (priceInput) {
        priceInput.addEventListener('input', function(e) {
            const value = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = addCommas(value);
            calculateAmount();
        });
        
        priceInput.addEventListener('blur', function(e) {
            const value = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = addCommas(value);
        });
    }
    
    if (amountInput) {
        amountInput.addEventListener('input', function(e) {
            const value = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = addCommas(value);
            updateQuoteTotal();
        });
        
        amountInput.addEventListener('blur', function(e) {
            const value = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = addCommas(value);
        });
    }
    
    if (quantityInput) quantityInput.addEventListener('input', calculateAmount);
    if (periodInput) periodInput.addEventListener('input', calculateAmount);
    
    // 자동 높이 조절 textarea
    const textareas = card.querySelectorAll('.form-input-auto-resize');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });
        // 초기 높이 설정
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    });
}

// 견적 항목 이벤트 리스너
function attachQuoteItemEvents(row, id, isTemplateItem = false) {
    // 삭제 버튼
    const deleteBtn = row.querySelector('.btn-delete-item');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('이 항목을 삭제하시겠습니까?')) {
                row.remove();
                updateQuoteTotal();
            }
        });
    }
    
    // 아래에 항목 추가 버튼
    const addBelowBtn = row.querySelector('.btn-add-item-below');
    if (addBelowBtn) {
        addBelowBtn.addEventListener('click', () => {
            const newRow = addQuoteItem();
            if (newRow && row.nextSibling) {
                row.parentNode.insertBefore(newRow, row.nextSibling);
            } else if (newRow) {
                row.parentNode.appendChild(newRow);
            }
        });
    }
    
    // 드래그 핸들 찾기
    const dragHandle = row.querySelector('.drag-handle');
    
    // 드래그 앤 드롭 이벤트 - 드래그 핸들에서만 시작
    if (dragHandle) {
        dragHandle.addEventListener('mousedown', (e) => {
            // 마우스 다운 시 드래그 준비
            e.stopPropagation();
        });
        
        dragHandle.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            draggedRow = row;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', id);
            row.classList.add('dragging');
            dragHandle.style.cursor = 'grabbing';
            // 행을 숨기지 않고 시각적 효과만 적용
        });
        
        dragHandle.addEventListener('dragend', (e) => {
            e.stopPropagation();
            row.classList.remove('dragging');
            dragHandle.style.cursor = 'grab';
            // 모든 drag-over 클래스 제거
            document.querySelectorAll('.quote-item-row.drag-over').forEach(r => {
                r.classList.remove('drag-over');
            });
            draggedRow = null;
        });
        
        // 드래그 핸들에 커서 스타일 추가
        dragHandle.style.cursor = 'grab';
        dragHandle.style.userSelect = 'none';
        dragHandle.style.webkitUserSelect = 'none';
        dragHandle.style.mozUserSelect = 'none';
        dragHandle.style.msUserSelect = 'none';
        
        // 드래그 핸들 클릭 시 이벤트 전파 방지
        dragHandle.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // 드롭 영역은 행 전체
    row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (draggedRow && draggedRow !== row) {
            const afterElement = getDragAfterElement(row.parentNode, e.clientY);
            if (afterElement == null) {
                row.parentNode.appendChild(draggedRow);
            } else {
                row.parentNode.insertBefore(draggedRow, afterElement);
            }
        }
    });
    
    row.addEventListener('dragenter', (e) => {
        e.preventDefault();
        if (draggedRow && draggedRow !== row) {
            row.classList.add('drag-over');
        }
    });
    
    row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over');
    });
    
    row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');
    });
    
    // 공급가액 자동 계산
    const periodInput = row.querySelector(`input[name="item-period-${id}"]`);
    const quantityInput = row.querySelector(`input[name="item-quantity-${id}"]`);
    const priceInput = row.querySelector(`input[name="item-price-${id}"]`);
    const amountInput = row.querySelector(`input[name="item-amount-${id}"]`);
    
    // 단가, 공급가액에 천단위 포맷팅 적용 (템플릿 및 일반 견적 항목 모두)
    if (priceInput) {
        priceInput.addEventListener('input', function(e) {
            const value = e.target.value;
            const numValue = removeCommas(value);
            if (numValue && !isNaN(numValue)) {
                e.target.value = addCommas(numValue);
            }
        });
        
        priceInput.addEventListener('blur', function(e) {
            const value = e.target.value;
            const numValue = removeCommas(value);
            if (numValue && !isNaN(numValue)) {
                e.target.value = addCommas(numValue);
            }
        });
    }
    
    if (amountInput) {
        amountInput.addEventListener('input', function(e) {
            const value = e.target.value;
            const numValue = removeCommas(value);
            if (numValue && !isNaN(numValue)) {
                e.target.value = addCommas(numValue);
            }
        });
        
        amountInput.addEventListener('blur', function(e) {
            const value = e.target.value;
            const numValue = removeCommas(value);
            if (numValue && !isNaN(numValue)) {
                e.target.value = addCommas(numValue);
            }
        });
    }
    
    function calculateAmount() {
        const period = parseFloat(periodInput.value) || 0;
        const quantity = parseFloat(quantityInput.value) || 0;
        const priceStr = priceInput ? removeCommas(priceInput.value) : '0';
        const price = parseFloat(priceStr) || 0;
        
        if (period > 0 && quantity > 0 && price > 0) {
            const calculated = period * quantity * price;
            if (amountInput) {
                if (amountInput.value === '' || removeCommas(amountInput.value) == calculated) {
                    amountInput.value = addCommas(calculated); // 모든 항목에 천단위 콤마 적용
                }
            }
        }
        // 계약 총액 업데이트
        updateQuoteTotal();
    }
    
    if (periodInput) periodInput.addEventListener('input', calculateAmount);
    if (quantityInput) quantityInput.addEventListener('input', calculateAmount);
    if (priceInput) priceInput.addEventListener('input', calculateAmount);
    
    // 공급가액 직접 입력 시에도 총액 업데이트
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            updateQuoteTotal();
        });
    }
    
    // textarea 자동 높이 조절 및 같은 행 입력창 높이 맞추기
    function syncRowInputHeights() {
        const rowInputs = row.querySelectorAll('.form-input, .form-input-small');
        let maxHeight = 0;
        
        // 모든 입력창의 실제 필요한 높이를 계산
        rowInputs.forEach(input => {
            if (input.tagName === 'TEXTAREA') {
                // scrollHeight를 얻기 위해 임시로 높이를 저장하고 auto로 설정
                const tempHeight = input.style.height;
                input.style.height = 'auto';
                const neededHeight = input.scrollHeight;
                // 즉시 원래 높이로 복원하여 깜빡임 방지
                input.style.height = tempHeight || (input.offsetHeight + 'px');
                maxHeight = Math.max(maxHeight, neededHeight);
            } else {
                // input 요소는 현재 높이 사용
                maxHeight = Math.max(maxHeight, input.offsetHeight);
            }
        });
        
        // 최소 높이 보장
        maxHeight = Math.max(maxHeight, 38);
        
        // 모든 입력창의 높이를 최대 높이로 맞추기
        // 한 번에 모든 높이를 설정하여 깜빡임 최소화
        requestAnimationFrame(() => {
            rowInputs.forEach(input => {
                const currentHeight = parseInt(input.style.height) || input.offsetHeight;
                // 높이 차이가 2px 이상일 때만 변경 (작은 변화는 무시)
                if (Math.abs(currentHeight - maxHeight) >= 2) {
                    input.style.height = maxHeight + 'px';
                }
            });
        });
    }
    
    // Debounce 함수
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Debounced 높이 조절 함수 (500ms 후 실행)
    const debouncedSyncHeights = debounce(syncRowInputHeights, 500);
    
    const autoResizeTextareas = row.querySelectorAll('.form-input-auto-resize');
    autoResizeTextareas.forEach(textarea => {
        // 입력 중에는 스크롤 사용, 입력이 끝난 후에만 높이 조절
        textarea.addEventListener('input', () => {
            // 입력 중에는 스크롤을 사용하도록 overflow 설정
            if (textarea.scrollHeight > textarea.clientHeight) {
                textarea.style.overflowY = 'auto';
            }
            // 입력이 끝난 후 높이 조절 (debounce) - 하지만 blur 이벤트는 제거
        });
        
        // 포커스를 잃을 때만 높이 조절 (debounce 적용)
        textarea.addEventListener('blur', () => {
            // blur 시 즉시 높이 조절 (debounce 없이)
            setTimeout(() => {
                syncRowInputHeights();
            }, 100);
        });
    });
    
    // 초기 높이 설정
    setTimeout(() => {
        syncRowInputHeights();
    }, 0);
}

// 드래그 후 위치 계산
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.quote-item-row:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 모바일 카드에서 견적 항목 수집
function collectQuoteItemsMobile(containerId = 'quote-items-mobile') {
    const mobileContainer = document.getElementById(containerId);
    if (!mobileContainer) return [];
    
    const cards = mobileContainer.querySelectorAll('.quote-item-card-mobile');
    const items = [];
    
    cards.forEach(card => {
        const id = card.getAttribute('data-item-id');
        const category = card.querySelector(`textarea[name="item-category-${id}"]`)?.value || '';
        const detail = card.querySelector(`textarea[name="item-detail-${id}"]`)?.value || '';
        const period = card.querySelector(`input[name="item-period-${id}"]`)?.value || '';
        const quantity = card.querySelector(`input[name="item-quantity-${id}"]`)?.value || '';
        const priceInput = card.querySelector(`input[name="item-price-${id}"]`);
        const amountInput = card.querySelector(`input[name="item-amount-${id}"]`);
        // 모든 항목에서 콤마 제거 후 저장
        const price = priceInput ? removeCommas(priceInput.value) : '';
        const amount = amountInput ? removeCommas(amountInput.value) : '';
        const note = card.querySelector(`textarea[name="item-note-${id}"]`)?.value || '';
        
        if (category || detail || period || quantity || price || amount || note) {
            items.push({
                id: id,
                category: category,
                detail: detail,
                period: period,
                quantity: quantity,
                price: price,
                amount: amount,
                note: note
            });
        }
    });
    
    return items;
}

// 견적 항목 수집
function collectQuoteItems(tbodyId = 'quote-items-body') {
    // 모바일인 경우 카드에서 수집
    if (window.innerWidth <= 768 && tbodyId === 'quote-items-body') {
        return collectQuoteItemsMobile();
    }
    
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return [];
    
    const rows = tbody.querySelectorAll('.quote-item-row');
    const items = [];
    
    rows.forEach(row => {
        const id = row.getAttribute('data-item-id');
        const category = row.querySelector(`textarea[name="item-category-${id}"]`)?.value || '';
        const detail = row.querySelector(`textarea[name="item-detail-${id}"]`)?.value || '';
        const period = row.querySelector(`input[name="item-period-${id}"]`)?.value || '';
        const quantity = row.querySelector(`input[name="item-quantity-${id}"]`)?.value || '';
        const priceInput = row.querySelector(`input[name="item-price-${id}"]`);
        const amountInput = row.querySelector(`input[name="item-amount-${id}"]`);
        // 모든 항목에서 콤마 제거 후 저장
        const price = priceInput ? removeCommas(priceInput.value) : '';
        const amount = amountInput ? removeCommas(amountInput.value) : '';
        const note = row.querySelector(`textarea[name="item-note-${id}"]`)?.value || '';
        
        if (category || detail || period || quantity || price || amount || note) {
            items.push({
                id: id,
                category: category,
                detail: detail,
                period: period,
                quantity: quantity,
                price: price,
                amount: amount,
                note: note
            });
        }
    });
    
    return items;
}

// 모바일 카드 데이터를 테이블로 동기화 (저장 시)
function syncQuoteItemsToTable(items) {
    const tbody = document.getElementById('quote-items-body');
    if (!tbody) return;
    
    // 기존 행 제거
    tbody.innerHTML = '';
    
    // 카드 데이터로 테이블 행 생성
    items.forEach(item => {
        addQuoteItem(item);
    });
}

// 견적 항목 표시 동기화 (테이블/카드)
function syncQuoteItemsDisplay() {
    const isMobile = window.innerWidth <= 768;
    const tbody = document.getElementById('quote-items-body');
    const mobileContainer = document.getElementById('quote-items-mobile');
    
    if (!tbody || !mobileContainer) return;
    
    if (isMobile) {
        // 모바일: 테이블에서 카드로 복사
        const rows = tbody.querySelectorAll('.quote-item-row');
        const existingCards = mobileContainer.querySelectorAll('.quote-item-card-mobile');
        const existingIds = Array.from(existingCards).map(card => card.getAttribute('data-item-id'));
        
        rows.forEach(row => {
            const id = row.getAttribute('data-item-id');
            if (!existingIds.includes(id)) {
                // 카드가 없으면 생성
                const category = row.querySelector(`textarea[name="item-category-${id}"]`)?.value || '';
                const detail = row.querySelector(`textarea[name="item-detail-${id}"]`)?.value || '';
                const period = row.querySelector(`input[name="item-period-${id}"]`)?.value || '';
                const quantity = row.querySelector(`input[name="item-quantity-${id}"]`)?.value || '';
                const priceInput = row.querySelector(`input[name="item-price-${id}"]`);
                const amountInput = row.querySelector(`input[name="item-amount-${id}"]`);
                const price = priceInput ? priceInput.value : '';
                const amount = amountInput ? amountInput.value : '';
                const note = row.querySelector(`textarea[name="item-note-${id}"]`)?.value || '';
                
                const item = {
                    id: id,
                    category: category,
                    detail: detail,
                    period: period,
                    quantity: quantity,
                    price: removeCommas(price),
                    amount: removeCommas(amount),
                    note: note
                };
                
                addQuoteItemMobile(item, id);
            }
        });
    } else {
        // PC: 카드에서 테이블로 복사
        const cards = mobileContainer.querySelectorAll('.quote-item-card-mobile');
        const existingRows = tbody.querySelectorAll('.quote-item-row');
        const existingIds = Array.from(existingRows).map(row => row.getAttribute('data-item-id'));
        
        cards.forEach(card => {
            const id = card.getAttribute('data-item-id');
            if (!existingIds.includes(id)) {
                // 테이블 행이 없으면 생성
                const category = card.querySelector(`textarea[name="item-category-${id}"]`)?.value || '';
                const detail = card.querySelector(`textarea[name="item-detail-${id}"]`)?.value || '';
                const period = card.querySelector(`input[name="item-period-${id}"]`)?.value || '';
                const quantity = card.querySelector(`input[name="item-quantity-${id}"]`)?.value || '';
                const priceInput = card.querySelector(`input[name="item-price-${id}"]`);
                const amountInput = card.querySelector(`input[name="item-amount-${id}"]`);
                const price = priceInput ? removeCommas(priceInput.value) : '';
                const amount = amountInput ? removeCommas(amountInput.value) : '';
                const note = card.querySelector(`textarea[name="item-note-${id}"]`)?.value || '';
                
                const item = {
                    id: id,
                    category: category,
                    detail: detail,
                    period: period,
                    quantity: quantity,
                    price: price,
                    amount: amount,
                    note: note
                };
                
                addQuoteItem(item);
            }
        });
    }
}

// 계약 총액 계산 및 업데이트
function updateQuoteTotal() {
    const items = collectQuoteItems();
    let totalAmount = 0;
    
    items.forEach(item => {
        const amount = parseFloat(item.amount) || 0;
        totalAmount += amount;
    });
    
    const totalExcludingVat = totalAmount;
    const totalIncludingVat = totalAmount * 1.1; // VAT 10%
    
    const excludingVatEl = document.getElementById('quote-total-excluding-vat');
    const includingVatEl = document.getElementById('quote-total-including-vat');
    
    if (excludingVatEl) {
        excludingVatEl.textContent = totalExcludingVat.toLocaleString('ko-KR') + '원';
    }
    if (includingVatEl) {
        includingVatEl.textContent = totalIncludingVat.toLocaleString('ko-KR') + '원';
    }
}

// 템플릿 저장
function saveQuoteTemplate(templateName, category, items) {
    const templates = getQuoteTemplates();
    const template = {
        id: Date.now(),
        name: templateName,
        category: category,
        items: items,
        createdAt: new Date().toISOString()
    };
    
    templates.push(template);
    localStorage.setItem(QUOTE_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    return template;
}

// 템플릿 목록 가져오기
function getQuoteTemplates() {
    const stored = localStorage.getItem(QUOTE_TEMPLATES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 초기 템플릿 데이터 생성
function initializeSampleTemplates() {
    const templates = getQuoteTemplates();
    
    // 이미 템플릿이 있으면 생성하지 않음
    if (templates.length > 0) {
        return;
    }
    
    const sampleTemplates = [
        {
            id: 1001,
            name: '구축형 기본 템플릿',
            category: '구축형',
            items: [
                {
                    id: '1',
                    category: '시스템 구축',
                    detail: '이지서티 시스템 구축',
                    period: '12',
                    quantity: '1',
                    price: '5000000',
                    amount: '60000000',
                    note: '초기 구축비 포함'
                },
                {
                    id: '2',
                    category: '유지보수',
                    detail: '연간 유지보수',
                    period: '12',
                    quantity: '1',
                    price: '1000000',
                    amount: '12000000',
                    note: '구축 후 1년간 무료 유지보수'
                }
            ],
            createdAt: new Date('2024-01-15').toISOString()
        },
        {
            id: 1002,
            name: 'SaaS 기본 템플릿',
            category: 'SaaS',
            items: [
                {
                    id: '1',
                    category: '라이선스',
                    detail: '이지서티 SaaS 라이선스',
                    period: '12',
                    quantity: '10',
                    price: '50000',
                    amount: '6000000',
                    note: '월 단위 과금'
                },
                {
                    id: '2',
                    category: '설정비',
                    detail: '초기 설정 및 교육',
                    period: '1',
                    quantity: '1',
                    price: '2000000',
                    amount: '2000000',
                    note: '일회성 비용'
                }
            ],
            createdAt: new Date('2024-01-20').toISOString()
        },
        {
            id: 1003,
            name: '하이브리드 템플릿',
            category: '하이브리드',
            items: [
                {
                    id: '1',
                    category: '구축',
                    detail: '온프레미스 시스템 구축',
                    period: '6',
                    quantity: '1',
                    price: '3000000',
                    amount: '18000000',
                    note: '기본 구축'
                },
                {
                    id: '2',
                    category: '클라우드 연동',
                    detail: '클라우드 서비스 연동',
                    period: '12',
                    quantity: '1',
                    price: '500000',
                    amount: '6000000',
                    note: '월 단위 연동 비용'
                },
                {
                    id: '3',
                    category: '유지보수',
                    detail: '통합 유지보수',
                    period: '12',
                    quantity: '1',
                    price: '1500000',
                    amount: '18000000',
                    note: '구축 및 클라우드 통합 유지보수'
                }
            ],
            createdAt: new Date('2024-02-01').toISOString()
        }
    ];
    
    localStorage.setItem(QUOTE_TEMPLATES_STORAGE_KEY, JSON.stringify(sampleTemplates));
}

// 템플릿 삭제
function deleteQuoteTemplate(templateId) {
    const templates = getQuoteTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    localStorage.setItem(QUOTE_TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));
}

// 템플릿 업데이트
function updateQuoteTemplate(templateId, templateName, category, items) {
    const templates = getQuoteTemplates();
    const index = templates.findIndex(t => t.id === templateId);
    if (index >= 0) {
        templates[index] = {
            ...templates[index],
            name: templateName,
            category: category,
            items: items,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(QUOTE_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
        return templates[index];
    }
    return null;
}

// 상품 목록 렌더링
function renderProductList() {
    // products.js의 getProducts 함수 사용
    if (typeof getProducts === 'function') {
        const products = getProducts();
        const select = document.getElementById('product-select');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">상품을 선택하세요</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            select.appendChild(option);
        });
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    if (!window.checkLogin || !window.checkLogin()) {
        return;
    }
    // URL 파라미터에서 견적서 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get('id');
    
    // 기존 견적서 데이터 로드
    if (quoteId) {
        loadQuoteForEdit(parseInt(quoteId));
    }
    
    // 상품 목록 렌더링
    renderProductList();
    
    // 초기 샘플 템플릿 생성
    initializeSampleTemplates();
    
    // 고객사 검색 버튼
    const searchBtn = document.getElementById('btn-search-customer');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const companyName = document.getElementById('customer-company').value.trim();
            openCustomerSearchModal(companyName);
        });
    }
    
    // 고객사 검색 모달 닫기
    const modal = document.getElementById('customer-search-modal');
    if (modal) {
        const overlay = modal.querySelector('.modal-overlay');
        const closeBtn = modal.querySelector('.modal-close');
        
        if (overlay) {
            overlay.addEventListener('click', closeCustomerSearchModal);
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', closeCustomerSearchModal);
        }
    }
    
    // 고객사 검색 입력창 엔터키 처리
    const searchInput = document.getElementById('customer-search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const term = this.value.trim();
                searchCustomers(term);
            }
        });
    }
    
    // 고객사 검색 버튼
    const customerSearchBtn = document.getElementById('btn-customer-search');
    if (customerSearchBtn) {
        customerSearchBtn.addEventListener('click', function() {
            const term = document.getElementById('customer-search-input').value.trim();
            searchCustomers(term);
        });
    }
    
    // 고객사 정보 저장 버튼
    const saveCustomerBtn = document.getElementById('btn-save-customer');
    if (saveCustomerBtn) {
        saveCustomerBtn.addEventListener('click', function() {
            const companyName = document.getElementById('customer-company').value.trim();
            if (!companyName) {
                alert('고객사명을 입력해주세요.');
                return;
            }
            
            // 사용 목적 수집
            const purposes = [];
            document.querySelectorAll('input[name="purpose"]:checked').forEach(checkbox => {
                purposes.push(checkbox.value);
            });
            
            const requoteCheckbox = document.getElementById('is-requote');
            const isRequote = requoteCheckbox ? requoteCheckbox.checked : false;
            
            const customerData = {
                companyName: companyName,
                contactName: document.getElementById('customer-contact-name').value.trim(),
                position: document.getElementById('customer-position').value.trim(),
                phone: document.getElementById('customer-phone').value.trim(),
                email: document.getElementById('customer-email').value.trim(),
                purposes: purposes,
                isRequote: isRequote
            };
            
            saveCustomer(customerData);
            alert('고객사 정보가 저장되었습니다.');
        });
    }
    
    // 견적 항목 추가 버튼
    const addQuoteItemBtn = document.getElementById('btn-add-quote-item');
    if (addQuoteItemBtn) {
        addQuoteItemBtn.addEventListener('click', function() {
            addQuoteItem();
        });
    }
    
    // 화면 크기 변경 시 테이블/카드 전환
    let resizeTimer;
    let lastWindowWidth = window.innerWidth;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const currentWidth = window.innerWidth;
            const wasMobile = lastWindowWidth <= 768;
            const isMobile = currentWidth <= 768;
            
            // 모바일/PC 전환 시에만 동기화
            if (wasMobile !== isMobile) {
                syncQuoteItemsDisplay();
            }
            lastWindowWidth = currentWidth;
        }, 250);
    });
    
    // 초기 표시 동기화
    syncQuoteItemsDisplay();
    
    // 폼 제출
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const quoteId = formData.get('quote-id') || generateQuoteId();
            
            // 고객사 정보 수집
            const companyName = document.getElementById('customer-company').value.trim();
            if (!companyName) {
                alert('고객사명을 입력해주세요.');
                return;
            }
            
            const purposes = [];
            document.querySelectorAll('input[name="purpose"]:checked').forEach(checkbox => {
                purposes.push(checkbox.value);
            });
            
            const requoteCheckbox = document.getElementById('is-requote');
            const isRequote = requoteCheckbox ? requoteCheckbox.checked : false;
            
            const customerInfo = {
                companyName: companyName,
                contactName: document.getElementById('customer-contact-name').value.trim(),
                position: document.getElementById('customer-position').value.trim(),
                phone: document.getElementById('customer-phone').value.trim(),
                email: document.getElementById('customer-email').value.trim(),
                purposes: purposes,
                isRequote: isRequote
            };
            
            // 고객사 정보 자동 저장
            saveCustomer(customerInfo);
            
            // 견적서 데이터 구성
            const quoteData = {
                id: parseInt(quoteId),
                customer: customerInfo,
                recipient: document.getElementById('quote-recipient')?.value || '',
                reference: document.getElementById('quote-reference')?.value || '',
                quoteTitle: document.getElementById('quote-title-input')?.value || '',
                quoteDate: document.getElementById('quote-date')?.value || '',
                items: collectQuoteItems(),
                paymentInfo: document.getElementById('quote-payment-info')?.value || '',
                depositInfo: document.getElementById('quote-deposit-info')?.value || '',
                managerName: document.getElementById('quote-manager-name')?.value || '',
                managerPosition: document.getElementById('quote-manager-position')?.value || '',
                managerPhone: document.getElementById('quote-manager-phone')?.value || '',
                managerEmail: document.getElementById('quote-manager-email')?.value || '',
                validity: document.getElementById('quote-validity')?.value || '',
                product: formData.get('product') || '',
                licenseCount: parseInt(formData.get('license_count')) || 0,
                memo: formData.get('memo') || '',
                purpose: purposes.join(', '),
                isRequote: isRequote,
                isTemp: false,
                status: '접수',
                statusHistory: {
                    접수: quoteDate ? new Date(quoteDate + 'T00:00:00').toISOString() : new Date().toISOString()
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // 계약 총액 계산
            let totalAmount = 0;
            quoteData.items.forEach(item => {
                totalAmount += parseFloat(removeCommas(item.amount)) || 0;
            });
            quoteData.totalAmount = totalAmount;
            
            saveQuote(quoteData);
            alert('견적서가 생성되었습니다.');
            window.location.href = 'status.html';
            
            // 견적서 미리보기 또는 다운로드 로직 추가 가능
        });
    }
    
    // 임시 저장 버튼
    const tempSaveBtn = document.getElementById('btn-temp-save');
    if (tempSaveBtn) {
        tempSaveBtn.addEventListener('click', function() {
            const formData = new FormData(document.getElementById('quote-form'));
            const quoteId = formData.get('quote-id') || generateQuoteId();
            
            const companyName = document.getElementById('customer-company').value.trim();
            const purposes = [];
            document.querySelectorAll('input[name="purpose"]:checked').forEach(checkbox => {
                purposes.push(checkbox.value);
            });
            
            const customerInfo = {
                companyName: companyName,
                contactName: document.getElementById('customer-contact-name').value.trim(),
                position: document.getElementById('customer-position').value.trim(),
                phone: document.getElementById('customer-phone').value.trim(),
                email: document.getElementById('customer-email').value.trim(),
                purposes: purposes
            };
            
            const requoteCheckbox = document.getElementById('is-requote');
            const isRequote = requoteCheckbox ? requoteCheckbox.checked : false;
            
            const quoteTitle = document.getElementById('quote-title-input')?.value || '';
            const quoteData = {
                id: parseInt(quoteId),
                customer: customerInfo,
                recipient: document.getElementById('quote-recipient')?.value || '',
                reference: document.getElementById('quote-reference')?.value || '',
                quoteTitle: quoteTitle ? `[임시저장] ${quoteTitle}` : '[임시저장] 견적서',
                quoteDate: document.getElementById('quote-date')?.value || '',
                items: collectQuoteItems(),
                paymentInfo: document.getElementById('quote-payment-info')?.value || '',
                depositInfo: document.getElementById('quote-deposit-info')?.value || '',
                managerName: document.getElementById('quote-manager-name')?.value || '',
                managerPosition: document.getElementById('quote-manager-position')?.value || '',
                managerPhone: document.getElementById('quote-manager-phone')?.value || '',
                managerEmail: document.getElementById('quote-manager-email')?.value || '',
                validity: document.getElementById('quote-validity')?.value || '',
                product: formData.get('product') || '',
                licenseCount: parseInt(formData.get('license_count')) || 0,
                memo: formData.get('memo') || '',
                purpose: purposes.join(', '),
                isRequote: isRequote,
                isTemp: true,
                status: '접수',
                statusHistory: {
                    접수: quoteDate ? new Date(quoteDate + 'T00:00:00').toISOString() : new Date().toISOString()
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // 계약 총액 계산
            let totalAmount = 0;
            quoteData.items.forEach(item => {
                totalAmount += parseFloat(removeCommas(item.amount)) || 0;
            });
            quoteData.totalAmount = totalAmount;
            
            saveQuote(quoteData);
            alert('임시 저장되었습니다.');
        });
    }
    
    // 견적 일자 기본값 설정 (오늘 날짜)
    const quoteDateInput = document.getElementById('quote-date');
    if (quoteDateInput && !quoteDateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        quoteDateInput.value = today;
    }
    
    // 로그인한 사용자 정보로 담당자 필드 자동 채우기
    function loadCurrentUserInfo() {
        const stored = localStorage.getItem('growth_launchpad_current_user');
        if (stored) {
            try {
                const currentUser = JSON.parse(stored);
                const managerNameInput = document.getElementById('quote-manager-name');
                const managerPositionInput = document.getElementById('quote-manager-position');
                const managerPhoneInput = document.getElementById('quote-manager-phone');
                const managerEmailInput = document.getElementById('quote-manager-email');
                
                if (managerNameInput && currentUser.name) {
                    managerNameInput.value = currentUser.name;
                }
                if (managerPositionInput && currentUser.position) {
                    managerPositionInput.value = currentUser.position;
                }
                if (managerPhoneInput && currentUser.phone) {
                    managerPhoneInput.value = currentUser.phone;
                }
                if (managerEmailInput && currentUser.email) {
                    managerEmailInput.value = currentUser.email;
                }
            } catch (e) {
                console.error('사용자 정보 로드 오류:', e);
            }
        }
    }
    
    // 페이지 로드 시 담당자 정보 자동 채우기
    loadCurrentUserInfo();
    
    // 담당자 정보 기본값 설정 (고객사 정보에서 가져오기)
    const managerNameInput = document.getElementById('quote-manager-name');
    const managerPositionInput = document.getElementById('quote-manager-position');
    if (managerNameInput && !managerNameInput.value) {
        // 로그인 계정 정보가 있다면 여기서 설정
        // 현재는 빈 값으로 유지
    }
    
    // 견적 항목 추가 버튼
    const addItemBtn = document.getElementById('btn-add-quote-item');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            addQuoteItem();
        });
    }
    
    // 템플릿 모달 항목 추가 버튼
    const addTemplateItemBtn = document.getElementById('btn-add-template-item');
    if (addTemplateItemBtn) {
        addTemplateItemBtn.addEventListener('click', () => {
            const newRow = addQuoteItem(null, 'template-items-body');
            // 신규 생성된 항목 위치로 스크롤 이동
            if (newRow) {
                setTimeout(() => {
                    newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    }
    
    // 기본 항목 3개 추가
    const itemsBody = document.getElementById('quote-items-body');
    const mobileContainer = document.getElementById('quote-items-mobile');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        if (mobileContainer && mobileContainer.children.length === 0) {
            for (let i = 0; i < 3; i++) {
                addQuoteItemMobile();
            }
        }
    } else {
        if (itemsBody && itemsBody.children.length === 0) {
            for (let i = 0; i < 3; i++) {
                addQuoteItem();
            }
        }
    }
    
    // 초기 계약 총액 업데이트
    updateQuoteTotal();
    
    // 템플릿 불러오기 버튼
    const loadTemplateBtn = document.getElementById('btn-load-template');
    if (loadTemplateBtn) {
        loadTemplateBtn.addEventListener('click', () => {
            openTemplateModal();
        });
    }
    
    // 템플릿 수정 모드 플래그
    let editingTemplateId = null;
    
    // 템플릿 저장 버튼
    const saveTemplateBtn = document.getElementById('btn-save-template');
    if (saveTemplateBtn) {
        saveTemplateBtn.addEventListener('click', () => {
            const items = collectQuoteItems();
            if (items.length === 0) {
                alert('저장할 견적 항목이 없습니다.');
                return;
            }
            
            // 템플릿 저장 모달 열기
            const saveModal = document.getElementById('template-save-modal');
            if (saveModal) {
                document.getElementById('template-save-name').value = '';
                document.getElementById('template-save-category').value = '';
                
                // 현재 견적 항목을 템플릿 모달에 복사
                const templateItemsBody = document.getElementById('template-items-body');
                if (templateItemsBody) {
                    templateItemsBody.innerHTML = '';
                    const currentItems = collectQuoteItems('quote-items-body');
                    if (currentItems.length > 0) {
                        currentItems.forEach(item => {
                            addQuoteItem(item, 'template-items-body');
                        });
                    } else {
                        // 항목이 없으면 기본 1개 추가
                        addQuoteItem(null, 'template-items-body');
                    }
                }
                
                const modalTitle = saveModal.querySelector('h2');
                if (modalTitle) modalTitle.textContent = '템플릿 저장';
                saveModal.style.display = 'flex';
            }
        });
    }
    
    // 템플릿 저장 모달 닫기
    const templateSaveModal = document.getElementById('template-save-modal');
    if (templateSaveModal) {
        const overlay = templateSaveModal.querySelector('.modal-overlay');
        const closeBtn = templateSaveModal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('btn-template-save-cancel');
        
        function closeSaveModal() {
            templateSaveModal.style.display = 'none';
            // 템플릿 항목 초기화
            const templateItemsBody = document.getElementById('template-items-body');
            if (templateItemsBody) {
                templateItemsBody.innerHTML = '';
            }
        }
        
        if (overlay) overlay.addEventListener('click', closeSaveModal);
        if (closeBtn) closeBtn.addEventListener('click', closeSaveModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeSaveModal);
        
        // 템플릿 저장 폼 제출
        const saveForm = document.getElementById('template-save-form');
        if (saveForm) {
            saveForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const templateName = document.getElementById('template-save-name').value.trim();
                const category = document.getElementById('template-save-category').value;
                
                if (!templateName) {
                    alert('템플릿 이름을 입력해주세요.');
                    return;
                }
                
                if (!category) {
                    alert('카테고리를 선택해주세요.');
                    return;
                }
                
                const items = collectQuoteItems('template-items-body');
                
                if (items.length === 0) {
                    alert('견적 항목을 최소 1개 이상 추가해주세요.');
                    return;
                }
                
                // 저장 모드
                saveQuoteTemplate(templateName, category, items);
                alert('템플릿이 저장되었습니다.');
                
                closeSaveModal();
                
                // 템플릿 목록 모달이 열려있다면 새로고침
                if (document.getElementById('quote-template-modal').style.display === 'flex') {
                    renderTemplateList();
                }
            });
        }
        
        if (overlay) overlay.addEventListener('click', closeSaveModal);
        if (closeBtn) closeBtn.addEventListener('click', closeSaveModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeSaveModal);
    }
    
    // 템플릿 수정 모달 닫기 및 폼 제출
    const templateEditModal = document.getElementById('template-edit-modal');
    if (templateEditModal) {
        const overlay = templateEditModal.querySelector('.modal-overlay');
        const closeBtn = templateEditModal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('btn-template-edit-cancel');
        
        function closeEditModal() {
            templateEditModal.style.display = 'none';
            editingTemplateId = null;
            // 템플릿 항목 초기화
            const templateEditItemsBody = document.getElementById('template-edit-items-body');
            if (templateEditItemsBody) {
                templateEditItemsBody.innerHTML = '';
            }
        }
        
        if (overlay) overlay.addEventListener('click', closeEditModal);
        if (closeBtn) closeBtn.addEventListener('click', closeEditModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeEditModal);
        
        // 템플릿 수정 폼 제출
        const editForm = document.getElementById('template-edit-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const templateName = document.getElementById('template-edit-name').value.trim();
                const category = document.getElementById('template-edit-category').value;
                
                if (!templateName) {
                    alert('템플릿 이름을 입력해주세요.');
                    return;
                }
                
                if (!category) {
                    alert('카테고리를 선택해주세요.');
                    return;
                }
                
                const items = collectQuoteItems('template-edit-items-body');
                
                if (items.length === 0) {
                    alert('견적 항목을 최소 1개 이상 추가해주세요.');
                    return;
                }
                
                if (editingTemplateId) {
                    // 수정 모드
                    updateQuoteTemplate(editingTemplateId, templateName, category, items);
                    alert('템플릿이 수정되었습니다.');
                    editingTemplateId = null;
                }
                
                // 모바일 카드도 동기화
                if (window.innerWidth <= 768) {
                    syncTemplateEditItemsToMobile(items);
                }
                
                closeEditModal();
                
                // 템플릿 목록 모달이 열려있다면 새로고침
                if (document.getElementById('quote-template-modal').style.display === 'flex') {
                    renderTemplateList();
                }
            });
        }
        
        // 템플릿 수정 모달 항목 추가 버튼
        const addTemplateEditItemBtn = document.getElementById('btn-add-template-edit-item');
        if (addTemplateEditItemBtn) {
            addTemplateEditItemBtn.addEventListener('click', () => {
                addQuoteItem(null, 'template-edit-items-body');
            });
        }
    }
    
    // 템플릿 모달 관련
    let selectedTemplateId = null;
    
    function openTemplateModal() {
        const modal = document.getElementById('quote-template-modal');
        if (modal) {
            modal.style.display = 'flex';
            renderTemplateList();
        }
    }
    
    function closeTemplateModal() {
        const modal = document.getElementById('quote-template-modal');
        if (modal) {
            modal.style.display = 'none';
            selectedTemplateId = null;
            document.getElementById('btn-template-load').style.display = 'none';
            document.getElementById('btn-template-edit').style.display = 'none';
            document.getElementById('btn-template-delete').style.display = 'none';
        }
    }
    
    function renderTemplateList() {
        const templates = getQuoteTemplates();
        const container = document.getElementById('template-list-container');
        const emptyMessage = document.getElementById('template-list-empty');
        const categoryFilter = document.getElementById('template-category-filter');
        const searchInput = document.getElementById('template-search-input');
        
        if (!container) return;
        
        // 필터링
        let filteredTemplates = templates;
        
        // 카테고리 필터
        if (categoryFilter && categoryFilter.value) {
            filteredTemplates = filteredTemplates.filter(t => t.category === categoryFilter.value);
        }
        
        // 검색 필터
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.trim().toLowerCase();
            filteredTemplates = filteredTemplates.filter(t => 
                t.name.toLowerCase().includes(searchTerm) ||
                (t.category && t.category.toLowerCase().includes(searchTerm))
            );
        }
        
        if (filteredTemplates.length === 0) {
            container.innerHTML = '';
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            container.innerHTML = filteredTemplates.map(template => `
                <div class="customer-list-item template-item" data-template-id="${template.id}">
                    <div class="customer-list-item-main">
                        <h3 class="customer-list-item-name">${escapeHtml(template.name)}</h3>
                        <p class="customer-list-item-info">
                            카테고리: ${escapeHtml(template.category || '미분류')} | 
                            항목 수: ${template.items.length}개 | 
                            생성일: ${new Date(template.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                    </div>
                    <div class="template-item-actions">
                        <button type="button" class="btn primary small btn-template-load-item" data-template-id="${template.id}">템플릿 불러오기</button>
                        <button type="button" class="btn secondary small btn-template-edit-item" data-template-id="${template.id}">수정</button>
                        <button type="button" class="btn secondary small btn-template-delete-item" data-template-id="${template.id}">삭제</button>
                    </div>
                </div>
            `).join('');
            
            // 템플릿 선택 이벤트 (항목 클릭 시 불러오기)
            container.querySelectorAll('.template-item').forEach(item => {
                const itemMain = item.querySelector('.customer-list-item-main');
                if (itemMain) {
                    itemMain.addEventListener('click', function(e) {
                        e.stopPropagation();
                        // 기존 선택 해제
                        container.querySelectorAll('.template-item').forEach(i => i.classList.remove('selected'));
                        // 현재 선택
                        item.classList.add('selected');
                        selectedTemplateId = parseInt(item.getAttribute('data-template-id'));
                        document.getElementById('btn-template-load').style.display = 'inline-block';
                        document.getElementById('btn-template-edit').style.display = 'inline-block';
                        document.getElementById('btn-template-delete').style.display = 'inline-block';
                    });
                }
            });
            
            // 템플릿 불러오기 버튼 이벤트 (각 항목에 있는 버튼)
            container.querySelectorAll('.btn-template-load-item').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const templateId = parseInt(this.getAttribute('data-template-id'));
                    const templates = getQuoteTemplates();
                    const template = templates.find(t => t.id === templateId);
                    if (template) {
                        // 기존 항목 모두 삭제
                        document.getElementById('quote-items-body').innerHTML = '';
                        document.getElementById('quote-items-mobile').innerHTML = '';
                        
                        // 템플릿 항목 추가
                        if (template.items && template.items.length > 0) {
                            template.items.forEach(item => {
                                addQuoteItem(item);
                            });
                        }
                        
                        // 총액 업데이트
                        updateQuoteTotal();
                        
                        // 모달 닫기
                        closeTemplateModal();
                        
                        alert(`"${template.name}" 템플릿이 불러와졌습니다.`);
                    }
                });
            });
            
            // 템플릿 수정 버튼 이벤트
            container.querySelectorAll('.btn-template-edit-item').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const templateId = parseInt(this.getAttribute('data-template-id'));
                    const templates = getQuoteTemplates();
                    const template = templates.find(t => t.id === templateId);
                    if (template) {
                        // 템플릿 수정 모달 열기
                        const editModal = document.getElementById('template-edit-modal');
                        if (editModal) {
                            editingTemplateId = templateId;
                            document.getElementById('template-edit-name').value = template.name || '';
                            document.getElementById('template-edit-category').value = template.category || '';
                            
                            // 템플릿 항목을 템플릿 수정 모달에 불러오기
                            const templateEditItemsBody = document.getElementById('template-edit-items-body');
                            const templateEditItemsMobile = document.getElementById('template-edit-items-mobile');
                            
                            if (templateEditItemsBody) {
                                templateEditItemsBody.innerHTML = '';
                            }
                            if (templateEditItemsMobile) {
                                templateEditItemsMobile.innerHTML = '';
                            }
                            
                            if (template.items && template.items.length > 0) {
                                template.items.forEach(item => {
                                    addQuoteItem(item, 'template-edit-items-body');
                                });
                            } else {
                                // 항목이 없으면 기본 1개 추가
                                addQuoteItem(null, 'template-edit-items-body');
                            }
                            
                            editModal.style.display = 'flex';
                            closeTemplateModal();
                        }
                    }
                });
            });
            
            // 템플릿 삭제 버튼 이벤트
            container.querySelectorAll('.btn-template-delete-item').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const templateId = parseInt(this.getAttribute('data-template-id'));
                    const templates = getQuoteTemplates();
                    const template = templates.find(t => t.id === templateId);
                    if (template && confirm(`"${template.name}" 템플릿을 삭제하시겠습니까?`)) {
                        deleteQuoteTemplate(templateId);
                        renderTemplateList();
                        selectedTemplateId = null;
                        document.getElementById('btn-template-load').style.display = 'none';
                        document.getElementById('btn-template-edit').style.display = 'none';
                        document.getElementById('btn-template-delete').style.display = 'none';
                        alert('템플릿이 삭제되었습니다.');
                    }
                });
            });
        }
    }
    
    // 템플릿 모달 닫기
    const templateModal = document.getElementById('quote-template-modal');
    if (templateModal) {
        const overlay = templateModal.querySelector('.modal-overlay');
        const closeBtn = templateModal.querySelector('.modal-close');
        
        if (overlay) overlay.addEventListener('click', closeTemplateModal);
        if (closeBtn) closeBtn.addEventListener('click', closeTemplateModal);
    }
    
    // 템플릿 불러오기
    const templateLoadBtn = document.getElementById('btn-template-load');
    if (templateLoadBtn) {
        templateLoadBtn.addEventListener('click', () => {
            if (!selectedTemplateId) return;
            
            const templates = getQuoteTemplates();
            const template = templates.find(t => t.id === selectedTemplateId);
            if (template) {
                // 기존 항목 모두 삭제
                document.getElementById('quote-items-body').innerHTML = '';
                
                // 템플릿 항목 추가
                template.items.forEach(item => {
                    addQuoteItem(item);
                });
                
                // 계약 총액 업데이트
                updateQuoteTotal();
                
                closeTemplateModal();
                alert('템플릿이 불러와졌습니다.');
            }
        });
    }
    
    // 템플릿 삭제
    const templateDeleteBtn = document.getElementById('btn-template-delete');
    if (templateDeleteBtn) {
        templateDeleteBtn.addEventListener('click', () => {
            if (!selectedTemplateId) return;
            
            if (confirm('이 템플릿을 삭제하시겠습니까?')) {
                deleteQuoteTemplate(selectedTemplateId);
                renderTemplateList();
                selectedTemplateId = null;
                document.getElementById('btn-template-load').style.display = 'none';
                document.getElementById('btn-template-edit').style.display = 'none';
                document.getElementById('btn-template-delete').style.display = 'none';
                alert('템플릿이 삭제되었습니다.');
            }
        });
    }
    
    // 템플릿 수정
    const templateEditBtn = document.getElementById('btn-template-edit');
    if (templateEditBtn) {
        templateEditBtn.addEventListener('click', () => {
            if (!selectedTemplateId) return;
            
            const templates = getQuoteTemplates();
            const template = templates.find(t => t.id === selectedTemplateId);
            if (template) {
                // 템플릿 수정 모달 열기
                const editModal = document.getElementById('template-edit-modal');
                if (editModal) {
                    editingTemplateId = selectedTemplateId;
                    document.getElementById('template-edit-name').value = template.name || '';
                    document.getElementById('template-edit-category').value = template.category || '';
                    
                    // 템플릿 항목을 템플릿 수정 모달에 불러오기
                    const templateEditItemsBody = document.getElementById('template-edit-items-body');
                    if (templateEditItemsBody) {
                        templateEditItemsBody.innerHTML = '';
                        if (template.items && template.items.length > 0) {
                            template.items.forEach(item => {
                                addQuoteItem(item, 'template-edit-items-body');
                            });
                        } else {
                            // 항목이 없으면 기본 1개 추가
                            addQuoteItem(null, 'template-edit-items-body');
                        }
                    }
                    
                    editModal.style.display = 'flex';
                    closeTemplateModal();
                }
            }
        });
    }
    
    // 카테고리 필터 변경 시 목록 새로고침
    const categoryFilter = document.getElementById('template-category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', renderTemplateList);
    }
    
    // 템플릿 검색
    const templateSearchBtn = document.getElementById('btn-template-search');
    if (templateSearchBtn) {
        templateSearchBtn.addEventListener('click', renderTemplateList);
    }
    
    const templateSearchInput = document.getElementById('template-search-input');
    if (templateSearchInput) {
        templateSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                renderTemplateList();
            }
        });
    }
    
    // 견적서 미리보기 버튼
    const previewBtn = document.getElementById('btn-preview');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            openQuotePreview();
        });
    }
    
    // 미리보기 모달 닫기
    const previewModal = document.getElementById('quote-preview-modal');
    if (previewModal) {
        const overlay = previewModal.querySelector('.modal-overlay');
        const closeBtn = document.getElementById('btn-preview-close');
        
        function closePreviewModal() {
            previewModal.style.display = 'none';
        }
        
        if (overlay) overlay.addEventListener('click', closePreviewModal);
        if (closeBtn) closeBtn.addEventListener('click', closePreviewModal);
    }
    
    // 인쇄 버튼
    const printBtn = document.getElementById('btn-preview-print');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            printQuote();
        });
    }
    
    // PDF 저장 버튼
    const pdfBtn = document.getElementById('btn-preview-pdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function() {
            saveQuoteAsPDF();
        });
    }
});

// 견적서 미리보기 열기
function openQuotePreview() {
    const modal = document.getElementById('quote-preview-modal');
    const previewContent = document.getElementById('quote-preview-content');
    
    if (!modal || !previewContent) return;
    
    // 견적서 데이터 수집
    const quoteData = collectQuoteData();
    
    // 미리보기 렌더링
    renderQuotePreview(quoteData, previewContent);
    
    // 모달 표시
    modal.style.display = 'flex';
}

// 견적서 데이터 수집
function collectQuoteData() {
    const companyName = document.getElementById('customer-company')?.value || '';
    const contactName = document.getElementById('customer-contact-name')?.value || '';
    const position = document.getElementById('customer-position')?.value || '';
    const phone = document.getElementById('customer-phone')?.value || '';
    const email = document.getElementById('customer-email')?.value || '';
    
    const purposes = [];
    document.querySelectorAll('input[name="purpose"]:checked').forEach(checkbox => {
        purposes.push(checkbox.value);
    });
    
    const requoteCheckbox = document.getElementById('is-requote');
    const isRequote = requoteCheckbox ? requoteCheckbox.checked : false;
    
    return {
        customer: {
            companyName: companyName,
            contactName: contactName,
            position: position,
            phone: phone,
            email: email,
            purposes: purposes,
            isRequote: isRequote
        },
        recipient: document.getElementById('quote-recipient')?.value || '',
        reference: document.getElementById('quote-reference')?.value || '',
        quoteTitle: document.getElementById('quote-title-input')?.value || '',
        quoteDate: document.getElementById('quote-date')?.value || '',
        items: collectQuoteItems(),
        paymentInfo: document.getElementById('quote-payment-info')?.value || '',
        depositInfo: document.getElementById('quote-deposit-info')?.value || '',
        managerName: document.getElementById('quote-manager-name')?.value || '',
        managerPosition: document.getElementById('quote-manager-position')?.value || '',
        managerPhone: document.getElementById('quote-manager-phone')?.value || '',
        managerEmail: document.getElementById('quote-manager-email')?.value || '',
        validity: document.getElementById('quote-validity')?.value || ''
    };
}

// 견적서 미리보기 렌더링
function renderQuotePreview(data, container) {
    const dateStr = data.quoteDate ? new Date(data.quoteDate).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR');
    
    // 총액 계산
    let totalAmount = 0;
    data.items.forEach(item => {
        const amount = parseFloat(item.amount) || 0;
        totalAmount += amount;
    });
    
    const totalAmountStr = totalAmount.toLocaleString('ko-KR');
    
    container.innerHTML = `
        <div class="quote-company-details">
            <div class="quote-header">
                <div class="quote-header-left">
                    <div class="quote-logo">
                        <span class="quote-logo-m">m</span>
                        <span class="quote-logo-tm">™</span>
                    </div>
                    <div class="quote-company-info">
                        <h3 class="quote-company-name">맑은소프트</h3>
                        <p class="quote-company-slogan">보통 사람들이 만드는 위대한 기업</p>
                    </div>
                </div>
                <div class="quote-header-right">
                    <h1 class="quote-title">견적서</h1>
                </div>
            </div>
            <div class="quote-company-info-details">
                <p>서울특별시 구로구 디지털로 288 | tel. 02-857-5445 | fax. 02-6442-7010</p>
                <p>업태/종목_ 서비스/소프트웨어 원격교육컨텐츠개발및공급</p>
                <p>사업자등록번호 119-86-39050 | 상호 (주)맑은소프트</p>
                <p>대표자_하근호</p>
            </div>
        </div>
        
        <div class="quote-subsection">
            <h3 class="quote-subsection-title">수신</h3>
            <div class="form-grid">
                <div class="form-field">
                    <span class="form-label">수신자</span>
                    <div class="form-input">${escapeHtml(data.recipient || '')}</div>
                </div>
                <div class="form-field">
                    <span class="form-label">참조</span>
                    <div class="form-input">${escapeHtml(data.reference || '')}</div>
                </div>
            </div>
        </div>

        <div class="quote-subsection">
            <h3 class="quote-subsection-title">견적 기본 정보</h3>
            <div class="form-grid">
                <div class="form-field">
                    <span class="form-label">견적서 제목</span>
                    <div class="form-input">${escapeHtml(data.quoteTitle || '')}</div>
                </div>
                <div class="form-field">
                    <span class="form-label">견적 일자</span>
                    <div class="form-input">${dateStr}</div>
                </div>
            </div>
        </div>

        <div class="quote-subsection">
            <h3 class="quote-subsection-title">견적 항목</h3>
            <p style="font-size: 0.75rem; color: var(--muted); margin-bottom: 0.4rem;">(단위 : 원, VAT 별도)</p>
            <div class="quote-items-table">
                <table class="quote-table">
                    <thead>
                        <tr>
                            <th style="width: 250px;">구분</th>
                            <th>세부 항목</th>
                            <th style="width: 120px;">기본계약기간(월)</th>
                            <th style="width: 100px;">수량</th>
                            <th style="width: 120px;">단가</th>
                            <th style="width: 120px;">공급가액</th>
                            <th>비고</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td>${escapeHtml(item.category || '')}</td>
                                <td>${escapeHtml(item.detail || '')}</td>
                                <td style="text-align: center;">${escapeHtml(item.period || '')}</td>
                                <td style="text-align: center;">${escapeHtml(item.quantity || '')}</td>
                                <td style="text-align: right;">${escapeHtml(item.price ? parseFloat(item.price).toLocaleString('ko-KR') : '')}</td>
                                <td style="text-align: right;">${escapeHtml(item.amount ? parseFloat(item.amount).toLocaleString('ko-KR') : '')}</td>
                                <td>${escapeHtml(item.note || '')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- 계약 총액 -->
            <div class="quote-total-section">
                <div class="quote-total-item">
                    <span class="quote-total-label">계약 총액 (VAT별도)</span>
                    <span class="quote-total-amount">${totalAmountStr}원</span>
                </div>
                <div class="quote-total-item">
                    <span class="quote-total-label">계약 총액 (VAT포함)</span>
                    <span class="quote-total-amount">${(totalAmount * 1.1).toLocaleString('ko-KR')}원</span>
                </div>
            </div>
        </div>

        <div class="quote-subsection">
            <h3 class="quote-subsection-title">결제 및 담당자 안내</h3>
            
            <div class="form-field">
                <span class="form-label">결제정보</span>
                <div class="form-input">${escapeHtml(data.paymentInfo || '')}</div>
            </div>

            <div class="form-field">
                <span class="form-label">입금 관련</span>
                <div class="form-input" style="white-space: pre-wrap;">${escapeHtml(data.depositInfo || '')}</div>
            </div>

            <div class="form-grid">
                <div class="form-field">
                    <span class="form-label">담당자 이름</span>
                    <div class="form-input">${escapeHtml(data.managerName || '')}</div>
                </div>
                <div class="form-field">
                    <span class="form-label">직책</span>
                    <div class="form-input">${escapeHtml(data.managerPosition || '')}</div>
                </div>
                <div class="form-field">
                    <span class="form-label">연락처</span>
                    <div class="form-input">${escapeHtml(data.managerPhone || '')}</div>
                </div>
                <div class="form-field">
                    <span class="form-label">이메일</span>
                    <div class="form-input">${escapeHtml(data.managerEmail || '')}</div>
                </div>
            </div>

            <div class="form-field">
                <span class="form-label">유효기간</span>
                <div class="form-input" style="white-space: pre-wrap;">${escapeHtml(data.validity || '')}</div>
            </div>
        </div>
    `;
}

// 견적서 인쇄
function printQuote() {
    const previewContent = document.getElementById('quote-preview-content');
    if (!previewContent) return;
    
    // 새 창에 인쇄용 HTML 생성
    const printWindow = window.open('', '_blank');
    const printContent = previewContent.innerHTML;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>견적서 인쇄</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 20mm;
                    font-family: "Pretendard", "Noto Sans KR", system-ui, sans-serif;
                    font-size: 12pt;
                    color: #1c2533;
                }
                .quote-company-details {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: #f6f8fb;
                    border-radius: 12px;
                    border: 1px solid #e2e6ef;
                }
                .quote-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.25rem;
                    padding-bottom: 1.25rem;
                    border-bottom: 1px solid #e2e6ef;
                }
                .quote-header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .quote-logo {
                    width: 46px;
                    height: 46px;
                    border-radius: 50%;
                    background: #0F91D0;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    position: relative;
                    font-family: "NanumBarunGothic", sans-serif;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1;
                }
                .quote-logo-m {
                    font-size: 1.2rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    transform: scaleY(1.3);
                    display: inline-block;
                    line-height: 1;
                }
                .quote-logo-tm {
                    position: absolute;
                    top: 13px;
                    right: 8px;
                    font-size: 0.6rem;
                    font-weight: 400;
                    line-height: 1;
                }
                .quote-company-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .quote-company-name {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #1c2533;
                }
                .quote-company-slogan {
                    margin: 0;
                    font-size: 0.9rem;
                    color: #6c7686;
                }
                .quote-header-right {
                    text-align: right;
                }
                .quote-title {
                    margin: 0;
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1c2533;
                }
                .quote-company-info-details {
                    margin-top: 0.75rem;
                }
                .quote-company-info-details p {
                    margin: 0.35rem 0;
                    font-size: 0.85rem;
                    color: #6c7686;
                    line-height: 1.6;
                }
                .quote-subsection {
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e2e6ef;
                }
                .quote-subsection:last-of-type {
                    border-bottom: none;
                }
                .quote-subsection-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #1c2533;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .form-field {
                    margin-bottom: 0.8rem;
                }
                .form-label {
                    font-size: 0.9rem;
                    color: #6c7686;
                    margin-bottom: 0.35rem;
                    display: block;
                }
                .form-input {
                    font-size: 0.95rem;
                    color: #1c2533;
                    padding: 0.5rem 0;
                }
                .quote-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                    margin-top: 1rem;
                }
                .quote-table th,
                .quote-table td {
                    padding: 0.75rem 0.5rem;
                    border: 1px solid #e2e6ef;
                    text-align: left;
                }
                .quote-table th {
                    background: #f6f8fb;
                    font-weight: 600;
                    color: #1c2533;
                    text-align: center;
                }
                .quote-table td {
                    background: #ffffff;
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // 인쇄 대화상자 열기
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

// 견적서 PDF 저장
function saveQuoteAsPDF() {
    const previewContent = document.getElementById('quote-preview-content');
    if (!previewContent) return;
    
    // jsPDF와 html2canvas가 로드되었는지 확인
    if (typeof window.jspdf === 'undefined') {
        alert('PDF 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
    if (typeof html2canvas === 'undefined') {
        alert('이미지 변환 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
    // PDF 생성 중 표시
    const pdfBtn = document.getElementById('btn-preview-pdf');
    if (pdfBtn) {
        pdfBtn.disabled = true;
        pdfBtn.textContent = 'PDF 생성 중...';
    }
    
    try {
        // 미리보기 영역의 실제 내용을 가져옴
        const quotePreviewPaper = previewContent.querySelector('.quote-preview-paper');
        if (!quotePreviewPaper) {
            throw new Error('견적서 미리보기 영역을 찾을 수 없습니다.');
        }
        
        // HTML을 canvas로 변환
        html2canvas(quotePreviewPaper, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: quotePreviewPaper.scrollWidth,
            height: quotePreviewPaper.scrollHeight
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            
            // A4 크기 계산 (mm 단위)
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            let position = 0;
            
            // 첫 페이지 추가
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // 여러 페이지가 필요한 경우 추가
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // PDF 저장
            const quoteData = collectQuoteData();
            const fileName = `견적서_${quoteData.customer.companyName || '미정'}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            // 버튼 상태 복원
            if (pdfBtn) {
                pdfBtn.disabled = false;
                pdfBtn.textContent = 'PDF 저장';
            }
        }).catch(error => {
            console.error('PDF 생성 오류:', error);
            alert('PDF 저장 중 오류가 발생했습니다. 인쇄 기능을 사용해주세요.');
            
            // 버튼 상태 복원
            if (pdfBtn) {
                pdfBtn.disabled = false;
                pdfBtn.textContent = 'PDF 저장';
            }
        });
    } catch (error) {
        console.error('PDF 생성 오류:', error);
        alert('PDF 저장 중 오류가 발생했습니다. 인쇄 기능을 사용해주세요.');
        
        // 버튼 상태 복원
        const pdfBtn = document.getElementById('btn-preview-pdf');
        if (pdfBtn) {
            pdfBtn.disabled = false;
            pdfBtn.textContent = 'PDF 저장';
        }
    }
}

