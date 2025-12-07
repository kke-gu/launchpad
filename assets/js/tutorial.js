/**
 * tutorial.js
 * - 홈페이지 튜토리얼(온보딩 워크스루) 기능
 */

const TUTORIAL_STORAGE_KEY = 'growth_launchpad_tutorial_completed';

// 튜토리얼 단계 정의
const tutorialSteps = [
    {
        id: 'intro',
        title: 'Growth Launchpad에 오신 걸 환영합니다',
        description: '지금부터 빠르게 둘러보세요!',
        target: null,
        position: 'center'
    },
    {
        id: 'products',
        title: '상품 정보',
        description: '모든 상품을 한 곳에서 보고, 제안서부터 요금, 데모, 고객 사례까지 확인할 수 있어요',
        target: '.dashboard-card-col1',
        position: 'right'
    },
    {
        id: 'quote-button',
        title: '견적 작성',
        description: '클릭 한 번으로 견적서를 작성할 수 있습니다',
        target: '.dashboard-card-col2',
        position: 'right'
    },
    {
        id: 'energy-panel',
        title: '성과 대시보드',
        description: '여기서 이번 달 성과와 진행 현황을 확인할 수 있어요',
        target: '.dashboard-card-col1-2-bottom',
        position: 'top'
    },
    {
        id: 'chart',
        title: '성과 추이 그래프',
        description: '성과 추이를 한눈에 확인하세요',
        target: '.dashboard-card-col3',
        position: 'left'
    },
    {
        id: 'finish',
        title: '이제 직접 시작해보세요!',
        description: '튜토리얼을 완료했습니다. Growth Launchpad를 자유롭게 탐색해보세요!',
        target: null,
        position: 'center'
    }
];

let currentStep = 0;
let tutorialOverlay = null;
let tutorialTooltip = null;
let tutorialHighlight = null;

// 튜토리얼 완료 여부 확인
function isTutorialCompleted() {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
}

// 튜토리얼 완료 표시
function markTutorialCompleted() {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
}

// 튜토리얼 초기화
function initTutorial() {
    // 모바일에서는 튜토리얼 비활성화 (PC에서만 노출)
    const viewportWidth = window.innerWidth;
    if (viewportWidth <= 768) {
        return;
    }
    
    // 이미 완료한 경우 실행하지 않음
    if (isTutorialCompleted()) {
        return;
    }
    
    // 로그인 체크
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser) {
        return;
    }
    
    tutorialOverlay = document.getElementById('tutorial-overlay');
    tutorialTooltip = document.getElementById('tutorial-tooltip');
    tutorialHighlight = document.querySelector('.tutorial-highlight');
    
    if (!tutorialOverlay || !tutorialTooltip || !tutorialHighlight) {
        return;
    }
    
    // 이벤트 리스너 설정
    const nextBtn = document.getElementById('tutorial-next');
    const skipBtn = document.getElementById('tutorial-skip');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextStep);
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', skipTutorial);
    }
    
    // 페이지 로드 후 약간의 지연을 두고 시작
    setTimeout(() => {
        startTutorial();
    }, 500);
}

// 튜토리얼 시작
function startTutorial() {
    currentStep = 0;
    showStep(currentStep);
}

// 다음 단계
function nextStep() {
    currentStep++;
    
    if (currentStep >= tutorialSteps.length) {
        finishTutorial();
    } else {
        showStep(currentStep);
    }
}

// 튜토리얼 건너뛰기
function skipTutorial() {
    if (confirm('튜토리얼을 건너뛰시겠습니까?')) {
        markTutorialCompleted();
        hideTutorial();
    }
}

// 튜토리얼 완료
function finishTutorial() {
    markTutorialCompleted();
    hideTutorial();
    alert('튜토리얼을 완료했습니다! 🎉');
}

// 단계 표시
function showStep(stepIndex) {
    const step = tutorialSteps[stepIndex];
    if (!step) return;
    
    // 툴팁 내용 업데이트
    const titleEl = document.getElementById('tutorial-title');
    const descEl = document.getElementById('tutorial-description');
    const stepEl = document.getElementById('tutorial-step');
    const totalEl = document.getElementById('tutorial-total');
    const iconEl = document.getElementById('tutorial-icon');
    
    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.description;
    if (stepEl) stepEl.textContent = stepIndex + 1;
    if (totalEl) totalEl.textContent = tutorialSteps.length;
    
    // 첫 번째 단계(인트로)에만 로켓 이미지 표시
    if (iconEl) {
        if (stepIndex === 0) {
            iconEl.style.display = 'block';
            iconEl.innerHTML = `
                <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- 배경 원형 -->
                    <circle cx="90" cy="90" r="75" fill="#E7F6FF" opacity="0.5"/>
                    <!-- 로켓 (성장/런치) - 크게 키우고 위로 이동 -->
                    <g transform="translate(90, 20) scale(2.2)">
                        <!-- 로켓 본체 -->
                        <path d="M0 40 L-12 20 L-8 15 L0 10 L8 15 L12 20 Z" fill="#3461FF"/>
                        <!-- 로켓 창문 -->
                        <circle cx="0" cy="25" r="5" fill="#FFFFFF"/>
                        <!-- 로켓 날개 -->
                        <path d="M-12 20 L-18 25 L-12 30 M12 20 L18 25 L12 30" stroke="#244ADD" stroke-width="2" fill="none"/>
                        <!-- 로켓 불꽃 -->
                        <path d="M-6 40 L-4 50 L0 45 L4 50 L6 40" fill="#FF6B35" opacity="0.8"/>
                        <path d="M-4 40 L-2 48 L0 44 L2 48 L4 40" fill="#FFA500" opacity="0.6"/>
                    </g>
                </svg>
            `;
        } else {
            iconEl.style.display = 'none';
            iconEl.innerHTML = '';
        }
    }
    
    // 버튼 텍스트 업데이트
    const nextBtn = document.getElementById('tutorial-next');
    if (nextBtn) {
        nextBtn.textContent = stepIndex === tutorialSteps.length - 1 ? '시작하기' : '다음';
    }
    
    // 타겟 요소 찾기
    let targetElement = null;
    if (step.target) {
        targetElement = document.querySelector(step.target);
    }
    
    // 오버레이 표시
    if (tutorialOverlay) {
        tutorialOverlay.style.display = 'block';
    }
    
    // 하이라이트 위치 설정
    if (targetElement) {
        highlightElement(targetElement, step.position);
    } else {
        // 타겟이 없는 경우 (인트로, 마무리)
        highlightCenter();
    }
    
    // 툴팁 위치 설정
    if (targetElement) {
        positionTooltip(targetElement, step.position);
    } else {
        positionTooltipCenter();
    }
}

// 요소 하이라이트
function highlightElement(element, position) {
    if (!element || !tutorialHighlight) return;
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXLeft || document.documentElement.scrollLeft;
    
    // 하이라이트 영역 설정
    tutorialHighlight.style.display = 'block';
    tutorialHighlight.style.position = 'absolute';
    tutorialHighlight.style.top = `${rect.top + scrollTop}px`;
    tutorialHighlight.style.left = `${rect.left + scrollLeft}px`;
    tutorialHighlight.style.width = `${rect.width}px`;
    tutorialHighlight.style.height = `${rect.height}px`;
    tutorialHighlight.style.borderRadius = '12px';
    
    // 스크롤하여 요소가 보이도록
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 약간의 지연 후 하이라이트 적용 (스크롤 완료 후)
    setTimeout(() => {
        const updatedRect = element.getBoundingClientRect();
        const updatedScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const updatedScrollLeft = window.pageXLeft || document.documentElement.scrollLeft;
        
        tutorialHighlight.style.top = `${updatedRect.top + updatedScrollTop}px`;
        tutorialHighlight.style.left = `${updatedRect.left + updatedScrollLeft}px`;
        tutorialHighlight.style.width = `${updatedRect.width}px`;
        tutorialHighlight.style.height = `${updatedRect.height}px`;
    }, 300);
}

// 중앙 하이라이트 (인트로, 마무리)
function highlightCenter() {
    if (!tutorialHighlight) return;
    
    tutorialHighlight.style.display = 'none';
}

// 툴팁 위치 설정
function positionTooltip(element, position) {
    if (!element || !tutorialTooltip) return;
    
    const rect = element.getBoundingClientRect();
    const tooltipRect = tutorialTooltip.getBoundingClientRect();
    
    // 툴팁 위치 클래스 제거
    tutorialTooltip.classList.remove('tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right', 'tooltip-center');
    
    // 위치에 따라 클래스 추가 및 위치 설정
    switch (position) {
        case 'top':
            tutorialTooltip.classList.add('tooltip-top');
            tutorialTooltip.style.top = `${rect.top - tooltipRect.height - 20}px`;
            tutorialTooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
            break;
        case 'bottom':
            tutorialTooltip.classList.add('tooltip-bottom');
            tutorialTooltip.style.top = `${rect.bottom + 20}px`;
            tutorialTooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
            break;
        case 'left':
            tutorialTooltip.classList.add('tooltip-left');
            tutorialTooltip.style.top = `${rect.top + rect.height / 2 - tooltipRect.height / 2}px`;
            tutorialTooltip.style.left = `${rect.left - tooltipRect.width - 20}px`;
            break;
        case 'right':
            tutorialTooltip.classList.add('tooltip-right');
            tutorialTooltip.style.top = `${rect.top + rect.height / 2 - tooltipRect.height / 2}px`;
            tutorialTooltip.style.left = `${rect.right + 20}px`;
            break;
        default:
            positionTooltipCenter();
    }
}

// 중앙 툴팁 위치
function positionTooltipCenter() {
    if (!tutorialTooltip) return;
    
    tutorialTooltip.classList.remove('tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right');
    tutorialTooltip.classList.add('tooltip-center');
    
    const tooltipRect = tutorialTooltip.getBoundingClientRect();
    tutorialTooltip.style.top = '50%';
    tutorialTooltip.style.left = '50%';
    tutorialTooltip.style.transform = 'translate(-50%, -50%)';
}

// 튜토리얼 숨기기
function hideTutorial() {
    if (tutorialOverlay) {
        tutorialOverlay.style.display = 'none';
    }
    if (tutorialHighlight) {
        tutorialHighlight.style.display = 'none';
    }
}

// 튜토리얼 재시작 (디버깅용)
function restartTutorial() {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    currentStep = 0;
    startTutorial();
}

// 전역 함수로 노출
window.restartTutorial = restartTutorial;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // index.html 페이지에서만 실행
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        initTutorial();
    }
});

