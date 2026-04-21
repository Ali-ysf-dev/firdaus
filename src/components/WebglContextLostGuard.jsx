import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

/** `preventDefault` on `webglcontextlost` avoids some mobile browsers tearing down the whole tab. */
export default function WebglContextLostGuard() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    const onLost = (e) => e.preventDefault();
    el.addEventListener("webglcontextlost", onLost);
    return () => el.removeEventListener("webglcontextlost", onLost);
  }, [gl]);
  return null;
}
