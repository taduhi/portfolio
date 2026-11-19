(() => {
  const motion = { openProject() {}, closeProject(dialog, done) { done(); } };
  window.portfolioMotion = motion;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!window.gsap || reduceMotion.matches) return;

  const gsap = window.gsap;
  const intro = gsap.timeline({ defaults: { ease: 'power2.out' } });
  intro.from('.hero-copy .kicker', { opacity: .72, y: 7, duration: .2 })
    .from('.hero h1', { opacity: .72, y: 12, duration: .34 }, '-=.1')
    .from('.hero-lead, .hero .cta', { opacity: .72, y: 8, duration: .26, stagger: .05 }, '-=.22')
    .from('.portrait-board', { opacity: .72, y: 10, duration: .34 }, '-=.33');

  if (window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.create({
      trigger: '.work',
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.fromTo('.work header',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: .44, ease: 'power2.out', clearProps: 'all' }),
    });
  }

  motion.openProject = content => {
    const dialog = content.closest('dialog');
    gsap.killTweensOf(dialog);
    gsap.set(dialog, { clearProps: 'opacity' });
    gsap.fromTo(content.querySelectorAll('.detail-title, .fields, .related, .gallery'),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: .34, stagger: .045, ease: 'power2.out', clearProps: 'all' });
  };

  motion.closeProject = (dialog, done) => {
    gsap.killTweensOf(dialog);
    gsap.to(dialog, {
      opacity: 0,
      duration: .16,
      ease: 'power1.in',
      onComplete: () => { done(); gsap.set(dialog, { clearProps: 'opacity' }); },
    });
  };
})();
