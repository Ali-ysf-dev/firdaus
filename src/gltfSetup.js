import { useGLTF } from "@react-three/drei";
import { MODEL_URL, getDracoDecoderPath } from "./modelConstants.js";

useGLTF.setDecoderPath(getDracoDecoderPath());
/** Draco on; Meshopt off unless the asset ships EXT_meshopt_compression. */
useGLTF.preload(MODEL_URL, true, false);
