if (typeof debounce === 'undefined') {
  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}
/**
 *  @class
 *  @function ThemeHeader
 */

if (!customElements.get('theme-header')) {
  class ThemeHeader extends HTMLElement {
    constructor() {
      super();
      // Create a style element for our important overrides
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'header-position-override';
      document.head.appendChild(this.styleElement);
    }
    connectedCallback() {
      this.header_section = document.querySelector('.header-section');
      this.menu = this.querySelector('#mobile-menu');
      this.toggle = this.querySelector('.mobile-toggle-wrapper');

      // Mutation observer for open attribute changes
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'open') {
            this.toggleHeaderPosition();
          }
        });
      });
      this.observer.observe(this.toggle, { attributes: true });

      document.addEventListener('keyup', (e) => {
        if (e.code) {
          if (e.code.toUpperCase() === 'ESCAPE') {
            this.toggle.removeAttribute('open');
            this.toggle.classList.remove('active');
          }
        }
      });
      
      if (this.classList.contains('header-sticky--active')) {
        document.body.classList.add('header-sticky--active');
      }
      
      this.toggle.querySelector('.mobile-toggle').addEventListener('click', (e) => {
        if (this.toggle.classList.contains('active')) {
          e.preventDefault();
          document.body.classList.remove('overflow-hidden');
          this.toggle.classList.remove('active');
          this.closeAnimation(this.toggle);
        } else {
          document.body.classList.add('overflow-hidden');
          setTimeout(() => {
            this.toggle.classList.add('active');
          });
        }
      });

      // Initial setup
      this.toggleHeaderPosition();

      // Rest of your existing code...
      // Sticky Header Class
      window.addEventListener('scroll', this.setStickyClass.bind(this), {
        passive: true
      });

      // Mobile Menu offset
      window.addEventListener('scroll', this.setHeaderOffset.bind(this), {
        passive: true
      });
      window.addEventListener('scroll', this.setHeaderHeight.bind(this), {
        passive: true
      });

      window.dispatchEvent(new Event('scroll'));

      if (document.querySelector('.announcement-bar-section')) {
        window.addEventListener('scroll', this.setAnnouncementHeight(), {
          passive: true
        });
        window.dispatchEvent(new Event('resize'));
      }

      // Mobile Navigation transparent header support.
      setTimeout(() => {
        this.mobile_nav = document.querySelector('.header-mobile-navigation');
        if (this.mobile_nav && this.classList.contains('transparent--true')) {
          this.mobile_nav.classList.add('is-fixed');
        }
      }, 100);
      
      // Buttons.
      this.menu.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
      this.menu.querySelectorAll('.parent-link-back--button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
      
      // Add style for menu-opening states
      const menuStyle = document.createElement('style');
      menuStyle.textContent = `
        .mobile-menu li details[open].menu-opening > summary .link-forward path {
          stroke: #00d0cd !important;
        }
        .mobile-menu li details[open].menu-opening > summary .link-forward {
          transform: rotate(-180deg);
        }
        .mobile-menu li details.menu-opening:not([open]) > summary .link-forward path {
          stroke: #2c2d2e !important;
        }
        .mobile-menu li details.menu-opening:not([open]) > summary .link-forward {
          transform: rotate(0deg);
        }
      `;
      document.head.appendChild(menuStyle);
    }
    
    toggleHeaderPosition() {
      if (!this.header_section) return;
      
      if (this.toggle.hasAttribute('open')) {
        this.styleElement.textContent = `
          #home-wrapper .header-section {
            position: static !important;
          }
          #home-wrapper .thb-secondary-area-item-new {
            opacity:1 !important;
          }
          .header:before{
            background: #f0f2f2 !important;
          }
          .mobile-menu-drawer--inner,.thb-mobile-menu-footer,home-content,main-content,.mobile-menu-drawer--inner .sub-menu{
            background: #f0f2f2 !important;
          }
        `;
      } else {
        this.styleElement.textContent = `
          .header:before,.mobile-menu-drawer--inner,.thb-mobile-menu-footer,home-content,main-content,.mobile-menu-drawer--inner .sub-menu{
            background: initial !important;
          }
        `;
      }
    }
    
    // Rest of your existing methods...
    setStickyClass() {
      if (this.classList.contains('header-sticky--active')) {
        let offset = parseInt(this.getBoundingClientRect().top, 10) + document.documentElement.scrollTop;
        this.classList.toggle('is-sticky', window.scrollY >= offset && window.scrollY > 0);
      }
    }
    
    setAnnouncementHeight() {
      const a_bar = document.querySelector('.announcement-bar-section');
      let h = a_bar.clientHeight;
      document.documentElement.style.setProperty('--announcement-height', h + 'px');
    }
    
    setHeaderOffset() {
      let h = this.header_section.getBoundingClientRect().top;
      document.documentElement.style.setProperty('--header-offset', h + 'px');
    }
    
    setHeaderHeight() {
      let h = this.clientHeight;
      document.documentElement.style.setProperty('--header-height', h + 'px');
    }
    
    onSummaryClick(event) {
      const summaryElement = event.currentTarget;
      const detailsElement = summaryElement.parentNode;
      const parentMenuElement = detailsElement.closest('.link-container');
      const isOpen = detailsElement.hasAttribute('open');
      // 只有当点击的是主菜单项（不是子菜单项）且菜单即将打开时才滚动到顶部
      if (this.querySelector('.parent-link-back--button') && !isOpen && !detailsElement.closest('.sub-menu')) {
        this.menu.scrollTop = 0; 
      }
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
      }, 100);
    }
    
    onCloseButtonClick(event) {
      event.preventDefault();
      const detailsElement = event.currentTarget.closest('details');
      this.closeSubmenu(detailsElement);
    }
    
    closeSubmenu(detailsElement) {
      detailsElement.classList.remove('menu-opening');
      this.closeAnimation(detailsElement);
    }
    
    closeAnimation(detailsElement) {
      let animationStart;

      const handleAnimation = (time) => {
        if (animationStart === undefined) {
          animationStart = time;
        }

        const elapsedTime = time - animationStart;

        if (elapsedTime < 400) {
          window.requestAnimationFrame(handleAnimation);
        } else {
          detailsElement.removeAttribute('open');
        }
      };

      window.requestAnimationFrame(handleAnimation);
    }
    
    disconnectedCallback() {
      if (this.observer) {
        this.observer.disconnect();
      }
      if (this.styleElement && this.styleElement.parentNode) {
        this.styleElement.parentNode.removeChild(this.styleElement);
      }
    }
  }
  customElements.define('theme-header', ThemeHeader);
}

/**
 *  @class
 *  @function FullMenu
 */
if (!customElements.get('full-menu')) {
  class FullMenu extends HTMLElement {
    constructor() {
      super();
      this.submenus = this.querySelectorAll('.thb-full-menu>.menu-item-has-children:not(.menu-item-has-megamenu)>.sub-menu');
    }
    connectedCallback() {
      if (!this.submenus.length) {
        return;
      }
      const _this = this;
      // resize on initial load
      document.fonts.ready.then(function() {
        window.addEventListener('resize', debounce(function() {
          _this.resizeSubMenus();
        }, 100));
      });
    }
    resizeSubMenus() {
      this.submenus.forEach((submenu) => {
        let sub_submenus = submenu.querySelectorAll(':scope >.menu-item-has-children>.sub-menu');
        sub_submenus.forEach((sub_submenu) => {
          let w = sub_submenu.offsetWidth,
            l = sub_submenu.parentElement.getBoundingClientRect().left + sub_submenu.parentElement.offsetWidth,
            total = w + l;

          if (total > window.innerWidth) {
            sub_submenu.parentElement.classList.add('left-submenu');
          } else if (sub_submenu.parentElement.classList.contains('left-submenu')) {
            sub_submenu.parentElement.classList.remove('left-submenu');
          }
        });
      });
    }
  }
  customElements.define('full-menu', FullMenu);
}