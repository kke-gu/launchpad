/**
 * 자료실 테스트 데이터 생성 스크립트
 * 브라우저 콘솔에서 실행: generateTestResources()
 */

// IIFE로 스코프 분리하여 상수 충돌 방지
(function() {
    'use strict';
    
    const RESOURCES_STORAGE_KEY = 'growth_launchpad_resources';

    // 테스트 자료 데이터 생성
    function generateTestResources() {
        const resources = [];
        const now = new Date();
        
        // 카테고리별 자료 목록
        const resourcesByCategory = {
            '계약서': [
                { name: '표준 계약서 템플릿', description: '일반적인 소프트웨어 라이선스 계약서 표준 템플릿입니다.', fileName: '표준계약서_템플릿.docx' },
                { name: '유지보수 계약서 양식', description: '소프트웨어 유지보수 서비스 계약서 양식입니다.', fileName: '유지보수계약서_양식.docx' },
                { name: '개발 계약서 템플릿', description: '맞춤형 소프트웨어 개발 계약서 템플릿입니다.', fileName: '개발계약서_템플릿.docx' },
                { name: '라이선스 계약서 양식', description: '소프트웨어 라이선스 계약서 표준 양식입니다.', fileName: '라이선스계약서_양식.pdf' }
            ],
            '시장조사 리포트': [
                { name: '2025년 교육 시장 동향 분석', description: '2025년 교육 시장 전반적인 동향과 트렌드를 분석한 리포트입니다.', fileName: '2025_교육시장_동향분석.pdf' },
                { name: '온라인 교육 플랫폼 시장 조사', description: '온라인 교육 플랫폼 시장 규모와 경쟁사 분석 리포트입니다.', fileName: '온라인교육플랫폼_시장조사.pdf' },
                { name: '학원 관리 시스템 시장 현황', description: '학원 관리 시스템 시장의 현재 상황과 향후 전망을 분석한 리포트입니다.', fileName: '학원관리시스템_시장현황.pdf' },
                { name: '에듀테크 산업 트렌드 리포트', description: '에듀테크 산업의 최신 트렌드와 기술 동향을 정리한 리포트입니다.', fileName: '에듀테크_트렌드_리포트.pdf' },
                { name: 'B2B 교육 솔루션 시장 분석', description: 'B2B 교육 솔루션 시장의 기업별 포지셔닝과 경쟁 분석입니다.', fileName: 'B2B교육솔루션_시장분석.pdf' }
            ],
            '영업정책': [
                { name: '2025년 영업 정책 가이드', description: '2025년도 영업 정책 및 프로세스 가이드라인입니다.', fileName: '2025_영업정책_가이드.pdf' },
                { name: '할인 정책 및 프로모션 규정', description: '제품 할인 정책 및 프로모션 진행 시 준수사항입니다.', fileName: '할인정책_프로모션_규정.pdf' },
                { name: '영업 수수료 및 인센티브 정책', description: '영업 담당자 수수료 및 인센티브 지급 기준과 정책입니다.', fileName: '영업수수료_인센티브_정책.pdf' },
                { name: '고객사별 가격 정책 가이드', description: '고객사 유형별 가격 정책 및 협상 가이드라인입니다.', fileName: '고객사별_가격정책_가이드.pdf' }
            ],
            '보고서': [
                { name: '2025년 1분기 영업 실적 보고서', description: '2025년 1분기 영업 실적 및 목표 달성 현황 보고서입니다.', fileName: '2025_Q1_영업실적_보고서.pdf' },
                { name: '월별 영업 활동 보고서 템플릿', description: '월별 영업 활동 및 성과를 기록하는 보고서 템플릿입니다.', fileName: '월별_영업활동_보고서_템플릿.docx' },
                { name: '고객사 방문 보고서 양식', description: '고객사 방문 후 작성하는 보고서 표준 양식입니다.', fileName: '고객사방문_보고서_양식.docx' },
                { name: '제안서 제출 보고서', description: '제안서 제출 후 결과 및 피드백을 기록하는 보고서입니다.', fileName: '제안서제출_보고서_템플릿.docx' },
                { name: '계약 체결 보고서 양식', description: '계약 체결 시 작성하는 보고서 표준 양식입니다.', fileName: '계약체결_보고서_양식.docx' }
            ],
            '업무 매뉴얼': [
                { name: '영업 프로세스 매뉴얼', description: '영업 프로세스 전반에 대한 상세 매뉴얼입니다.', fileName: '영업프로세스_매뉴얼.pdf' },
                { name: '견적서 작성 가이드', description: '견적서 작성 시 필요한 정보와 작성 방법 가이드입니다.', fileName: '견적서작성_가이드.pdf' },
                { name: '제안서 작성 매뉴얼', description: '효과적인 제안서 작성 방법과 체크리스트입니다.', fileName: '제안서작성_매뉴얼.pdf' },
                { name: '고객사 관리 매뉴얼', description: '고객사 정보 관리 및 관계 유지 방법에 대한 매뉴얼입니다.', fileName: '고객사관리_매뉴얼.pdf' },
                { name: '계약 체결 프로세스 가이드', description: '계약 체결 전후 프로세스 및 주의사항 가이드입니다.', fileName: '계약체결_프로세스_가이드.pdf' },
                { name: 'CRM 시스템 사용 매뉴얼', description: 'CRM 시스템 사용 방법 및 기능 안내 매뉴얼입니다.', fileName: 'CRM시스템_사용매뉴얼.pdf' }
            ],
            '제안서&브로슈어': [
                { name: '회사 소개 브로슈어 2025', description: '맑은소프트 회사 소개 및 주요 제품 브로슈어입니다.', fileName: '회사소개_브로슈어_2025.pdf' },
                { name: '제품 제안서 템플릿', description: '표준 제품 제안서 작성 템플릿입니다.', fileName: '제품제안서_템플릿.pptx' },
                { name: '교육 솔루션 소개서', description: '교육 솔루션 제품 소개 및 특징을 담은 소개서입니다.', fileName: '교육솔루션_소개서.pdf' },
                { name: '학원 관리 시스템 제안서', description: '학원 관리 시스템 제품 제안서 템플릿입니다.', fileName: '학원관리시스템_제안서.pptx' },
                { name: '온라인 교육 플랫폼 브로슈어', description: '온라인 교육 플랫폼 제품 브로슈어입니다.', fileName: '온라인교육플랫폼_브로슈어.pdf' },
                { name: '고객사 사례집 2025', description: '주요 고객사 도입 사례 및 성공 스토리를 담은 사례집입니다.', fileName: '고객사_사례집_2025.pdf' }
            ]
        };
        
        // 담당자 정보 (테스트 계정)
        const authors = [
            { name: '홍길동', email: 'sales1@malgeunsoft.com', id: 'sales1' },
            { name: '이마케팅', email: 'sales2@malgeunsoft.com', id: 'sales2' },
            { name: '박지원', email: 'sales3@malgeunsoft.com', id: 'sales3' }
        ];
        
        let resourceId = Date.now() - 2000000000; // 고유 ID 생성용
        
        // 카테고리별로 자료 생성
        Object.keys(resourcesByCategory).forEach(category => {
            const categoryResources = resourcesByCategory[category];
            
            categoryResources.forEach((resourceData, index) => {
                // 날짜 생성 (최근 1년 내)
                const daysAgo = Math.floor(Math.random() * 365);
                const createdAt = new Date(now);
                createdAt.setDate(createdAt.getDate() - daysAgo);
                
                // 업데이트 날짜 (생성일 이후 0~30일)
                const updatedAt = new Date(createdAt);
                updatedAt.setDate(updatedAt.getDate() + Math.floor(Math.random() * 30));
                
                // 작성자 랜덤 선택
                const author = authors[Math.floor(Math.random() * authors.length)];
                
                // URL이 있는 자료도 일부 생성 (30% 확률)
                let url = '';
                if (Math.random() > 0.7) {
                    url = `https://www.malgnsoft.com/resources/${resourceData.fileName.replace(/\s/g, '-').toLowerCase()}`;
                }
                
                resources.push({
                    id: resourceId++,
                    name: resourceData.name,
                    category: category,
                    description: resourceData.description,
                    fileName: resourceData.fileName,
                    url: url,
                    authorId: author.id,
                    authorEmail: author.email,
                    authorName: author.name,
                    createdAt: createdAt.toISOString(),
                    updatedAt: updatedAt.toISOString()
                });
            });
        });
        
        // 기존 자료 가져오기
        const existingResources = JSON.parse(localStorage.getItem(RESOURCES_STORAGE_KEY) || '[]');
        
        // 새 자료 추가 (기존 데이터와 합치기)
        const allResources = [...existingResources, ...resources];
        
        // ID 중복 제거 (최신 것만 유지)
        const uniqueResources = [];
        const seenIds = new Set();
        for (let i = allResources.length - 1; i >= 0; i--) {
            if (!seenIds.has(allResources[i].id)) {
                seenIds.add(allResources[i].id);
                uniqueResources.unshift(allResources[i]);
            }
        }
        
        // 저장
        localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(uniqueResources));
        
        console.log(`✅ 테스트 자료 데이터 생성 완료!`);
        console.log(`- 생성된 자료: ${resources.length}개`);
        console.log(`- 총 자료: ${uniqueResources.length}개`);
        console.log(`- 카테고리별 분포:`);
        Object.keys(resourcesByCategory).forEach(category => {
            const count = uniqueResources.filter(r => r.category === category).length;
            console.log(`  - ${category}: ${count}개`);
        });
        
        return uniqueResources;
    }

    // 전역 함수로 등록
    if (typeof window !== 'undefined') {
        window.generateTestResources = generateTestResources;
        
        // resources.html 페이지에서 자동 실행 (기존 데이터가 없을 때만)
        if (window.location.pathname.includes('resources.html')) {
            document.addEventListener('DOMContentLoaded', function() {
                const existingResources = JSON.parse(localStorage.getItem(RESOURCES_STORAGE_KEY) || '[]');
                // 기존 데이터가 5개 미만이면 테스트 데이터 생성
                if (existingResources.length < 5) {
                    console.log('테스트 자료 데이터를 생성합니다...');
                    generateTestResources();
                    // 페이지 새로고침하여 데이터 표시
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            });
        }
    }
})();

