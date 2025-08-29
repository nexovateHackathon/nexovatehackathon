"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, StatsGl, HemisphereLight } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CropType = "Box" | "Cylinder" | "Cone";

type CropPlot3DProps = {
  defaultLengthM?: number;
  defaultWidthM?: number;
  defaultCrop?: CropType;
  cellSizeM?: number; // meters per grid cell
  showStats?: boolean;
};

export function CropPlot3D({
  defaultLengthM = 20,
  defaultWidthM = 12,
  defaultCrop = "Box",
  cellSizeM = 1,
  showStats = false,
}: CropPlot3DProps) {
  const [lengthM, setLengthM] = useState<number>(defaultLengthM);
  const [widthM, setWidthM] = useState<number>(defaultWidthM);
  const [crop, setCrop] = useState<CropType>(defaultCrop);
  const [applied, setApplied] = useState({ lengthM, widthM, crop });
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);

  const applyChanges = () => setApplied({ lengthM, widthM, crop });

  const exportAsImage = () => {
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataURL = (canvas as HTMLCanvasElement).toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `crop-plot-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>3D Crop Plot</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={canvasWrapperRef} className="relative w-full aspect-video rounded-md overflow-hidden border bg-background">
              <Canvas
                camera={{ position: [Math.max(applied.lengthM, applied.widthM), Math.max(applied.lengthM, applied.widthM), Math.max(applied.lengthM, applied.widthM)], fov: 50 }}
                gl={{ preserveDrawingBuffer: true }}
              >
                <ambientLight intensity={0.4} />
                <hemisphereLight args={[0x88bbff, 0x443311, 0.5]} />
                <directionalLight position={[10, 20, 10]} intensity={1.1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                <OrbitControls makeDefault />
                <group position={[-applied.lengthM / 2, 0, -applied.widthM / 2]}>
                  <SoilPlane lengthM={applied.lengthM} widthM={applied.widthM} />
                  <PlotGrid lengthM={applied.lengthM} widthM={applied.widthM} cellSizeM={cellSizeM} />
                  <CropsInstanced lengthM={applied.lengthM} widthM={applied.widthM} cellSizeM={cellSizeM} crop={applied.crop} />
                </group>
                <Grid infiniteGrid cellSize={cellSizeM} sectionColor={new THREE.Color("#999")} cellColor={new THREE.Color("#bbb")} />
                {showStats && <StatsGl className="hidden lg:block" />}
              </Canvas>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={applyChanges}>Update Plot</Button>
              <Button variant="secondary" onClick={exportAsImage}>Export as Image</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Length (m)</label>
                <Input type="number" min={1} step={1} value={lengthM} onChange={(e) => setLengthM(Math.max(1, Number(e.target.value)))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Width (m)</label>
                <Input type="number" min={1} step={1} value={widthM} onChange={(e) => setWidthM(Math.max(1, Number(e.target.value)))} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Crop</label>
                <Select value={crop} onValueChange={(v) => setCrop(v as CropType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop placeholder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Box">Box (rows)</SelectItem>
                    <SelectItem value="Cylinder">Cylinder (stems)</SelectItem>
                    <SelectItem value="Cone">Cone (plants)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SoilPlane({ lengthM, widthM }: { lengthM: number; widthM: number }) {
  const geom = useMemo(() => new THREE.PlaneGeometry(lengthM, widthM, 64, 64), [lengthM, widthM]);
  // Subtle noise displacement for uneven soil
  const pos = (geom.attributes.position as THREE.BufferAttribute);
  for (let i = 0; i < pos.count; i++) {
    const y = (Math.sin(i * 0.13) + Math.cos(i * 0.15)) * 0.02;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color("#6b4f2d"), roughness: 0.95, metalness: 0.0, side: THREE.DoubleSide }), []);
  return (
    <mesh geometry={geom} material={mat} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
  );
}

function PlotGrid({ lengthM, widthM, cellSizeM }: { lengthM: number; widthM: number; cellSizeM: number }) {
  const lines: JSX.Element[] = [];
  const xCount = Math.floor(lengthM / cellSizeM);
  const zCount = Math.floor(widthM / cellSizeM);
  const color = new THREE.Color("#3b823b");
  for (let i = 0; i <= xCount; i++) {
    const x = i * cellSizeM;
    lines.push(
      <line key={`v-${i}`} position={[x, 0.001, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([0, 0, 0, 0, 0, widthM])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={1} />
      </line>
    );
  }
  for (let j = 0; j <= zCount; j++) {
    const z = j * cellSizeM;
    lines.push(
      <line key={`h-${j}`} position={[0, 0.001, z]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([0, 0, 0, lengthM, 0, 0])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={1} />
      </line>
    );
  }
  return <group>{lines}</group>;
}

function CropsInstanced({ lengthM, widthM, cellSizeM, crop }: { lengthM: number; widthM: number; cellSizeM: number; crop: CropType }) {
  return crop === "Box"
    ? <BoxCropsInstanced lengthM={lengthM} widthM={widthM} cellSizeM={cellSizeM} />
    : <StemLeafCropsInstanced lengthM={lengthM} widthM={widthM} cellSizeM={cellSizeM} />;
}

function BoxCropsInstanced({ lengthM, widthM, cellSizeM }: { lengthM: number; widthM: number; cellSizeM: number }) {
  const xCount = Math.floor(lengthM / cellSizeM);
  const zCount = Math.floor(widthM / cellSizeM);
  const count = Math.max(1, xCount * zCount);
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(0.45 * cellSizeM, 0.3 * cellSizeM, 0.45 * cellSizeM), [cellSizeM]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color("#2f7f2f") }), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    const d = new THREE.Object3D();
    let i = 0;
    for (let xi = 0; xi < xCount; xi++) {
      for (let zi = 0; zi < zCount; zi++) {
        const x = xi * cellSizeM + cellSizeM / 2;
        const z = zi * cellSizeM + cellSizeM / 2;
        d.position.set(x, 0.15 * cellSizeM, z);
        d.updateMatrix();
        ref.current.setMatrixAt(i, d.matrix);
        i++;
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [xCount, zCount, cellSizeM]);
  return <instancedMesh ref={ref} args={[boxGeometry, mat, count]} castShadow receiveShadow />;
}

function StemLeafCropsInstanced({ lengthM, widthM, cellSizeM }: { lengthM: number; widthM: number; cellSizeM: number }) {
  const xCount = Math.floor(lengthM / cellSizeM);
  const zCount = Math.floor(widthM / cellSizeM);
  const count = Math.max(1, xCount * zCount);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const stemColor = useMemo(() => new THREE.Color("#2e7d32"), []);
  const leafColor = useMemo(() => new THREE.Color("#43a047"), []);
  const stemGeometry = useMemo(() => new THREE.CylinderGeometry(0.08 * cellSizeM, 0.1 * cellSizeM, 0.9 * cellSizeM, 10), [cellSizeM]);
  const leafGeometry = useMemo(() => new THREE.ConeGeometry(0.22 * cellSizeM, 0.35 * cellSizeM, 8), [cellSizeM]);
  const stemMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: stemColor, roughness: 0.8 }), [stemColor]);
  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.6 }), [leafColor]);
  const stemsRef = useRef<THREE.InstancedMesh>(null);
  const leavesRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!stemsRef.current || !leavesRef.current) return;
    let i = 0;
    for (let xi = 0; xi < xCount; xi++) {
      for (let zi = 0; zi < zCount; zi++) {
        const x = xi * cellSizeM + cellSizeM / 2;
        const z = zi * cellSizeM + cellSizeM / 2;
        const sway = ((xi * 17 + zi * 13) % 100) / 100;
        const heightJitter = 0.85 + sway * 0.3;
        dummy.position.set(x, (0.45 * cellSizeM) * heightJitter, z);
        dummy.rotation.set(0, (xi * 0.07 + zi * 0.11) % (Math.PI * 2), (sway - 0.5) * 0.15);
        dummy.scale.set(1, heightJitter, 1);
        dummy.updateMatrix();
        stemsRef.current.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x, (0.9 * cellSizeM) * heightJitter, z);
        dummy.rotation.set(-Math.PI / 2 + (sway - 0.5) * 0.2, (xi * 0.15 + zi * 0.09) % (Math.PI * 2), 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        leavesRef.current.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    stemsRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
  }, [xCount, zCount, cellSizeM, dummy]);

  useFrame((state) => {
    if (!stemsRef.current || !leavesRef.current) return;
    const t = state.clock.getElapsedTime();
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    let i = 0;
    for (let xi = 0; xi < xCount; xi++) {
      for (let zi = 0; zi < zCount; zi++) {
        const x = xi * cellSizeM + cellSizeM / 2;
        const z = zi * cellSizeM + cellSizeM / 2;
        const sway = Math.sin(t * 0.8 + (xi + zi) * 0.15) * 0.07;
        v.set(x, 0.45 * cellSizeM, z);
        q.setFromEuler(new THREE.Euler(0, (xi * 0.07 + zi * 0.11) % (Math.PI * 2), sway));
        m.compose(v, q, new THREE.Vector3(1, 1, 1));
        stemsRef.current.setMatrixAt(i, m);
        v.set(x, 0.9 * cellSizeM, z);
        q.setFromEuler(new THREE.Euler(-Math.PI / 2 + sway * 0.5, (xi * 0.15 + zi * 0.09) % (Math.PI * 2), 0));
        m.compose(v, q, new THREE.Vector3(1, 1, 1));
        leavesRef.current.setMatrixAt(i, m);
        i++;
      }
    }
    stemsRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={stemsRef} args={[stemGeometry, stemMaterial, count]} castShadow receiveShadow />
      <instancedMesh ref={leavesRef} args={[leafGeometry, leafMaterial, count]} castShadow receiveShadow />
    </group>
  );
}

export default CropPlot3D;


