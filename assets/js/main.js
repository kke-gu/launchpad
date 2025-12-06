/**
 * main.js
 * - 사이트 공통 JavaScript
 * - GNB 동작(모바일 메뉴 토글, 활성 메뉴 표시 등)을 담당
 */

const CURRENT_USER_KEY = 'growth_launchpad_current_user';

// 현재 사용자 정보 가져오기
function getCurrentUser() {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

// window 객체에 노출 (다른 스크립트에서 사용 가능하도록)
window.getCurrentUser = getCurrentUser;

// 로그인 체크 (로그인 페이지가 아닌 경우에만)
function checkLogin() {
  const currentUser = getCurrentUser();
  const currentPath = window.location.pathname;
  const currentHref = window.location.href;
  const currentPage = currentPath.split('/').pop() || currentPath;
  
  // 로그인 페이지는 예외 처리 (경로나 URL에 login.html이 포함된 경우)
  if (currentPage === 'login.html' || 
      currentPath.includes('login.html') || 
      currentHref.includes('login.html')) {
    return true;
  }
  
  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!currentUser) {
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

// window 객체에 노출
window.checkLogin = checkLogin;

// 로그아웃 처리
function handleLogout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = 'login.html';
}

// GNB 업데이트 (로그인 상태에 따라)
function updateGNB() {
  const currentUser = getCurrentUser();
  const headerActions = document.querySelector('.header-actions');
  const mobileNavExtra = document.querySelector('.main-nav-extra');
  
  if (currentUser) {
    // 로그인 상태: 로그인 버튼을 로그아웃 버튼으로 변경하고 이름 표시
    if (headerActions) {
      const loginBtn = headerActions.querySelector('a[href="login.html"].btn.primary');
      const mobileLoginBtn = headerActions.querySelector('.mobile-header-cta a[href="login.html"]');
      
      if (loginBtn) {
        loginBtn.textContent = '로그아웃';
        loginBtn.href = '#';
        loginBtn.onclick = function(e) {
          e.preventDefault();
          handleLogout();
        };
      }
      
      if (mobileLoginBtn) {
        mobileLoginBtn.textContent = '로그아웃';
        mobileLoginBtn.href = '#';
        mobileLoginBtn.onclick = function(e) {
          e.preventDefault();
          handleLogout();
        };
      }
      
      // 사용자 이름 표시 추가 (클릭 가능한 링크)
      if (!headerActions.querySelector('.user-name')) {
        const userNameDisplay = document.createElement('a');
        userNameDisplay.className = 'user-name';
        userNameDisplay.href = 'profile.html';
        // 이름이 있으면 이름을, 없으면 이메일 표시 (이름 뒤에 '님' 추가)
        const displayName = (currentUser.name && currentUser.name.trim() && currentUser.name !== '-') 
          ? currentUser.name + '님' 
          : (currentUser.email || '사용자');
        userNameDisplay.textContent = displayName;
        
        console.log('Header 표시 이름:', {
          name: currentUser.name,
          email: currentUser.email,
          displayName: displayName,
          fullUser: currentUser
        });
        userNameDisplay.style.marginRight = '1rem';
        userNameDisplay.style.color = 'var(--text)';
        userNameDisplay.style.fontWeight = '600';
        userNameDisplay.style.textDecoration = 'none';
        userNameDisplay.style.cursor = 'pointer';
        userNameDisplay.style.transition = 'color 0.2s';
        
        userNameDisplay.addEventListener('mouseenter', function() {
          this.style.color = 'var(--primary)';
        });
        userNameDisplay.addEventListener('mouseleave', function() {
          this.style.color = 'var(--text)';
        });
        
        // 로그인 버튼 앞에 사용자 이름 추가
        if (loginBtn) {
          headerActions.insertBefore(userNameDisplay, loginBtn);
        }
      }
    }
    
    // 모바일 메뉴에 로고와 계정 정보 추가 (ensureMobileMenuElements 함수 사용)
    ensureMobileMenuElements();
  } else {
    // 로그인 페이지가 아닌 경우 로그인 페이지로 리다이렉트
    if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('login.html')) {
      // 로그인 페이지가 아닐 때만 리다이렉트 (무한 루프 방지)
      // 필요시 주석 해제: window.location.href = 'login.html';
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // 모바일 메뉴 토글
  var nav = document.querySelector('.main-nav');
  var toggle = document.querySelector('.mobile-menu-toggle');
  var closeBtn = document.querySelector('.mobile-menu-close');

  function openNav() {
    if (nav) {
      nav.classList.add('is-open');
    }
  }

  function closeNav() {
    if (nav) {
      nav.classList.remove('is-open');
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      // 모바일 메뉴 열 때마다 로고와 계정 정보 확인 및 추가
      ensureMobileMenuElements();
      openNav();
    });
  }

  if (closeBtn && nav) {
    closeBtn.addEventListener('click', function () {
      closeNav();
    });
  }

  // 현재 페이지에 따른 내비게이션 active 상태 설정 (간단한 예시)
  var path = window.location.pathname;
  var navLinks = document.querySelectorAll('.main-nav .nav-pill');

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && path.endsWith(href)) {
      link.classList.add('active');
    }
  });
  
  // GNB 업데이트 (로그인 상태 확인)
  updateGNB();
});

// 모바일 메뉴 요소 확인 및 추가 함수
function ensureMobileMenuElements() {
  const mainNav = document.querySelector('.main-nav');
  if (!mainNav) return;
  
  const currentUser = getCurrentUser();
  
  // 로고 영역 확인 및 추가 (로그인 상태와 관계없이 항상 표시)
  let brandSection = mainNav.querySelector('.mobile-menu-brand');
  if (!brandSection) {
    brandSection = document.createElement('div');
    brandSection.className = 'mobile-menu-brand';
    brandSection.innerHTML = `
      <div class="brand-mark" aria-hidden="true">
        <span class="m-letter">m</span>
        <span class="tm-symbol">™</span>
      </div>
      <div class="brand-info">
        <p class="brand-label">맑은소프트</p>
        <p class="brand-sub">Growth Launchpad</p>
      </div>
    `;
    const closeBtn = mainNav.querySelector('.mobile-menu-close');
    if (closeBtn) {
      closeBtn.insertAdjacentElement('afterend', brandSection);
    } else {
      const firstNavPill = mainNav.querySelector('.nav-pill');
      if (firstNavPill) {
        firstNavPill.insertAdjacentElement('beforebegin', brandSection);
      } else {
        mainNav.insertBefore(brandSection, mainNav.firstChild);
      }
    }
  }
  
  // 계정 정보 영역 확인 및 추가 (로그인 상태일 때만)
  if (currentUser) {
    let userSection = mainNav.querySelector('.mobile-menu-user');
    if (!userSection) {
      userSection = document.createElement('div');
      userSection.className = 'mobile-menu-user';
      const displayName = (currentUser.name && currentUser.name.trim() && currentUser.name !== '-') 
        ? currentUser.name + '님' 
        : (currentUser.email || '사용자');
      userSection.innerHTML = `
        <div class="mobile-menu-user-content">
          <div class="mobile-menu-user-info">
            <a href="profile.html" class="user-name">${displayName}</a>
            <div class="user-email">${currentUser.email || ''}</div>
          </div>
          <a href="profile.html" class="mobile-menu-user-edit" aria-label="프로필 수정">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6667 3.33333L16.6667 8.33333M14.1667 1.66667L17.5 5L10.8333 11.6667H7.5V8.33333L14.1667 1.66667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16.6667 11.6667V16.6667C16.6667 17.1087 16.4911 17.5326 16.1785 17.8452C15.866 18.1577 15.442 18.3333 15 18.3333H4.16667C3.72464 18.3333 3.30072 18.1577 2.98816 17.8452C2.67559 17.5326 2.5 17.1087 2.5 16.6667V5.83333C2.5 5.39131 2.67559 4.96738 2.98816 4.65482C3.30072 4.34226 3.72464 4.16667 4.16667 4.16667H9.16667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      `;
      if (brandSection) {
        brandSection.insertAdjacentElement('afterend', userSection);
      } else {
        const firstNavPill = mainNav.querySelector('.nav-pill');
        if (firstNavPill) {
          firstNavPill.insertAdjacentElement('beforebegin', userSection);
        } else {
          mainNav.insertBefore(userSection, mainNav.firstChild);
        }
      }
    }
    
    // 로그인 버튼을 로그아웃으로 변경하고 박스 밖으로 이동
    const mobileNavExtra = document.querySelector('.main-nav-extra');
    let mobileLoginPill = mobileNavExtra ? mobileNavExtra.querySelector('a[href="login.html"]') : null;
    if (!mobileLoginPill) {
      mobileLoginPill = mainNav.querySelector('a.nav-pill--primary[href="login.html"], a.nav-pill--primary[href="#"]');
    }
    
    if (mobileLoginPill) {
      mobileLoginPill.innerHTML = '로그아웃';
      mobileLoginPill.href = '#';
      mobileLoginPill.classList.add('nav-pill--primary');
      mobileLoginPill.setAttribute('aria-label', '로그아웃');
      mobileLoginPill.onclick = function(e) {
        e.preventDefault();
        handleLogout();
      };
      if (mobileNavExtra && mobileNavExtra.contains(mobileLoginPill)) {
        mainNav.appendChild(mobileLoginPill);
      }
    }
  } else {
    // 로그아웃 상태일 때 계정 정보 제거
    const existingUser = mainNav.querySelector('.mobile-menu-user');
    if (existingUser) {
      existingUser.remove();
    }
    
    // 로그인 버튼을 박스 밖으로 이동 (로그아웃 버튼과 동일한 위치)
    const mobileNavExtra = document.querySelector('.main-nav-extra');
    let mobileLoginPill = mainNav.querySelector('a.nav-pill--primary[href="#"]');
    if (!mobileLoginPill) {
      mobileLoginPill = mobileNavExtra ? mobileNavExtra.querySelector('a[href="login.html"]') : null;
    }
    
    if (mobileLoginPill) {
      mobileLoginPill.innerHTML = '로그인';
      mobileLoginPill.href = 'login.html';
      mobileLoginPill.classList.add('nav-pill--primary');
      mobileLoginPill.setAttribute('aria-label', '로그인');
      mobileLoginPill.onclick = null;
      // main-nav-extra에서 main-nav로 이동 (박스 밖으로)
      if (mobileNavExtra && mobileNavExtra.contains(mobileLoginPill)) {
        mainNav.appendChild(mobileLoginPill);
      }
    }
  }
}

// window 객체에 updateGNB 노출 (다른 스크립트에서 사용 가능하도록)
window.updateGNB = updateGNB;
window.ensureMobileMenuElements = ensureMobileMenuElements;



