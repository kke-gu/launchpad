/**
 * index.js
 * - 홈페이지 대시보드 JavaScript
 * - 진행 현황별 건수, 월별 분석 그래프 표시
 */

const QUOTES_STORAGE_KEY = 'growth_launchpad_quotes';

// 견적 데이터 가져오기
function getQuotes() {
    const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 천단위 콤마 포맷팅
function formatNumber(num) {
    if (!num) return '0';
    return Number(num).toLocaleString('ko-KR');
}

// 성과 에너지 패널 업데이트
function updateEnergyPanel() {
    const quotes = getQuotes();
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (!currentUser) {
        // 로그인하지 않은 경우 모든 값을 0으로 표시
        document.getElementById('energy-monthly-completed')?.setAttribute('textContent', '0');
        document.getElementById('energy-total-completed')?.setAttribute('textContent', '0');
        document.getElementById('energy-received')?.setAttribute('textContent', '0');
        document.getElementById('energy-sent')?.setAttribute('textContent', '0');
        document.getElementById('energy-negotiating')?.setAttribute('textContent', '0');
        return;
    }
    
    // 로그인한 사용자로 작성한 견적만 필터링
    const userQuotes = quotes.filter(quote => {
        if (quote.managerName && currentUser.name) {
            return quote.managerName === currentUser.name || quote.managerName === currentUser.name.replace('님', '');
        }
        if (quote.createdBy && currentUser.email) {
            return quote.createdBy === currentUser.email;
        }
        return quote.managerName && currentUser.name && 
               (quote.managerName.includes(currentUser.name.replace('님', '')) || 
                currentUser.name.replace('님', '').includes(quote.managerName));
    });
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // 성과 지표 (최종 상태 기준)
    let monthlyCompleted = 0; // 이번 달 계약 완료 건수
    let totalCompleted = 0; // 누적 계약 완료 건수
    let monthlyAmount = 0; // 이번 달 계약 완료 금액
    let totalAmount = 0; // 누적 계약 완료 금액
    let totalQuotes = userQuotes.length; // 전체 견적 건수
    
    // 진행 중 현황 (현재 상태 기준)
    let received = 0; // 접수된 견적 수
    let sent = 0; // 발송 완료 건수
    let negotiating = 0; // 협의 중 건수
    
    userQuotes.forEach(quote => {
        const status = quote.status || '접수';
        const statusHistory = quote.statusHistory || {};
        const quoteAmount = quote.totalAmount || 0;
        
        // 성과 지표: 계약 완료 건수 및 금액 (최종 상태 기준)
        if (status === '계약 완료' || status === '계약완료') {
            totalCompleted++;
            totalAmount += quoteAmount;
            
            // 이번 달 계약 완료 건수 및 금액 확인
            const completedDate = statusHistory['계약 완료'] || statusHistory['계약완료'] || quote.updatedAt || quote.createdAt;
            if (completedDate) {
                const date = new Date(completedDate);
                if (date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth) {
                    monthlyCompleted++;
                    monthlyAmount += quoteAmount;
                }
            }
        }
        
        // 진행 중 현황: 현재 상태 기준
        if (status === '접수') {
            received++;
        } else if (status === '발송 완료' || status === '발송완료') {
            sent++;
        } else if (status === '협의 중' || status === '협의중') {
            negotiating++;
        }
    });
    
    // 계약 성공률 계산 (전체 견적 대비 계약 완료 비율)
    const successRate = totalQuotes > 0 ? Math.round((totalCompleted / totalQuotes) * 100) : 0;
    
    // DOM 업데이트
    const monthlyCompletedEl = document.getElementById('energy-monthly-completed');
    const totalCompletedEl = document.getElementById('energy-total-completed');
    const monthlyAmountEl = document.getElementById('energy-monthly-amount');
    const totalAmountEl = document.getElementById('energy-total-amount');
    const successRateEl = document.getElementById('energy-success-rate');
    const receivedEl = document.getElementById('energy-received');
    const sentEl = document.getElementById('energy-sent');
    const negotiatingEl = document.getElementById('energy-negotiating');
    
    if (monthlyCompletedEl) monthlyCompletedEl.textContent = monthlyCompleted + '건';
    if (totalCompletedEl) totalCompletedEl.textContent = totalCompleted;
    if (monthlyAmountEl) monthlyAmountEl.textContent = formatNumber(monthlyAmount) + '원';
    if (totalAmountEl) totalAmountEl.textContent = formatNumber(totalAmount) + '원';
    if (successRateEl) successRateEl.textContent = successRate + '%';
    if (receivedEl) receivedEl.textContent = received;
    if (sentEl) sentEl.textContent = sent;
    if (negotiatingEl) negotiatingEl.textContent = negotiating;
    
    // 진행 중 현황 항목 클릭 이벤트 설정
    setupEnergyPanelClickEvents();
    
    // 제목 업데이트
    const titleEl = document.getElementById('energy-panel-title');
    if (titleEl && currentUser.name) {
        const userName = currentUser.name.replace('님', '');
        titleEl.textContent = `${userName}님의 성과 에너지 패널`;
    }
}

// 진행 중 현황 항목 클릭 이벤트 설정
function setupEnergyPanelClickEvents() {
    // 접수된 견적 수 클릭
    const receivedEl = document.getElementById('energy-received');
    if (receivedEl) {
        const receivedItem = receivedEl.closest('.energy-panel-status-item');
        if (receivedItem) {
            receivedItem.style.cursor = 'pointer';
            receivedItem.addEventListener('click', function() {
                window.location.href = 'status.html?status=접수';
            });
        }
    }
    
    // 발송 완료 건수 클릭
    const sentEl = document.getElementById('energy-sent');
    if (sentEl) {
        const sentItem = sentEl.closest('.energy-panel-status-item');
        if (sentItem) {
            sentItem.style.cursor = 'pointer';
            sentItem.addEventListener('click', function() {
                window.location.href = 'status.html?status=발송 완료';
            });
        }
    }
    
    // 협의 중 건수 클릭
    const negotiatingEl = document.getElementById('energy-negotiating');
    if (negotiatingEl) {
        const negotiatingItem = negotiatingEl.closest('.energy-panel-status-item');
        if (negotiatingItem) {
            negotiatingItem.style.cursor = 'pointer';
            negotiatingItem.addEventListener('click', function() {
                window.location.href = 'status.html?status=협의 중';
            });
        }
    }
}

// 월별 분석 그래프 그리기 (발송완료 vs 계약 완료)
function drawMonthlyChart() {
    const quotes = getQuotes();
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    const canvas = document.getElementById('monthly-chart-canvas');
    if (!canvas) return;

    // 선택된 연도 가져오기
    const yearSelect = document.getElementById('chart-year-select');
    const selectedYear = yearSelect ? parseInt(yearSelect.value) : new Date().getFullYear();

    // 로그인한 사용자로 작성한 견적만 필터링
    let userQuotes = quotes;
    if (currentUser) {
        userQuotes = quotes.filter(quote => {
            if (quote.managerName && currentUser.name) {
                return quote.managerName === currentUser.name || quote.managerName === currentUser.name.replace('님', '');
            }
            if (quote.createdBy && currentUser.email) {
                return quote.createdBy === currentUser.email;
            }
            return quote.managerName && currentUser.name && 
                   (quote.managerName.includes(currentUser.name.replace('님', '')) || 
                    currentUser.name.replace('님', '').includes(quote.managerName));
        });
    } else {
        userQuotes = [];
    }

    // 월별 발송완료/계약완료 건수 및 계약완료 총 금액 계산
    // 각 상태의 실제 날짜(statusHistory)를 기준으로 집계
    const monthlyData = {
        '발송완료': {},
        '계약완료': {},
        '계약완료금액': {} // 월별 계약완료 총액
    };
    let totalCompletedAmount = 0; // 계약완료 건의 총 계약 금액 (VAT 제외)

    userQuotes.forEach(quote => {
        const status = quote.status || '접수';
        const normalizedStatus = status.replace(/\s/g, '');
        const statusHistory = quote.statusHistory || {};

        // 발송완료 상태인 경우: statusHistory['발송 완료'] 날짜를 기준으로 집계
        if (normalizedStatus === '발송완료' || status === '발송 완료') {
            const sentDate = statusHistory['발송 완료'] || statusHistory['발송완료'];
            if (sentDate) {
                const date = new Date(sentDate);
                if (date.getFullYear() === selectedYear) {
                    const monthKey = date.getMonth() + 1; // 1-12
                    monthlyData['발송완료'][monthKey] = (monthlyData['발송완료'][monthKey] || 0) + 1;
                }
            }
        }
        
        // 계약완료 상태인 경우: statusHistory['계약 완료'] 날짜를 기준으로 집계
        if (normalizedStatus === '계약완료' || status === '계약 완료') {
            const completedDate = statusHistory['계약 완료'] || statusHistory['계약완료'];
            if (completedDate) {
                const date = new Date(completedDate);
                if (date.getFullYear() === selectedYear) {
                    const monthKey = date.getMonth() + 1; // 1-12
                    monthlyData['계약완료'][monthKey] = (monthlyData['계약완료'][monthKey] || 0) + 1;
                    // 계약완료 건의 총 금액 합산 (VAT 제외) - 월별로도 집계
                    const amount = quote.totalAmount || 0;
                    monthlyData['계약완료금액'][monthKey] = (monthlyData['계약완료금액'][monthKey] || 0) + amount;
                    totalCompletedAmount += amount;
                }
            }
        }
    });

    // 12개월 데이터 준비
    const months = [];
    const sentCounts = [];
    const completedCounts = [];
    const completedAmounts = []; // 월별 계약완료 총액
    
    for (let month = 1; month <= 12; month++) {
        months.push(`${month}월`);
        sentCounts.push(monthlyData['발송완료'][month] || 0);
        completedCounts.push(monthlyData['계약완료'][month] || 0);
        completedAmounts.push(monthlyData['계약완료금액'][month] || 0);
    }

    // Canvas 설정
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const container = canvas.parentElement;
    const containerWidth = container ? container.offsetWidth : 300;
    
    // 고해상도 디스플레이 지원
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = containerWidth || 400;
    const isMobile = window.innerWidth < 768;
    const displayHeight = isMobile ? 220 : 360; // 모바일에서는 높이 더 줄임
    
    // 실제 캔버스 크기 (고해상도 지원)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    // CSS 표시 크기
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // 스케일 조정 (고해상도 디스플레이)
    ctx.scale(dpr, dpr);
    
    // 실제 사용할 크기
    const width = displayWidth;
    const height = displayHeight;
    
    // PC/모바일 구분 (768px 이상이면 PC)
    const isPC = window.innerWidth >= 768;
    const leftPadding = isPC ? 50 : 35; // 모바일에서는 Y축 공간 줄임
    const rightPadding = isPC ? 20 : 15; // 모바일에서는 우측 패딩 줄임
    const legendSpace = isMobile ? 50 : 50; // 모바일에서 범례가 두 줄일 수 있으므로 공간 확보
    const topPadding = isMobile ? 10 : 20; // 모바일에서는 상단 패딩 줄임
    const bottomPadding = isMobile ? 20 : 25; // X축 레이블과 그래프 사이 간격 (모바일은 약간 줄임)
    const chartWidth = width - leftPadding - rightPadding;
    const chartHeight = height - topPadding - bottomPadding - legendSpace; // 범례 공간 확보

    // 배경 지우기
    ctx.clearRect(0, 0, width, height);

    // 최대값 계산 (건수)
    const maxCount = Math.max(...sentCounts, ...completedCounts, 1);
    
    // 최대값 계산 (금액) - 꺾은선 그래프용
    const maxAmount = Math.max(...completedAmounts, 1);

    // 배경 (깔끔한 흰색 배경)
    const chartTop = topPadding + legendSpace;
    const chartBottom = chartTop + chartHeight;
    
    // 배경 영역 (약간의 그림자 효과를 위한 배경)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(leftPadding - 5, chartTop - 5, chartWidth + 10, chartHeight + 10);
    
    // 그리드 라인 그리기 (더 얇고 부드러운 스타일)
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 5; i++) {
        const y = chartTop + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(leftPadding, y);
        ctx.lineTo(width - rightPadding, y);
        ctx.stroke();
    }
    
    // Y축 레이블 (PC에서만, 장평 조정)
    if (isPC) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Pretendard';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 5; i++) {
            const y = chartTop + (chartHeight / 5) * i;
            const value = Math.round(maxCount * (1 - i / 5));
            ctx.fillText(value.toString(), leftPadding - 12, y);
        }
    }

    // 둥근 모서리 함수
    function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    // 막대 그래프 그리기 (완전히 새로운 플랫 디자인)
    const barGroupWidth = chartWidth / months.length * 0.85;
    const barWidth = barGroupWidth / 2 * 0.92;
    const barSpacing = chartWidth / months.length;
    const barRadius = 8; // 더 둥근 모서리

    months.forEach((month, index) => {
        const sentCount = sentCounts[index];
        const completedCount = completedCounts[index];
        const x = leftPadding + barSpacing * index + (barSpacing - barGroupWidth) / 2;

        // 발송완료 막대 (플랫 디자인, 그림자 없음)
        if (sentCount > 0) {
            const sentBarHeight = (sentCount / maxCount) * chartHeight;
            const sentY = chartBottom - sentBarHeight;
            const barX = x;
            
            // 단색 막대 (플랫 디자인)
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            roundRect(ctx, barX, sentY, barWidth, sentBarHeight, barRadius);
            ctx.fill();
            
            // 값 표시 제거 (미노출)
        }

        // 계약완료 막대 (플랫 디자인, 그림자 없음)
        if (completedCount > 0) {
            const completedBarHeight = (completedCount / maxCount) * chartHeight;
            const completedY = chartBottom - completedBarHeight;
            const barX = x + barWidth + (barGroupWidth - barWidth * 2) / 2;
            
            // 단색 막대 (플랫 디자인)
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            roundRect(ctx, barX, completedY, barWidth, completedBarHeight, barRadius);
            ctx.fill();
            
            // 값 표시 제거 (미노출)
        }
    });

    // 계약완료 총액 꺾은선 그래프 그리기 (깔끔한 직선 스타일)
    if (maxAmount > 0) {
        // 영역 채우기 제거 (더 깔끔하게)
        
        // 직선 꺾은선 그리기 (부드러운 선)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        let firstPoint = true;
        months.forEach((month, index) => {
            const amount = completedAmounts[index] || 0;
            const x = leftPadding + barSpacing * index + barSpacing / 2;
            const normalizedAmount = amount / maxAmount;
            const y = chartBottom - (normalizedAmount * chartHeight);
            
            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // 점 표시 (작고 깔끔한 점)
        months.forEach((month, index) => {
            const amount = completedAmounts[index] || 0;
            if (amount > 0) {
                const x = leftPadding + barSpacing * index + barSpacing / 2;
                const normalizedAmount = amount / maxAmount;
                const y = chartBottom - (normalizedAmount * chartHeight);
                
                // 작은 원형 점
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // 흰색 외곽선
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 금액 값 표시 제거 (미노출)
            }
        });
    }

    // X축 레이블 (그래프와 충분한 간격)
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Pretendard';
    ctx.textAlign = 'center';
    const xAxisLabelOffset = isMobile ? 12 : 15; // 모바일에서는 약간 줄임
    months.forEach((month, index) => {
        const x = leftPadding + barSpacing * index + barSpacing / 2;
        ctx.fillText(month, x, chartBottom + xAxisLabelOffset); // 그래프와 충분한 간격
    });

    // 범례 그리기 (모던한 미니멀 디자인, 그래프와 충분한 간격)
    const legendY = isMobile ? 8 : 5; // 모바일에서는 약간 아래로
    const legendX = leftPadding;
    const legendSpacing = isMobile ? 80 : 110; // 모바일에서는 간격 줄임
    const charSpacing = 1.5; // 글자 간격 (범례 전체에서 사용)
    
    // 발송완료 범례
    const legend1X = legendX;
    const legend1Y = legendY;
    // 아이콘 (둥근 모서리)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    roundRect(ctx, legend1X, legend1Y, 14, 14, 3);
    ctx.fill();
    // 텍스트 (정렬 수정, 장평 넓게)
    ctx.fillStyle = '#1e293b';
    ctx.font = '13px Pretendard';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    // 글자 간격을 넓게 하기 위해 각 문자를 개별적으로 그리기
    const text1 = '발송완료';
    let text1X = legend1X + 20;
    for (let i = 0; i < text1.length; i++) {
        ctx.fillText(text1[i], text1X, legend1Y + 7);
        text1X += ctx.measureText(text1[i]).width + charSpacing;
    }
    
    // 계약완료 범례
    const legend2X = legend1X + legendSpacing;
    const legend2Y = legendY;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    roundRect(ctx, legend2X, legend2Y, 14, 14, 3);
    ctx.fill();
    // 텍스트 (정렬 수정, 장평 넓게)
    ctx.textBaseline = 'middle';
    const text2 = '계약완료';
    let text2X = legend2X + 20;
    for (let i = 0; i < text2.length; i++) {
        ctx.fillText(text2[i], text2X, legend2Y + 7);
        text2X += ctx.measureText(text2[i]).width + charSpacing;
    }
    
    // 계약완료 총액 꺾은선 범례 (VAT 제외 표기, 깔끔한 스타일)
    const legend3X = legend2X + legendSpacing;
    const legend3Y = legendY;
    // 선 (더 얇고 깔끔하게)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(legend3X, legend3Y + 7);
    ctx.lineTo(legend3X + 14, legend3Y + 7);
    ctx.stroke();
    // 점 (작고 깔끔하게)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(legend3X + 7, legend3Y + 7, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(legend3X + 7, legend3Y + 7, 2, 0, Math.PI * 2);
    ctx.fill();
    // 텍스트 (정렬 수정, 장평 넓게)
    ctx.textBaseline = 'middle';
    // 모바일에서는 텍스트를 줄여서 표시
    const text3 = isMobile ? '계약완료 총액' : '계약완료 총액 (VAT 제외)';
    let text3X = legend3X + 20;
    // 모바일에서는 범례가 잘리지 않도록 체크
    const text3Width = ctx.measureText(text3).width + (text3.length * charSpacing);
    if (isMobile && text3X + text3Width > width - rightPadding) {
        // 범례가 화면 밖으로 나가면 두 번째 줄로 배치
        const legend3Y2 = legendY + 20;
        text3X = legendX;
        for (let i = 0; i < text3.length; i++) {
            ctx.fillText(text3[i], text3X, legend3Y2 + 7);
            text3X += ctx.measureText(text3[i]).width + charSpacing;
        }
    } else {
        for (let i = 0; i < text3.length; i++) {
            ctx.fillText(text3[i], text3X, legend3Y + 7);
            text3X += ctx.measureText(text3[i]).width + charSpacing;
        }
    }
    
    // 마우스 이벤트를 위한 데이터 저장 (툴팁용)
    canvas.chartData = {
        months: months,
        sentCounts: sentCounts,
        completedCounts: completedCounts,
        completedAmounts: completedAmounts,
        leftPadding: leftPadding,
        barSpacing: barSpacing,
        chartTop: chartTop,
        chartBottom: chartBottom,
        barGroupWidth: barGroupWidth,
        barWidth: barWidth,
        maxCount: maxCount,
        maxAmount: maxAmount,
        chartHeight: chartHeight
    };
    
    // 마우스 이벤트 리스너 추가
    setupChartTooltip(canvas);
}

// 그래프 툴팁 설정
function setupChartTooltip(canvas) {
    // 기존 이벤트 리스너 제거
    canvas.removeEventListener('mousemove', canvas._tooltipHandler);
    canvas.removeEventListener('mouseleave', canvas._tooltipLeaveHandler);
    
    // 툴팁 요소 생성 (없으면)
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'chart-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(30, 41, 59, 0.95);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: none;
            font-family: 'Pretendard', sans-serif;
        `;
        document.body.appendChild(tooltip);
    }
    
    // 마우스 이동 이벤트
    canvas._tooltipHandler = function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const data = canvas.chartData;
        
        if (!data) return;
        
        // 마우스 위치가 그래프 영역인지 확인
        if (x < data.leftPadding || x > rect.width - 20 || 
            y < data.chartTop || y > data.chartBottom) {
            tooltip.style.display = 'none';
            return;
        }
        
        // 어떤 월인지 찾기
        const monthIndex = Math.floor((x - data.leftPadding) / data.barSpacing);
        if (monthIndex < 0 || monthIndex >= data.months.length) {
            tooltip.style.display = 'none';
            return;
        }
        
        const month = data.months[monthIndex];
        const sentCount = data.sentCounts[monthIndex] || 0;
        const completedCount = data.completedCounts[monthIndex] || 0;
        const amount = data.completedAmounts[monthIndex] || 0;
        const amountInMillion = amount / 1000000;
        
        // 툴팁 내용 생성
        let tooltipContent = `<div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${month}</div>`;
        tooltipContent += `<div style="display: flex; flex-direction: column; gap: 4px;">`;
        tooltipContent += `<div style="display: flex; align-items: center; gap: 8px;"><span style="display: inline-block; width: 10px; height: 10px; background: #3b82f6; border-radius: 2px;"></span>발송완료: <strong>${sentCount}건</strong></div>`;
        tooltipContent += `<div style="display: flex; align-items: center; gap: 8px;"><span style="display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span>계약완료: <strong>${completedCount}건</strong></div>`;
        if (amount > 0) {
            tooltipContent += `<div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.2);"><span style="display: inline-block; width: 10px; height: 2px; background: #f59e0b;"></span>계약완료 총액: <strong>${formatNumber(amount)}원</strong> <span style="font-size: 11px; opacity: 0.8;">(VAT 제외)</span></div>`;
        }
        tooltipContent += `</div>`;
        
        tooltip.innerHTML = tooltipContent;
        tooltip.style.display = 'block';
        
        // 툴팁 위치 설정
        const tooltipX = e.clientX + 15;
        const tooltipY = e.clientY - 10;
        tooltip.style.left = tooltipX + 'px';
        tooltip.style.top = tooltipY + 'px';
        
        // 화면 밖으로 나가지 않도록 조정
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = (e.clientX - tooltipRect.width - 15) + 'px';
        }
        if (tooltipRect.bottom > window.innerHeight) {
            tooltip.style.top = (e.clientY - tooltipRect.height - 10) + 'px';
        }
    };
    
    // 마우스 나가기 이벤트
    canvas._tooltipLeaveHandler = function() {
        tooltip.style.display = 'none';
    };
    
    canvas.addEventListener('mousemove', canvas._tooltipHandler);
    canvas.addEventListener('mouseleave', canvas._tooltipLeaveHandler);
    canvas.style.cursor = 'pointer';
}

// 차트 연도 드롭다운 초기화
function initChartYearSelect() {
    const yearSelect = document.getElementById('chart-year-select');
    if (!yearSelect) return;
    
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    
    // 최근 5년 + 현재년도
    for (let i = currentYear; i >= currentYear - 5; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i + '년';
        if (i === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    if (!window.checkLogin || !window.checkLogin()) {
        return;
    }
    
    // index.html 페이지가 아닌 경우 실행하지 않음
    const dashboardSection = document.querySelector('.dashboard-section');
    if (!dashboardSection) {
        return;
    }

    // 계정 이름을 제목에 추가
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (currentUser && currentUser.name) {
        const userName = currentUser.name.replace('님', '');
        const statusTitle = document.getElementById('status-title');
        
        if (statusTitle) {
            statusTitle.textContent = `${userName}님 견적 현황 단계별 건수`;
        }
    }

    // 차트 연도 드롭다운 초기화
    initChartYearSelect();
    
    // 성과 에너지 패널 업데이트
    updateEnergyPanel();
    
    // 차트 제목 설정 (연도 드롭다운 초기화 후)
    if (currentUser && currentUser.name) {
        const userName = currentUser.name.replace('님', '');
        const chartTitle = document.getElementById('chart-title');
        if (chartTitle) {
            // 선택된 연도 가져오기 (초기화 후이므로 값이 있음)
            const yearSelect = document.getElementById('chart-year-select');
            const selectedYear = yearSelect ? yearSelect.value : new Date().getFullYear();
            chartTitle.textContent = `${userName}님의 ${selectedYear} 성장의 궤적`;
        }
    }

    // 월별 분석 그래프 그리기
    drawMonthlyChart();
    
    // 차트 연도 변경 이벤트
    const chartYearSelect = document.getElementById('chart-year-select');
    if (chartYearSelect) {
        chartYearSelect.addEventListener('change', function() {
            // 제목 업데이트
            const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
            if (currentUser && currentUser.name) {
                const userName = currentUser.name.replace('님', '');
                const chartTitle = document.getElementById('chart-title');
                if (chartTitle) {
                    const selectedYear = chartYearSelect.value;
                    chartTitle.textContent = `${userName}님의 ${selectedYear} 성장의 궤적`;
                }
            }
            drawMonthlyChart();
        });
    }

    // 창 크기 변경 시 그래프 다시 그리기
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(drawMonthlyChart, 250);
    });
});

