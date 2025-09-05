document.addEventListener('DOMContentLoaded', function() {
  // Kiểm tra đăng nhập
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    window.location.href = '../../login.html';
    return;
  }

  // Lấy thông tin user
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'USER';
  const userPosition = localStorage.getItem('userPosition') || 'Nhân viên';

  // Cập nhật thông tin user
  const displayUserName = document.getElementById('displayUserName');
  const displayUserPosition = document.getElementById('displayUserPosition');
  if (displayUserName) displayUserName.textContent = userName;
  if (displayUserPosition) displayUserPosition.textContent = userPosition;

  // Xử lý dropdown user profile
  const userProfile = document.getElementById('userProfile');
  const logoutDropdown = document.getElementById('logoutDropdown');
  const dropdownIcon = document.querySelector('.dropdown-icon');

  // Biến toàn cục theo dõi dropdown
  let activeDropdown = null;
  let hoveredDropdown = null;
  let hoverTimeout;
  let isUserDropdownOpen = false;
  let userHoverTimeout;

  // Xử lý dropdown menu chính
  const dropdownParents = document.querySelectorAll('.nav-menu li.has-dropdown');

  dropdownParents.forEach(parent => {
    const navItem = parent.querySelector('.nav-item');
    const dropdown = parent.querySelector('.dropdown_menu');

    // Hover mở dropdown
    parent.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      if (hoveredDropdown && hoveredDropdown !== parent) {
        closeHoveredDropdown();
      }
      openDropdown(parent, dropdown);
      hoveredDropdown = parent;
    });

    // Hover đóng dropdown
    parent.addEventListener('mouseleave', (e) => {
      if (!dropdown.contains(e.relatedTarget)) {
        startHoverClose(parent, dropdown);
      }
    });

    // Click toggle dropdown
    navItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (activeDropdown === parent) {
        closeActiveDropdown();
      } else {
        closeAllDropdowns();
        openDropdown(parent, dropdown, true);
        activeDropdown = parent;
      }
    });

    // Xử lý hover trên dropdown
    dropdown.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
    dropdown.addEventListener('mouseleave', (e) => {
      if (!parent.contains(e.relatedTarget)) {
        startHoverClose(parent, dropdown);
      }
    });
  });

  // Xử lý user profile dropdown
  if (userProfile && logoutDropdown && dropdownIcon) {
    // Mở dropdown khi hover
    userProfile.addEventListener('mouseenter', () => {
      clearTimeout(userHoverTimeout);
      openUserDropdown();
    });

    // Đóng dropdown khi rời chuột
    userProfile.addEventListener('mouseleave', () => {
      userHoverTimeout = setTimeout(() => {
        if (!isUserDropdownOpen) closeUserDropdown();
      }, 200);
    });

    // Dừng timeout khi hover vào dropdown
    logoutDropdown.addEventListener('mouseenter', () => clearTimeout(userHoverTimeout));
    
    // Đóng dropdown khi rời khỏi dropdown
    logoutDropdown.addEventListener('mouseleave', (e) => {
      if (!userProfile.contains(e.relatedTarget) && !isUserDropdownOpen) {
        userHoverTimeout = setTimeout(() => closeUserDropdown(), 200);
      }
    });

    // Mở/đóng dropdown khi click
    userProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      isUserDropdownOpen = !isUserDropdownOpen;
      if (isUserDropdownOpen) {
        openUserDropdown();
      } else {
        closeUserDropdown();
      }
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (!userProfile.contains(e.target) && !logoutDropdown.contains(e.target) && isUserDropdownOpen) {
        closeUserDropdown();
        isUserDropdownOpen = false;
      }
    });

    // Ngăn sự kiện click lan truyền từ dropdown
    logoutDropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  // Xử lý logout
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '../../html/login.html';
  });

  // Đóng dropdown khi click ra ngoài
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.has-dropdown') && !e.target.closest('.dropdown_menu')) {
      closeAllDropdowns();
    }
  });

  // Helper functions
  function openDropdown(parent, dropdown, isClick = false) {
    parent.classList.add('active');
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';
    dropdown.style.transform = 'translateX(-50%) translateY(0)';
    dropdown.style.pointerEvents = 'auto';
    if (isClick) activeDropdown = parent;
  }

  function startHoverClose(parent, dropdown) {
    hoverTimeout = setTimeout(() => {
      if (activeDropdown !== parent) {
        closeDropdown(parent, dropdown);
        if (hoveredDropdown === parent) hoveredDropdown = null;
      }
    }, 150);
  }

  function closeDropdown(parent, dropdown) {
    parent.classList.remove('active');
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';
    dropdown.style.transform = 'translateX(-50%) translateY(10px)';
    dropdown.style.pointerEvents = 'none';
  }

  function closeHoveredDropdown() {
    if (hoveredDropdown) {
      const dropdown = hoveredDropdown.querySelector('.dropdown_menu');
      closeDropdown(hoveredDropdown, dropdown);
      hoveredDropdown = null;
    }
  }

  function closeActiveDropdown() {
    if (activeDropdown) {
      const dropdown = activeDropdown.querySelector('.dropdown_menu');
      closeDropdown(activeDropdown, dropdown);
      activeDropdown = null;
    }
  }

  function closeAllDropdowns() {
    closeActiveDropdown();
    closeHoveredDropdown();
  }

  function openUserDropdown() {
    userProfile.classList.add('active');
    logoutDropdown.style.opacity = '1';
    logoutDropdown.style.visibility = 'visible';
    logoutDropdown.style.transform = 'translateY(0)';
    logoutDropdown.style.pointerEvents = 'auto';
    dropdownIcon.style.transform = 'rotate(180deg)';
  }

  function closeUserDropdown() {
    userProfile.classList.remove('active');
    logoutDropdown.style.opacity = '0';
    logoutDropdown.style.visibility = 'hidden';
    logoutDropdown.style.transform = 'translateY(10px)';
    logoutDropdown.style.pointerEvents = 'none';
    dropdownIcon.style.transform = 'rotate(0deg)';
  }
});