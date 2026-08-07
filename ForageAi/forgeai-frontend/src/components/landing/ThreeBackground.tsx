"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scene = new THREE.Scene()
    
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const points: THREE.Mesh[] = []
    const group = new THREE.Group()
    const particleCount = 200
    const radius = 5

    // Neural Network Nodes
    const geometry = new THREE.SphereGeometry(0.08, 16, 16)
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x4F46E5, 
        emissive: 0x4F46E5, 
        emissiveIntensity: 0.5,
        shininess: 100 
    })

    for (let i = 0; i < particleCount; i++) {
        const node = new THREE.Mesh(geometry, material)
        const phi = Math.acos(-1 + (2 * i) / particleCount)
        const theta = Math.sqrt(particleCount * Math.PI) * phi
        
        node.position.set(
            radius * Math.cos(theta) * Math.sin(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(phi)
        )
        group.add(node)
        points.push(node)
    }

    // Connections (Lines)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4F46E5, transparent: true, opacity: 0.1 })
    for (let i = 0; i < points.length; i++) {
        const nearest = points.slice().sort((a, b) => a.position.distanceTo(points[i].position) - b.position.distanceTo(points[i].position)).slice(1, 4)
        nearest.forEach(n => {
            const lineGeom = new THREE.BufferGeometry().setFromPoints([points[i].position, n.position])
            const line = new THREE.Line(lineGeom, lineMaterial)
            group.add(line)
        })
    }

    scene.add(group)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const pointLight = new THREE.PointLight(0x8B5CF6, 2)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    camera.position.z = 12

    let mouseX = 0, mouseY = 0
    
    const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX - window.innerWidth / 2) / 100
        mouseY = (e.clientY - window.innerHeight / 2) / 100
    }
    
    window.addEventListener('mousemove', handleMouseMove)

    let animationFrameId: number

    function animate() {
        animationFrameId = requestAnimationFrame(animate)
        group.rotation.y += 0.002
        group.rotation.x += 0.001
        
        group.position.x += (mouseX - group.position.x) * 0.05
        group.position.y += (-mouseY - group.position.y) * 0.05
        
        renderer.render(scene, camera)
    }

    const handleResize = () => {
        const w = container.clientWidth || window.innerWidth
        const h = container.clientHeight || window.innerHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)
    
    animate()

    return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('resize', handleResize)
        cancelAnimationFrame(animationFrameId)
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement)
        }
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full z-0 overflow-hidden rounded-xl" 
      style={{ opacity: 0.8 }} 
    />
  )
}
