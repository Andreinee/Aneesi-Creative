  /* ── Icons ── */
  lucide.createIcons();

  /* ── Contact form ── */
  const contactForm = document.querySelector('.contact-sec__form');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn  = contactForm.querySelector('button[type="submit"]');
      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const phone = document.getElementById('cf-phone').value.trim();
      const message = document.getElementById('cf-message').value.trim();

      if (!name || !email || !message) {
        btn.textContent = 'Please fill required fields';
        btn.style.background = '#555';
        setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; }, 3000);
        return;
      }

      btn.textContent = 'Sending…';
      btn.disabled = true;

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, message }),
        });
        if (res.ok) {
          btn.textContent = 'Message Sent ✓';
          btn.style.background = '#16a34a';
          contactForm.reset();
        } else {
          throw new Error();
        }
      } catch {
        btn.textContent = 'Failed — try emailing us directly';
        btn.style.background = '#555';
      } finally {
        btn.disabled = false;
        setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; }, 5000);
      }
    });
  }

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

  /* ── Interactive 3D Geometric Element ── */
  (function () {
    const canvas = document.querySelector('.hero3d');
    if (!canvas || typeof THREE === 'undefined') return;

    const W = () => canvas.clientWidth  || 400;
    const H = () => canvas.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W(), H(), false);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100);
    camera.position.z = 6;

    /* Main icosahedron — brand red wireframe */
    const geo      = new THREE.IcosahedronGeometry(2, 1);
    const edgeGeo  = new THREE.EdgesGeometry(geo);
    const wireMat  = new THREE.LineBasicMaterial({ color: 0xE8193C, transparent: true, opacity: 0.88 });
    const wire     = new THREE.LineSegments(edgeGeo, wireMat);
    scene.add(wire);

    /* Dark inner face for depth */
    const fillMat  = new THREE.MeshBasicMaterial({ color: 0x080808, transparent: true, opacity: 0.72, side: THREE.BackSide });
    const fill     = new THREE.Mesh(geo, fillMat);
    fill.scale.setScalar(0.97);
    scene.add(fill);

    /* Outer glow halo */
    const halogeo  = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.14, 1));
    const haloMat  = new THREE.LineBasicMaterial({ color: 0xE8193C, transparent: true, opacity: 0.10 });
    const halo     = new THREE.LineSegments(halogeo, haloMat);
    scene.add(halo);

    /* Floating particles */
    const N   = 130;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r     = 2.9 + Math.random() * 2.1;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const ptMat = new THREE.PointsMaterial({ color: 0xE8193C, size: 0.045, transparent: true, opacity: 0.5 });
    const pts   = new THREE.Points(ptGeo, ptMat);
    scene.add(pts);

    /* Mouse tracking */
    let mx = 0, my = 0;
    let autoX = 0, autoY = 0;
    document.addEventListener('mousemove', e => {
      mx =  (e.clientX / window.innerWidth  - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    /* Animation loop */
    renderer.setAnimationLoop(() => {
      autoX += 0.0028;
      autoY += 0.0046;
      const tX = autoX + my * 0.38;
      const tY = autoY + mx * 0.38;
      wire.rotation.x  += (tX - wire.rotation.x)  * 0.045;
      wire.rotation.y  += (tY - wire.rotation.y)   * 0.045;
      fill.rotation.copy(wire.rotation);
      halo.rotation.copy(wire.rotation);
      pts.rotation.x    = wire.rotation.x * 0.22;
      pts.rotation.y    = wire.rotation.y * 0.22;
      renderer.render(scene, camera);
    });

    /* Scroll parallax — shape drifts and fades as page scrolls */
    window.addEventListener('scroll', () => {
      const progress = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      canvas.style.setProperty('--hero3d-scroll', `${progress * 120}px`);
      canvas.style.opacity = Math.max(0.08, 0.55 - progress * 0.45);
    }, { passive: true });

    /* Resize */
    window.addEventListener('resize', () => {
      renderer.setSize(W(), H(), false);
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
    }, { passive: true });
  })();

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

/* ═══════════════════════════════════════════════════════
   AI CHATBOT — powered by Claude (api/chat.js)
   ═══════════════════════════════════════════════════════ */
(function () {

  /* ── Conversation history (sent to API) ── */
  const history = [];

  /* ── Build DOM ── */
  const SUGS = ['Our services', 'Pricing & quotes', 'How you work', 'See our work', 'Get in touch'];

  const bubble = document.createElement('button');
  bubble.className = 'chat-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

  const notify = document.createElement('span');
  notify.className = 'chat-notify';
  notify.textContent = '1';
  bubble.appendChild(notify);

  const win = document.createElement('div');
  win.className = 'chat-window';
  win.setAttribute('aria-live', 'polite');
  win.innerHTML = `
    <div class="chat-head">
      <div class="chat-head-info">
        <span class="chat-status-dot"></span>
        <div>
          <p class="chat-head-name">Aneesi Creative</p>
          <p class="chat-head-sub">AI assistant — always online</p>
        </div>
      </div>
      <button class="chat-close" aria-label="Close chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="chat-msgs" id="chatMsgs"></div>
    <div class="chat-sugs" id="chatSugs"></div>
    <div class="chat-input-row">
      <input class="chat-input" id="chatInput" type="text" placeholder="Ask us anything\u2026" autocomplete="off" />
      <button class="chat-send-btn" id="chatSend" aria-label="Send message">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>`;

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  const msgs    = document.getElementById('chatMsgs');
  const sugsEl  = document.getElementById('chatSugs');
  const inputEl = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const closeBtn = win.querySelector('.chat-close');

  /* ── Helpers ── */
  function addMsg(text, who) {
    const typing = msgs.querySelector('.chat-typing');
    if (typing) typing.remove();

    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--' + who;
    el.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function buildSugs(list) {
    sugsEl.innerHTML = '';
    list.forEach(label => {
      const btn = document.createElement('button');
      btn.className = 'chat-sug';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        addMsg(label, 'user');
        sugsEl.innerHTML = '';
        sendToAI(label);
      });
      sugsEl.appendChild(btn);
    });
  }

  /* ── AI call ── */
  let isBusy = false;

  async function sendToAI(userText) {
    if (isBusy) return;
    isBusy = true;
    inputEl.disabled = true;
    sendBtn.disabled = true;

    history.push({ role: 'user', content: userText });
    showTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const errMsg = data.error || 'Something went wrong. Try emailing aneesicreative@gmail.com';
        addMsg(errMsg, 'bot');
      } else {
        addMsg(data.reply, 'bot');
        history.push({ role: 'assistant', content: data.reply });
      }
    } catch (_) {
      addMsg("Connection issue — please email us directly at aneesicreative@gmail.com", 'bot');
    }

    isBusy = false;
    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }

  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isBusy) return;
    inputEl.value = '';
    sugsEl.innerHTML = '';
    addMsg(text, 'user');
    sendToAI(text);
  }

  /* ── Open / close ── */
  let isOpen = false;

  function openChat() {
    isOpen = true;
    win.classList.add('open');
    bubble.classList.add('active');
    notify.style.display = 'none';
    inputEl.focus();
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('open');
    bubble.classList.remove('active');
  }

  bubble.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  /* ── Initial greeting (static — no API cost) ── */
  setTimeout(() => {
    const greeting = "Hey! Welcome to Aneesi Creative. I'm here to answer any questions about our services, process, or how to get started. What can I help you with?";
    addMsg(greeting, 'bot');
    history.push({ role: 'assistant', content: greeting });
    setTimeout(() => buildSugs(SUGS), 600);
  }, 1000);

})();
