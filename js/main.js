  /* ── Icons ── */
  lucide.createIcons();

  /* ── Work filters ── */
  document.querySelectorAll('.wf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ── Nav scroll ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });

  /* ── Mobile burger ── */
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('navDrawer');
  burger.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.drawer-link').forEach(l =>
    l.addEventListener('click', () => {
      drawer.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    })
  );

  /* ── Scroll reveal ── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const siblings = [...e.target.parentElement.querySelectorAll('[data-reveal]')];
      const delay = siblings.indexOf(e.target) * 90;
      setTimeout(() => e.target.classList.add('on'), delay);
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-i__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-i');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-i.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-i__btn').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Testimonial card 3D tilt ── */
  document.querySelectorAll('.tc').forEach(card => {
    card.addEventListener('mouseenter', () => card.classList.add('tilting'));
    card.addEventListener('mouseleave', () => {
      card.classList.remove('tilting');
      card.style.transform = '';
    });
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = e.clientX - r.left;
      const y  = e.clientY - r.top;
      const cx = r.width  / 2;
      const cy = r.height / 2;
      const rotX = ((y - cy) / cy) * -9;
      const rotY = ((x - cx) / cx) *  9;
      const pctX = Math.round((x / r.width)  * 100);
      const pctY = Math.round((y / r.height) * 100);
      card.style.setProperty('--mx', pctX + '%');
      card.style.setProperty('--my', pctY + '%');
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-10px) scale(1.02)`;
    });
  });

  /* ── Cybernetic Grid Shader (hero background) ── */
  (function () {
    const container = document.getElementById('hero-shader');
    if (!container || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;';

    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock  = new THREE.Clock();

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    /* Brand-red cybernetic grid — transparent background */
    const fragmentShader = `
      precision highp float;
      uniform vec2  iResolution;
      uniform float iTime;
      uniform vec2  iMouse;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse           - 0.5 * iResolution.xy) / iResolution.y;

        float t         = iTime * 0.18;
        float mouseDist = length(uv - mouse);

        /* warp around mouse */
        float warp = sin(mouseDist * 18.0 - t * 4.0) * 0.08;
        warp *= smoothstep(0.45, 0.0, mouseDist);
        uv += warp;

        /* grid */
        vec2  gridUv = abs(fract(uv * 10.0) - 0.5);
        float line   = pow(1.0 - min(gridUv.x, gridUv.y), 55.0);

        /* brand red #E8193C = (0.910, 0.098, 0.235) */
        vec3 red   = vec3(0.910, 0.098, 0.235);
        vec3 color = red * line * (0.45 + sin(t * 2.0) * 0.18);

        /* energy pulses — deep orange-red */
        float energy = sin(uv.x * 20.0 + t * 5.0)
                     * sin(uv.y * 20.0 + t * 3.0);
        energy = smoothstep(0.78, 1.0, energy);
        color += vec3(1.0, 0.18, 0.04) * energy * line;

        /* mouse glow */
        float glow = smoothstep(0.12, 0.0, mouseDist);
        color += red * glow * 0.55;

        /* subtle noise */
        color += random(uv + t * 0.1) * 0.03;

        /* alpha: grid lines only — transparent everywhere else */
        float alpha = clamp(line * 0.65 + energy * line * 0.5 + glow * 0.25, 0.0, 0.75) * 0.75;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const uniforms = {
      iTime:       { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse:      { value: new THREE.Vector2(
                       window.innerWidth  / 2,
                       window.innerHeight / 2) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, uniforms, transparent: true
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    /* resize */
    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h);
    };
    window.addEventListener('resize', onResize, { passive: true });
    onResize();

    /* mouse */
    const heroSection = document.getElementById('home');
    const onMouseMove = (e) => {
      const rect = heroSection.getBoundingClientRect();
      uniforms.iMouse.value.set(
        e.clientX - rect.left,
        container.clientHeight - (e.clientY - rect.top)
      );
    };
    heroSection.addEventListener('mousemove', onMouseMove, { passive: true });

    /* animate */
    renderer.setAnimationLoop(() => {
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    });
  })();

  /* ── Smooth scroll with nav offset ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      window.scrollTo({ top: t.offsetTop - navH, behavior: 'smooth' });
    });
  });

  /* ── Custom cursor ── */
  (function () {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = -200, my = -200;
    let rx = -200, ry = -200;
    let rafPending = false;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
      if (!rafPending) { rafPending = true; requestAnimationFrame(tick); }
    }, { passive: true });

    function tick() {
      rafPending = false;
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) {
        rafPending = true;
        requestAnimationFrame(tick);
      }
    }

    /* Hover state */
    const hoverables = 'a, button, .btn, [role="button"], label, input, textarea, select';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverables)) {
        dot.classList.add('cursor--hover');
        ring.classList.add('cursor--hover');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverables)) {
        dot.classList.remove('cursor--hover');
        ring.classList.remove('cursor--hover');
      }
    });

    document.addEventListener('mousedown', () => ring.classList.add('cursor--click'));
    document.addEventListener('mouseup',   () => ring.classList.remove('cursor--click'));

    /* Hide cursor when it leaves the window */
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

    document.body.classList.add('cursor-ready');
  })();

  /* ── Global spotlight glow ── */
  (function () {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const spot = document.createElement('div');
    spot.className = 'cursor-spotlight';
    document.body.appendChild(spot);

    let sx = -400, sy = -400;
    let tx = -400, ty = -400;

    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });

    (function animSpot() {
      sx += (tx - sx) * 0.06;
      sy += (ty - sy) * 0.06;
      spot.style.left = sx + 'px';
      spot.style.top  = sy + 'px';
      requestAnimationFrame(animSpot);
    })();
  })();

  /* ── Magnetic large CTA buttons ── */
  (function () {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.btn-lg').forEach(btn => {
      const STRENGTH = 0.32;

      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = (e.clientX - cx) * STRENGTH;
        const dy = (e.clientY - cy) * STRENGTH;
        btn.style.transition = 'transform .15s ease, box-shadow .25s ease';
        btn.style.transform  = `translate(${dx}px, ${dy - 2}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1), box-shadow .25s ease';
        btn.style.transform  = '';
      });
    });
  })();

  /* ── Hero parallax on mouse ── */
  (function () {
    const hero = document.getElementById('home');
    if (!hero) return;

    const wm  = hero.querySelector('.hero__wm');
    const glA = hero.querySelector('.hero__glow-a');
    const glB = hero.querySelector('.hero__glow-b');

    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left  - r.width  / 2) / r.width;
      const y = (e.clientY - r.top   - r.height / 2) / r.height;

      if (wm)  wm.style.transform  = `translate(${x * -32}px, ${y * -20}px)`;
      if (glA) glA.style.transform = `translate(${x *  24}px, ${y *  16}px)`;
      if (glB) glB.style.transform = `translate(${x * -20}px, ${y *  24}px)`;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      if (wm)  wm.style.transform  = '';
      if (glA) glA.style.transform = '';
      if (glB) glB.style.transform = '';
    });
  })();
