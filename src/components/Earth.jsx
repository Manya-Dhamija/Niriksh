import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

export default function Earth() {
  const meshRef = useRef()

  // Slow self-rotation (Earth rotates ~360° per 24h)
  // We do a very slight visual rotation for aesthetics
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.03
    }
  })

  return (
    <group>
      {/* Main Earth sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color="#1a6ea8"
          emissive="#0a2a44"
          specular="#4fc3f7"
          shininess={15}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.025, 32, 32]} />
        <meshPhongMaterial
          color="#4fc3f7"
          transparent
          opacity={0.08}
          side={2} /* THREE.DoubleSide */
        />
      </mesh>

      {/* Subtle grid lines to show curvature */}
      <mesh>
        <sphereGeometry args={[1.002, 18, 9]} />
        <meshBasicMaterial
          color="#1e3a5f"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  )
}
