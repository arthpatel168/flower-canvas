import * as THREE from 'https://cdn.skypack.dev/three@0.133.1/build/three.module'

const canvas = document.getElementById('canvas')
const cleanBtn = document.querySelector('.clean-btn')

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const sceneA = new THREE.Scene()
const sceneB = new THREE.Scene()
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
const clock = new THREE.Clock()

let rt1, rt2

const pointer = { x: 0.5, y: 0.5, clicked: false }

const shaderMat = new THREE.ShaderMaterial({
    uniforms: {
        u_ratio: { value: 1 },
        u_cursor: { value: new THREE.Vector2() },
        u_stop_time: { value: 0 },
        u_stop_randomizer: { value: new THREE.Vector2() },
        u_texture: { value: null },
        u_clean: { value: 1 }
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
})

const basicMat = new THREE.MeshBasicMaterial()
const geo = new THREE.PlaneGeometry(2, 2)

sceneA.add(new THREE.Mesh(geo, shaderMat))
sceneB.add(new THREE.Mesh(geo, basicMat))

function resize() {
    const w = window.innerWidth
    const h = window.innerHeight

    renderer.setSize(w, h)
    shaderMat.uniforms.u_ratio.value = w / h

    if (rt1) rt1.dispose()
    if (rt2) rt2.dispose()

    rt1 = new THREE.WebGLRenderTarget(w, h)
    rt2 = new THREE.WebGLRenderTarget(w, h)

    renderer.setRenderTarget(rt1)
    renderer.setClearColor(0x000000, 1)
    renderer.clear()

    renderer.setRenderTarget(rt2)
    renderer.clear()

    renderer.setRenderTarget(null)

    shaderMat.uniforms.u_texture.value = rt1.texture
}
resize()
window.addEventListener('resize', resize)

window.addEventListener('click', e => {
    pointer.x = e.clientX / window.innerWidth
    pointer.y = e.clientY / window.innerHeight
    pointer.clicked = true
})

cleanBtn.onclick = () => {
    shaderMat.uniforms.u_clean.value = 0
    setTimeout(() => shaderMat.uniforms.u_clean.value = 1, 60)
}

function animate() {
    shaderMat.uniforms.u_stop_time.value += clock.getDelta()

    if (pointer.clicked) {
        shaderMat.uniforms.u_cursor.value.set(pointer.x, 1 - pointer.y)
        shaderMat.uniforms.u_stop_randomizer.value.set(Math.random(), Math.random())
        shaderMat.uniforms.u_stop_time.value = 0
        pointer.clicked = false
    }

    renderer.setRenderTarget(rt2)
    renderer.render(sceneA, camera)

    basicMat.map = rt2.texture
    renderer.setRenderTarget(null)
    renderer.render(sceneB, camera)

    ;[rt1, rt2] = [rt2, rt1]
    shaderMat.uniforms.u_texture.value = rt1.texture

    requestAnimationFrame(animate)
}
animate()
