/**
 *  @class
 *  @function ImageTextOverlayCustom
 */

if (!customElements.get('image-with-text-overlay-custom')) {
  class ImageTextOverlayCustom extends HTMLElement {
    constructor() {
      super();

      this.tl = false;
    }

    connectedCallback() {
      if (this.dataset.enableAnimations !== 'true') {
        return;
      }

      this.loadAnimations().then(() => {
        if (typeof gsap !== 'undefined') {
          this.prepareAnimations();
        }
      });
    }

    disconnectedCallback() {
      if (this.tl) {
        this.tl.kill();
      }
    }

    loadAnimations() {
      if (typeof gsap !== 'undefined') {
        this.configureGsap();
        return Promise.resolve();
      }

      if (!window.imageWithTextOverlayAnimationsPromise) {
        window.imageWithTextOverlayAnimationsPromise = new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = this.dataset.animationsSrc;
          script.onload = () => {
            this.configureGsap();
            resolve();
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      return window.imageWithTextOverlayAnimationsPromise.then(() => {
        this.configureGsap();
      });
    }

    configureGsap() {
      if (typeof gsap === 'undefined') {
        return;
      }

      gsap.config({
        nullTargetWarn: false
      });

      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }
    }

    prepareAnimations() {
      const animatedItems = this.querySelectorAll([
        '.image-with-text-overlay--heading',
        '.rte',
        '.button',
        '.image-with-text-overlay--packing-list-title',
        '.image-with-text-overlay--packing-list-item',
        '.image-with-text-overlay--icon-text-item'
      ].join(','));
      const floatingImages = this.querySelectorAll('.image-with-text-overlay--floating-image');

      if (!animatedItems.length && !floatingImages.length) {
        return;
      }

      this.tl = gsap.timeline({
        scrollTrigger: {
          trigger: this.querySelector('.image-with-text-overlay--content-inner') || this,
          start: 'top 80%',
          once: true
        }
      });

      if (animatedItems.length) {
        this.tl.to(animatedItems, {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out'
        });
      }

      if (floatingImages.length) {
        this.tl.fromTo(floatingImages, {
          autoAlpha: 0,
          yPercent: 12
        }, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out'
        }, animatedItems.length ? '-=0.65' : 0);
      }
    }
  }

  customElements.define('image-with-text-overlay-custom', ImageTextOverlayCustom);
}
