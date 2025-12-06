/**
 * login.js
 * - 로그인 페이지 전용 JavaScript
 * - 계정 관리 및 로그인 처리
 */

// 계정 정보 저장소 키
const ACCOUNTS_STORAGE_KEY = 'growth_launchpad_accounts';
// CURRENT_USER_KEY는 main.js에서 선언됨

// 초기 계정 데이터 (3개 계정)
const INITIAL_ACCOUNTS = [
    {
        email: 'sales1@malgeunsoft.com',
        password: 'sales123',
        companyName: '맑은소프트',
        department: '영업본부',
        teamName: '영업1팀',
        name: '김영업',
        position: '팀장',
        phone: '02-1234-5678',
        mobile: '010-1234-5678'
    },
    {
        email: 'sales2@malgeunsoft.com',
        password: 'sales456',
        companyName: '맑은소프트',
        department: '마케팅본부',
        teamName: '마케팅팀',
        name: '이마케팅',
        position: '과장',
        phone: '02-2345-6789',
        mobile: '010-2345-6789'
    },
    {
        email: 'sales3@malgeunsoft.com',
        password: 'sales789',
        companyName: '맑은소프트',
        department: '고객지원본부',
        teamName: '고객지원팀',
        name: '박지원',
        position: '대리',
        phone: '02-3456-7890',
        mobile: '010-3456-7890'
    }
];

// 계정 정보 초기화
function initializeAccounts() {
    // 항상 최신 계정 정보로 업데이트 (기존 데이터 덮어쓰기)
    console.log('계정 정보 초기화 및 업데이트:', INITIAL_ACCOUNTS);
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_ACCOUNTS));
    
    // 저장 확인
    const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    const savedAccounts = saved ? JSON.parse(saved) : [];
    console.log('저장된 계정 정보:', savedAccounts);
}

// 계정 정보 가져오기
function getAccounts() {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 계정 검증
function validateAccount(email, password) {
    const accounts = getAccounts();
    const foundAccount = accounts.find(account => 
        account.email === email && account.password === password
    );
    
    // 디버깅: 찾은 계정 정보 확인
    if (foundAccount) {
        console.log('찾은 계정 정보 (전체):', foundAccount);
        console.log('계정 필드 확인:', {
            email: foundAccount.email,
            companyName: foundAccount.companyName,
            department: foundAccount.department,
            teamName: foundAccount.teamName,
            name: foundAccount.name,
            position: foundAccount.position,
            phone: foundAccount.phone,
            mobile: foundAccount.mobile
        });
    } else {
        console.log('계정을 찾을 수 없습니다. 저장된 계정 목록:', accounts);
    }
    
    return foundAccount;
}

// 로그인 처리
function handleLogin(email, password) {
    // 먼저 INITIAL_ACCOUNTS에서 찾기 (항상 최신 정보)
    let account = INITIAL_ACCOUNTS.find(acc => 
        acc.email === email && acc.password === password
    );
    
    // INITIAL_ACCOUNTS에서 못 찾으면 localStorage에서 찾기
    if (!account) {
        account = validateAccount(email, password);
    }
    
    if (account) {
        // 계정 정보 확인 및 디버깅
        console.log('로그인 계정 정보 (전체):', account);
        console.log('계정 필드 확인:', {
            email: account.email,
            companyName: account.companyName,
            department: account.department,
            teamName: account.teamName,
            name: account.name,
            position: account.position,
            phone: account.phone,
            mobile: account.mobile
        });
        
        // 현재 사용자 정보 저장 (모든 필드 포함)
        // 기존 사용자 정보가 있으면 id 유지, 없으면 새로 생성
        const existingUser = localStorage.getItem('growth_launchpad_current_user');
        let userId = null;
        if (existingUser) {
            try {
                const parsed = JSON.parse(existingUser);
                userId = parsed.id || parsed.userId;
            } catch (e) {
                // 파싱 실패 시 무시
            }
        }
        
        // id가 없으면 email 기반으로 생성 (일관성 유지)
        if (!userId) {
            userId = account.email ? account.email.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now() : Date.now();
        }
        
        const userData = {
            id: userId,
            userId: userId, // 호환성을 위해 둘 다 저장
            email: account.email || '',
            companyName: account.companyName || '',
            department: account.department || '',
            teamName: account.teamName || '',
            name: account.name || '',
            position: account.position || '',
            phone: account.phone || '',
            mobile: account.mobile || ''
        };
        
        console.log('저장할 사용자 정보:', userData);
        localStorage.setItem('growth_launchpad_current_user', JSON.stringify(userData));
        
        // 저장 확인
        const saved = localStorage.getItem('growth_launchpad_current_user');
        const savedUser = saved ? JSON.parse(saved) : null;
        console.log('저장된 사용자 정보:', savedUser);
        console.log('저장된 사용자 필드 확인:', {
            email: savedUser?.email,
            companyName: savedUser?.companyName,
            department: savedUser?.department,
            teamName: savedUser?.teamName,
            name: savedUser?.name,
            position: savedUser?.position,
            phone: savedUser?.phone,
            mobile: savedUser?.mobile
        });
        
        // 로그인 성공 시 메인 페이지로 이동
        window.location.href = 'index.html';
        return true;
    } else {
        alert('이메일 또는 비밀번호가 올바르지 않습니다.');
        return false;
    }
}

// 저장된 로그인 정보 불러오기
function loadSavedLogin() {
    const savedEmail = localStorage.getItem('saved_login_email');
    const savedPassword = localStorage.getItem('saved_login_password');
    
    if (savedEmail && savedPassword) {
        const emailInput = document.querySelector('input[name="email"]');
        const passwordInput = document.querySelector('input[name="password"]');
        const rememberCheckbox = document.getElementById('remember-login');
        
        if (emailInput) emailInput.value = savedEmail;
        if (passwordInput) passwordInput.value = savedPassword;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

// 로그인 정보 저장
function saveLogin(email, password, remember) {
    if (remember) {
        localStorage.setItem('saved_login_email', email);
        localStorage.setItem('saved_login_password', password);
    } else {
        localStorage.removeItem('saved_login_email');
        localStorage.removeItem('saved_login_password');
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 계정 정보 초기화
    initializeAccounts();
    
    // 저장된 로그인 정보 불러오기
    loadSavedLogin();
    
    // 로그인 폼 이벤트 리스너
    const loginForm = document.querySelector('form.form-card');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = loginForm.querySelector('input[name="email"]');
            const passwordInput = loginForm.querySelector('input[name="password"]');
            const rememberCheckbox = document.getElementById('remember-login');
            
            if (emailInput && passwordInput) {
                const email = emailInput.value.trim();
                const password = passwordInput.value;
                const remember = rememberCheckbox ? rememberCheckbox.checked : false;
                
                if (!email || !password) {
                    alert('이메일과 비밀번호를 모두 입력해주세요.');
                    return;
                }
                
                // 로그인 정보 저장
                saveLogin(email, password, remember);
                
                handleLogin(email, password);
            }
        });
    }
    
    // 테스트 계정 버튼 이벤트 리스너
    const testAccountButtons = document.querySelectorAll('.test-account-btn');
    testAccountButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // 폼 제출 방지
            e.stopPropagation(); // 이벤트 전파 방지
            
            const email = this.getAttribute('data-email');
            const password = this.getAttribute('data-password');
            
            if (!email || !password) {
                alert('계정 정보를 불러올 수 없습니다.');
                return;
            }
            
            const emailInput = document.querySelector('input[name="email"]');
            const passwordInput = document.querySelector('input[name="password"]');
            
            if (emailInput && passwordInput) {
                emailInput.value = email;
                passwordInput.value = password;
                
                // 로그인 정보 저장 (체크박스는 체크하지 않음)
                saveLogin(email, password, false);
                
                // 자동 로그인 처리
                handleLogin(email, password);
            } else {
                alert('입력 필드를 찾을 수 없습니다.');
            }
        });
    });
});

