/**
 * 상품 테스트 데이터 생성 스크립트
 * 브라우저 콘솔에서 실행: generateTestProducts()
 */

// IIFE로 스코프 분리하여 상수 충돌 방지
(function() {
    'use strict';
    
    const PRODUCTS_STORAGE_KEY = 'growth_launchpad_products';

    // 테스트 상품 데이터 생성
    function generateTestProducts() {
        const products = [];
        const now = new Date();
        
        // 초기 상품 데이터
        const productData = [
            {
                name: '학원 관리 시스템',
                description: '학원 운영에 필요한 모든 기능을 통합 관리하는 종합 솔루션입니다. 학생 관리, 수강 관리, 결제 관리, 출석 관리 등 학원 운영의 전 과정을 효율적으로 관리할 수 있습니다.',
                proposalFile: '학원관리시스템_제안서.pdf',
                basicAreas: [
                    { buttonName: '제안서', url: 'https://www.malgnsoft.com/products/academy' },
                    { buttonName: '요금 안내', url: 'https://www.malgnsoft.com/products/academy/pricing' }
                ],
                demoAreas: [
                    { buttonName: '데모 체험', url: 'https://demo.malgnsoft.com/academy', id: 'demo01', password: 'demo1234' }
                ],
                caseAreas: [
                    { customerName: '서울대학교 평생교육원', url: 'https://www.malgnsoft.com/cases/seoul-university' },
                    { customerName: '강남 어학원', url: 'https://www.malgnsoft.com/cases/gangnam-language' },
                    { customerName: '종로 학원가', url: 'https://www.malgnsoft.com/cases/jongno-academy' }
                ]
            },
            {
                name: '온라인 교육 플랫폼',
                description: '언제 어디서나 학습할 수 있는 온라인 교육 플랫폼입니다. 실시간 화상 강의, 동영상 강의, 과제 관리, 학습 진도 추적 등 다양한 기능을 제공합니다.',
                proposalFile: '온라인교육플랫폼_제안서.pdf',
                basicAreas: [
                    { buttonName: '제안서', url: 'https://www.malgnsoft.com/products/online-education' },
                    { buttonName: '요금 안내', url: 'https://www.malgnsoft.com/products/online-education/pricing' },
                    { buttonName: '기능 소개', url: 'https://www.malgnsoft.com/products/online-education/features' }
                ],
                demoAreas: [
                    { buttonName: '데모 체험', url: 'https://demo.malgnsoft.com/online-edu', id: 'demo02', password: 'demo1234' },
                    { buttonName: '강의 체험', url: 'https://demo.malgnsoft.com/online-edu/lecture', id: 'demo02', password: 'demo1234' }
                ],
                caseAreas: [
                    { customerName: 'K대학교 원격교육원', url: 'https://www.malgnsoft.com/cases/k-university' },
                    { customerName: '글로벌 어학원', url: 'https://www.malgnsoft.com/cases/global-language' }
                ]
            },
            {
                name: '기업 교육 솔루션',
                description: '기업 내부 직원 교육 및 역량 강화를 위한 맞춤형 교육 솔루션입니다. 온보딩 교육, 직무 교육, 리더십 교육 등 다양한 교육 프로그램을 운영할 수 있습니다.',
                proposalFile: '기업교육솔루션_제안서.pdf',
                basicAreas: [
                    { buttonName: '제안서', url: 'https://www.malgnsoft.com/products/corporate-education' },
                    { buttonName: '요금 안내', url: 'https://www.malgnsoft.com/products/corporate-education/pricing' }
                ],
                demoAreas: [
                    { buttonName: '데모 체험', url: 'https://demo.malgnsoft.com/corporate', id: 'demo03', password: 'demo1234' }
                ],
                caseAreas: [
                    { customerName: '삼성전자', url: 'https://www.malgnsoft.com/cases/samsung' },
                    { customerName: 'LG전자', url: 'https://www.malgnsoft.com/cases/lg' },
                    { customerName: '현대자동차', url: 'https://www.malgnsoft.com/cases/hyundai' },
                    { customerName: 'SK하이닉스', url: 'https://www.malgnsoft.com/cases/sk-hynix' }
                ]
            },
            {
                name: '학습 관리 시스템(LMS)',
                description: '학습자의 학습 과정을 체계적으로 관리하고 추적할 수 있는 학습 관리 시스템입니다. 학습 진도, 평가, 인증서 발급 등 학습 전 과정을 관리합니다.',
                proposalFile: 'LMS_제안서.pdf',
                basicAreas: [
                    { buttonName: '제안서', url: 'https://www.malgnsoft.com/products/lms' },
                    { buttonName: '요금 안내', url: 'https://www.malgnsoft.com/products/lms/pricing' }
                ],
                demoAreas: [
                    { buttonName: '데모 체험', url: 'https://demo.malgnsoft.com/lms', id: 'demo04', password: 'demo1234' }
                ],
                caseAreas: [
                    { customerName: '국립대학교', url: 'https://www.malgnsoft.com/cases/national-university' },
                    { customerName: '사이버대학교', url: 'https://www.malgnsoft.com/cases/cyber-university' }
                ]
            },
            {
                name: '평가 및 시험 시스템',
                description: '온라인 시험 및 평가를 위한 종합 솔루션입니다. 객관식, 주관식, 실기 평가 등 다양한 유형의 시험을 온라인으로 진행하고 자동 채점할 수 있습니다.',
                proposalFile: '평가시험시스템_제안서.pdf',
                basicAreas: [
                    { buttonName: '제안서', url: 'https://www.malgnsoft.com/products/exam' },
                    { buttonName: '요금 안내', url: 'https://www.malgnsoft.com/products/exam/pricing' }
                ],
                demoAreas: [
                    { buttonName: '데모 체험', url: 'https://demo.malgnsoft.com/exam', id: 'demo05', password: 'demo1234' }
                ],
                caseAreas: [
                    { customerName: '공무원 시험원', url: 'https://www.malgnsoft.com/cases/public-exam' },
                    { customerName: '자격증 시험원', url: 'https://www.malgnsoft.com/cases/certification' }
                ]
            }
        ];
        
        let productId = Date.now() - 1000000000; // 고유 ID 생성용
        
        // 상품 데이터 생성
        productData.forEach((productInfo, index) => {
            // 날짜 생성 (최근 6개월 내)
            const daysAgo = Math.floor(Math.random() * 180);
            const createdAt = new Date(now);
            createdAt.setDate(createdAt.getDate() - daysAgo);
            
            // 업데이트 날짜 (생성일 이후 0~30일)
            const updatedAt = new Date(createdAt);
            updatedAt.setDate(updatedAt.getDate() + Math.floor(Math.random() * 30));
            
            products.push({
                id: productId++,
                name: productInfo.name,
                description: productInfo.description,
                proposalFile: productInfo.proposalFile,
                basicAreas: productInfo.basicAreas || [],
                demoAreas: productInfo.demoAreas || [],
                caseAreas: productInfo.caseAreas || [],
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt.toISOString()
            });
        });
        
        // 기존 상품 가져오기
        const existingProducts = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || '[]');
        
        // 새 상품 추가 (기존 데이터와 합치기)
        const allProducts = [...existingProducts, ...products];
        
        // ID 중복 제거 (최신 것만 유지)
        const uniqueProducts = [];
        const seenIds = new Set();
        for (let i = allProducts.length - 1; i >= 0; i--) {
            if (!seenIds.has(allProducts[i].id)) {
                seenIds.add(allProducts[i].id);
                uniqueProducts.unshift(allProducts[i]);
            }
        }
        
        // 저장
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(uniqueProducts));
        
        console.log(`✅ 테스트 상품 데이터 생성 완료!`);
        console.log(`- 생성된 상품: ${products.length}개`);
        console.log(`- 총 상품: ${uniqueProducts.length}개`);
        console.log(`- 상품 목록:`);
        products.forEach(product => {
            console.log(`  - ${product.name}`);
        });
        
        return uniqueProducts;
    }

    // 전역 함수로 등록
    if (typeof window !== 'undefined') {
        window.generateTestProducts = generateTestProducts;
        
        // products.html 페이지에서 자동 실행 (기존 데이터가 없을 때만)
        if (window.location.pathname.includes('products.html')) {
            document.addEventListener('DOMContentLoaded', function() {
                const existingProducts = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || '[]');
                // 기존 데이터가 5개 미만이면 테스트 데이터 생성
                if (existingProducts.length < 5) {
                    console.log('테스트 상품 데이터를 생성합니다...');
                    generateTestProducts();
                    // 페이지 새로고침하여 데이터 표시
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            });
        }
    }
})();

