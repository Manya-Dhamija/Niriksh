import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { parseTLE, getSatellitePosition } from '../utils/orbital.js'

const TRAIL_LENGTH = 80 // number of past positions to draw

export default function SatellitePoint({ tle1, tle2, color, name, isSelected, onClick }) {
  const meshRef = useRef()
  const trailRef = useRef()
  const trailPositions = useRef([])
  const satrec = useMemo(() => parseTLE(tle1, tle2), [tle1, tle2])
  const [hovered, setHovered] = useState(false)

  // Build trail geometry
  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(TRAIL_LENGTH * 3)
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame(() => {
    const pos = getSatellitePosition(satrec)
    if (!pos || !meshRef.current) return

    meshRef.current.position.set(pos.x, pos.y, pos.z)

    // Update trail
    trailPositions.current.push(new THREE.Vector3(pos.x, pos.y, pos.z))
    if (trailPositions.current.length > TRAIL_LENGTH) {
      trailPositions.current.shift()
    }

    // Write trail positions into buffer
    const posArr = trailGeometry.attributes.position.array
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const p = trailPositions.current[i]
      if (p) {
        posArr[i * 3] = p.x
        posArr[i * 3 + 1] = p.y
        posArr[i * 3 + 2] = p.z
      }
    }
    trailGeometry.attributes.position.needsUpdate = true
    trailGeometry.setDrawRange(0, trailPositions.current.length)
  })

  const satColor = new THREE.Color(color)
  const scale = isSelected ? 1.8 : hovered ? 1.4 : 1

  return (
    <group>
      {/* Orbit trail */}
      {(isSelected || hovered) && (
        <line geometry={trailGeometry}>
          <lineBasicMaterial color={color} transparent opacity={0.4} />
        </line>
      )}

      {/* Satellite mesh */}
      <mesh
        ref={meshRef}
        scale={scale}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color={satColor} />
      </mesh>

      {/* Glow ring for selected */}
      {isSelected && (
        <mesh ref={meshRef}>
          <ringGeometry args={[0.03, 0.05, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} side={2} />
        </mesh>
      )}

      {/* Hover label */}
      {(hovered || isSelected) && meshRef.current && (
        <Html position={meshRef.current.position.toArray()} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,10,20,0.85)',
            border: `1px solid ${color}`,
            color: color,
            padding: '3px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            fontFamily: 'Courier New, monospace',
            whiteSpace: 'nowrap',
            transform: 'translate(12px, -50%)',
          }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  )
}
