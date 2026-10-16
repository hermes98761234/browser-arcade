// Flight3D: three.js endless flight. Thread rings, dodge obstacles, gates and foes, collect pickups.
// World style comes from the theme/name: tunnel (cyber/neon/corridor), canyon (default), space, water (ocean/cave).
// three.js is imported dynamically so it lands in this engine's own lazy chunk.
import type * as T from 'three'
import { Bag, byDiff, clamp, isTouch, keys, vpad, type Engine } from '../kit'

type Kind = 'tunnel' | 'canyon' | 'space' | 'water'
interface Ring { m: T.Group; d: number; done: number; x: number; y: number }
interface Obst { m: T.Object3D; r: number; hz: number; shape: number; x: number; y: number; hit: boolean; spin: number; osc: number; ox: number; ph: number }
interface Gate { m: T.Mesh; x: number; y: number; hole: number; checked: boolean }
interface Pick { m: T.Sprite; x: number; y: number; got: boolean }

const BX = 11 // half-width of the flight area
const BY = 6.5

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const bag = new Bag()
    const k = keys()
    const host = env.host
    const blurb = `${env.name} ${env.desc}`.toLowerCase()
    const kind: Kind =
      t.id === 'space' || /space|asteroid|orbit|dogfight|satellite|solar|planet|galax|star/.test(blurb) ? 'space'
        : t.id === 'ocean' || mods.has('swim') || /ocean|underwater|cave|manta|whale|sea|reef/.test(blurb) ? 'water'
          : t.id === 'cyberpunk' || t.id === 'neon' || t.id === 'robot' || /tunnel|corridor|courier|cube|netrunner|firewall|data/.test(blurb) ? 'tunnel'
            : 'canyon'
    const dark = mods.has('dark') || /cave|night|dread/.test(blurb)
    const wind = mods.has('wind')
    const endless = mods.has('endless')
    const goal = endless ? 0 : byDiff(env, 5000, 7500, 10000)
    const baseSpeed = byDiff(env, 34, 40, 46) * (mods.has('fast') ? 1.25 : 1)
    const maxLives = byDiff(env, 4, 3, 2)

    // DOM root
    const root = document.createElement('div')
    root.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;touch-action:none;background:' + t.bg
    host.appendChild(root)
    const hud = document.createElement('div')
    hud.style.cssText = 'position:absolute;inset:0;pointer-events:none;font-family:"Press Start 2P",ui-monospace,monospace;color:#fff;text-shadow:0 2px 6px #000;z-index:2'
    const mkEl = (css: string) => {
      const e = document.createElement('div')
      e.style.cssText = 'position:absolute;' + css
      hud.appendChild(e)
      return e
    }
    const elLives = mkEl('left:12px;top:10px;font-size:clamp(12px,3vw,18px)')
    const elCombo = mkEl(`right:12px;top:10px;font-size:clamp(12px,3vw,18px);color:${t.accent2}`)
    const elBanner = mkEl('left:0;right:0;top:30%;text-align:center;font-size:clamp(14px,4vw,28px);opacity:0;transition:opacity .3s')
    const elHint = mkEl('left:0;right:0;bottom:70px;text-align:center;font-size:clamp(8px,2vw,11px)')
    const elBoost = mkEl(`left:12px;bottom:14px;width:110px;height:10px;background:rgba(0,0,0,.5);border-radius:5px;overflow:hidden`)
    const elBoostFill = document.createElement('div')
    elBoostFill.style.cssText = 'height:100%;width:100%;background:#fb923c'
    elBoost.appendChild(elBoostFill)
    const elFlash = mkEl('inset:0;background:' + t.danger + ';opacity:0')
    root.appendChild(hud)
    elHint.textContent = isTouch() ? 'DRAG TO STEER · ⚡ BOOST' : 'MOUSE OR ARROWS/WASD TO STEER · SPACE BOOST'
    elBanner.textContent = env.name.toUpperCase()
    elBanner.style.opacity = '1'
    const dispVpad = vpad(host, k, 'dpad', [{ action: 'a', label: '⚡' }])

    let dead = false
    let paused = false
    let raf = 0
    let cleanup = () => {}

    // --- state ---
    let dist = 0
    let speed = baseSpeed
    let score = 0
    let ringsGot = 0
    let combo = 0
    let lives = maxLives
    let invuln = 0
    let sector = 1
    let boost = 1
    let over = false
    let bannerT = 2
    let flash = 0
    let time = 0

    const importThree = import('three')
    importThree
      .then((THREE) => {
        if (dead) return
        let renderer: T.WebGLRenderer
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
        } catch {
          elBanner.textContent = 'WEBGL NOT AVAILABLE'
          elBanner.style.opacity = '1'
          bag.timeout(() => env.end({ score: 0, won: false, text: 'This game needs WebGL' }), 1800)
          return
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
        const cv = renderer.domElement
        cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
        root.insertBefore(cv, hud)
        const scene = new THREE.Scene()
        const bg = new THREE.Color(kind === 'canyon' ? t.bg2 : t.bg)
        scene.background = bg
        scene.fog = new THREE.Fog(bg, dark ? 8 : 25, dark ? 85 : 200)
        const cam = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, 400)
        scene.add(new THREE.AmbientLight(0xffffff, 0.75))
        const sun = new THREE.DirectionalLight(0xffffff, 1.1)
        sun.position.set(4, 10, 6)
        scene.add(sun)

        const col = (c: string) => new THREE.Color(c)
        const acc = col(t.accent)
        const acc2 = col(t.accent2)
        const resize = () => {
          const w = Math.max(10, root.clientWidth)
          const h = Math.max(10, root.clientHeight)
          renderer.setSize(w, h, false)
          cam.aspect = w / h
          cam.fov = w / h < 1 ? 85 : 72
          cam.updateProjectionMatrix()
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(root)

        // ---------- shared resources ----------
        const emojiTex = new Map<string, T.CanvasTexture>()
        const tex = (e: string) => {
          let x = emojiTex.get(e)
          if (!x) {
            const c = document.createElement('canvas')
            c.width = c.height = 128
            const g = c.getContext('2d')!
            g.font = '96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
            g.textAlign = 'center'
            g.textBaseline = 'middle'
            g.fillText(e, 64, 70)
            x = new THREE.CanvasTexture(c)
            emojiTex.set(e, x)
          }
          return x
        }
        const sprite = (e: string, s: number) => {
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(e), transparent: true, fog: true }))
          sp.scale.set(s, s, 1)
          return sp
        }
        const ringGeo = new THREE.TorusGeometry(3.2, 0.2, 10, 40)
        const haloGeo = new THREE.TorusGeometry(3.2, 0.7, 8, 40)
        const ringMat = new THREE.MeshBasicMaterial({ color: acc2 })
        const haloMat = new THREE.MeshBasicMaterial({ color: acc2, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })
        const doneMat = new THREE.MeshBasicMaterial({ color: col(t.good), transparent: true, opacity: 0.8 })
        const blockMats = t.blocks.map((c) => new THREE.MeshLambertMaterial({ color: col(c), emissive: col(c), emissiveIntensity: 0.18 }))
        const boxGeo = new THREE.BoxGeometry(2.6, 2.6, 2.6)
        const rockGeo = new THREE.IcosahedronGeometry(1.6, 0)
        const pillarGeo = new THREE.CylinderGeometry(0.9, 0.9, 16, 10)
        const gateShape = new THREE.Shape()
        gateShape.moveTo(-60, -40)
        gateShape.lineTo(60, -40)
        gateShape.lineTo(60, 40)
        gateShape.lineTo(-60, 40)
        gateShape.closePath()
        const hole = new THREE.Path()
        hole.absarc(0, 0, 4.6, 0, Math.PI * 2, true)
        gateShape.holes.push(hole)
        const gateGeo = new THREE.ExtrudeGeometry(gateShape, { depth: 1, bevelEnabled: false, curveSegments: 20 })
        const gateMat = new THREE.MeshLambertMaterial({ color: col(t.danger), emissive: col(t.danger), emissiveIntensity: 0.35 })
        const frameGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(BX * 2 + 8, BY * 2 + 6, 0.1))
        const frameMat = new THREE.LineBasicMaterial({ color: acc, transparent: true, opacity: 0.8 })

        // ---------- ship ----------
        const ship = new THREE.Group()
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.6, 8).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: acc, emissive: acc, emissiveIntensity: 0.25 }))
        const wing = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 1.1), new THREE.MeshLambertMaterial({ color: acc2, emissive: acc2, emissiveIntensity: 0.25 }))
        wing.position.z = 0.5
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.8), new THREE.MeshLambertMaterial({ color: acc2 }))
        fin.position.set(0, 0.35, 0.9)
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }))
        glow.position.z = 1.45
        const pilot = sprite(t.hero, 1.7)
        pilot.position.set(0, 0.95, 0.2)
        ship.add(body, wing, fin, glow, pilot)
        scene.add(ship)
        const shipPos = { x: 0, y: 0 }
        const aim = { x: 0, y: 0 }
        let usePointer = false

        // ---------- decor ----------
        const decor: T.Object3D[] = []
        const grid = new THREE.GridHelper(220, 44, acc, acc)
        const gm = grid.material as T.Material
        gm.transparent = true
        gm.opacity = 0.35
        grid.position.set(0, -BY - 2.5, -80)
        if (kind === 'canyon' || kind === 'water' || kind === 'tunnel') scene.add(grid)
        if (kind === 'tunnel') {
          const ceil = grid.clone()
          ceil.position.y = BY + 2.5
          scene.add(ceil)
        }
        const starCount = 420
        const starPos = new Float32Array(starCount * 3)
        const resetStar = (i: number, far: boolean) => {
          starPos[i * 3] = (Math.random() - 0.5) * 120
          starPos[i * 3 + 1] = (Math.random() - 0.5) * 70
          starPos[i * 3 + 2] = far ? -Math.random() * 220 : -220
        }
        for (let i = 0; i < starCount; i++) resetStar(i, true)
        const starGeo = new THREE.BufferGeometry()
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
        const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: kind === 'water' ? acc2 : 0xffffff, size: kind === 'water' ? 0.4 : 0.22, transparent: true, opacity: 0.8, fog: false }))
        scene.add(stars)
        if (kind === 'space') {
          const planet = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 24), new THREE.MeshLambertMaterial({ color: col(t.blocks[1]), emissive: col(t.blocks[1]), emissiveIntensity: 0.3 }))
          planet.position.set(-70, 20, -330)
          const ringP = new THREE.Mesh(new THREE.RingGeometry(55, 72, 48), new THREE.MeshBasicMaterial({ color: acc, side: THREE.DoubleSide, transparent: true, opacity: 0.4 }))
          ringP.rotation.x = 1.2
          planet.add(ringP)
          scene.add(planet)
        }
        // speed lines
        const LN = 70
        const linePos = new Float32Array(LN * 6)
        const lineXY = Array.from({ length: LN }, () => ({ x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 24, z: -Math.random() * 120 }))
        const lineGeo = new THREE.BufferGeometry()
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
        const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, fog: false }))
        lines.frustumCulled = false
        scene.add(lines)

        // ---------- world content ----------
        const rings: Ring[] = []
        const obsts: Obst[] = []
        const gates: Gate[] = []
        const picks: Pick[] = []
        const ph = [rng.range(0, 6), rng.range(0, 6), rng.range(0, 6), rng.range(0, 6)]
        const amp = () => byDiff(env, 0.55, 0.7, 0.85) + Math.min(0.25, sector * 0.04)
        const pathX = (d: number) => (Math.sin(d * 0.021 + ph[0]) * 0.7 + Math.sin(d * 0.047 + ph[1]) * 0.3) * BX * amp()
        const pathY = (d: number) => (Math.sin(d * 0.017 + ph[2]) * 0.6 + Math.sin(d * 0.039 + ph[3]) * 0.4) * BY * amp()
        let spawnD = 60
        let decorD = 0
        let step = 0

        const place = (o: T.Object3D, d: number, x: number, y: number) => o.position.set(x, y, -(d - dist))
        const spawnRing = (d: number) => {
          const g = new THREE.Group()
          g.add(new THREE.Mesh(ringGeo, ringMat), new THREE.Mesh(haloGeo, haloMat))
          const x = pathX(d)
          const y = pathY(d)
          place(g, d, x, y)
          scene.add(g)
          rings.push({ m: g, d, done: 0, x, y })
        }
        const spawnObst = (d: number) => {
          const r = Math.random()
          // shape: 0 circle, 1 horizontal bar, 2 vertical bar
          const shape = r >= 0.8 && kind !== 'space' ? (Math.random() < 0.5 ? 1 : 2) : 0
          for (let tries = 0; tries < 8; tries++) {
            const x = (Math.random() * 2 - 1) * BX * 1.05
            const y = (Math.random() * 2 - 1) * BY * 1.1
            let clear = true
            for (const dd of [d - 8, d, d + 8]) {
              const px = pathX(dd)
              const py = pathY(dd)
              if (shape === 0 && Math.hypot(x - px, y - py) < 4.8) clear = false
              if (shape === 1 && Math.abs(y - py) < 3.6) clear = false
              if (shape === 2 && Math.abs(x - px) < 3.6) clear = false
            }
            if (!clear) continue
            let m: T.Object3D
            let rad = 1.5
            let spin = 0
            let osc = 0
            const mat = blockMats[Math.floor(Math.random() * blockMats.length)]
            if (shape) {
              m = new THREE.Mesh(pillarGeo, mat)
              if (shape === 1) m.rotation.z = Math.PI / 2
              rad = 1
            } else if (r < 0.3 && kind !== 'space') {
              m = sprite(rng.pick(t.foes), 3.2)
              rad = 1.5
              osc = 2 + Math.random() * 3
            } else if (r < 0.55 || kind === 'space') {
              m = new THREE.Mesh(rockGeo, mat)
              const sc = 0.8 + Math.random() * 1.3
              m.scale.setScalar(sc)
              rad = 1.5 * sc
              spin = (Math.random() - 0.5) * 2
            } else {
              m = new THREE.Mesh(boxGeo, mat)
              spin = (Math.random() - 0.5) * 1.5
              rad = 1.8
            }
            place(m, d, x, y)
            scene.add(m)
            obsts.push({ m, r: rad, hz: rad, shape, x, y, hit: false, spin, osc, ox: x, ph: Math.random() * 6 })
            return
          }
        }
        const spawnGate = (d: number) => {
          const m = new THREE.Mesh(gateGeo, gateMat)
          const x = pathX(d)
          const y = pathY(d)
          place(m, d, x, y)
          scene.add(m)
          gates.push({ m, x, y, hole: 4.6, checked: false })
        }
        const spawnPick = (d: number) => {
          const m = sprite(rng.pick(t.items), 1.8)
          const x = pathX(d) + (Math.random() - 0.5) * 2
          const y = pathY(d) + (Math.random() - 0.5) * 2
          place(m, d, x, y)
          scene.add(m)
          picks.push({ m, x, y, got: false })
        }
        const spawnDecor = (d: number) => {
          if (kind === 'tunnel') {
            const f = new THREE.LineSegments(frameGeo, frameMat)
            place(f, d, 0, 0)
            scene.add(f)
            decor.push(f)
          } else if (kind === 'canyon') {
            for (const side of [-1, 1]) {
              const h = 14 + Math.random() * 30
              const w = 6 + Math.random() * 10
              const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8 + Math.random() * 6), blockMats[Math.floor(Math.random() * blockMats.length)])
              place(m, d, side * (BX + 8 + w / 2 + Math.random() * 10), -BY - 2.5 + h / 2 - 1, )
              scene.add(m)
              decor.push(m)
            }
          } else if (kind === 'water') {
            const m = new THREE.Mesh(new THREE.ConeGeometry(2 + Math.random() * 3, 6 + Math.random() * 10, 7), blockMats[Math.floor(Math.random() * blockMats.length)])
            place(m, d, (Math.random() < 0.5 ? -1 : 1) * (BX + 4 + Math.random() * 18), -BY - 2.5 + 3, )
            scene.add(m)
            decor.push(m)
          }
        }
        const dropObj = (o: T.Object3D) => {
          scene.remove(o)
          o.traverse((c) => {
            const mt = (c as T.Sprite).material as T.SpriteMaterial | undefined
            if ((c as T.Sprite).isSprite && mt) mt.dispose()
          })
        }

        const spawnAhead = () => {
          while (spawnD < dist + 230) {
            step++
            const d = spawnD
            spawnRing(d)
            spawnPick(d + 9)
            spawnPick(d + 17)
            const dens = Math.min(0.95, byDiff(env, 0.35, 0.5, 0.65) + sector * 0.06)
            if (step > 2) {
              if (step % 5 === 0 && sector >= 2) spawnGate(d + 13)
              else if (Math.random() < dens) spawnObst(d + 13)
              if (Math.random() < dens * 0.7) spawnObst(d + 22)
              if (sector >= 3 && Math.random() < 0.5) spawnObst(d + 5)
            }
            spawnD += 30
          }
          while (decorD < dist + 230) {
            spawnDecor(decorD)
            decorD += kind === 'tunnel' ? 14 : 20
          }
        }

        // ---------- helpers ----------
        const setBanner = (s: string, secs = 1.6) => {
          elBanner.textContent = s
          elBanner.style.opacity = '1'
          bannerT = secs
        }
        const hudUpdate = () => {
          elLives.textContent = '❤️'.repeat(Math.max(0, lives))
          elCombo.textContent = combo > 1 ? `x${combo}` : ''
          env.score(Math.round(score))
          env.status(`Sector ${sector} · ${'❤️'.repeat(Math.max(0, lives))} · ${Math.floor(dist)} m · ${ringsGot} rings`)
        }
        const finish = (won: boolean) => {
          if (over) return
          over = true
          env.sfx(won ? 'win' : 'lose')
          env.end({ score: Math.round(score), won, text: won ? `Course complete! ${ringsGot} rings` : `${Math.floor(dist)} m, ${ringsGot} rings, sector ${sector}` })
        }
        const hurt = () => {
          if (invuln > 0 || over) return
          lives--
          combo = 0
          invuln = 1.6
          flash = 0.4
          speed = Math.max(baseSpeed * 0.8, speed * 0.7)
          env.sfx('hit')
          camShake = 1
          hudUpdate()
          if (lives <= 0) finish(false)
        }
        let camShake = 0

        // ---------- input ----------
        const rect = () => root.getBoundingClientRect()
        let tStart: { x: number; y: number; ax: number; ay: number } | null = null
        const onMove = (e: PointerEvent) => {
          const r = rect()
          if (e.pointerType === 'mouse') {
            usePointer = true
            aim.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)
            aim.y = clamp(-(((e.clientY - r.top) / r.height) * 2 - 1), -1, 1)
          } else if (tStart) {
            usePointer = true
            aim.x = clamp(tStart.ax + ((e.clientX - tStart.x) / (r.width * 0.45)), -1, 1)
            aim.y = clamp(tStart.ay - ((e.clientY - tStart.y) / (r.height * 0.45)), -1, 1)
          }
        }
        const onDown = (e: PointerEvent) => {
          if (e.pointerType !== 'mouse') tStart = { x: e.clientX, y: e.clientY, ax: aim.x, ay: aim.y }
          else k.set('a', true)
        }
        const onUp = (e: PointerEvent) => {
          tStart = null
          if (e.pointerType === 'mouse') k.set('a', false)
        }
        bag.on(root, 'pointermove', onMove)
        bag.on(root, 'pointerdown', onDown)
        bag.on(root, 'pointerup', onUp)
        bag.on(root, 'pointercancel', onUp)
        root.addEventListener('contextmenu', (e) => e.preventDefault())

        // ---------- main loop ----------
        let last = performance.now()
        const tmpV = new THREE.Vector3()
        const frame = (now: number) => {
          if (dead) return
          raf = requestAnimationFrame(frame)
          const dt = Math.min(0.05, (now - last) / 1000)
          last = now
          if (!paused) tick(dt)
          renderer.render(scene, cam)
        }

        const tick = (dt: number) => {
          time += dt
          bannerT -= dt
          if (bannerT <= 0 && elBanner.style.opacity !== '0') elBanner.style.opacity = '0'
          if (time > 5) elHint.style.opacity = '0'
          flash = Math.max(0, flash - dt)
          elFlash.style.opacity = String(flash * 0.8)
          camShake = Math.max(0, camShake - dt * 2.5)
          if (!over) {
            invuln = Math.max(0, invuln - dt)
            // input
            const ax = k.axis()
            if (ax.x !== 0 || ax.y !== 0) {
              usePointer = false
              aim.x = clamp(aim.x + ax.x * dt * 1.9, -1, 1)
              aim.y = clamp(aim.y - ax.y * dt * 1.9, -1, 1)
            }
            const wantBoost = (k.down('a') || k.down('b')) && boost > 0.05
            boost = clamp(boost + (wantBoost ? -dt * 0.45 : dt * 0.12), 0, 1)
            const target = baseSpeed * (1 + Math.min(0.9, dist / 9000)) * (wantBoost ? 1.45 : 1)
            speed += (target - speed) * Math.min(1, dt * 1.6)
            dist += speed * dt
            score += speed * dt * 0.1
            if (goal && dist >= goal) finish(true)
            if (Math.floor(dist / 1500) + 1 > sector) {
              sector = Math.floor(dist / 1500) + 1
              setBanner(`SECTOR ${sector}`)
              env.sfx('power')
              hudUpdate()
            }
          }
          void usePointer
          // ship
          const tx = aim.x * BX
          const ty = aim.y * BY + (wind ? Math.sin(time * 0.8) * 1.2 : 0)
          const px = shipPos.x
          const py = shipPos.y
          const f = 1 - Math.exp(-8.5 * dt)
          shipPos.x += (tx - shipPos.x) * f
          shipPos.y += (ty - shipPos.y) * f
          const vx = (shipPos.x - px) / Math.max(dt, 0.001)
          const vy = (shipPos.y - py) / Math.max(dt, 0.001)
          ship.position.set(shipPos.x, shipPos.y, 0)
          ship.rotation.z += (-vx * 0.05 - ship.rotation.z) * Math.min(1, dt * 8)
          ship.rotation.x += (vy * 0.025 - ship.rotation.x) * Math.min(1, dt * 8)
          ship.rotation.y += (-vx * 0.015 - ship.rotation.y) * Math.min(1, dt * 8)
          ship.visible = invuln <= 0 || Math.floor(time * 18) % 2 === 0
          glow.scale.setScalar(1 + Math.sin(time * 40) * 0.15 + (k.down('a') ? 0.7 : 0))
          // camera
          cam.position.x += (shipPos.x * 0.6 - cam.position.x) * Math.min(1, dt * 6)
          cam.position.y += (shipPos.y * 0.6 + 2.4 - cam.position.y) * Math.min(1, dt * 6)
          cam.position.z = 7.5
          if (camShake > 0) {
            cam.position.x += (Math.random() - 0.5) * camShake * 0.8
            cam.position.y += (Math.random() - 0.5) * camShake * 0.8
          }
          tmpV.set(shipPos.x * 0.85, shipPos.y * 0.85, -22)
          cam.lookAt(tmpV)
          cam.rotation.z += -vx * 0.003
          const fov = (cam.aspect < 1 ? 85 : 72) + (speed / baseSpeed - 1) * 12
          if (Math.abs(cam.fov - fov) > 0.2) {
            cam.fov = fov
            cam.updateProjectionMatrix()
          }
          // world scroll
          spawnAhead()
          const dz = speed * dt
          const move = (o: T.Object3D) => (o.position.z += dz)
          for (let i = rings.length - 1; i >= 0; i--) {
            const r = rings[i]
            const prev = r.m.position.z
            move(r.m)
            if (r.done > 0) {
              r.done += dt
              r.m.scale.setScalar(1 + r.done * 1.4)
              ;(r.m.children[0] as T.Mesh).material = doneMat
              ;(r.m.children[1] as T.Mesh).visible = false
              if (r.done > 0.6) r.m.visible = false
            } else if (prev < 0 && r.m.position.z >= 0 && !over) {
              const d = Math.hypot(r.x - shipPos.x, r.y - shipPos.y)
              if (d < 3.4) {
                r.done = 0.001
                ringsGot++
                combo++
                score += 100 * Math.min(combo, 10)
                env.sfx('point')
                if (combo > 0 && combo % 5 === 0) setBanner(`${combo} IN A ROW!`, 1.1)
                hudUpdate()
              } else {
                if (combo > 2) setBanner('MISSED!', 0.8)
                combo = 0
                r.done = -1
                hudUpdate()
              }
            }
            r.m.rotation.z += dt * 0.5
            if (r.m.position.z > 14) {
              dropObj(r.m)
              rings.splice(i, 1)
            }
          }
          for (let i = obsts.length - 1; i >= 0; i--) {
            const o = obsts[i]
            move(o.m)
            if (o.spin) {
              o.m.rotation.x += o.spin * dt
              o.m.rotation.y += o.spin * 0.7 * dt
            }
            if (o.osc) {
              o.x = o.ox + Math.sin(time * 1.4 + o.ph) * o.osc
              o.m.position.x = o.x
            }
            const z = o.m.position.z
            if (!o.hit && !over && Math.abs(z) < o.hz + 0.9) {
              const ex = o.x - shipPos.x
              const ey = o.y - shipPos.y
              const dd = o.shape === 1 ? Math.abs(ey) < o.r + 0.85 && Math.abs(ex) < 8.9 : o.shape === 2 ? Math.abs(ex) < o.r + 0.85 && Math.abs(ey) < 8.9 : Math.hypot(ex, ey) < o.r + 0.85
              if (dd) {
                o.hit = true
                hurt()
              }
            }
            if (z > 14) {
              dropObj(o.m)
              obsts.splice(i, 1)
            }
          }
          for (let i = gates.length - 1; i >= 0; i--) {
            const g = gates[i]
            move(g.m)
            const z = g.m.position.z
            if (!g.checked && z > -0.2 && z < 1.3 && !over) {
              g.checked = true
              if (Math.hypot(g.x - shipPos.x, g.y - shipPos.y) > g.hole - 0.8) hurt()
              else {
                score += 50
                env.sfx('move')
              }
            }
            if (z > 14) {
              dropObj(g.m)
              gates.splice(i, 1)
            }
          }
          for (let i = picks.length - 1; i >= 0; i--) {
            const p = picks[i]
            move(p.m)
            p.m.position.y = p.y + Math.sin(time * 4 + i) * 0.25
            if (!p.got && Math.abs(p.m.position.z) < 1.2 && Math.hypot(p.x - shipPos.x, p.y - shipPos.y) < 1.8 && !over) {
              p.got = true
              p.m.visible = false
              score += 25
              boost = Math.min(1, boost + 0.06)
              env.sfx('click')
            }
            if (p.m.position.z > 14) {
              dropObj(p.m)
              picks.splice(i, 1)
            }
          }
          for (let i = decor.length - 1; i >= 0; i--) {
            move(decor[i])
            if (decor[i].position.z > 20) {
              scene.remove(decor[i])
              const m = decor[i] as T.Mesh
              if (m.geometry && m.geometry !== frameGeo) m.geometry.dispose()
              decor.splice(i, 1)
            }
          }
          // grid scroll
          grid.position.z = -80 + (dist % 5)
          const sp = starGeo.attributes.position as T.BufferAttribute
          for (let i = 0; i < starCount; i++) {
            starPos[i * 3 + 2] += dz * (kind === 'space' ? 0.5 : 0.9)
            if (kind === 'water') starPos[i * 3 + 1] += dt * 2
            if (starPos[i * 3 + 2] > 12) resetStar(i, false)
          }
          sp.needsUpdate = true
          // speed lines
          const lp = lineGeo.attributes.position as T.BufferAttribute
          const len = 1 + speed * 0.07
          for (let i = 0; i < LN; i++) {
            const l = lineXY[i]
            l.z += dz * 1.3
            if (l.z > 8) {
              l.z = -120
              l.x = (Math.random() - 0.5) * 44
              l.y = (Math.random() - 0.5) * 26
            }
            linePos[i * 6] = l.x
            linePos[i * 6 + 1] = l.y
            linePos[i * 6 + 2] = l.z
            linePos[i * 6 + 3] = l.x
            linePos[i * 6 + 4] = l.y
            linePos[i * 6 + 5] = l.z - len * (1 + (k.down('a') ? 1.2 : 0))
          }
          lp.needsUpdate = true
          elBoostFill.style.width = `${boost * 100}%`
        }

        hudUpdate()
        raf = requestAnimationFrame(frame)
        cleanup = () => {
          cancelAnimationFrame(raf)
          ro.disconnect()
          for (const x of emojiTex.values()) x.dispose()
          for (const g of [ringGeo, haloGeo, boxGeo, rockGeo, pillarGeo, gateGeo, frameGeo, starGeo, lineGeo]) g.dispose()
          for (const mm of [ringMat, haloMat, doneMat, gateMat, frameMat, ...blockMats]) mm.dispose()
          renderer.dispose()
          renderer.forceContextLoss()
          cv.remove()
        }
      })
      .catch(() => {
        elBanner.textContent = 'COULD NOT LOAD 3D'
        elBanner.style.opacity = '1'
      })

    return {
      pause(p) {
        paused = p
      },
      destroy() {
        dead = true
        cleanup()
        k.dispose()
        bag.dispose()
        dispVpad()
        root.remove()
      },
    }
  },
}

export default engine
