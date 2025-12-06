/**
 * quote-detail.js
 * - 견적서 상세 페이지 전용 JavaScript
 * - 견적서 상세 정보 표시 및 수정/삭제/PDF 저장 기능
 */

const QUOTES_STORAGE_KEY = 'growth_launchpad_quotes';
// CURRENT_USER_KEY는 main.js에서 선언됨

// 현재 사용자 정보 가져오기 (main.js의 함수를 직접 사용하거나, 없으면 직접 구현)
function getCurrentUser() {
    // main.js가 먼저 로드되어 window.getCurrentUser가 설정되었는지 확인
    // 하지만 무한 재귀를 방지하기 위해 직접 localStorage에서 가져옴
    // main.js의 CURRENT_USER_KEY 값 사용
    const CURRENT_USER_KEY = 'growth_launchpad_current_user';
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
}

// 견적서 목록 가져오기
function getQuotes() {
    const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// URL 파라미터에서 ID 가져오기
function getQuoteIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// 현황 단계별 프로세스 그래프 생성 (클릭 가능)
function createStatusGraph(status, statusHistory, quoteDate, quoteId, isClickable = true) {
    // 현황 단계 정의 (순서대로)
    const statusFlow = {
        '접수': 0,
        '발송 완료': 1,
        '협의 중': 2,
        '계약 확정': 3,
        '계약 미체결': 3, // 계약 확정과 같은 단계
        '계약 완료': 4
    };
    
    const mainStatuses = ['접수', '발송 완료', '협의 중'];
    const currentStatus = status || '접수';
    const currentIndex = statusFlow[currentStatus] !== undefined ? statusFlow[currentStatus] : 0;
    const isContractConfirmed = currentStatus === '계약 확정';
    const isContractRejected = currentStatus === '계약 미체결';
    const isContractCompleted = currentStatus === '계약 완료';
    
    let html = '<div class="status-graph" id="status-graph-' + quoteId + '">';
    
    // 메인 프로세스 (접수 ~ 협의 중)
    mainStatuses.forEach((s, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex && !isContractConfirmed && !isContractRejected && !isContractCompleted;
        
        // 접수 단계는 견적일자 사용, 나머지는 statusHistory에서 가져오기
        let date = '';
        if (s === '접수') {
            date = quoteDate ? formatDate(quoteDate) : (statusHistory && statusHistory[s] ? formatDate(statusHistory[s]) : '');
        } else {
            date = statusHistory && statusHistory[s] ? formatDate(statusHistory[s]) : '';
        }
        
        const clickableClass = isClickable ? 'status-step-clickable' : '';
        const dataStatus = isClickable ? `data-status="${s}"` : '';
        
        html += `
            <div class="status-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''} ${clickableClass}" ${dataStatus}>
                <div class="status-step-circle">
                    ${isActive ? '✓' : ''}
                </div>
                <span class="status-step-label">${s}</span>
                ${date ? `<span class="status-step-date">${date}</span>` : ''}
            </div>
        `;
        
        if (index < mainStatuses.length - 1) {
            html += `<div class="status-step-line ${isActive && index < currentIndex ? 'active' : ''}"></div>`;
        }
    });
    
    // 협의 중 이후 분기점 (항상 표시)
    // 협의 중에서 계약 확정/미체결로 가는 선
    const hasConfirmedHistory = statusHistory && statusHistory['계약 확정'];
    const hasCompletedHistory = statusHistory && statusHistory['계약 완료'];
    const shouldShowConfirmed = isContractConfirmed || isContractCompleted || hasConfirmedHistory;
    
    html += `<div class="status-step-line ${shouldShowConfirmed || isContractRejected ? 'active' : ''}"></div>`;
    
    // 계약 확정 또는 계약 미체결 표시
    if (shouldShowConfirmed) {
        const clickableClass = isClickable ? 'status-step-clickable' : '';
        const dataStatus = isClickable ? `data-status="계약 확정"` : '';
        const isConfirmedCurrent = isContractConfirmed && !isContractCompleted;
        
        html += `
            <div class="status-step status-step--confirmed active ${isConfirmedCurrent ? 'current' : ''} ${clickableClass}" ${dataStatus}>
                <div class="status-step-circle">✓</div>
                <span class="status-step-label">계약 확정</span>
                ${hasConfirmedHistory ? `<span class="status-step-date">${formatDate(statusHistory['계약 확정'])}</span>` : ''}
            </div>
        `;
        
        // 계약 확정에서 계약 완료로 가는 선
        html += `<div class="status-step-line ${isContractCompleted || hasCompletedHistory ? 'active' : ''}"></div>`;
        
        // 계약 완료 표시
        if (isContractCompleted || hasCompletedHistory) {
            const clickableClass = isClickable ? 'status-step-clickable' : '';
            const dataStatus = isClickable ? `data-status="계약 완료"` : '';
            const isCompletedCurrent = isContractCompleted;
            
            html += `
                <div class="status-step status-step--completed active ${isCompletedCurrent ? 'current' : ''} ${clickableClass}" ${dataStatus}>
                    <div class="status-step-circle">✓</div>
                    <span class="status-step-label">계약 완료</span>
                    ${hasCompletedHistory ? `<span class="status-step-date">${formatDate(statusHistory['계약 완료'])}</span>` : ''}
                </div>
            `;
        } else {
            const clickableClass = isClickable ? 'status-step-clickable' : '';
            const dataStatus = isClickable ? `data-status="계약 완료"` : '';
            
            html += `
                <div class="status-step ${clickableClass}" ${dataStatus}>
                    <div class="status-step-circle"></div>
                    <span class="status-step-label">계약 완료</span>
                </div>
            `;
        }
    } else if (isContractRejected) {
        const clickableClass = isClickable ? 'status-step-clickable' : '';
        const dataStatus = isClickable ? `data-status="계약 미체결"` : '';
        
            html += `
                <div class="status-step status-step--rejected active current ${clickableClass}" ${dataStatus}>
                    <div class="status-step-circle">✗</div>
                    <span class="status-step-label">계약 미체결</span>
                    ${statusHistory && statusHistory['계약 미체결'] ? `<span class="status-step-date">${formatDate(statusHistory['계약 미체결'])}</span>` : ''}
                </div>
            `;
        } else {
            // 협의 중이지만 아직 확정/미체결이 아닌 경우
            const clickableClass = isClickable ? 'status-step-clickable' : '';
            const dataStatusConfirmed = isClickable ? `data-status="계약 확정"` : '';
            const dataStatusRejected = isClickable ? `data-status="계약 미체결"` : '';
            
            html += `
                <div class="status-step ${clickableClass}" ${dataStatusConfirmed}>
                    <div class="status-step-circle"></div>
                    <span class="status-step-label">계약 확정</span>
                </div>
                <div class="status-step ${clickableClass}" ${dataStatusRejected}>
                    <div class="status-step-circle"></div>
                    <span class="status-step-label">계약 미체결</span>
                </div>
            `;
    }
    
    html += '</div>';
    return html;
}

// 권한 체크 (최고관리자 또는 등록자)
function canEditOrDelete(quote) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return false;
        
        // 최고관리자 체크 (email이 admin으로 시작하거나 name이 관리자 관련인 경우)
        const isAdmin = currentUser.email && (
            currentUser.email.toLowerCase().includes('admin') ||
            currentUser.name === '관리자' ||
            currentUser.position === '관리자'
        );
        
        // 등록자 체크 (담당자 이름과 현재 사용자 이름이 일치)
        const isCreator = quote.managerName && currentUser.name && 
                          quote.managerName === currentUser.name;
        
        return isAdmin || isCreator;
    } catch (error) {
        console.error('canEditOrDelete 오류:', error);
        return false;
    }
}

// 견적서 상세 정보 렌더링
function renderQuoteDetail(quote) {
    console.log('renderQuoteDetail 호출됨, quote:', quote);
    const content = document.getElementById('quote-detail-content');
    if (!content) {
        console.error('quote-detail-content 요소를 찾을 수 없습니다.');
        return;
    }
    
    if (!quote) {
        content.innerHTML = `
            <div class="form-card" style="text-align: center; padding: 3rem;">
                <p style="color: var(--muted); font-size: 1.1rem;">견적서를 찾을 수 없습니다.</p>
                <a href="status.html" class="btn primary" style="margin-top: 1.5rem;">목록으로 돌아가기</a>
            </div>
        `;
        return;
    }
    
    const dateStr = quote.quoteDate ? formatDate(quote.quoteDate) : '-';
    let totalAmount = 0;
    
    // items가 배열인지 확인하고 처리
    const items = quote.items && Array.isArray(quote.items) ? quote.items : [];
    items.forEach(item => {
        // amount가 null/undefined/빈 문자열인 경우 0으로 처리
        if (!item.amount && item.amount !== 0) {
            return;
        }
        
        // amount가 문자열인 경우 콤마 제거 후 숫자로 변환
        let amountValue = 0;
        if (typeof item.amount === 'string') {
            const cleaned = item.amount.replace(/,/g, '').trim();
            amountValue = cleaned ? parseFloat(cleaned) : 0;
        } else if (typeof item.amount === 'number') {
            amountValue = item.amount;
        } else {
            amountValue = parseFloat(item.amount) || 0;
        }
        
        // NaN 체크
        if (isNaN(amountValue)) {
            amountValue = 0;
        }
        
        totalAmount += amountValue;
    });
    
    // 최종 NaN 체크
    if (isNaN(totalAmount)) {
        totalAmount = 0;
    }
    
    const totalAmountStr = totalAmount.toLocaleString('ko-KR');
    
    // 임시저장 라벨
    const tempLabel = quote.isTemp ? '<span class="status-label status-label--temp">임시저장</span>' : '';
    
    // 견적서명에서 [임시저장] 제거
    let quoteTitle = quote.quoteTitle || '-';
    if (quoteTitle.startsWith('[임시저장] ')) {
        quoteTitle = quoteTitle.replace('[임시저장] ', '');
    }
    
    content.innerHTML = `
        <div class="form-card form-card--wide">
            <!-- 견적 상태 -->
            <div class="quote-section" style="margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
                    <h2 class="quote-section-title" style="margin: 0;">견적 상태</h2>
                    <div id="quote-status-graph" style="flex: 1; min-width: 300px;">
                        ${createStatusGraph(quote.status || '접수', quote.statusHistory || {}, quote.quoteDate, quote.id, true)}
                    </div>
                </div>
            </div>
            
            <!-- 고객사 정보 -->
            <div class="quote-section quote-section--customer">
                <h2 class="quote-section-title">고객사 정보</h2>
                
                <div class="form-grid form-grid-single-row">
                    <div class="form-field">
                        <span class="form-label">고객사명</span>
                        <div class="form-input">${escapeHtml(quote.customer?.companyName || '-')}</div>
                    </div>
                    <div class="form-field">
                        <span class="form-label">담당자명</span>
                        <div class="form-input">${escapeHtml(quote.customer?.contactName || '-')}</div>
                    </div>
                    <div class="form-field">
                        <span class="form-label">직책</span>
                        <div class="form-input">${escapeHtml(quote.customer?.position || '-')}</div>
                    </div>
                    <div class="form-field">
                        <span class="form-label">연락처</span>
                        <div class="form-input">${escapeHtml(quote.customer?.phone || '-')}</div>
                    </div>
                    <div class="form-field">
                        <span class="form-label">이메일</span>
                        <div class="form-input">${escapeHtml(quote.customer?.email || '-')}</div>
                    </div>
                </div>
                
                <div class="form-field">
                    <span class="form-label">사용 목적</span>
                    <div class="form-input">${escapeHtml(quote.purpose || '-')}</div>
                </div>
                
                <div class="form-field">
                    <span class="form-label">재견적 여부</span>
                    <div class="form-input">${quote.isRequote ? '✓ 재견적' : '-'}</div>
                </div>
            </div>

            <!-- 견적서 영역 -->
            <div class="quote-section quote-section--document">
                <h2 class="quote-section-title">견적서</h2>
                
                <!-- 견적서 헤더 및 회사 정보 -->
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
                
                <!-- 수신 -->
                <div class="quote-subsection">
                    <h3 class="quote-subsection-title">수신</h3>
                    <div class="form-grid">
                        <div class="form-field">
                            <span class="form-label">수신자</span>
                            <div class="form-input">${escapeHtml(quote.recipient || '')}</div>
                        </div>
                        <div class="form-field">
                            <span class="form-label">참조</span>
                            <div class="form-input">${escapeHtml(quote.reference || '')}</div>
                        </div>
                    </div>
                </div>

                <!-- 견적 기본 정보 -->
                <div class="quote-subsection">
                    <h3 class="quote-subsection-title">견적 기본 정보</h3>
                    <div class="form-grid">
                        <div class="form-field">
                            <span class="form-label">견적서 제목</span>
                            <div class="form-input" style="display: flex; align-items: center; gap: 0.5rem;">
                                <span>${escapeHtml(quoteTitle)}</span>
                                ${tempLabel}
                            </div>
                        </div>
                        <div class="form-field">
                            <span class="form-label">견적 일자</span>
                            <div class="form-input">${dateStr}</div>
                        </div>
                    </div>
                </div>

                <!-- 견적 항목 -->
                <div class="quote-subsection">
                    <div class="quote-subsection-header">
                        <div class="quote-subsection-title-group">
                            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                <h3 class="quote-subsection-title" style="margin: 0;">견적 항목</h3>
                            </div>
                            <span style="font-size: 0.85rem; color: var(--muted); font-weight: normal;">(단위 : 원, VAT 별도)</span>
                        </div>
                    </div>
                    
                    <!-- 데스크톱용 테이블 -->
                    <div class="quote-items-table" id="quote-items-table">
                        ${items.length > 0 ? `
                        <table class="quote-table">
                            <thead>
                                <tr>
                                    <th style="width: 40px;"></th>
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
                                ${items.map((item, index) => {
                                    let priceValue = 0;
                                    if (typeof item.price === 'string') {
                                        const cleaned = item.price.replace(/,/g, '').trim();
                                        priceValue = cleaned ? parseFloat(cleaned) : 0;
                                    } else if (typeof item.price === 'number') {
                                        priceValue = item.price;
                                    } else {
                                        priceValue = parseFloat(item.price) || 0;
                                    }
                                    if (isNaN(priceValue)) priceValue = 0;
                                    
                                    let amountValue = 0;
                                    if (!item.amount && item.amount !== 0) {
                                        amountValue = 0;
                                    } else if (typeof item.amount === 'string') {
                                        const cleaned = item.amount.replace(/,/g, '').trim();
                                        amountValue = cleaned ? parseFloat(cleaned) : 0;
                                    } else if (typeof item.amount === 'number') {
                                        amountValue = item.amount;
                                    } else {
                                        amountValue = parseFloat(item.amount) || 0;
                                    }
                                    if (isNaN(amountValue)) amountValue = 0;
                                    
                                    return `
                                        <tr>
                                            <td></td>
                                            <td>${escapeHtml(item.category || '-')}</td>
                                            <td>${escapeHtml(item.detail || '-')}</td>
                                            <td>${escapeHtml(item.period || '-')}</td>
                                            <td>${escapeHtml(item.quantity || '-')}</td>
                                            <td>${priceValue > 0 ? priceValue.toLocaleString('ko-KR') + '원' : '-'}</td>
                                            <td>${amountValue > 0 ? amountValue.toLocaleString('ko-KR') + '원' : '-'}</td>
                                            <td>${escapeHtml(item.note || '-')}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                        ` : '<div style="text-align: center; padding: 3rem; color: var(--muted);">견적 항목이 없습니다.</div>'}
                    </div>
                    
                    <!-- 모바일용 카드 -->
                    <div class="quote-items-mobile" id="quote-items-mobile">
                        ${items.length > 0 ? items.map((item, index) => {
                            // price와 amount를 숫자로 변환 (문자열인 경우 콤마 제거)
                            let priceValue = 0;
                            if (typeof item.price === 'string') {
                                const cleaned = item.price.replace(/,/g, '').trim();
                                priceValue = cleaned ? parseFloat(cleaned) : 0;
                            } else if (typeof item.price === 'number') {
                                priceValue = item.price;
                            } else {
                                priceValue = parseFloat(item.price) || 0;
                            }
                            if (isNaN(priceValue)) priceValue = 0;
                            
                            let amountValue = 0;
                            if (!item.amount && item.amount !== 0) {
                                amountValue = 0;
                            } else if (typeof item.amount === 'string') {
                                const cleaned = item.amount.replace(/,/g, '').trim();
                                amountValue = cleaned ? parseFloat(cleaned) : 0;
                            } else if (typeof item.amount === 'number') {
                                amountValue = item.amount;
                            } else {
                                amountValue = parseFloat(item.amount) || 0;
                            }
                            if (isNaN(amountValue)) amountValue = 0;
                            
                            return `
                                <div class="quote-item-card-mobile">
                                    <div class="quote-item-card-mobile-header">
                                        <div class="quote-item-card-mobile-title">${escapeHtml(item.category || '-')}</div>
                                    </div>
                                    <div class="quote-item-card-mobile-field">
                                        <label>세부 항목</label>
                                        <div>${escapeHtml(item.detail || '-')}</div>
                                    </div>
                                    <div class="quote-item-card-mobile-row">
                                        <div class="quote-item-card-mobile-field">
                                            <label>기본계약기간(월)</label>
                                            <div>${escapeHtml(item.period || '-')}</div>
                                        </div>
                                        <div class="quote-item-card-mobile-field">
                                            <label>수량</label>
                                            <div>${escapeHtml(item.quantity || '-')}</div>
                                        </div>
                                    </div>
                                    <div class="quote-item-card-mobile-row">
                                        <div class="quote-item-card-mobile-field">
                                            <label>단가</label>
                                            <div>${priceValue > 0 ? priceValue.toLocaleString('ko-KR') + '원' : '-'}</div>
                                        </div>
                                        <div class="quote-item-card-mobile-field">
                                            <label>공급가액</label>
                                            <div>${amountValue > 0 ? amountValue.toLocaleString('ko-KR') + '원' : '-'}</div>
                                        </div>
                                    </div>
                                    ${item.note ? `
                                    <div class="quote-item-card-mobile-field">
                                        <label>비고</label>
                                        <div>${escapeHtml(item.note)}</div>
                                    </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('') : '<div style="text-align: center; padding: 3rem; color: var(--muted);">견적 항목이 없습니다.</div>'}
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

                <!-- 결제 및 담당자 안내 -->
                <div class="quote-subsection">
                    <h3 class="quote-subsection-title">결제 및 담당자 안내</h3>
                    
                    <div class="form-field">
                        <span class="form-label">결제정보</span>
                        <div class="form-input">${escapeHtml(quote.paymentInfo || '')}</div>
                    </div>

                    <div class="form-field">
                        <span class="form-label">입금 관련</span>
                        <div class="form-input" style="white-space: pre-wrap;">${escapeHtml(quote.depositInfo || '')}</div>
                    </div>

                    <div class="form-grid">
                        <div class="form-field">
                            <span class="form-label">담당자 이름</span>
                            <div class="form-input">${escapeHtml(quote.managerName || '')}</div>
                        </div>
                        <div class="form-field">
                            <span class="form-label">직책</span>
                            <div class="form-input">${escapeHtml(quote.managerPosition || '')}</div>
                        </div>
                        <div class="form-field">
                            <span class="form-label">연락처</span>
                            <div class="form-input">${escapeHtml(quote.managerPhone || '')}</div>
                        </div>
                        <div class="form-field">
                            <span class="form-label">이메일</span>
                            <div class="form-input">${escapeHtml(quote.managerEmail || '')}</div>
                        </div>
                    </div>

                    <div class="form-field">
                        <span class="form-label">유효기간</span>
                        <div class="form-input" style="white-space: pre-wrap;">${escapeHtml(quote.validity || '')}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 버튼 렌더링
    try {
        renderActionButtons(quote);
    } catch (error) {
        console.error('renderActionButtons 오류:', error);
    }
    
    // 상태 그래프 클릭 이벤트 추가
    setupStatusGraphClickHandlers(quote);
    
    // 모바일 카드 표시는 CSS에서 처리됨
}

// 상태 그래프 클릭 이벤트 설정
function setupStatusGraphClickHandlers(quote) {
    const statusGraph = document.getElementById('status-graph-' + quote.id);
    if (!statusGraph) return;
    
    const clickableSteps = statusGraph.querySelectorAll('.status-step-clickable');
    clickableSteps.forEach(step => {
        step.addEventListener('click', function() {
            const newStatus = this.getAttribute('data-status');
            if (newStatus) {
                openStatusUpdateModal(quote, newStatus);
            }
        });
    });
}

// 상태 업데이트 모달 열기
function openStatusUpdateModal(quote, newStatus) {
    // 기존 날짜 가져오기
    const statusHistory = quote.statusHistory || {};
    const existingDate = statusHistory[newStatus] ? formatDate(statusHistory[newStatus]) : '';
    const today = new Date().toISOString().split('T')[0];
    
    // 모달 HTML 생성
    const modalHTML = `
        <div class="modal" id="status-update-modal" style="display: flex;">
            <div class="modal-overlay"></div>
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>상태 변경</h2>
                    <button type="button" class="modal-close" aria-label="닫기" onclick="closeStatusUpdateModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-field">
                        <span class="form-label">상태</span>
                        <div class="form-input" style="background: #f5f5f5;">${newStatus}</div>
                    </div>
                    <div class="form-field">
                        <span class="form-label">등록일자</span>
                        <input type="date" id="status-update-date" class="form-input" value="${existingDate || today}">
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="form-actions">
                        <button type="button" class="btn secondary" onclick="closeStatusUpdateModal()">취소</button>
                        <button type="button" class="btn primary" onclick="confirmStatusUpdate(${quote.id}, '${newStatus}')">확인</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById('status-update-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 모달 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 오버레이 클릭 시 닫기
    const overlay = document.querySelector('#status-update-modal .modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeStatusUpdateModal);
    }
}

// 상태 업데이트 모달 닫기
function closeStatusUpdateModal() {
    const modal = document.getElementById('status-update-modal');
    if (modal) {
        modal.remove();
    }
}

// 상태 업데이트 확인
function confirmStatusUpdate(quoteId, newStatus) {
    const dateInput = document.getElementById('status-update-date');
    if (!dateInput) {
        alert('날짜를 입력해주세요.');
        return;
    }
    
    const selectedDate = dateInput.value;
    if (!selectedDate) {
        alert('날짜를 선택해주세요.');
        return;
    }
    
    updateQuoteStatus(quoteId, newStatus, selectedDate);
    closeStatusUpdateModal();
}

// window 객체에 노출 (HTML에서 호출 가능하도록)
window.closeStatusUpdateModal = closeStatusUpdateModal;
window.confirmStatusUpdate = confirmStatusUpdate;

// 견적서 상태 업데이트
function updateQuoteStatus(quoteId, newStatus, selectedDate) {
    const quotes = getQuotes();
    const quoteIndex = quotes.findIndex(q => {
        const qId = typeof q.id === 'string' ? parseInt(q.id) : (typeof q.id === 'number' ? q.id : parseInt(q.id));
        return qId === parseInt(quoteId);
    });
    
    if (quoteIndex === -1) {
        alert('견적서를 찾을 수 없습니다.');
        return;
    }
    
    const quote = quotes[quoteIndex];
    
    // 상태 업데이트
    quote.status = newStatus;
    
    // 상태 히스토리 업데이트
    if (!quote.statusHistory) {
        quote.statusHistory = {};
    }
    
    // 선택한 날짜로 상태 히스토리 저장 (ISO 형식으로 변환)
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const isoDate = dateObj.toISOString();
    quote.statusHistory[newStatus] = isoDate;
    
    // 접수 상태인 경우 견적일자도 업데이트
    if (newStatus === '접수') {
        quote.quoteDate = isoDate;
    }
    
    // updatedAt 업데이트
    quote.updatedAt = new Date().toISOString();
    
    // localStorage에 저장
    quotes[quoteIndex] = quote;
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
    
    // 화면 새로고침
    alert('상태가 변경되었습니다.');
    renderQuoteDetail(quote);
}

// 액션 버튼 렌더링
function renderActionButtons(quote) {
    const actionsContainer = document.getElementById('quote-detail-actions');
    if (!actionsContainer) return;
    
    const hasPermission = canEditOrDelete(quote);
    
    let buttonsHTML = '';
    
    if (hasPermission) {
        buttonsHTML += `
            <button type="button" id="btn-edit-quote" class="btn primary">수정</button>
            <button type="button" id="btn-delete-quote" class="btn secondary">삭제</button>
        `;
    }
    
    buttonsHTML += `
        <button type="button" id="btn-pdf-save" class="btn secondary">PDF 저장</button>
        <a href="status.html" class="btn ghost">목록</a>
    `;
    
    actionsContainer.innerHTML = buttonsHTML;
    
    // 이벤트 리스너 추가
    if (hasPermission) {
        const editBtn = document.getElementById('btn-edit-quote');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                window.location.href = `quote.html?id=${quote.id}`;
            });
        }
        
        const deleteBtn = document.getElementById('btn-delete-quote');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('정말로 이 견적서를 삭제하시겠습니까?')) {
                    deleteQuote(quote.id);
                }
            });
        }
    }
    
    const pdfBtn = document.getElementById('btn-pdf-save');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            saveQuoteAsPDF(quote);
        });
    }
}

// 견적서 삭제
function deleteQuote(quoteId) {
    const quotes = getQuotes();
    const filteredQuotes = quotes.filter(q => q.id !== parseInt(quoteId));
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(filteredQuotes));
    alert('견적서가 삭제되었습니다.');
    window.location.href = 'status.html';
}

// PDF 저장
function saveQuoteAsPDF(quote) {
    if (typeof window.jspdf === 'undefined') {
        alert('PDF 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
    if (typeof html2canvas === 'undefined') {
        alert('이미지 변환 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
    const pdfBtn = document.getElementById('btn-pdf-save');
    if (pdfBtn) {
        pdfBtn.disabled = true;
        pdfBtn.textContent = 'PDF 생성 중...';
    }
    
    try {
        const quotePreviewPaper = document.querySelector('.quote-section--document');
        if (!quotePreviewPaper) {
            throw new Error('견적서 영역을 찾을 수 없습니다.');
        }
        
        html2canvas(quotePreviewPaper, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: quotePreviewPaper.scrollWidth,
            height: quotePreviewPaper.scrollHeight
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            let position = 0;
            
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            const fileName = `견적서_${quote.customer?.companyName || '미정'}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            if (pdfBtn) {
                pdfBtn.disabled = false;
                pdfBtn.textContent = 'PDF 저장';
            }
        }).catch(error => {
            console.error('PDF 생성 오류:', error);
            alert('PDF 저장 중 오류가 발생했습니다.');
            
            if (pdfBtn) {
                pdfBtn.disabled = false;
                pdfBtn.textContent = 'PDF 저장';
            }
        });
    } catch (error) {
        console.error('PDF 생성 오류:', error);
        alert('PDF 저장 중 오류가 발생했습니다.');
        
        const pdfBtn = document.getElementById('btn-pdf-save');
        if (pdfBtn) {
            pdfBtn.disabled = false;
            pdfBtn.textContent = 'PDF 저장';
        }
    }
}

// 견적 항목 캐러셀 초기화
let currentCarouselIndex = 0;
let totalCarouselItems = 0;
let carouselPrevHandler = null;
let carouselNextHandler = null;

function initQuoteItemsCarousel() {
    const cardsContainer = document.getElementById('quote-items-cards');
    const prevBtn = document.getElementById('quote-carousel-prev');
    const nextBtn = document.getElementById('quote-carousel-next');
    const currentIndicator = document.getElementById('quote-carousel-current');
    const totalIndicator = document.getElementById('quote-carousel-total');
    
    if (!cardsContainer) return;
    
    const cards = cardsContainer.querySelectorAll('.quote-item-card');
    totalCarouselItems = cards.length;
    
    if (totalCarouselItems === 0) return;
    
    // 이전 이벤트 리스너 제거
    if (prevBtn && carouselPrevHandler) {
        prevBtn.removeEventListener('click', carouselPrevHandler);
    }
    if (nextBtn && carouselNextHandler) {
        nextBtn.removeEventListener('click', carouselNextHandler);
    }
    
    // 초기 상태 설정
    currentCarouselIndex = 0;
    updateCarousel();
    
    // 버튼 이벤트 리스너
    carouselPrevHandler = function() {
        if (currentCarouselIndex > 0) {
            currentCarouselIndex--;
            updateCarousel();
        }
    };
    
    carouselNextHandler = function() {
        if (currentCarouselIndex < totalCarouselItems - 1) {
            currentCarouselIndex++;
            updateCarousel();
        }
    };
    
    if (prevBtn) {
        prevBtn.addEventListener('click', carouselPrevHandler);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', carouselNextHandler);
    }
    
    function updateCarousel() {
        cards.forEach((card, index) => {
            if (index === currentCarouselIndex) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // 버튼 활성화/비활성화
        if (prevBtn) {
            prevBtn.disabled = currentCarouselIndex === 0;
            prevBtn.style.opacity = currentCarouselIndex === 0 ? '0.4' : '1';
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentCarouselIndex === totalCarouselItems - 1;
            nextBtn.style.opacity = currentCarouselIndex === totalCarouselItems - 1 ? '0.4' : '1';
        }
        
        // 인디케이터 업데이트
        if (currentIndicator) {
            currentIndicator.textContent = currentCarouselIndex + 1;
        }
        
        if (totalIndicator) {
            totalIndicator.textContent = totalCarouselItems;
        }
    }
}

function destroyQuoteItemsCarousel() {
    const cardsContainer = document.getElementById('quote-items-cards');
    if (!cardsContainer) return;
    
    const cards = cardsContainer.querySelectorAll('.quote-item-card');
    cards.forEach(card => {
        card.style.display = 'block';
    });
    
    // 이벤트 리스너 제거
    const prevBtn = document.getElementById('quote-carousel-prev');
    const nextBtn = document.getElementById('quote-carousel-next');
    
    if (prevBtn && carouselPrevHandler) {
        prevBtn.removeEventListener('click', carouselPrevHandler);
    }
    if (nextBtn && carouselNextHandler) {
        nextBtn.removeEventListener('click', carouselNextHandler);
    }
    
    carouselPrevHandler = null;
    carouselNextHandler = null;
}

// 페이지 로드 시 견적서 상세 정보 표시
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    if (!window.checkLogin || !window.checkLogin()) {
        return;
    }
    
    console.log('quote-detail.js: DOMContentLoaded 이벤트 발생');
    
    // GNB 업데이트 (로그인 상태 확인)
    if (typeof window.updateGNB === 'function') {
        window.updateGNB();
    } else if (typeof updateGNB === 'function') {
        updateGNB();
    }
    
    const quoteId = getQuoteIdFromURL();
    console.log('quote-detail.js: quoteId from URL:', quoteId);
    
    if (!quoteId) {
        console.log('quote-detail.js: quoteId가 없음, 빈 화면 표시');
        renderQuoteDetail(null);
        return;
    }
    
    const quotes = getQuotes();
    console.log('quote-detail.js: 전체 견적서 개수:', quotes.length);
    
    // ID 타입 변환하여 비교 (문자열과 숫자 모두 처리)
    const quoteIdNum = parseInt(quoteId);
    const quote = quotes.find(q => {
        // q.id가 문자열이면 숫자로 변환, 이미 숫자면 그대로 사용
        const qId = typeof q.id === 'string' ? parseInt(q.id) : (typeof q.id === 'number' ? q.id : parseInt(q.id));
        return qId === quoteIdNum;
    });
    
    if (!quote) {
        console.error('quote-detail.js: 견적서를 찾을 수 없습니다.', {
            quoteId: quoteId,
            quoteIdNum: quoteIdNum,
            totalQuotes: quotes.length,
            quoteIds: quotes.map(q => ({ id: q.id, type: typeof q.id }))
        });
        renderQuoteDetail(null);
        return;
    }
    
    console.log('quote-detail.js: 견적서 찾음, 렌더링 시작:', quote);
    renderQuoteDetail(quote);
    
    // 화면 크기 변경 시 캐러셀 초기화/제거
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                initQuoteItemsCarousel();
            } else {
                destroyQuoteItemsCarousel();
            }
        }, 250);
    });
});

