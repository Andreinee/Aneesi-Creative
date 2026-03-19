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
   CHATBOT
   ═══════════════════════════════════════════════════════ */
(function () {

  /* ── Knowledge base ── */
  const KB = [
    {
      keys: ['hello','hi','hey','good morning','good afternoon','good evening','howdy'],
      reply: "Hey there! Welcome to Aneesi Creative. I'm here to help with any questions about our services, process, or projects. What can I do for you?"
    },
    {
      keys: ['service','offer','do you','what can','help with','speciali'],
      reply: "We offer five core creative services:\n\n• **Brand Identity & Strategy** — naming, positioning, visual systems\n• **Website & Digital Design** — UX, UI, and web experiences\n• **Campaign & Content** — integrated creative campaigns\n• **Packaging & Print** — tactile, shelf-stopping design\n• **UI/UX & Product Design** — user-centred digital products\n\nWhich area are you most interested in?"
    },
    {
      keys: ['price','cost','rate','budget','how much','pricing','quote','package'],
      reply: "Every project is scoped to fit your goals and budget — we don't do one-size-fits-all pricing. We offer flexible packages whether you're a startup or an established brand.\n\nThe best next step is a quick discovery call where we can give you an accurate quote. Ready to start? → hello@aneesicreative.com"
    },
    {
      keys: ['contact','email','reach','get in touch','talk','speak','call','meet'],
      reply: "You can reach us at **hello@aneesicreative.com** or fill out the contact form on this page.\n\nWe typically respond within one business day. If you have an urgent brief, mention it in your message and we'll prioritise."
    },
    {
      keys: ['process','how do you work','workflow','steps','stage','approach','methodology'],
      reply: "Our process has seven stages:\n\n1. **Discovery** — understanding your brand and goals\n2. **Strategy** — positioning and creative direction\n3. **Concept** — initial creative directions\n4. **Design** — visual development and iteration\n5. **Craft** — final production and delivery\n6. **Launch** — deployment and handover\n7. **Evolve** — ongoing retainer support\n\nWant to know more about any specific stage?"
    },
    {
      keys: ['timeline','long','time','deadline','turnaround','fast','quick','urgent','when'],
      reply: "Project timelines vary by scope:\n\n• **Brand identity** — 3–6 weeks\n• **Website design** — 4–8 weeks\n• **Campaign** — 2–4 weeks\n• **Packaging** — 2–5 weeks\n\nWe can also accommodate urgent briefs — just let us know your deadline when you get in touch."
    },
    {
      keys: ['startup','new business','launch','entrepreneur','early stage','founder'],
      reply: "We love working with startups and founders. We offer pitch-ready design, brand identities built to scale, and flexible packages designed for growth-stage budgets.\n\nBuilding something new? Let's make it impossible to ignore."
    },
    {
      keys: ['portfolio','work','project','case study','example','previous','past','sample'],
      reply: "Our portfolio spans brand identity, web design, campaigns, packaging, and UI/UX across 8+ industries. You can browse selected work right here on our Work page.\n\nWant to see work relevant to your specific industry? Drop us an email at hello@aneesicreative.com."
    },
    {
      keys: ['location','based','where','country','city','remote','local','africa','ghana','nigeria','kenya','uk','usa'],
      reply: "We're a global creative studio working across 3 continents — with clients in Africa, Europe, and North America. We work remotely, collaborating seamlessly wherever you are in the world."
    },
    {
      keys: ['team','who','people','size','designer','staff'],
      reply: "Aneesi Creative is a focused studio of senior creatives — not a factory. Every project gets hands-on senior attention, not passed down to a junior. We bring in specialist partners when a project calls for it."
    },
    {
      keys: ['industry','sector','niche','type of client','who do you'],
      reply: "We've worked across 8+ industries including fintech, wellness, food & beverage, fashion, healthcare, tech, hospitality, and education. Bold design that works doesn't belong to just one sector."
    },
    {
      keys: ['retainer','ongoing','monthly','support','maintain','long term'],
      reply: "Yes — we offer ongoing retainer support for brands that need regular design, content, or campaign work. This gives you a dedicated creative partner without the overhead of an in-house team."
    },
    {
      keys: ['agency','white label','partner','overflow','outsource','subcontract'],
      reply: "We work with agencies too — offering white-label design support for overflow capacity, all under NDA. Reliable, brief-responsive, and built around your timelines."
    },
    {
      keys: ['thank','thanks','appreciate','great','perfect','awesome','brilliant','love it'],
      reply: "Always a pleasure. If there's anything else you need — briefs, quotes, or just a creative chat — we're here. Make it seen."
    },
    {
      keys: ['bye','goodbye','see you','later','take care','ciao'],
      reply: "Thanks for stopping by. When you're ready to make something remarkable, you know where to find us. — Aneesi Creative"
    }
  ];

  const FALLBACKS = [
    "That's a great question — the best person to answer it is our team directly. Reach us at hello@aneesicreative.com and we'll come back to you fast.",
    "I want to make sure you get the right answer on that. Send us a message at hello@aneesicreative.com and we'll give you a proper response.",
    "Good question. For anything specific like that, I'd recommend getting in touch directly — hello@aneesicreative.com. We're quick to respond."
  ];

  let fallbackIdx = 0;

  function getReply(input) {
    const lower = input.toLowerCase();
    for (const entry of KB) {
      if (entry.keys.some(k => lower.includes(k))) return entry.reply;
    }
    const reply = FALLBACKS[fallbackIdx % FALLBACKS.length];
    fallbackIdx++;
    return reply;
  }

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
          <p class="chat-head-sub">Typically replies in minutes</p>
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
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function botReply(text) {
    showTyping();
    setTimeout(() => addMsg(text, 'bot'), 900 + Math.random() * 400);
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
        botReply(getReply(label));
      });
      sugsEl.appendChild(btn);
    });
  }

  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    sugsEl.innerHTML = '';
    addMsg(text, 'user');
    botReply(getReply(text));
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

  /* ── Initial greeting ── */
  setTimeout(() => {
    botReply("Hey! Welcome to Aneesi Creative. Looking to start a project, or just want to learn more about what we do?");
    setTimeout(() => buildSugs(SUGS), 1400);
  }, 1200);

})();
