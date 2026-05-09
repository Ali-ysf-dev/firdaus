import { useGLTF } from '@react-three/drei'

const MODEL_URL = '/models/model1.glb'
const DRACO_DECODER_PATH = '/draco/'

function Carpet1(props) {
  const { nodes, materials } = useGLTF(MODEL_URL, DRACO_DECODER_PATH)

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.foam.geometry}
        material={materials['Material.001']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.front_texture.geometry}
        material={materials['front model texture']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.back_texture.geometry}
        material={materials['Material.004']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.display.geometry}
        material={
          materials['tripo_mat_93f5d5d4-b371-4a7f-9c7e-aabf3af89880.001']
        }
        position={[0, 12, 0.15]}
        rotation={[Math.PI / 2, -1.553, Math.PI / 2]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.sensor_icon_transparent.geometry}
        material={materials.sensor_icon_transparent}
        position={[0, 11, 0.18]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

useGLTF.preload(MODEL_URL, DRACO_DECODER_PATH)

export { Carpet1 }
