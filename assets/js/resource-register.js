/**
 * resource-register.js
 * - 자료 등록/수정 페이지 전용 JavaScript
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

// 자료 ID 생성
function generateResourceId() {
    return Date.now();
}

// 파일명 표시 업데이트
function updateFileNameDisplay() {
    const fileInput = document.getElementById('resource-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    const fileNameSpan = fileNameDisplay.querySelector('span');
    const removeBtn = document.getElementById('btn-remove-file');

    if (fileInput.files.length > 0) {
        fileNameSpan.textContent = fileInput.files[0].name;
        fileNameDisplay.style.display = 'block';
    } else {
        fileNameDisplay.style.display = 'none';
    }
}

// 파일 제거
function removeFile() {
    const fileInput = document.getElementById('resource-file');
    fileInput.value = '';
    updateFileNameDisplay();
}

// 기존 자료 로드 (수정 모드)
function loadResource(resourceId) {
    const resources = getResources();
    const resource = resources.find(r => r.id === resourceId);
    
    if (!resource) {
        alert('자료를 찾을 수 없습니다.');
        window.location.href = 'resources.html';
        return;
    }

    // 권한 체크
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }
    
    const currentUserId = currentUser.id || currentUser.userId || currentUser.email;
    const currentUserEmail = currentUser.email;
    
    // 디버깅: 권한 체크 정보 출력
    console.log('권한 체크:', {
        currentUserId: currentUserId,
        currentUserEmail: currentUserEmail,
        resourceAuthorId: resource.authorId,
        resourceAuthorEmail: resource.authorEmail,
        resourceName: resource.name
    });
    
    // authorId 또는 authorEmail로 권한 확인
    const hasPermission = (
        (resource.authorId && String(resource.authorId) === String(currentUserId)) ||
        (resource.authorEmail && resource.authorEmail === currentUserEmail) ||
        (currentUserEmail && resource.authorEmail === currentUserEmail)
    );
    
    console.log('권한 확인 결과:', hasPermission);
    
    if (!hasPermission) {
        alert('수정 권한이 없습니다.');
        window.location.href = 'resources.html';
        return;
    }

    // 폼에 데이터 채우기
    document.getElementById('resource-id').value = resource.id;
    document.getElementById('resource-category').value = resource.category;
    document.getElementById('resource-name').value = resource.name || '';
    document.getElementById('resource-url').value = resource.url || '';

    // 파일명 표시 (기존 파일이 있는 경우)
    if (resource.fileName) {
        const fileNameDisplay = document.getElementById('file-name-display');
        const fileNameSpan = fileNameDisplay.querySelector('span');
        fileNameSpan.textContent = resource.fileName;
        fileNameDisplay.style.display = 'block';
    }

    // 페이지 제목 변경
    document.getElementById('page-title').textContent = '자료 수정';
}

// 폼 제출
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    if (!window.checkLogin || !window.checkLogin()) {
        return;
    }
    // URL 파라미터에서 자료 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const resourceId = urlParams.get('id');

    // 수정 모드인 경우 데이터 로드
    if (resourceId) {
        loadResource(parseInt(resourceId));
    }

    // 파일 입력 변경 시 파일명 표시
    const fileInput = document.getElementById('resource-file');
    if (fileInput) {
        fileInput.addEventListener('change', updateFileNameDisplay);
    }

    // 파일 제거 버튼
    const removeBtn = document.getElementById('btn-remove-file');
    if (removeBtn) {
        removeBtn.addEventListener('click', removeFile);
    }

    // 취소 버튼
    const cancelBtn = document.getElementById('btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?')) {
                window.location.href = 'resources.html';
            }
        });
    }

    // 폼 제출
    const form = document.getElementById('resource-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
            if (!currentUser) {
                alert('로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }

            const formData = new FormData(this);
            const id = formData.get('resource-id') || generateResourceId();
            const category = formData.get('category');
            const name = formData.get('name');
            const url = formData.get('url');
            const fileInput = document.getElementById('resource-file');

            // 유효성 검사
            if (!category) {
                alert('카테고리를 선택해주세요.');
                return;
            }

            if (!name || !name.trim()) {
                alert('자료명을 입력해주세요.');
                return;
            }

            // 자료 데이터 구성
            const resources = getResources();
            const existingIndex = resources.findIndex(r => r.id === parseInt(id));
            const existingResource = existingIndex >= 0 ? resources[existingIndex] : null;

            // 파일 또는 URL 중 하나는 필수
            const hasNewFile = fileInput.files.length > 0;
            const hasUrl = url && url.trim();
            const hasExistingFile = existingResource && existingResource.fileName;
            const hasExistingUrl = existingResource && existingResource.url;

            // 새 파일이 없고 URL도 없고, 기존 파일도 없고 기존 URL도 없으면 오류
            if (!hasNewFile && !hasUrl && !hasExistingFile && !hasExistingUrl) {
                alert('파일 또는 URL 중 하나는 반드시 입력해야 합니다.');
                return;
            }

            // 파일명 결정: 새 파일이 있으면 새 파일명, 없으면 기존 파일명 유지
            let finalFileName = '';
            if (hasNewFile) {
                finalFileName = fileInput.files[0].name;
            } else if (hasExistingFile) {
                finalFileName = existingResource.fileName;
            }

            // URL 결정: 새 URL이 있으면 새 URL, 없으면 기존 URL 유지
            let finalUrl = '';
            if (hasUrl) {
                finalUrl = url.trim();
            } else if (hasExistingUrl) {
                finalUrl = existingResource.url;
            }

            const resourceData = {
                id: parseInt(id),
                category: category,
                name: name.trim(),
                url: finalUrl,
                fileName: finalFileName,
                authorId: currentUser.id || currentUser.userId || currentUser.email,
                authorEmail: currentUser.email || '',
                authorName: currentUser.name || '알 수 없음',
                createdAt: existingIndex >= 0 ? resources[existingIndex].createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // 저장
            if (existingIndex >= 0) {
                resources[existingIndex] = resourceData;
            } else {
                resources.push(resourceData);
            }

            saveResources(resources);

            alert(existingIndex >= 0 ? '자료가 수정되었습니다.' : '자료가 등록되었습니다.');
            window.location.href = 'resources.html';
        });
    }
});

