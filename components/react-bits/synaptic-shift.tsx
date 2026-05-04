"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec3 uColor;
  uniform float uSpeed;
  uniform float uScale;
  uniform float uIntensity;
  uniform float uFalloff;
  uniform float uComplexity;

  varying vec2 vUv;

  mat2 rotate2D(float r) {
    return mat2(cos(r), sin(r), -sin(r), cos(r));
  }

  void main() {
    vec2 uv = (vUv * uResolution - 0.5 * uResolution) / uResolution.y;
    vec3 col = vec3(0.0);
    float t = uTime * uSpeed;

    vec2 n = vec2(0.0);
    vec2 q = vec2(0.0);
    vec2 N = vec2(0.0);
    vec2 p = uv + sin(t * 0.1) / 10.0;
    float S = 10.0 * uScale;

    mat2 m = rotate2D(1.0 - uPointer.x * 0.0001);

    for (float i = 0.0; i < 50.0; i++) {
      if (i >= uComplexity) break;
      float j = i + 1.0;
      p *= m;
      n *= m;
      q = p * S + j + n + t;
      n += sin(q);
      N += cos(q) / S;
      S *= uFalloff;
    }

    float brightness = pow((N.x + N.y + 0.2) + 0.005 / length(N), uIntensity);
    col = uColor * vec3(1.0, 2.0, 4.0) * brightness;

    float alpha = clamp(brightness, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

interface SceneProps {
  color: string;
  speed: number;
  scale: number;
  intensity: number;
  falloff: number;
  complexity: number;
  breathing: boolean;
}

const Scene: React.FC<SceneProps> = ({
  color,
  speed,
  scale,
  intensity,
  falloff,
  complexity,
  breathing,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport, pointer } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(color) },
      uSpeed: { value: speed },
      uScale: { value: scale },
      uIntensity: { value: intensity },
      uFalloff: { value: falloff },
      uComplexity: { value: complexity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uResolution.value.set(
        size.width,
        size.height,
      );
      materialRef.current.uniforms.uColor.value.set(color);
      materialRef.current.uniforms.uSpeed.value = speed;
      materialRef.current.uniforms.uScale.value = scale;
      materialRef.current.uniforms.uFalloff.value = falloff;
      materialRef.current.uniforms.uComplexity.value = complexity;

      if (breathing) {
        const breathEffect =
          Math.sin(state.clock.elapsedTime * 2.0) * 0.2 + 1.0;
        materialRef.current.uniforms.uIntensity.value =
          intensity * breathEffect;
      } else {
        materialRef.current.uniforms.uIntensity.value = intensity;
      }

      const targetX = pointer.x * size.width;
      const targetY = pointer.y * size.height;

      materialRef.current.uniforms.uPointer.value.x +=
        (targetX - materialRef.current.uniforms.uPointer.value.x) * 0.1;
      materialRef.current.uniforms.uPointer.value.y +=
        (targetY - materialRef.current.uniforms.uPointer.value.y) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export interface SynapticShiftProps {
  speed?: number;
  scale?: number;
  intensity?: number;
  color?: string;
  falloff?: number;
  complexity?: number;
  breathing?: boolean;
  className?: string;
}

const SynapticShift: React.FC<SynapticShiftProps> = ({
  speed = 0.5,
  scale = 0.5,
  intensity = 2,
  color = "#FF9FFC",
  falloff = 1.15,
  complexity = 10,
  breathing = false,
  className = "",
}) => {
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <Scene
          color={color}
          speed={speed}
          scale={scale}
          intensity={intensity}
          falloff={falloff}
          complexity={complexity}
          breathing={breathing}
        />
      </Canvas>
    </div>
  );
};

export default SynapticShift;
