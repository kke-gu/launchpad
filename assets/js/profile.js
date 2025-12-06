/**
 * profile.js
 * - 프로필 페이지 전용 JavaScript
 * - 사용자 계정 정보 표시
 */

// CURRENT_USER_KEY는 main.js에서 선언됨

// 현재 사용자 정보 가져오기
function getCurrentUser() {
    const stored = localStorage.getItem('growth_launchpad_current_user');
    return stored ? JSON.parse(stored) : null;
}

// 프로필 정보 표시
function displayProfile() {
    const stored = localStorage.getItem('growth_launchpad_current_user');
    const currentUser = stored ? JSON.parse(stored) : null;
    const profileContent = document.getElementById('profile-content');
    
    if (!currentUser) {
        // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
        window.location.href = 'login.html';
        return;
    }
    
    if (!profileContent) {
        console.error('프로필 컨텐츠 영역을 찾을 수 없습니다.');
        return;
    }
    
    // 디버깅: 저장된 사용자 정보 확인
    console.log('현재 사용자 정보:', currentUser);
    
    profileContent.innerHTML = `
        <h1>프로필</h1>
        <p class="page-section-subtitle">
          내 계정 정보를 확인하고 관리합니다.
        </p>
        
        <div class="profile-header">
            <div class="profile-header-name">
                ${escapeHtml(currentUser.name || '사용자')} ${currentUser.name ? '님' : ''}
            </div>
            <div class="profile-header-info">
                ${escapeHtml(currentUser.position || '')} ${currentUser.position && currentUser.department ? '·' : ''} ${escapeHtml(currentUser.department || '')}
            </div>
            <div class="profile-header-info">
                ${escapeHtml(currentUser.teamName || '')}
            </div>
            <div class="profile-header-email">
                ${escapeHtml(currentUser.email || '')}
            </div>
        </div>
        
        <div class="profile-info-grid">
            <div class="profile-info-item">
                <div class="profile-info-label">회사명</div>
                <div class="profile-info-value">${escapeHtml(currentUser.companyName || '-')}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="profile-info-label">부서</div>
                <div class="profile-info-value">${escapeHtml(currentUser.department || '-')}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="profile-info-label">팀명</div>
                <div class="profile-info-value">${escapeHtml(currentUser.teamName || '-')}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="profile-info-label">이름</div>
                <div class="profile-info-value">${escapeHtml(currentUser.name || '-')}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="profile-info-label">직책</div>
                <div class="profile-info-value">${escapeHtml(currentUser.position || '-')}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="profile-info-label">연락처</div>
                <div class="profile-info-value">${escapeHtml(currentUser.phone || '-')}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="profile-info-label">휴대폰 연락처</div>
                <div class="profile-info-value">${escapeHtml(currentUser.mobile || '-')}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="profile-info-label">이메일</div>
                <div class="profile-info-value">${escapeHtml(currentUser.email || '-')}</div>
            </div>
        </div>
        
        <div class="profile-actions">
            <a href="index.html" class="btn secondary">돌아가기</a>
        </div>
    `;
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 페이지 로드 시 프로필 정보 표시
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    if (!window.checkLogin || !window.checkLogin()) {
        return;
    }
    
    displayProfile();
});

