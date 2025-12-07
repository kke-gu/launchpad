/**
 * 테스트 견적서 데이터 생성 스크립트
 * 브라우저 콘솔에서 실행: generateTestQuotes()
 */

// IIFE로 스코프 분리하여 상수 충돌 방지
(function() {
    'use strict';
    
    const QUOTES_STORAGE_KEY = 'growth_launchpad_quotes';

// 테스트 견적서 데이터 생성
function generateTestQuotes() {
    const quotes = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // 고객사 목록
    const companies = [
        '㈜테크솔루션', '㈜디지털교육', '㈜스마트에듀', '㈜에듀테크', '㈜학원시스템',
        '㈜교육플랫폼', '㈜온라인교육', '㈜에듀케이션', '㈜교육혁신', '㈜스마트학원',
        '㈜디지털학원', '㈜교육솔루션', '㈜에듀시스템', '㈜학원관리', '㈜교육서비스'
    ];
    
    // 사용 목적 목록
    const purposes = [
        '학원/학교', '개인 사업자', '내부 교육용', '내일배움카드', '공공기관 사용', '기타'
    ];
    
    // 담당자 정보
    const managers = [
        { name: '홍길동', email: 'sales1@malgeunsoft.com', position: '팀장', phone: '010-1234-5678' },
        { name: '이마케팅', email: 'sales2@malgeunsoft.com', position: '과장', phone: '010-2345-6789' },
        { name: '박지원', email: 'sales3@malgeunsoft.com', position: '대리', phone: '010-3456-7890' }
    ];
    
    // 견적 항목 샘플
    const sampleItems = [
        { category: '기본', detail: '기본 라이선스', period: '12', quantity: 10, price: 100000, amount: 1000000, note: '' },
        { category: '추가', detail: '추가 모듈', period: '12', quantity: 5, price: 50000, amount: 250000, note: '옵션' },
        { category: '서비스', detail: '유지보수', period: '12', quantity: 1, price: 200000, amount: 200000, note: '연간' }
    ];
    
    let quoteId = Date.now() - 1000000000; // 고유 ID 생성용
    
    // 상태별 견적서 생성 (각 담당자별로 1~2개씩)
    const statuses = [
        { status: '접수', count: 2 },
        { status: '발송 완료', count: 2 },
        { status: '협의 중', count: 2 },
        { status: '계약 확정', count: 2 },
        { status: '계약 미체결', count: 1 },
        { status: '계약 완료', count: 2 }
    ];
    
    statuses.forEach(({ status, count }) => {
        for (let i = 0; i < count; i++) {
            const manager = managers[i % managers.length];
            const company = companies[Math.floor(Math.random() * companies.length)];
            const purpose = purposes[Math.floor(Math.random() * purposes.length)];
            
            // 날짜 생성 (최근 6개월 내)
            const daysAgo = Math.floor(Math.random() * 180);
            const quoteDate = new Date(now);
            quoteDate.setDate(quoteDate.getDate() - daysAgo);
            
            const statusHistory = {
                '접수': quoteDate.toISOString()
            };
            
            // 상태에 따른 날짜 설정
            if (status !== '접수') {
                const statusDate = new Date(quoteDate);
                statusDate.setDate(statusDate.getDate() + Math.floor(Math.random() * 30) + 1);
                statusHistory[status] = statusDate.toISOString();
            }
            
            // 계약 완료인 경우 계약 확정도 추가
            if (status === '계약 완료') {
                const confirmedDate = new Date(statusHistory[status]);
                confirmedDate.setDate(confirmedDate.getDate() - 7);
                statusHistory['계약 확정'] = confirmedDate.toISOString();
            }
            
            const items = sampleItems.map(item => ({
                ...item,
                amount: item.quantity * item.price
            }));
            
            const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
            
            quotes.push({
                id: quoteId++,
                customer: {
                    companyName: company,
                    contactName: `담당자${i + 1}`,
                    position: '대표이사',
                    phone: `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
                    email: `contact${i}@${company.replace(/[㈜\s]/g, '').toLowerCase()}.com`
                },
                recipient: company,
                reference: `REF-${quoteId}`,
                quoteTitle: `${company} 견적서`,
                quoteDate: quoteDate.toISOString().split('T')[0],
                items: items,
                paymentInfo: '계좌이체',
                depositInfo: '계약금 30%',
                managerName: manager.name,
                managerPosition: manager.position,
                managerPhone: manager.phone,
                managerEmail: manager.email,
                validity: '30일',
                product: '상품A',
                licenseCount: 10,
                memo: '',
                purpose: purpose,
                isRequote: Math.random() > 0.7,
                isTemp: false,
                status: status,
                statusHistory: statusHistory,
                totalAmount: totalAmount,
                createdAt: quoteDate.toISOString(),
                updatedAt: statusHistory[status] || quoteDate.toISOString()
            });
        }
    });
    
    // 홍길동의 1년치 데이터 생성 (2025년 월별)
    const hongQuotes = [];
    const year = 2025;
    
    for (let month = 1; month <= 12; month++) {
        // 월별로 2~4개의 견적서 생성
        const quotesPerMonth = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < quotesPerMonth; i++) {
            const day = Math.floor(Math.random() * 28) + 1; // 1~28일
            const quoteDate = new Date(year, month - 1, day);
            
            // 상태 분배 (월별로 다양한 상태)
            let status = '접수';
            let statusHistory = {
                '접수': quoteDate.toISOString()
            };
            
            // 월에 따라 상태 분배
            if (month <= 2) {
                // 1~2월: 주로 접수, 발송 완료
                if (i % 2 === 0) {
                    status = '접수';
                } else {
                    status = '발송 완료';
                    const sentDate = new Date(quoteDate);
                    sentDate.setDate(sentDate.getDate() + Math.floor(Math.random() * 7) + 1);
                    statusHistory['발송 완료'] = sentDate.toISOString();
                }
            } else if (month <= 4) {
                // 3~4월: 발송 완료, 협의 중
                if (i % 2 === 0) {
                    status = '발송 완료';
                    const sentDate = new Date(quoteDate);
                    sentDate.setDate(sentDate.getDate() + Math.floor(Math.random() * 7) + 1);
                    statusHistory['발송 완료'] = sentDate.toISOString();
                } else {
                    status = '협의 중';
                    const sentDate = new Date(quoteDate);
                    sentDate.setDate(sentDate.getDate() + Math.floor(Math.random() * 7) + 1);
                    statusHistory['발송 완료'] = sentDate.toISOString();
                    const negotiatingDate = new Date(sentDate);
                    negotiatingDate.setDate(negotiatingDate.getDate() + Math.floor(Math.random() * 14) + 1);
                    statusHistory['협의 중'] = negotiatingDate.toISOString();
                }
            } else if (month <= 6) {
                // 5~6월: 협의 중, 계약 확정
                if (i % 2 === 0) {
                    status = '협의 중';
                    const sentDate = new Date(quoteDate);
                    sentDate.setDate(sentDate.getDate() + Math.floor(Math.random() * 7) + 1);
                    statusHistory['발송 완료'] = sentDate.toISOString();
                    const negotiatingDate = new Date(sentDate);
                    negotiatingDate.setDate(negotiatingDate.getDate() + Math.floor(Math.random() * 14) + 1);
                    statusHistory['협의 중'] = negotiatingDate.toISOString();
                } else {
                    status = '계약 확정';
                    const sentDate = new Date(quoteDate);
                    sentDate.setDate(sentDate.getDate() + Math.floor(Math.random() * 7) + 1);
                    statusHistory['발송 완료'] = sentDate.toISOString();
                    const negotiatingDate = new Date(sentDate);
                    negotiatingDate.setDate(negotiatingDate.getDate() + Math.floor(Math.random() * 14) + 1);
                    statusHistory['협의 중'] = negotiatingDate.toISOString();
                    const confirmedDate = new Date(negotiatingDate);
                    confirmedDate.setDate(confirmedDate.getDate() + Math.floor(Math.random() * 14) + 1);
                    statusHistory['계약 확정'] = confirmedDate.toISOString();
                }
            } else if (month <= 8) {
                // 7~8월: 계약 확정, 계약 완료
                if (i % 2 === 0) {
                    status = '계약 확정';
                    const sentDate = new Date(quoteDate);
                    sentDate.setDate(sentDate.getDate() + Math.floor(Math.random() * 7) + 1);
                    statusHistory['발송 완료'] = sentDate.toISOString();
                    const negotiatingDate = new Date(sentDate);
                    negotiatingDate.setDate(negotiatingDate.getDate() + Math.floor(Math.random() * 14) + 1);
                    statusHistory['협의 중'] = negotiatingDate.toISOString();
                    const confirmedDate = new Date(negotiatingDate);
                    confirmedDate.setDate(confirmedDate.getDate() + Math.floor(Math.random() * 14) + 1);
                    statusHistory['계약 확정'] = confirmedDate.toISOString();
                } else {
                    status = '계약 완료';
                    const sentDate = new Date(quoteDate);
                    sentDate.setDate(sentDate.getDate() + Math.floor(Math.random() * 7) + 1);
                    statusHistory['발송 완료'] = sentDate.toISOString();
                    const negotiatingDate = new Date(sentDate);
                    negotiatingDate.setDate(negotiatingDate.getDate() + Math.floor(Math.random() * 14) + 1);
                    statusHistory['협의 중'] = negotiatingDate.toISOString();
                    const confirmedDate = new Date(negotiatingDate);
                    confirmedDate.setDate(confirmedDate.getDate() + Math.floor(Math.random() * 14) + 1);
                    statusHistory['계약 확정'] = confirmedDate.toISOString();
                    const completedDate = new Date(confirmedDate);
                    completedDate.setDate(completedDate.getDate() + Math.floor(Math.random() * 30) + 1);
                    statusHistory['계약 완료'] = completedDate.toISOString();
                }
            } else {
                // 9~12월: 계약 완료 위주
                status = '계약 완료';
                const sentDate = new Date(quoteDate);
                sentDate.setDate(sentDate.getDate() + Math.floor(Math.random() * 7) + 1);
                statusHistory['발송 완료'] = sentDate.toISOString();
                const negotiatingDate = new Date(sentDate);
                negotiatingDate.setDate(negotiatingDate.getDate() + Math.floor(Math.random() * 14) + 1);
                statusHistory['협의 중'] = negotiatingDate.toISOString();
                const confirmedDate = new Date(negotiatingDate);
                confirmedDate.setDate(confirmedDate.getDate() + Math.floor(Math.random() * 14) + 1);
                statusHistory['계약 확정'] = confirmedDate.toISOString();
                const completedDate = new Date(confirmedDate);
                completedDate.setDate(completedDate.getDate() + Math.floor(Math.random() * 30) + 1);
                statusHistory['계약 완료'] = completedDate.toISOString();
            }
            
            const company = companies[Math.floor(Math.random() * companies.length)];
            const purpose = purposes[Math.floor(Math.random() * purposes.length)];
            
            const items = sampleItems.map(item => ({
                ...item,
                amount: item.quantity * item.price * (0.8 + Math.random() * 0.4) // 가격 변동
            }));
            
            const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
            
            hongQuotes.push({
                id: quoteId++,
                customer: {
                    companyName: company,
                    contactName: `담당자${month}-${i + 1}`,
                    position: '대표이사',
                    phone: `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
                    email: `contact${month}${i}@${company.replace(/[㈜\s]/g, '').toLowerCase()}.com`
                },
                recipient: company,
                reference: `REF-${year}${String(month).padStart(2, '0')}-${i + 1}`,
                quoteTitle: `${company} ${year}년 ${month}월 견적서`,
                quoteDate: quoteDate.toISOString().split('T')[0],
                items: items,
                paymentInfo: '계좌이체',
                depositInfo: '계약금 30%',
                managerName: '홍길동',
                managerPosition: '팀장',
                managerPhone: '010-1234-5678',
                managerEmail: 'sales1@malgeunsoft.com',
                validity: '30일',
                product: '상품A',
                licenseCount: 10,
                memo: '',
                purpose: purpose,
                isRequote: Math.random() > 0.8,
                isTemp: false,
                status: status,
                statusHistory: statusHistory,
                totalAmount: Math.round(totalAmount),
                createdAt: quoteDate.toISOString(),
                updatedAt: statusHistory[status] || quoteDate.toISOString()
            });
        }
    }
    
    // 기존 견적서 가져오기
    const existingQuotes = JSON.parse(localStorage.getItem(QUOTES_STORAGE_KEY) || '[]');
    
    // 새 견적서 추가 (기존 데이터와 합치기)
    const allQuotes = [...existingQuotes, ...quotes, ...hongQuotes];
    
    // ID 중복 제거 (최신 것만 유지)
    const uniqueQuotes = [];
    const seenIds = new Set();
    for (let i = allQuotes.length - 1; i >= 0; i--) {
        if (!seenIds.has(allQuotes[i].id)) {
            seenIds.add(allQuotes[i].id);
            uniqueQuotes.unshift(allQuotes[i]);
        }
    }
    
    // 저장
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(uniqueQuotes));
    
    console.log(`✅ 테스트 견적서 데이터 생성 완료!`);
    console.log(`- 상태별 견적서: ${quotes.length}개`);
    console.log(`- 홍길동 1년치 견적서: ${hongQuotes.length}개`);
    console.log(`- 총 견적서: ${uniqueQuotes.length}개`);
    
    return uniqueQuotes;
}

    // 전역 함수로 등록
    if (typeof window !== 'undefined') {
        window.generateTestQuotes = generateTestQuotes;
        
        // status.html 페이지에서 자동 실행 (기존 데이터가 없을 때만)
        if (window.location.pathname.includes('status.html')) {
            document.addEventListener('DOMContentLoaded', function() {
                const existingQuotes = JSON.parse(localStorage.getItem(QUOTES_STORAGE_KEY) || '[]');
                // 기존 데이터가 10개 미만이면 테스트 데이터 생성
                if (existingQuotes.length < 10) {
                    console.log('테스트 견적서 데이터를 생성합니다...');
                    generateTestQuotes();
                    // 페이지 새로고침하여 데이터 표시
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            });
        }
    }
})();

