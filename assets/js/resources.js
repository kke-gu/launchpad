/**
 * resources.js
 * - 자료실 페이지 전용 JavaScript
 * - 자료 등록, 수정, 삭제, 목록 표시 기능
 */

const RESOURCES_STORAGE_KEY = 'growth_launchpad_resources';

// 자료 목록 가져오기
function getResources() {
    const stored = localStorage.getItem(RESOURCES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 자료 목록 저장하기
function saveResources(resources) {
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resources));
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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\./g, '-').replace(/\s/g, '').slice(0, -1);
}

// 파일 확장자 추출
function getFileExtension(filename) {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
}

// 자료 목록 렌더링
function renderResources(category = 'all', searchText = '') {
    const resources = getResources();
    const container = document.getElementById('resource-list');
    if (!container) return;

    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    const currentUserId = currentUser ? (currentUser.id || currentUser.userId || currentUser.email) : null;
    const currentUserEmail = currentUser ? currentUser.email : null;

    // 기존 자료 중 authorId가 없는 경우 현재 로그인한 사용자 정보로 업데이트
    let hasUpdate = false;
    if (currentUser && resources.length > 0) {
        resources.forEach(resource => {
            if (!resource.authorId && !resource.authorEmail) {
                resource.authorId = currentUserId;
                resource.authorEmail = currentUserEmail;
                resource.authorName = currentUser.name || '알 수 없음';
                hasUpdate = true;
            }
        });
        
        if (hasUpdate) {
            saveResources(resources);
            console.log('기존 자료에 작성자 정보를 추가했습니다.');
        }
    }

    // 카테고리 필터링
    let filteredResources = resources;
    if (category !== 'all') {
        filteredResources = resources.filter(resource => resource.category === category);
    }
    
    // 검색어 필터링
    if (searchText && searchText.trim()) {
        const searchTerm = searchText.trim().toLowerCase();
        filteredResources = filteredResources.filter(resource => {
            const name = (resource.name || '').toLowerCase();
            const description = (resource.description || '').toLowerCase();
            const category = (resource.category || '').toLowerCase();
            return name.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm);
        });
    }

    // 최신순 정렬
    filteredResources.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
    });

    if (filteredResources.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 3rem; grid-column: 1 / -1;">등록된 자료가 없습니다.</p>';
        return;
    }

    container.innerHTML = filteredResources.map(resource => {
        const fileExt = resource.fileName ? getFileExtension(resource.fileName) : '';
        const updatedDate = formatDate(resource.updatedAt || resource.createdAt);
        
        // authorId와 currentUserId를 문자열로 변환하여 비교 (타입 불일치 방지)
        // authorId가 없으면 authorEmail로도 비교 (하위 호환성)
        const isOwner = currentUserId && (
            (resource.authorId && String(resource.authorId) === String(currentUserId)) ||
            (resource.authorEmail && resource.authorEmail === currentUserEmail) ||
            (currentUserEmail && resource.authorEmail === currentUserEmail)
        );

        let downloadLink = '';
        let urlLink = '';
        
        if (resource.fileName) {
            // 파일이 있는 경우 (실제로는 파일을 다운로드할 수 있는 URL이 필요)
            downloadLink = `<a href="#" class="btn small ghost" onclick="downloadResource('${resource.id}'); return false;">다운로드</a>`;
        }
        
        if (resource.url) {
            // URL이 있는 경우
            urlLink = `<a href="${escapeHtml(resource.url)}" class="btn small ghost" target="_blank" rel="noopener noreferrer">URL 열기</a>`;
        }

        // 드롭다운 메뉴 (작성자만)
        let dropdownMenu = '';
        if (isOwner) {
            dropdownMenu = `
                <div class="dropdown-menu-container">
                    <button type="button" class="btn-icon-only" onclick="toggleResourceDropdown('${resource.id}')" title="메뉴">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="4" r="1.5" fill="currentColor"/>
                            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                            <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
                        </svg>
                    </button>
                    <div class="dropdown-menu" id="dropdown-${resource.id}" style="display: none;">
                        <button type="button" onclick="editResource('${resource.id}'); closeResourceDropdown('${resource.id}');">수정</button>
                        <button type="button" onclick="deleteResource('${resource.id}'); closeResourceDropdown('${resource.id}');">삭제</button>
                    </div>
                </div>
            `;
        }

        // 카테고리별 클래스명 생성 (공백과 특수문자 제거)
        // 카테고리명을 클래스명으로 변환
        let categoryClass = '';
        const categoryMap = {
            '계약서': 'category-계약서',
            '시장조사 리포트': 'category-시장조사-리포트',
            '영업정책': 'category-영업정책',
            '보고서': 'category-보고서',
            '업무 매뉴얼': 'category-업무-매뉴얼',
            '제안서&브로슈어': 'category-제안서-브로슈어'
        };
        
        if (categoryMap[resource.category]) {
            categoryClass = categoryMap[resource.category];
        } else {
            // 매핑에 없는 경우 자동 변환
            categoryClass = 'category-' + resource.category
                .replace(/&/g, '-')
                .replace(/[^a-zA-Z0-9가-힣]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        }
        
        const authorName = resource.authorName || '알 수 없음';
        
        return `
            <article class="resource-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h2 style="margin: 0; flex: 1;">${escapeHtml(resource.name)}</h2>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="resource-category-label ${categoryClass}">${escapeHtml(resource.category)}</span>
                        ${dropdownMenu}
                    </div>
                </div>
                <p class="resource-card-meta">
                    ${fileExt ? fileExt + ' · ' : ''}최신 업데이트: ${updatedDate}
                </p>
                <p class="resource-card-meta" style="margin-top: 0.25rem; color: var(--muted); font-size: 0.85rem;">
                    등록자: ${escapeHtml(authorName)}
                </p>
                <div style="display: flex; justify-content: flex-start; align-items: center; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
                    ${downloadLink}
                    ${urlLink}
                </div>
            </article>
        `;
    }).join('');
}

// 자료 다운로드
function downloadResource(resourceId) {
    const resources = getResources();
    const resource = resources.find(r => r.id === parseInt(resourceId));
    if (!resource) {
        alert('자료를 찾을 수 없습니다.');
        return;
    }
    
    if (resource.fileName) {
        // 실제 파일 다운로드 구현 (현재는 파일명만 표시)
        alert(`파일 다운로드: ${resource.fileName}\n\n실제 구현 시 파일 서버에서 다운로드하는 로직이 필요합니다.`);
    } else if (resource.url) {
        window.open(resource.url, '_blank', 'noopener,noreferrer');
    } else {
        alert('다운로드할 파일이 없습니다.');
    }
}

// 자료 수정
function editResource(resourceId) {
    window.location.href = `resource-register.html?id=${resourceId}`;
}

// 자료 삭제
function deleteResource(resourceId) {
    if (!confirm('이 자료를 삭제하시겠습니까?')) {
        return;
    }

    const resources = getResources();
    const filtered = resources.filter(r => r.id !== parseInt(resourceId));
    saveResources(filtered);
    
    // 현재 선택된 카테고리와 검색어로 다시 렌더링
    const activeBtn = document.querySelector('.status-tab.active');
    const category = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
    const searchInput = document.getElementById('search-text');
    const searchText = searchInput ? searchInput.value : '';
    renderResources(category, searchText);
}

// 드롭다운 메뉴 토글
function toggleResourceDropdown(resourceId) {
    // 모든 드롭다운 닫기
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== `dropdown-${resourceId}`) {
            menu.style.display = 'none';
        }
    });
    
    // 현재 드롭다운 토글
    const menu = document.getElementById(`dropdown-${resourceId}`);
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// 드롭다운 메뉴 닫기
function closeResourceDropdown(resourceId) {
    const menu = document.getElementById(`dropdown-${resourceId}`);
    if (menu) {
        menu.style.display = 'none';
    }
}

// 전역 함수로 노출
window.downloadResource = downloadResource;
window.editResource = editResource;
window.deleteResource = deleteResource;
window.toggleResourceDropdown = toggleResourceDropdown;
window.closeResourceDropdown = closeResourceDropdown;

// 현재 선택된 카테고리 가져오기
function getCurrentCategory() {
    const activeBtn = document.querySelector('.status-tab.active');
    return activeBtn ? activeBtn.getAttribute('data-category') : 'all';
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    if (!window.checkLogin || !window.checkLogin()) {
        return;
    }
    
    // 자료 등록 버튼
    const registerBtn = document.getElementById('btn-register-resource');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            window.location.href = 'resource-register.html';
        });
    }

    // 검색 기능
    const searchInput = document.getElementById('search-text');
    const searchBtn = document.getElementById('btn-search-text');
    
    function performSearch() {
        const searchText = searchInput ? searchInput.value : '';
        const category = getCurrentCategory();
        renderResources(category, searchText);
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }

    // 카테고리 필터 버튼
    const filterBtns = document.querySelectorAll('.status-tab');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 모든 버튼에서 active 제거
            filterBtns.forEach(b => b.classList.remove('active'));
            // 클릭한 버튼에 active 추가
            this.classList.add('active');
            // 해당 카테고리로 필터링 (검색어 유지)
            const category = this.getAttribute('data-category');
            const searchText = searchInput ? searchInput.value : '';
            renderResources(category, searchText);
        });
    });

    // 초기 목록 렌더링
    renderResources('all', '');

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown-menu-container')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
});

