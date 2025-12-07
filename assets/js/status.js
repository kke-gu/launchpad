/**
 * status.js
 * - 진행 현황 페이지 전용 JavaScript
 * - 견적서 목록 표시 및 페이징
 */

const QUOTES_STORAGE_KEY = 'growth_launchpad_quotes';
const ITEMS_PER_PAGE = 10;

// 고정 견적서 데이터 (홍길동 계정으로 작성된 견적서 - 항상 표시됨)
const FIXED_QUOTES = [
    {
        id: 'fixed-quote-1',
        customer: {
            companyName: '㈜테크솔루션',
            contactName: '김담당',
            position: '대표이사',
            phone: '010-1234-5678',
            email: 'contact@techsolution.com'
        },
        recipient: '㈜테크솔루션',
        reference: 'REF-2025-001',
        quoteTitle: '㈜테크솔루션 견적서',
        quoteDate: '2025-01-15',
        items: [
            { category: '기본', detail: '기본 라이선스', period: '12', quantity: 10, price: 100000, amount: 1000000, note: '' },
            { category: '추가', detail: '추가 모듈', period: '12', quantity: 5, price: 50000, amount: 250000, note: '옵션' }
        ],
        paymentInfo: '계좌이체',
        depositInfo: '계약금 30%',
        managerName: '홍길동',
        managerPosition: '팀장',
        managerPhone: '010-1234-5678',
        managerEmail: 'sales1@malgeunsoft.com',
        validity: '30일',
        product: '범용 LMS',
        licenseCount: 10,
        memo: '',
        purpose: '학원/학교',
        isRequote: false,
        isTemp: false,
        status: '접수',
        statusHistory: {
            '접수': '2025-01-15T00:00:00.000Z'
        },
        totalAmount: 1250000,
        createdAt: '2025-01-15T00:00:00.000Z',
        updatedAt: '2025-01-15T00:00:00.000Z'
    },
    {
        id: 'fixed-quote-2',
        customer: {
            companyName: '㈜디지털교육',
            contactName: '이담당',
            position: '대표이사',
            phone: '010-2345-6789',
            email: 'contact@digitaledu.com'
        },
        recipient: '㈜디지털교육',
        reference: 'REF-2025-002',
        quoteTitle: '㈜디지털교육 견적서',
        quoteDate: '2025-02-20',
        items: [
            { category: '기본', detail: '기본 라이선스', period: '12', quantity: 20, price: 100000, amount: 2000000, note: '' },
            { category: '서비스', detail: '유지보수', period: '12', quantity: 1, price: 200000, amount: 200000, note: '연간' }
        ],
        paymentInfo: '계좌이체',
        depositInfo: '계약금 30%',
        managerName: '홍길동',
        managerPosition: '팀장',
        managerPhone: '010-1234-5678',
        managerEmail: 'sales1@malgeunsoft.com',
        validity: '30일',
        product: '공공 LMS',
        licenseCount: 20,
        memo: '',
        purpose: '공공기관 사용',
        isRequote: false,
        isTemp: false,
        status: '발송 완료',
        statusHistory: {
            '접수': '2025-02-20T00:00:00.000Z',
            '발송 완료': '2025-02-25T00:00:00.000Z'
        },
        totalAmount: 2200000,
        createdAt: '2025-02-20T00:00:00.000Z',
        updatedAt: '2025-02-25T00:00:00.000Z'
    },
    {
        id: 'fixed-quote-3',
        customer: {
            companyName: '㈜스마트에듀',
            contactName: '박담당',
            position: '대표이사',
            phone: '010-3456-7890',
            email: 'contact@smartedu.com'
        },
        recipient: '㈜스마트에듀',
        reference: 'REF-2025-003',
        quoteTitle: '㈜스마트에듀 견적서',
        quoteDate: '2025-03-10',
        items: [
            { category: '기본', detail: '기본 라이선스', period: '12', quantity: 15, price: 100000, amount: 1500000, note: '' },
            { category: '추가', detail: '추가 모듈', period: '12', quantity: 3, price: 50000, amount: 150000, note: '옵션' },
            { category: '서비스', detail: '유지보수', period: '12', quantity: 1, price: 200000, amount: 200000, note: '연간' }
        ],
        paymentInfo: '계좌이체',
        depositInfo: '계약금 30%',
        managerName: '홍길동',
        managerPosition: '팀장',
        managerPhone: '010-1234-5678',
        managerEmail: 'sales1@malgeunsoft.com',
        validity: '30일',
        product: '환급 LMS',
        licenseCount: 15,
        memo: '',
        purpose: '내일배움카드',
        isRequote: false,
        isTemp: false,
        status: '협의 중',
        statusHistory: {
            '접수': '2025-03-10T00:00:00.000Z',
            '발송 완료': '2025-03-15T00:00:00.000Z',
            '협의 중': '2025-03-20T00:00:00.000Z'
        },
        totalAmount: 1850000,
        createdAt: '2025-03-10T00:00:00.000Z',
        updatedAt: '2025-03-20T00:00:00.000Z'
    },
    {
        id: 'fixed-quote-4',
        customer: {
            companyName: '㈜에듀테크',
            contactName: '최담당',
            position: '대표이사',
            phone: '010-4567-8901',
            email: 'contact@edutech.com'
        },
        recipient: '㈜에듀테크',
        reference: 'REF-2025-004',
        quoteTitle: '㈜에듀테크 견적서',
        quoteDate: '2025-04-05',
        items: [
            { category: '기본', detail: '기본 라이선스', period: '12', quantity: 30, price: 100000, amount: 3000000, note: '' },
            { category: '서비스', detail: '유지보수', period: '12', quantity: 1, price: 300000, amount: 300000, note: '연간' }
        ],
        paymentInfo: '계좌이체',
        depositInfo: '계약금 30%',
        managerName: '홍길동',
        managerPosition: '팀장',
        managerPhone: '010-1234-5678',
        managerEmail: 'sales1@malgeunsoft.com',
        validity: '30일',
        product: '위캔디오',
        licenseCount: 30,
        memo: '',
        purpose: '개인 사업자',
        isRequote: false,
        isTemp: false,
        status: '계약 완료',
        statusHistory: {
            '접수': '2025-04-05T00:00:00.000Z',
            '발송 완료': '2025-04-10T00:00:00.000Z',
            '협의 중': '2025-04-15T00:00:00.000Z',
            '계약 확정': '2025-04-20T00:00:00.000Z',
            '계약 완료': '2025-04-25T00:00:00.000Z'
        },
        totalAmount: 3300000,
        createdAt: '2025-04-05T00:00:00.000Z',
        updatedAt: '2025-04-25T00:00:00.000Z'
    }
];

// 검색 및 필터 상태
let currentFilters = {
    status: 'all',
    purpose: '', // 드롭다운으로 변경 (단일 값)
    company: '',
    manager: '',
    text: '',
    dateFrom: '',
    dateTo: ''
};

// 견적서 목록 가져오기 (고정 견적서 + 로컬 스토리지 견적서)
function getQuotes() {
    // 고정 견적서 먼저 가져오기
    const fixedQuotes = FIXED_QUOTES.map(quote => ({
        ...quote,
        isFixed: true // 고정 견적서 표시용 플래그
    }));
    
    // 로컬 스토리지에서 견적서 가져오기
    const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
    let localQuotes = stored ? JSON.parse(stored) : [];
    
    // 로컬 스토리지에 고정 견적서가 저장되어 있는 경우 제거
    const fixedQuoteIds = FIXED_QUOTES.map(q => q.id);
    const hasFixedQuotes = localQuotes.some(q => fixedQuoteIds.includes(q.id) || (typeof q.id === 'string' && q.id.startsWith('fixed-quote-')));
    
    if (hasFixedQuotes) {
        localQuotes = localQuotes.filter(q => !fixedQuoteIds.includes(q.id) && !(typeof q.id === 'string' && q.id.startsWith('fixed-quote-')));
        // 정리된 견적서 목록 저장
        localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(localQuotes));
    }
    
    // 고정 견적서와 로컬 견적서 합치기 (고정 견적서가 먼저)
    return [...fixedQuotes, ...localQuotes];
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\./g, '-').replace(/\s/g, '').slice(0, -1);
}

// 현황 단계별 프로세스 그래프 생성 (간소화된 디자인)
function createStatusGraph(status, statusHistory, quoteDate) {
    const currentStatus = status || '접수';
    
    // 상태별 색상 및 아이콘
    const statusConfig = {
        '접수': { 
            color: '#6b7280', 
            bg: 'rgba(107, 114, 128, 0.12)',
            icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`
        },
        '발송 완료': { 
            color: '#3b82f6', 
            bg: 'rgba(59, 130, 246, 0.12)',
            icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L5 8L2 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        },
        '협의 중': { 
            color: '#f59e0b', 
            bg: 'rgba(245, 158, 11, 0.12)',
            icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 1.5L7.5 5L11 5.5L7.5 7L6 10.5L4.5 7L1 5.5L4.5 5L6 1.5Z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`
        },
        '계약 확정': { 
            color: '#10b981', 
            bg: 'rgba(16, 185, 129, 0.12)',
            icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L5 8L2 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`
        },
        '계약 미체결': { 
            color: '#ef4444', 
            bg: 'rgba(239, 68, 68, 0.12)',
            icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3L9 9M9 3L3 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
        },
        '계약 완료': { 
            color: '#8b5cf6', 
            bg: 'rgba(139, 92, 246, 0.12)',
            icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L5 8L2 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`
        }
    };
    
    const config = statusConfig[currentStatus] || statusConfig['접수'];
    
    // 상태별 클래스명 생성
    const statusClassMap = {
        '접수': 'status-badge-접수',
        '발송 완료': 'status-badge-발송완료',
        '협의 중': 'status-badge-협의중',
        '계약 확정': 'status-badge-계약확정',
        '계약 미체결': 'status-badge-계약미체결',
        '계약 완료': 'status-badge-계약완료'
    };
    const statusClass = statusClassMap[currentStatus] || 'status-badge-접수';
    
    return `
        <div class="status-badge-modern ${statusClass}">
            <span class="status-badge-icon">
                ${config.icon}
            </span>
            <span class="status-badge-label">${currentStatus}</span>
        </div>
    `;
}

// 견적서 필터링
function filterQuotes(quotes) {
    return quotes.filter(quote => {
        // 상태 필터
        if (currentFilters.status !== 'all') {
            const quoteStatus = quote.status || '접수';
            const statusHistory = quote.statusHistory || {};
            
            // 상태가 일치하는지 확인
            if (quoteStatus !== currentFilters.status) {
                return false;
            }
            
            // 상태 변경 날짜를 기준으로 기간 필터링 (해당 월에 상태가 변경된 건만 표시)
            if (currentFilters.dateFrom && currentFilters.dateTo) {
                let statusChangeDate = null;
                
                // 접수 상태는 견적일자(quoteDate)를 우선 사용 (statusHistory['접수']는 무시)
                if (currentFilters.status === '접수') {
                    // 접수 상태는 quoteDate를 우선 사용
                    statusChangeDate = quote.quoteDate;
                } else if (currentFilters.status === '계약 완료') {
                    statusChangeDate = statusHistory['계약 완료'] || statusHistory['계약완료'];
                } else if (currentFilters.status === '발송 완료' || currentFilters.status === '발송완료') {
                    statusChangeDate = statusHistory['발송 완료'] || statusHistory['발송완료'];
                } else if (currentFilters.status === '협의 중' || currentFilters.status === '협의중') {
                    statusChangeDate = statusHistory['협의 중'] || statusHistory['협의중'];
                } else if (currentFilters.status === '계약 확정' || currentFilters.status === '계약확정') {
                    statusChangeDate = statusHistory['계약 확정'] || statusHistory['계약확정'];
                } else if (currentFilters.status === '계약 미체결' || currentFilters.status === '계약미체결') {
                    statusChangeDate = statusHistory['계약 미체결'] || statusHistory['계약미체결'];
                }
                
                // statusHistory에 날짜가 있으면 그 날짜를 기준으로 필터링
                if (statusChangeDate) {
                    // quoteDate는 문자열 형식일 수 있으므로 Date 객체로 변환
                    const changeDate = new Date(statusChangeDate);
                    const dateFrom = new Date(currentFilters.dateFrom);
                    const dateTo = new Date(currentFilters.dateTo + 'T23:59:59');
                    
                    // 상태 변경 날짜가 선택한 기간에 포함되지 않으면 제외
                    if (changeDate < dateFrom || changeDate > dateTo) {
                        return false;
                    }
                } else {
                    // statusHistory에 날짜가 없는 경우 quoteDate 또는 createdAt 기준으로 필터링
                    // 접수 상태는 이미 위에서 statusHistory['접수'] 또는 quoteDate를 사용하므로 여기로 오는 경우는 거의 없음
                    const quoteDate = new Date(quote.quoteDate || quote.createdAt || quote.date || 0);
                    const dateFrom = new Date(currentFilters.dateFrom);
                    const dateTo = new Date(currentFilters.dateTo + 'T23:59:59');
                    
                    if (quoteDate < dateFrom || quoteDate > dateTo) {
                        return false;
                    }
                }
            }
        }
        
        // 사용 목적 필터 (드롭다운 - 단일 값)
        if (currentFilters.purpose) {
            const quotePurpose = quote.purpose || '';
            if (quotePurpose !== currentFilters.purpose) {
                return false;
            }
        }
        
        // 고객사명 필터 (드롭다운 - 정확한 값)
        if (currentFilters.company) {
            const companyName = quote.customer?.companyName || '';
            if (companyName !== currentFilters.company) {
                return false;
            }
        }
        
        // 견적 담당자 필터 (드롭다운 - 정확한 값 또는 부분 일치)
        if (currentFilters.manager) {
            const managerName = quote.managerName || '';
            const filterManager = currentFilters.manager;
            // 정확한 일치 또는 부분 일치 확인
            if (managerName !== filterManager && 
                !managerName.includes(filterManager) && 
                !filterManager.includes(managerName)) {
                return false;
            }
        }
        
        // 텍스트 검색 (견적서명, 비고 등)
        if (currentFilters.text) {
            const searchText = currentFilters.text.toLowerCase();
            const quoteTitle = (quote.quoteTitle || '').toLowerCase();
            const note = quote.items ? quote.items.map(item => (item.note || '').toLowerCase()).join(' ') : '';
            const allText = quoteTitle + ' ' + note;
            if (!allText.includes(searchText)) {
                return false;
            }
        }
        
        // 기간 검색 (상태 필터가 없을 때만 적용)
        if (currentFilters.status === 'all' && (currentFilters.dateFrom || currentFilters.dateTo)) {
            const quoteDate = new Date(quote.quoteDate || quote.createdAt || quote.date || 0);
            const dateFrom = currentFilters.dateFrom ? new Date(currentFilters.dateFrom) : null;
            const dateTo = currentFilters.dateTo ? new Date(currentFilters.dateTo + 'T23:59:59') : null;
            
            if (dateFrom && quoteDate < dateFrom) {
                return false;
            }
            if (dateTo && quoteDate > dateTo) {
                return false;
            }
        }
        
        return true;
    });
}

// 견적서 목록 렌더링
function renderQuoteList(page = 1) {
    let quotes = getQuotes();
    
    // 필터링 적용
    quotes = filterQuotes(quotes);
    
    // 최신순 정렬 (견적일자 기준)
    quotes.sort((a, b) => {
        const dateA = new Date(a.quoteDate || a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.quoteDate || b.createdAt || b.updatedAt || 0);
        return dateB - dateA;
    });
    
    // 전체 견적서 개수 저장 (넘버링용)
    const totalQuotes = quotes.length;
    
    // 페이징 계산
    const totalPages = Math.ceil(quotes.length / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageQuotes = quotes.slice(startIndex, endIndex);
    
    const container = document.getElementById('status-cards-grid');
    if (!container) return;
    
    if (pageQuotes.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--muted);">
                등록된 견적서가 없습니다.
            </div>
        `;
        renderPagination(1, 0);
        return;
    }
    
    container.innerHTML = pageQuotes.map((quote, index) => {
        // 역순 넘버링: 전체 개수에서 현재 인덱스를 빼서 계산
        const rowNumber = totalQuotes - startIndex - index;
        const totalAmount = quote.totalAmount || 0;
        const formattedAmount = totalAmount.toLocaleString('ko-KR');
        
        // 견적서명에서 [임시저장] 제거하고 원래 제목만 표시
        let quoteTitle = quote.quoteTitle || '-';
        if (quoteTitle.startsWith('[임시저장] ')) {
            quoteTitle = quoteTitle.replace('[임시저장] ', '');
        }
        
        // 임시저장 라벨 생성
        const tempLabel = quote.isTemp ? '<span class="status-label status-label--temp">임시저장</span>' : '';
        
        return `
            <article class="status-card" data-quote-id="${quote.id}">
                <div class="status-card-header">
                    <div class="status-card-header-left">
                        <div class="status-card-number">#${rowNumber}</div>
                        <div class="status-card-status">
                            ${createStatusGraph(quote.status || '접수', quote.statusHistory || {}, quote.quoteDate)}
                        </div>
                    </div>
                    <div class="status-card-date">${formatDate(quote.quoteDate || quote.createdAt)}</div>
                </div>
                <div class="status-card-body">
                    <h3 class="status-card-title">
                        ${escapeHtml(quoteTitle)}
                        ${tempLabel}
                    </h3>
                    <div class="status-card-company">${escapeHtml(quote.customer?.companyName || '-')}</div>
                    <div class="status-card-info">
                        <div class="status-card-info-item">
                            <span class="status-card-info-label">사용목적</span>
                            <span class="status-card-info-value">${escapeHtml(quote.purpose || '-')}</span>
                        </div>
                        <div class="status-card-info-item">
                            <span class="status-card-info-label">계약 총액</span>
                            <span class="status-card-info-value">${formattedAmount}원</span>
                        </div>
                        <div class="status-card-info-item">
                            <span class="status-card-info-label">견적 담당자</span>
                            <span class="status-card-info-value">${escapeHtml(quote.managerName || '-')}</span>
                        </div>
                        ${quote.isRequote ? `
                        <div class="status-card-info-item">
                            <span class="status-card-info-label">재견적</span>
                            <span class="status-card-info-value">✓</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </article>
        `;
    }).join('');
    
    // 카드 클릭 이벤트 추가
    document.querySelectorAll('.status-card').forEach(card => {
        card.addEventListener('click', function() {
            const quoteId = this.getAttribute('data-quote-id');
            if (quoteId) {
                window.location.href = `quote-detail.html?id=${quoteId}`;
            }
        });
    });
    
    // 페이징 렌더링
    renderPagination(page, totalPages);
}

// 페이징 렌더링
function renderPagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination-controls">';
    
    // 이전 버튼
    if (currentPage > 1) {
        html += `<button class="pagination-btn" onclick="renderQuoteList(${currentPage - 1})">이전</button>`;
    }
    
    // 페이지 번호
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="renderQuoteList(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="renderQuoteList(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<button class="pagination-btn" onclick="renderQuoteList(${totalPages})">${totalPages}</button>`;
    }
    
    // 다음 버튼
    if (currentPage < totalPages) {
        html += `<button class="pagination-btn" onclick="renderQuoteList(${currentPage + 1})">다음</button>`;
    }
    
    html += '</div>';
    pagination.innerHTML = html;
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 고유값 추출 함수
function getUniqueValues(quotes, fieldPath) {
    const values = new Set();
    quotes.forEach(quote => {
        let value;
        if (fieldPath.includes('.')) {
            const parts = fieldPath.split('.');
            value = quote;
            for (const part of parts) {
                value = value?.[part];
            }
        } else {
            value = quote[fieldPath];
        }
        if (value && value.trim()) {
            values.add(value.trim());
        }
    });
    return Array.from(values).sort();
}

// 검색 옵션 렌더링
function renderSearchOptions() {
    const quotes = getQuotes();
    
    // 사용 목적 드롭다운 생성 (quote.html의 고정 목록 사용)
    const purposeOptions = [
        '학원/학교',
        '개인 사업자',
        '내부 교육용',
        '내일배움카드',
        '공공기관 사용',
        '기타'
    ];
    const purposeSelect = document.getElementById('search-purpose');
    if (purposeSelect) {
        purposeSelect.innerHTML = '<option value="">전체</option>' + 
            purposeOptions.map(purpose => `<option value="${escapeHtml(purpose)}">${escapeHtml(purpose)}</option>`).join('');
    }
    
    // 고객사명 드롭다운 생성
    const companies = getUniqueValues(quotes, 'customer.companyName');
    const companySelect = document.getElementById('search-company');
    if (companySelect) {
        companySelect.innerHTML = '<option value="">전체</option>' + 
            companies.map(company => `<option value="${escapeHtml(company)}">${escapeHtml(company)}</option>`).join('');
    }
    
    // 견적 담당자 드롭다운 생성
    const managers = getUniqueValues(quotes, 'managerName');
    const managerSelect = document.getElementById('search-manager');
    if (managerSelect) {
        managerSelect.innerHTML = '<option value="">전체</option>' + 
            managers.map(manager => `<option value="${escapeHtml(manager)}">${escapeHtml(manager)}</option>`).join('');
    }
}

// 검색 및 필터 이벤트 설정
function setupSearchAndFilters() {
    // 검색 옵션 렌더링
    renderSearchOptions();
    
    // 텍스트 검색 버튼
    const textSearchBtn = document.getElementById('btn-search-text');
    if (textSearchBtn) {
        textSearchBtn.addEventListener('click', function() {
            updateFilters();
            renderQuoteList(1);
        });
    }
    
    // 상세 검색 토글 버튼
    const advancedSearchBtn = document.getElementById('btn-advanced-search');
    const advancedSearchPanel = document.getElementById('search-advanced');
    if (advancedSearchBtn && advancedSearchPanel) {
        advancedSearchBtn.addEventListener('click', function() {
            const isVisible = advancedSearchPanel.style.display !== 'none';
            advancedSearchPanel.style.display = isVisible ? 'none' : 'block';
            
            // 버튼 활성화 상태 표시
            if (isVisible) {
                advancedSearchBtn.classList.remove('active');
            } else {
                advancedSearchBtn.classList.add('active');
            }
        });
    }
    
    // 검색 버튼
    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            updateFilters();
            renderQuoteList(1);
        });
    }
    
    // 초기화 버튼
    const resetBtn = document.getElementById('btn-reset-search');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetFilters();
            renderQuoteList(1);
        });
    }
    
    // 상태 탭
    const statusTabs = document.querySelectorAll('.status-tab');
    statusTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 모든 탭에서 active 제거
            statusTabs.forEach(t => t.classList.remove('active'));
            // 클릭한 탭에 active 추가
            this.classList.add('active');
            
            const status = this.getAttribute('data-status');
            currentFilters.status = status;
            renderQuoteList(1);
        });
    });
    
    // 드롭다운 변경 이벤트
    const purposeSelect = document.getElementById('search-purpose');
    if (purposeSelect) {
        purposeSelect.addEventListener('change', function() {
            updateFilters();
            renderQuoteList(1);
        });
    }
    
    // 드롭다운 변경 이벤트
    const companySelect = document.getElementById('search-company');
    const managerSelect = document.getElementById('search-manager');
    if (companySelect) {
        companySelect.addEventListener('change', function() {
            updateFilters();
            renderQuoteList(1);
        });
    }
    if (managerSelect) {
        managerSelect.addEventListener('change', function() {
            updateFilters();
            renderQuoteList(1);
        });
    }
    
    // Enter 키로 검색 (텍스트 검색만)
    const textInput = document.getElementById('search-text');
    if (textInput) {
        textInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                updateFilters();
                renderQuoteList(1);
            }
        });
    }
}

// 필터 업데이트
function updateFilters() {
    // 사용 목적 드롭다운
    const purposeSelect = document.getElementById('search-purpose');
    currentFilters.purpose = purposeSelect ? purposeSelect.value : '';
    
    // 고객사명 드롭다운
    const companySelect = document.getElementById('search-company');
    currentFilters.company = companySelect ? companySelect.value : '';
    
    // 견적 담당자 드롭다운
    const managerSelect = document.getElementById('search-manager');
    currentFilters.manager = managerSelect ? managerSelect.value : '';
    
    // 텍스트 검색
    const textInput = document.getElementById('search-text');
    currentFilters.text = textInput ? textInput.value : '';
    
    // 기간 검색
    const dateFromInput = document.getElementById('search-date-from');
    const dateToInput = document.getElementById('search-date-to');
    currentFilters.dateFrom = dateFromInput ? dateFromInput.value : '';
    currentFilters.dateTo = dateToInput ? dateToInput.value : '';
}

// 필터 초기화
function resetFilters() {
    currentFilters = {
        status: 'all',
        purpose: '',
        company: '',
        manager: '',
        text: '',
        dateFrom: '',
        dateTo: ''
    };
    
    // 드롭다운 초기화
    const purposeSelect = document.getElementById('search-purpose');
    if (purposeSelect) purposeSelect.value = '';
    
    const companySelect = document.getElementById('search-company');
    const managerSelect = document.getElementById('search-manager');
    if (companySelect) companySelect.value = '';
    if (managerSelect) managerSelect.value = '';
    
    // 텍스트 검색 초기화
    const textInput = document.getElementById('search-text');
    if (textInput) textInput.value = '';
    
    // 기간 검색 초기화
    const dateFromInput = document.getElementById('search-date-from');
    const dateToInput = document.getElementById('search-date-to');
    if (dateFromInput) dateFromInput.value = '';
    if (dateToInput) dateToInput.value = '';
    
    // 전체 탭 활성화
    const statusTabs = document.querySelectorAll('.status-tab');
    statusTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-status') === 'all') {
            tab.classList.add('active');
        }
    });
}

// URL 파라미터에서 필터 값 읽기
function loadFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 상태 필터
    const status = urlParams.get('status');
    if (status) {
        currentFilters.status = status;
        
        // 해당 상태 탭 활성화
        const statusTabs = document.querySelectorAll('.status-tab');
        statusTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-status') === status) {
                tab.classList.add('active');
            }
        });
    }
    
    // 연도/월 필터를 날짜 범위로 변환
    const year = urlParams.get('year');
    const month = urlParams.get('month');
    
    // 로그인한 사용자 정보 가져오기
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (currentUser && currentUser.name) {
        // 로그인한 사용자 이름으로 manager 필터 설정
        currentFilters.manager = currentUser.name.replace('님', '');
    }
    
    if (year && month) {
        // 선택한 연도/월의 시작일과 종료일 설정
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
        
        const dateFromInput = document.getElementById('search-date-from');
        const dateToInput = document.getElementById('search-date-to');
        
        if (dateFromInput) {
            dateFromInput.value = startDate.toISOString().split('T')[0];
            currentFilters.dateFrom = startDate.toISOString().split('T')[0];
        }
        if (dateToInput) {
            dateToInput.value = endDate.toISOString().split('T')[0];
            currentFilters.dateTo = endDate.toISOString().split('T')[0];
        }
        
        // 상세 검색 영역 자동 열기 (status 파라미터가 없을 때만)
        if (!status) {
            const advancedSearch = document.getElementById('search-advanced');
            if (advancedSearch) {
                advancedSearch.style.display = 'block';
            }
        }
    } else if (year) {
        // 연도만 선택된 경우
        const yearNum = parseInt(year);
        const startDate = new Date(yearNum, 0, 1);
        const endDate = new Date(yearNum, 11, 31, 23, 59, 59);
        
        const dateFromInput = document.getElementById('search-date-from');
        const dateToInput = document.getElementById('search-date-to');
        
        if (dateFromInput) {
            dateFromInput.value = startDate.toISOString().split('T')[0];
            currentFilters.dateFrom = startDate.toISOString().split('T')[0];
        }
        if (dateToInput) {
            dateToInput.value = endDate.toISOString().split('T')[0];
            currentFilters.dateTo = endDate.toISOString().split('T')[0];
        }
        
        // 상세 검색 영역 자동 열기 (status 파라미터가 없을 때만)
        if (!status) {
            const advancedSearch = document.getElementById('search-advanced');
            if (advancedSearch) {
                advancedSearch.style.display = 'block';
            }
        }
    }
    
    // 담당자 필터 (현재 로그인한 사용자)
    // setupSearchAndFilters가 먼저 실행되어 드롭다운이 생성된 후에 설정
    // currentUser는 위에서 이미 선언되었으므로 재선언하지 않음
    if (currentUser && currentUser.name) {
        const managerSelect = document.getElementById('search-manager');
        if (managerSelect && managerSelect.options.length > 1) {
            // 옵션이 있는지 확인하고 설정
            const managerName = currentUser.name.replace('님', '');
            // 가장 유사한 옵션 찾기
            let bestMatch = '';
            for (let i = 0; i < managerSelect.options.length; i++) {
                const optValue = managerSelect.options[i].value;
                if (optValue === managerName || 
                    optValue.includes(managerName) || 
                    managerName.includes(optValue)) {
                    bestMatch = optValue;
                    break;
                }
            }
            if (bestMatch) {
                managerSelect.value = bestMatch;
                currentFilters.manager = bestMatch;
            }
        }
    }
}

// 천단위 콤마 포맷팅
function formatNumber(num) {
    if (!num) return '0';
    return Number(num).toLocaleString('ko-KR');
}

// 견적 미션 진행 현황 계산 및 표시 (모든 견적서 기준)
function updateStatusCounts() {
    const quotes = getQuotes();
    
    // 선택된 연도/월 가져오기
    const yearSelect = document.getElementById('status-year-select');
    const monthSelect = document.getElementById('status-month-select');
    const selectedYear = yearSelect ? parseInt(yearSelect.value) : new Date().getFullYear();
    const selectedMonth = monthSelect ? parseInt(monthSelect.value) : 0; // 0은 전체
    
    // 모든 견적서 사용 (사용자 필터링 제거)
    let userQuotes = quotes;
    
    // 해당 월 집계와 총 누적 건수
    const monthlyCounts = {
        '접수': 0,
        '발송완료': 0,
        '협의중': 0,
        '계약확정': 0,
        '계약미체결': 0,
        '계약완료': 0
    };
    
    const totalCounts = {
        '접수': 0,
        '발송완료': 0,
        '협의중': 0,
        '계약확정': 0,
        '계약미체결': 0,
        '계약완료': 0
    };
    
    const amounts = {
        '접수': 0,
        '발송완료': 0,
        '협의중': 0,
        '계약확정': 0,
        '계약미체결': 0,
        '계약완료': 0
    };

    userQuotes.forEach(quote => {
        const status = quote.status || '접수';
        const normalizedStatus = status.replace(/\s/g, '');
        const totalAmount = quote.totalAmount || 0;
        const statusHistory = quote.statusHistory || {};
        
        let statusKey = '접수';
        let isInSelectedMonth = false;
        let isInSelectedRange = false;
        
        if (normalizedStatus === '발송완료' || status === '발송 완료') {
            statusKey = '발송완료';
            const sentDate = statusHistory['발송 완료'] || statusHistory['발송완료'];
            if (sentDate) {
                const date = new Date(sentDate);
                const dateYear = date.getFullYear();
                const dateMonth = date.getMonth() + 1;
                
                if (selectedYear && selectedMonth > 0) {
                    isInSelectedMonth = (dateYear === selectedYear && dateMonth === selectedMonth);
                    isInSelectedRange = (dateYear < selectedYear) || 
                                       (dateYear === selectedYear && dateMonth <= selectedMonth);
                } else if (selectedYear) {
                    isInSelectedRange = dateYear <= selectedYear;
                } else {
                    isInSelectedRange = true;
                }
            }
        } else if (normalizedStatus === '협의중' || status === '협의 중') {
            statusKey = '협의중';
            const date = new Date(quote.createdAt || quote.date || quote.quoteDate || Date.now());
            if (selectedYear && selectedMonth > 0) {
                const dateYear = date.getFullYear();
                const dateMonth = date.getMonth() + 1;
                isInSelectedMonth = (dateYear === selectedYear && dateMonth === selectedMonth);
                isInSelectedRange = (dateYear < selectedYear) || 
                                   (dateYear === selectedYear && dateMonth <= selectedMonth);
            } else if (selectedYear) {
                isInSelectedRange = date.getFullYear() <= selectedYear;
            } else {
                isInSelectedRange = true;
            }
        } else if (normalizedStatus === '계약확정' || status === '계약 확정') {
            statusKey = '계약확정';
            const date = new Date(quote.createdAt || quote.date || quote.quoteDate || Date.now());
            if (selectedYear && selectedMonth > 0) {
                const dateYear = date.getFullYear();
                const dateMonth = date.getMonth() + 1;
                isInSelectedMonth = (dateYear === selectedYear && dateMonth === selectedMonth);
                isInSelectedRange = (dateYear < selectedYear) || 
                                   (dateYear === selectedYear && dateMonth <= selectedMonth);
            } else if (selectedYear) {
                isInSelectedRange = date.getFullYear() <= selectedYear;
            } else {
                isInSelectedRange = true;
            }
        } else if (normalizedStatus === '계약미체결' || status === '계약 미체결') {
            statusKey = '계약미체결';
            const date = new Date(quote.createdAt || quote.date || quote.quoteDate || Date.now());
            if (selectedYear && selectedMonth > 0) {
                const dateYear = date.getFullYear();
                const dateMonth = date.getMonth() + 1;
                isInSelectedMonth = (dateYear === selectedYear && dateMonth === selectedMonth);
                isInSelectedRange = (dateYear < selectedYear) || 
                                   (dateYear === selectedYear && dateMonth <= selectedMonth);
            } else if (selectedYear) {
                isInSelectedRange = date.getFullYear() <= selectedYear;
            } else {
                isInSelectedRange = true;
            }
        } else if (normalizedStatus === '계약완료' || status === '계약 완료') {
            statusKey = '계약완료';
            const completedDate = statusHistory['계약 완료'] || statusHistory['계약완료'];
            if (completedDate) {
                const date = new Date(completedDate);
                const dateYear = date.getFullYear();
                const dateMonth = date.getMonth() + 1;
                
                if (selectedYear && selectedMonth > 0) {
                    isInSelectedMonth = (dateYear === selectedYear && dateMonth === selectedMonth);
                    isInSelectedRange = (dateYear < selectedYear) || 
                                       (dateYear === selectedYear && dateMonth <= selectedMonth);
                } else if (selectedYear) {
                    isInSelectedRange = dateYear <= selectedYear;
                } else {
                    isInSelectedRange = true;
                }
            } else {
                const date = new Date(quote.createdAt || quote.date || quote.quoteDate || Date.now());
                if (selectedYear && selectedMonth > 0) {
                    const dateYear = date.getFullYear();
                    const dateMonth = date.getMonth() + 1;
                    isInSelectedMonth = (dateYear === selectedYear && dateMonth === selectedMonth);
                    isInSelectedRange = (dateYear < selectedYear) || 
                                       (dateYear === selectedYear && dateMonth <= selectedMonth);
                } else if (selectedYear) {
                    isInSelectedRange = date.getFullYear() <= selectedYear;
                } else {
                    isInSelectedRange = true;
                }
            }
        } else {
            // 접수 상태 - 견적일자(quoteDate)를 우선 사용
            const receivedDate = quote.quoteDate || quote.createdAt || quote.date;
            const date = new Date(receivedDate || Date.now());
            if (selectedYear && selectedMonth > 0) {
                const dateYear = date.getFullYear();
                const dateMonth = date.getMonth() + 1;
                isInSelectedMonth = (dateYear === selectedYear && dateMonth === selectedMonth);
                isInSelectedRange = (dateYear < selectedYear) || 
                                   (dateYear === selectedYear && dateMonth <= selectedMonth);
            } else if (selectedYear) {
                isInSelectedRange = date.getFullYear() <= selectedYear;
            } else {
                isInSelectedRange = true;
            }
        }
        
        if (isInSelectedRange) {
            totalCounts[statusKey]++;
            amounts[statusKey] += totalAmount;
            
            if (isInSelectedMonth) {
                monthlyCounts[statusKey]++;
            }
        }
    });

    // DOM 업데이트 - "해당 월 집계 / 총 누적 건수" 형식으로 표시
    const statusKeys = ['접수', '발송완료', '협의중', '계약확정', '계약미체결', '계약완료'];
    statusKeys.forEach(status => {
        const countEl = document.getElementById(`status-${status}`);
        const amountEl = document.getElementById(`amount-${status}`);
        
        if (countEl) {
            const monthlyCount = monthlyCounts[status] || 0;
            const totalCount = totalCounts[status] || 0;
            
            if (selectedYear && selectedMonth > 0) {
                countEl.textContent = `${monthlyCount} / ${totalCount}`;
            } else {
                countEl.textContent = totalCount;
            }
        }
        
        if (amountEl) {
            amountEl.textContent = formatNumber(amounts[status]) + '원';
        }
    });
}

// 상태 카드 클릭 이벤트 설정
function setupStatusCardClickEvents() {
    const statusKeys = ['접수', '발송완료', '협의중', '계약확정', '계약미체결', '계약완료'];
    
    statusKeys.forEach(status => {
        const card = document.getElementById(`status-${status}`)?.closest('.dashboard-status-card');
        if (card) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function() {
                const yearSelect = document.getElementById('status-year-select');
                const monthSelect = document.getElementById('status-month-select');
                const selectedYear = yearSelect ? yearSelect.value : new Date().getFullYear();
                const selectedMonth = monthSelect ? monthSelect.value : new Date().getMonth() + 1;
                
                const statusMap = {
                    '접수': '접수',
                    '발송완료': '발송 완료',
                    '협의중': '협의 중',
                    '계약확정': '계약 확정',
                    '계약미체결': '계약 미체결',
                    '계약완료': '계약 완료'
                };
                const statusValue = statusMap[status] || status;
                
                const params = new URLSearchParams();
                params.set('status', statusValue);
                params.set('year', selectedYear);
                params.set('month', selectedMonth);
                
                window.location.href = `status.html?${params.toString()}`;
            });
        }
    });
}

// 연도/월 드롭다운 초기화
function initYearSelect() {
    const yearSelect = document.getElementById('status-year-select');
    const monthSelect = document.getElementById('status-month-select');
    
    if (!yearSelect) return;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    yearSelect.innerHTML = '';
    for (let i = currentYear; i >= currentYear - 5; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i + '년';
        if (i === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
    
    if (monthSelect) {
        monthSelect.value = currentMonth;
    }
}

// 페이지 로드 시 견적서 목록 표시
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    if (!window.checkLogin || !window.checkLogin()) {
        return;
    }
    
    // 견적 미션 진행 현황 초기화 (status.html에 있는 경우)
    const statusCountList = document.getElementById('status-count-list');
    if (statusCountList) {
        initYearSelect();
        updateStatusCounts();
        // setupStatusCardClickEvents(); // 클릭 기능 비활성화
        
        const yearSelect = document.getElementById('status-year-select');
        const monthSelect = document.getElementById('status-month-select');
        
        if (yearSelect) {
            yearSelect.addEventListener('change', function() {
                updateStatusCounts();
            });
        }
        
        if (monthSelect) {
            monthSelect.addEventListener('change', function() {
                updateStatusCounts();
            });
        }
    }
    
    setupSearchAndFilters();
    
    // URL 파라미터에서 필터 로드 (드롭다운 생성 후)
    loadFiltersFromURL();
    
    renderQuoteList(1);
});

