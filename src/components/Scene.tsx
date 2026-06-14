import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Html, RoundedBox, Cylinder, Plane, Text, ContactShadows, SpotLight } from "@react-three/drei";
import * as THREE from "three";
import { useAppContext } from "../AppContext";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const ScreenContent = ({ position }: { position: [number, number, number] }) => {
    const { deviceState, recordingTime } = useAppContext();
    const htmlContainerRef = useRef<HTMLDivElement>(null);
    
    useFrame(({ camera }) => {
        if (htmlContainerRef.current) {
            const isVisible = camera.position.z > 0.2;
            const tgtOpacity = isVisible ? '1' : '0';
            const tgtPointerEvents = isVisible ? 'auto' : 'none';
            if (htmlContainerRef.current.style.opacity !== tgtOpacity) {
                htmlContainerRef.current.style.opacity = tgtOpacity;
                htmlContainerRef.current.style.pointerEvents = tgtPointerEvents;
            }
        }
    });
    
    return (
        <Plane args={[2.0, 1.5]} position={position}>
            <meshStandardMaterial
                color={deviceState === "off" ? "#090a0b" : "#031206"}
                emissive={deviceState === "off" ? "#000000" : "#0b3b18"}
                emissiveIntensity={deviceState === "off" ? 0 : 0.65}
                roughness={0.28}
            />
            <Html transform distanceFactor={5} position={[0, 0, 0.005]} style={{ width: '200px', height: '150px' }}>
               <div ref={htmlContainerRef} className="w-full h-full p-[8px] flex flex-col justify-between overflow-hidden transition-all duration-300" 
                    style={{ 
                        fontFamily: "'Courier New', Courier, monospace", 
                        filter: 'drop-shadow(0 0 4px rgba(74, 222, 128, 0.8))', 
                        color: '#4ade80',
                        background: deviceState === "off" ? 'transparent' : '#031206',
                        visibility: deviceState === "off" ? 'hidden' : 'visible'
                    }}>
                   {deviceState === "booting" && (
                       <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                           <div className="text-[22px] font-black tracking-[0.2em] animate-pulse">BEETECH</div>
                           <div className="w-24 h-[2px] overflow-hidden bg-[#4ade80]/20">
                               <div className="h-full bg-[#4ade80] animate-[pulse_0.8s_ease-in-out_infinite]"></div>
                           </div>
                           <div className="text-[10px] tracking-[0.28em] text-[#4ade80]/70">POWERING ON</div>
                       </div>
                   )}
                   {deviceState === "idle" && (
                       <div className="w-full h-full flex flex-col text-[12px] leading-tight font-bold">
                           <div className="flex justify-between items-center mb-1">
                               <span>002 000:00:00</span>
                               <div className="w-7 h-3.5 border border-[#4ade80] flex items-center p-[1px] relative">
                                   <div className="w-[80%] h-full bg-[#4ade80]"></div>
                                   <div className="absolute -right-[3px] top-[2px] w-[2px] h-[7px] bg-[#4ade80]"></div>
                               </div>
                           </div>
                           <div className="text-[#4ade80]/80 text-[13px]">003 036:22:06</div>
                           <div className="text-center mt-1 text-[16px] tracking-wider">20042026044552</div>
                           
                           <div className="flex-1 flex items-end opacity-80 pt-1 pb-1">
                               <div className="flex items-center text-[12px] bg-[#4ade80]/20 px-1 border border-[#4ade80]/50">
                                   <div className="font-sans mr-1">🎵</div>
                                   <span>512 WAV</span>
                               </div>
                           </div>
                       </div>
                   )}
                   {deviceState === "recording" && (
                       <div className="w-full h-full flex flex-col">
                           <div className="flex justify-between items-center text-[12px] mb-1 font-bold">
                               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border border-red-500 bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)] animate-pulse"></div> REC</span>
                               <span>[HQ 384K]</span>
                           </div>
                           <div className="flex-1 flex flex-col items-center justify-center">
                               <div className="text-[40px] font-bold tracking-wider leading-none">
                                   {formatTime(recordingTime)}
                               </div>
                           </div>
                       </div>
                   )}
                   {deviceState === "playing" && (
                       <div className="w-full h-full flex flex-col">
                           <div className="flex justify-between items-center text-[12px] mb-1 font-bold">
                               <span>► PLAYING</span>
                               <div className="flex items-end gap-[2px] h-3.5">
                                   <div className="w-1.5 bg-[#4ade80] h-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                                   <div className="w-1.5 bg-[#4ade80] h-[60%] animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                                   <div className="w-1.5 bg-[#4ade80] h-[80%] animate-[pulse_0.8s_ease-in-out_infinite]"></div>
                               </div>
                           </div>
                           <div className="flex-1 flex flex-col items-center justify-center">
                               <div className="text-[40px] font-bold tracking-wider leading-none">
                                   {formatTime(recordingTime)}
                               </div>
                           </div>
                       </div>
                   )}
               </div>
            </Html>
        </Plane>
    );
};

interface HotspotProps {
    position: [number, number, number];
    label: string;
    description: string;
    id: string;
}

const Hotspot = ({ position, label, description, id }: HotspotProps) => {
    const { activeHotspot, setActiveHotspot, language } = useAppContext();
    const isActive = activeHotspot === id;
    
    const groupRef = useRef<THREE.Group>(null);
    const htmlRef = useRef<HTMLDivElement>(null);

    useFrame(({ camera }) => {
        if (groupRef.current && htmlRef.current) {
            const normal = new THREE.Vector3(0, 0, 1).transformDirection(groupRef.current.matrixWorld);
            const target = new THREE.Vector3();
            groupRef.current.getWorldPosition(target);
            const viewDir = new THREE.Vector3().subVectors(camera.position, target).normalize();
            
            const isVisible = normal.dot(viewDir) > 0.15;
            const tgtOpacity = isVisible ? '1' : '0';
            
            if (htmlRef.current.style.opacity !== tgtOpacity) {
                htmlRef.current.style.opacity = tgtOpacity;
                htmlRef.current.style.pointerEvents = isVisible ? 'auto' : 'none';
            }
        }
    });

    const isHe = language === 'he';
    
    return (
        <group ref={groupRef} position={position}>
            <Html center zIndexRange={[100, 0]}>
                <div ref={htmlRef}
                    className="relative transition-opacity duration-200"
                    onPointerEnter={() => setActiveHotspot(id)}
                    onPointerLeave={() => setActiveHotspot(null)}
                >
                    <div className={`absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none ${isHe ? 'flex-row-reverse right-0' : 'flex-row left-0'}`}>
                        {/* Connecting Line */}
                        <div className={`h-[1px] bg-[#4ade80] origin-[${isHe ? 'right' : 'left'}] transition-all duration-500 ease-out ${isActive ? 'w-16 md:w-32 opacity-100 scale-x-100' : 'w-8 md:w-16 opacity-0 md:opacity-30 scale-x-100'}`}></div>
                        
                        {/* Label Container */}
                        <div className={`transition-all duration-300 ease-in-out whitespace-nowrap ml-2 mr-2 ${isActive ? 'opacity-100 transform-none text-[#4ade80]' : 'opacity-0 md:opacity-60 scale-95 text-white/50'}`}>
                            <div className="font-mono tracking-widest uppercase text-[13px] md:text-[15px] font-bold">
                                {label}
                            </div>
                        </div>
                    </div>
                </div>
            </Html>
        </group>
    );
};

const PowerSwitch = () => {
    const { deviceState, setPower } = useAppContext();
    const controls = useThree((state) => state.controls) as unknown as { enabled: boolean } | undefined;
    const groupRef = useRef<THREE.Group>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const startMeshY = useRef(0);
    const movedDuringDrag = useRef(false);

    useFrame(() => {
        if (groupRef.current && !isDragging) {
            const targetY = deviceState !== "off" ? 0.34 : -0.34;
            groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.18;
        }
    });

    const handlePointerDown = (e: any) => {
        e.stopPropagation();
        setIsDragging(true);
        movedDuringDrag.current = false;
        dragStartY.current = e.point.y;
        startMeshY.current = groupRef.current?.position.y || -0.34;
        if (controls) controls.enabled = false;
        e.target.setPointerCapture(e.pointerId);
        document.body.style.cursor = 'ns-resize';
    };

    const handlePointerMove = (e: any) => {
        if (!isDragging || !groupRef.current) return;
        e.stopPropagation();
        const deltaY = e.point.y - dragStartY.current;
        if (Math.abs(deltaY) > 0.02) {
            movedDuringDrag.current = true;
        }
        let newY = startMeshY.current + deltaY;
        newY = Math.max(-0.34, Math.min(0.34, newY));
        groupRef.current.position.y = newY;
    };

    const handlePointerUp = (e: any) => {
        if (!isDragging) return;
        e.stopPropagation();
        setIsDragging(false);
        e.target.releasePointerCapture(e.pointerId);
        if (controls) controls.enabled = true;
        document.body.style.cursor = 'auto';
        
        if (movedDuringDrag.current && groupRef.current) {
            setPower(groupRef.current.position.y > 0);
        }
    };

    const handleClick = (e: any) => {
        e.stopPropagation();
        setIsDragging(false);
        if (controls) controls.enabled = true;
        document.body.style.cursor = 'auto';
        if (!movedDuringDrag.current) {
            setPower(deviceState === 'off');
        }
    };

    const handlePointerCancel = () => {
        setIsDragging(false);
        if (controls) controls.enabled = true;
        document.body.style.cursor = 'auto';
    };

    return (
        <group 
            position={[0, -2.2, 0]} 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerEnter={() => document.body.style.cursor = 'ns-resize'}
            onPointerLeave={() => document.body.style.cursor = 'auto'}
            onClick={handleClick}
        >
            <RoundedBox args={[0.34, 1.32, 0.07]} radius={0.16} smoothness={16}>
                <meshStandardMaterial color="#090b0d" roughness={0.35} metalness={0.75} />
            </RoundedBox>
            <RoundedBox args={[0.22, 1.0, 0.025]} radius={0.1} smoothness={12} position={[0, 0, 0.05]}>
                <meshStandardMaterial color="#020304" roughness={0.8} />
            </RoundedBox>

            <Plane args={[1.25, 2.15]} position={[0, 0, 0.09]}>
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </Plane>
            
            {/* The animated physical switch */}
            <group ref={groupRef} position={[0, -0.34, 0.07]} scale={[1, 1, 1]} rotation={[0, 0, 0]}>
                {/* Switch base */}
                <RoundedBox args={[0.26, 0.38, 0.1]} radius={0.06} smoothness={16} position={[0, 0, 0]}>
                    <meshStandardMaterial
                        color={deviceState === "off" ? "#d8dde3" : "#f8fafc"}
                        emissive={deviceState === "off" ? "#000000" : "#4ade80"}
                        emissiveIntensity={deviceState === "off" ? 0 : 0.12}
                        roughness={0.25}
                        metalness={0.95}
                    />
                </RoundedBox>
                {/* Grip ridges */}
                <Cylinder args={[0.015, 0.015, 0.18, 8]} rotation={[0, 0, Math.PI/2]} position={[0, 0.05, 0.04]}>
                    <meshStandardMaterial color="#94a3b8" />
                </Cylinder>
                <Cylinder args={[0.015, 0.015, 0.18, 8]} rotation={[0, 0, Math.PI/2]} position={[0, 0, 0.04]}>
                    <meshStandardMaterial color="#94a3b8" />
                </Cylinder>
                <Cylinder args={[0.015, 0.015, 0.18, 8]} rotation={[0, 0, Math.PI/2]} position={[0, -0.05, 0.04]}>
                    <meshStandardMaterial color="#94a3b8" />
                </Cylinder>
            </group>

            <Text position={[0, 0.88, 0.065]} rotation={[0, 0, -Math.PI/2]} fontSize={0.12} color="#4ade80" anchorX="center" anchorY="middle">ON</Text>
            <Text position={[0, -0.88, 0.065]} rotation={[0, 0, -Math.PI/2]} fontSize={0.12} color="#a3a3a3" anchorX="center" anchorY="middle">OFF</Text>
            <Text position={[0, -1.1, 0.06]} rotation={[0, 0, -Math.PI/2]} fontSize={0.10} color="#777" anchorX="center" anchorY="middle">POWER</Text>
        </group>
    );
};

const PressableDeviceButton = ({ position, onClick, disabled, children }: { position: [number, number, number], onClick: () => void, disabled?: boolean, children: React.ReactNode }) => {
    const groupRef = useRef<THREE.Group>(null);

    const handlePointerDown = (e: any) => {
        e.stopPropagation();
        if (!disabled && groupRef.current) {
            groupRef.current.scale.set(0.9, 0.9, 0.9);
        }
    };

    const handlePointerUp = (e: any) => {
        e.stopPropagation();
        if (groupRef.current) {
            groupRef.current.scale.set(1, 1, 1);
        }
    };

    const handlePointerLeave = (e: any) => {
        document.body.style.cursor = 'auto';
        if (groupRef.current) {
            groupRef.current.scale.set(1, 1, 1);
        }
    };

    return (
        <group 
            ref={groupRef}
            position={position}
            onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerEnter={(e) => { 
                e.stopPropagation();
                if (!disabled) document.body.style.cursor = 'pointer'; 
            }}
            onPointerLeave={handlePointerLeave}
        >
            {children}
        </group>
    );
};

const RecorderModel = () => {
    const { t, deviceState, audioUrl, simulationMode, language } = useAppContext();
    const { handleStartRecording, handleStopRecording, handlePlayAudio } = useAudioRecorder();

    // High fidelity main body dimensions
    const width = 2.4;
    const height = 6.6;
    const depth = 0.8;

    return (
        <group position={[0, 0, 0]}>
            {/* --- CASING --- */}
            {/* Outer Silver Side Band Frame */}
            <RoundedBox args={[width + 0.06, height + 0.06, depth - 0.22]} radius={0.25} smoothness={16} position={[0, 0, 0]}>
                <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.9} />
            </RoundedBox>

            {/* Main Black Body Front/Back Insets */}
            <RoundedBox args={[width, height, depth]} radius={0.15} smoothness={16} position={[0, 0, 0]}>
                <meshStandardMaterial color="#0a0a0a" roughness={0.6} metalness={0.4} />
            </RoundedBox>

            {/* --- FRONT DETAILS --- */}
            
            {/* Elegant Screen Trim */}
            <RoundedBox args={[2.26, 1.76, 0.03]} radius={0.08} smoothness={8} position={[0, 1.8, depth/2 + 0.01]}>
                <meshStandardMaterial color="#1d2228" roughness={0.25} metalness={0.78} />
            </RoundedBox>

            {/* Screen Bezel Window (Glossy Black) */}
            <RoundedBox args={[2.2, 1.7, 0.04]} radius={0.06} smoothness={8} position={[0, 1.8, depth/2 + 0.015]}>
                <meshStandardMaterial color="#050505" roughness={0.05} metalness={0.9} />
            </RoundedBox>

            {/* Elegant Horizontal Groove separating upper/lower sections */}
            <group position={[0, 0.7, depth/2 + 0.01]}>
                 <Cylinder args={[0.01, 0.01, 2.3, 16]} rotation={[0, 0, Math.PI/2]}>
                      <meshStandardMaterial color="#000" roughness={0.8} />
                 </Cylinder>
            </group>

            {/* Display Screen Component */}
            <ScreenContent position={[0, 1.8, depth/2 + 0.036]} />

            {/* Labels Top Corner & Mics */}
            <group position={[-0.8, 3.0, depth/2 + 0.02]}>
                <Text fontSize={0.16} color="#d1d5db" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">L</Text>
                <Cylinder args={[0.15, 0.15, 0.01, 32]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.005]}>
                    <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.8} />
                </Cylinder>
                <Cylinder args={[0.13, 0.13, 0.011, 32]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.004]}>
                    <meshStandardMaterial color="#0f0f0f" />
                </Cylinder>
            </group>
            
            <group position={[0.8, 3.0, depth/2 + 0.02]}>
                <Text fontSize={0.16} color="#d1d5db" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">R</Text>
                <Cylinder args={[0.15, 0.15, 0.01, 32]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.005]}>
                    <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.8} />
                </Cylinder>
                <Cylinder args={[0.13, 0.13, 0.011, 32]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.004]}>
                    <meshStandardMaterial color="#0f0f0f" />
                </Cylinder>
                {/* Small indicator hole next to R */}
                <Cylinder args={[0.035, 0.035, 0.05, 16]} rotation={[Math.PI/2, 0, 0]} position={[-0.3, 0.05, -0.01]}>
                    <meshStandardMaterial color="#000" />
                </Cylinder>
            </group>

            {/* REC Button Assembly (Left) */}
            <PressableDeviceButton 
                position={[-0.55, -0.4, depth/2 + 0.01]}
                onClick={() => { if (deviceState === "idle") handleStartRecording(); }}
                disabled={deviceState !== "idle"}
            >
               {/* Beveled Outer Shiny Ring */}
               <Cylinder args={[0.55, 0.55, 0.06, 64]} rotation={[Math.PI / 2, 0, 0]}>
                   <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={1.0} />
               </Cylinder>
               {/* Brushed Inner Ring */}
               <Cylinder args={[0.35, 0.50, 0.07, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
                   <meshStandardMaterial color="#cccccc" roughness={0.5} metalness={0.8} />
               </Cylinder>
               {/* Center Clickable Plate */}
               <Cylinder args={[0.32, 0.32, 0.08, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
                   <meshStandardMaterial color="#f3f4f6" roughness={0.2} metalness={0.9} />
               </Cylinder>
               {/* Red Dot (Flat circle on surface of plate) */}
               <Cylinder args={[0.1, 0.1, 0.01, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.065]}>
                   <meshStandardMaterial color="#ef4444" roughness={0.3} />
               </Cylinder>
               {/* Label */}
               <Text position={[0, -0.75, 0.05]} fontSize={0.22} color="#d4d4d4" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">REC</Text>
            </PressableDeviceButton>

            {/* STOP Button Assembly (Right Top) */}
            <PressableDeviceButton 
                position={[0.65, 0.2, depth/2 + 0.01]}
                onClick={() => { if (deviceState !== "off" && deviceState !== "idle") handleStopRecording(); }}
                disabled={deviceState === "off" || deviceState === "idle"}
            >
               <Cylinder args={[0.38, 0.38, 0.06, 64]} rotation={[Math.PI / 2, 0, 0]}>
                   <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={1.0} />
               </Cylinder>
               <Cylinder args={[0.26, 0.34, 0.07, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
                   <meshStandardMaterial color="#cccccc" roughness={0.5} metalness={0.8} />
               </Cylinder>
               <Plane args={[0.1, 0.1]} position={[0, 0, 0.05]}>
                    <meshBasicMaterial color="#111" />
               </Plane>
               <Text position={[0, -0.55, 0.05]} fontSize={0.15} color="#d4d4d4" anchorX="center" anchorY="middle">↩/STOP</Text>
            </PressableDeviceButton>

            {/* PLAY/PAUSE Button Assembly (Right Bottom) */}
            <PressableDeviceButton 
                position={[0.65, -0.9, depth/2 + 0.01]}
                onClick={() => { if (deviceState === "idle" && (audioUrl || simulationMode)) handlePlayAudio(); }}
                disabled={deviceState !== "idle" || (!audioUrl && !simulationMode)}
            >
               <Cylinder args={[0.42, 0.42, 0.06, 64]} rotation={[Math.PI / 2, 0, 0]}>
                   <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={1.0} />
               </Cylinder>
               <Cylinder args={[0.28, 0.38, 0.07, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
                   <meshStandardMaterial color="#cccccc" roughness={0.5} metalness={0.8} />
               </Cylinder>
               <group position={[0, 0, 0.05]}>
                   <Cylinder args={[0.09, 0.09, 0.01, 3]} rotation={[Math.PI/2, 0, -Math.PI/2]} position={[-0.04, 0, 0]}>
                       <meshBasicMaterial color="#111" />
                   </Cylinder>
                   <Plane args={[0.03, 0.12]} position={[0.05, 0, 0]}><meshBasicMaterial color="#111" /></Plane>
                   <Plane args={[0.03, 0.12]} position={[0.1, 0, 0]}><meshBasicMaterial color="#111" /></Plane>
               </group>
               <Text position={[0, -0.6, 0.05]} fontSize={0.15} color="#d4d4d4" anchorX="center" anchorY="middle">PLAY/PAUSE</Text>
            </PressableDeviceButton>

            {/* Front Speaker Matrix */}
            <group position={[0, -1.9, depth/2 + 0.01]}>
                {[...Array(42)].map((_, i) => {
                    const row = Math.floor(i / 7);
                    const col = i % 7;
                    return (
                        <Cylinder key={i} args={[0.05, 0.05, 0.05, 16]} rotation={[Math.PI / 2, 0, 0]} position={[(col - 3) * 0.22, -row * 0.22, 0]}>
                            <meshStandardMaterial color="#000" roughness={0.9} />
                        </Cylinder>
                    );
                })}
            </group>

            {/* Bottom Logo */}
            <Text position={[0, -3.15, depth/2 + 0.01]} fontSize={0.38} color="#d8d8d8" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">
               BEETECH
            </Text>

            {/* --- BACK DETAILS --- */}
            <group position={[0, 0, -(depth/2 + 0.01)]} rotation={[0, Math.PI, 0]}>
                {/* Silver bridge at top back */}
                <RoundedBox args={[1.9, 0.8, 0.05]} radius={0.05} smoothness={8} position={[0, height/2 - 0.4, 0]}>
                    <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.9} />
                </RoundedBox>
                <RoundedBox args={[0.34, 0.16, 0.025]} radius={0.06} smoothness={12} position={[0, height/2 - 0.4, 0.035]}>
                    <meshStandardMaterial color="#111317" roughness={0.45} metalness={0.65} />
                </RoundedBox>
                <RoundedBox args={[0.22, 0.065, 0.03]} radius={0.03} smoothness={12} position={[0, height/2 - 0.4, 0.052]}>
                    <meshBasicMaterial color="#020202" />
                </RoundedBox>
                {/* Headset/Line-in icons at top bridge */}
                <Text position={[-0.55, height/2 - 0.4, 0.03]} fontSize={0.15} color="#333" anchorX="center" anchorY="middle">🎧</Text>
                <Text position={[0.55, height/2 - 0.4, 0.03]} fontSize={0.15} color="#333" anchorX="center" anchorY="middle">🎤</Text>

                {/* Stickers Wrapper */}
                <group position={[0, 1.2, 0.02]}>
                    <RoundedBox args={[1.5, 2.5, 0.01]} radius={0.08} smoothness={4} position={[0, 0, 0]}>
                        <meshStandardMaterial color="#ffffff" roughness={0.6} />
                    </RoundedBox>

                    {/* Yellow Sticker */}
                    <Plane args={[1.4, 0.7]} position={[0, 0.8, 0.01]}>
                        <meshStandardMaterial color="#f59e0b" roughness={0.5} />
                    </Plane>
                    <Text position={[-0.5, 0.8, 0.02]} fontSize={0.25} color="white">🎙️</Text>
                    <Text position={[-0.2, 0.95, 0.02]} fontSize={0.14} color="white" anchorX="left" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">DIGITAL</Text>
                    <Text position={[-0.2, 0.65, 0.02]} fontSize={0.14} color="white" anchorX="left" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">RECORDER</Text>

                    {/* Red Sticker */}
                    <Plane args={[1.4, 0.7]} position={[0, 0, 0.01]}>
                        <meshStandardMaterial color="#dc2626" roughness={0.5} />
                    </Plane>
                    <Text position={[-0.5, 0, 0.02]} fontSize={0.25} color="white">🔊</Text>
                    <Text position={[-0.2, 0.15, 0.02]} fontSize={0.14} color="white" anchorX="left" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">3D</Text>
                    <Text position={[-0.2, -0.15, 0.02]} fontSize={0.14} color="white" anchorX="left" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">SOUND</Text>

                    {/* Blue Sticker */}
                    <Plane args={[1.4, 0.7]} position={[0, -0.8, 0.01]}>
                        <meshStandardMaterial color="#2563eb" roughness={0.5} />
                    </Plane>
                    <Text position={[-0.5, -0.8, 0.02]} fontSize={0.25} color="white">🎵</Text>
                    <Text position={[-0.2, -0.65, 0.02]} fontSize={0.14} color="white" anchorX="left" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">MP3</Text>
                    <Text position={[-0.2, -0.95, 0.02]} fontSize={0.14} color="white" anchorX="left" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">PLAYER</Text>
                </group>

                {/* Left vertical col (looking from back) */}
                <Text position={[-0.9, 1.2, 0.01]} rotation={[0, 0, Math.PI/2]} fontSize={0.1} color="#a3a3a3" anchorX="center" anchorY="middle">MODE</Text>
                <Text position={[-0.9, 0.2, 0.01]} rotation={[0, 0, Math.PI/2]} fontSize={0.1} color="#a3a3a3" anchorX="center" anchorY="middle">|◁◁</Text>
                <Text position={[-0.9, -0.8, 0.01]} rotation={[0, 0, Math.PI/2]} fontSize={0.1} color="#a3a3a3" anchorX="center" anchorY="middle">▷▷|</Text>
                <Text position={[-0.9, -2.0, 0.01]} rotation={[0, 0, Math.PI/2]} fontSize={0.1} color="#a3a3a3" anchorX="center" anchorY="middle">OFF ▬ ON</Text>
                <Text position={[-0.75, -2.0, 0.01]} rotation={[0, 0, Math.PI/2]} fontSize={0.1} color="#a3a3a3" anchorX="center" anchorY="middle">POWER</Text>
                
                {/* Right vertical col */}
                <Text position={[0.9, 0.2, 0.01]} rotation={[0, 0, -Math.PI/2]} fontSize={0.1} color="#a3a3a3" anchorX="center" anchorY="middle">PLAY</Text>
                <Text position={[0.9, -1.8, 0.01]} rotation={[0, 0, -Math.PI/2]} fontSize={0.1} color="#a3a3a3" anchorX="center" anchorY="middle">USB</Text>

                {/* Center Bottom Text */}
                <Text position={[0, -1.0, 0.01]} rotation={[0, 0, Math.PI/2]} fontSize={0.15} color="#cccccc" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">DIGITAL VOICE RECORDER</Text>
                <Text position={[-0.3, -1.0, 0.01]} rotation={[0, 0, Math.PI/2]} fontSize={0.15} color="#cccccc" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">MADE IN CHINA</Text>
                <Text position={[-0.6, -1.0, 0.01]} rotation={[0, 0, Math.PI/2]} fontSize={0.2} color="#cccccc" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">CE FC</Text>
            </group>

            {/* --- RIGHT SIDE PANEL DETAILS --- */}
            <group position={[width/2, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                <RoundedBox args={[0.5, 6.25, 0.055]} radius={0.18} smoothness={12} position={[0, 0, -0.04]}>
                    <meshStandardMaterial color="#d9dde1" roughness={0.24} metalness={0.92} />
                </RoundedBox>
                <group position={[0, 2.7, 0]}>
                    <Cylinder args={[0.3, 0.3, 0.08, 64]} rotation={[Math.PI/2, 0, 0]}>
                        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.9} />
                    </Cylinder>
                    {/* Inner sunken grill */}
                    <Cylinder args={[0.22, 0.22, 0.09, 32]} rotation={[Math.PI/2, 0, 0]}>
                        <meshStandardMaterial color="#9ca3af" roughness={0.6} metalness={0.5} />
                    </Cylinder>
                    {/* 7 holes pattern */}
                    {[ [0,0], [0,0.12], [0,-0.12], [0.1,0.06], [-0.1,0.06], [0.1,-0.06], [-0.1,-0.06] ].map((pos, idx) => (
                        <Cylinder key={idx} args={[0.04, 0.04, 0.1, 12]} rotation={[Math.PI/2, 0, 0]} position={[pos[0], pos[1], 0]}>
                            <meshStandardMaterial color="#000" />
                        </Cylinder>
                    ))}
                </group>

                {/* 'M' Button Capsule */}
                <group position={[0, 1.2, 0]}>
                    <RoundedBox args={[0.35, 0.65, 0.12]} radius={0.17} smoothness={16}>
                        <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.95} />
                    </RoundedBox>
                    <Text position={[0, 0, 0.065]} rotation={[0, 0, -Math.PI/2]} fontSize={0.25} color="#333" anchorX="center" anchorY="middle">M</Text>
                </group>

                {/* Skip Rocker Capsule */}
                <group position={[0, -0.4, 0]}>
                    <RoundedBox args={[0.35, 1.6, 0.12]} radius={0.17} smoothness={16}>
                        <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.95} />
                    </RoundedBox>
                    <Text position={[0, 0.5, 0.065]} rotation={[0, 0, -Math.PI/2]} fontSize={0.15} color="#333" anchorX="center" anchorY="middle">|◁◁</Text>
                    <Text position={[0, -0.5, 0.065]} rotation={[0, 0, -Math.PI/2]} fontSize={0.15} color="#333" anchorX="center" anchorY="middle">▷▷|</Text>
                </group>

                {/* Bottom Toggle Switch (POWER) */}
                <PowerSwitch />

                {/* Small blue QC sticker */}
                <Cylinder args={[0.2, 0.2, 0.01, 32]} rotation={[Math.PI/2, 0, 0]} position={[0, -3.0, 0.05]}>
                    <meshStandardMaterial color="#0ea5e9" roughness={0.5} />
                </Cylinder>
                <Text position={[0, -3.0, 0.06]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">QC</Text>
                <Text position={[0, -3.1, 0.06]} fontSize={0.06} color="white" anchorX="center" anchorY="middle">25</Text>

                <Hotspot position={[0, -2.2, 0.15]} label={language === 'he' ? "הפעלה / כיבוי" : "Power Switch"} description={language === 'he' ? "מתג הדלקה" : "Power switch"} id="power" />
                <Hotspot position={[0, 2.7, 0.15]} label={t.hotspotMic} description={"Stereo Microphone Array (Right)"} id="side_mic" />
                <Hotspot position={[0, -0.4, 0.15]} label={t.hotspotSide} description={"Menu Navigation Rocker"} id="side_rocker" />
            </group>

            {/* Left side equivalent for mic (symmetry facing LEFT, so rotation Y is -Math.PI/2) */}
            <group position={[-width/2, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
                <RoundedBox args={[0.5, 6.25, 0.055]} radius={0.18} smoothness={12} position={[0, 0, -0.04]}>
                    <meshStandardMaterial color="#d9dde1" roughness={0.24} metalness={0.92} />
                </RoundedBox>
                <group position={[0, 2.7, 0]}>
                    <Cylinder args={[0.3, 0.3, 0.08, 64]} rotation={[Math.PI/2, 0, 0]}>
                        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.9} />
                    </Cylinder>
                    <Cylinder args={[0.22, 0.22, 0.09, 32]} rotation={[Math.PI/2, 0, 0]}>
                        <meshStandardMaterial color="#9ca3af" roughness={0.6} metalness={0.5} />
                    </Cylinder>
                    {[ [0,0], [0,0.12], [0,-0.12], [0.1,0.06], [-0.1,0.06], [0.1,-0.06], [-0.1,-0.06] ].map((pos, idx) => (
                        <Cylinder key={idx} args={[0.04, 0.04, 0.1, 12]} rotation={[Math.PI/2, 0, 0]} position={[pos[0], pos[1], 0]}>
                            <meshStandardMaterial color="#000" />
                        </Cylinder>
                    ))}
                </group>
                <Hotspot position={[0, 2.7, 0.15]} label={t.hotspotMic} description={"Stereo Microphone Array (Left)"} id="side_mic_l" />
            </group>

            {/* --- HOTSPOTS (FRONT) --- */}
            <Hotspot position={[0, 1.8, depth/2 + 0.1]} label={t.hotspotScreen} description={t.hotspotScreenDesc} id="screen" />
            <Hotspot position={[-0.55, -0.4, depth/2 + 0.15]} label={t.hotspotRec} description={t.hotspotRecDesc} id="rec" />
            <Hotspot position={[0.65, 0.2, depth/2 + 0.15]} label={t.hotspotStop} description={t.hotspotStopDesc} id="stop" />
            <Hotspot position={[0.65, -0.9, depth/2 + 0.15]} label={t.hotspotPlay} description={t.hotspotPlayDesc} id="play" />
            <Hotspot position={[0, -2.2, depth/2 + 0.1]} label={t.hotspotSpeaker} description={t.hotspotSpeakerDesc} id="speaker" />
            
            {/* Top Hotspots */}
            <Hotspot position={[-0.55, 3.4, -0.05]} label={t.hotspotAuxOut} description={t.hotspotAuxOutDesc} id="aux_out" />
            <Hotspot position={[0.55, 3.4, -0.05]} label={t.hotspotAuxIn} description={t.hotspotAuxInDesc} id="aux_in" />

            {/* --- TOP PANEL (AUX PORTS) --- */}
            <group position={[0, 3.32, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
                {/* Main top silver plate containing the ports */}
                <RoundedBox args={[1.9, 0.45, 0.04]} radius={0.06} smoothness={16} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.95} />
                </RoundedBox>
                {/* Inner bevel/groove to make it look embedded */}
                <RoundedBox args={[1.86, 0.41, 0.045]} radius={0.05} smoothness={16} position={[0, 0, -0.005]}>
                    <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.6} />
                </RoundedBox>
                
                {/* Right AUX Jack (Global +X) -> Headphone */}
                <group position={[0.55, 0, 0.02]}>
                    <Cylinder args={[0.16, 0.16, 0.04]} rotation={[Math.PI/2, 0, 0]}>
                        <meshStandardMaterial color="#111" roughness={0.5} />
                    </Cylinder>
                    <Cylinder args={[0.08, 0.08, 0.08]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.02]}>
                        <meshBasicMaterial color="#000" />
                    </Cylinder>
                </group>

                {/* Left AUX Jack (Global -X) -> Mic */}
                <group position={[-0.55, 0, 0.02]}>
                    <Cylinder args={[0.16, 0.16, 0.04]} rotation={[Math.PI/2, 0, 0]}>
                        <meshStandardMaterial color="#111" roughness={0.5} />
                    </Cylinder>
                    <Cylinder args={[0.08, 0.08, 0.08]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.02]}>
                        <meshBasicMaterial color="#000" />
                    </Cylinder>
                </group>

                {/* Center Pill / Lanyard / LED hole */}
                <RoundedBox args={[0.18, 0.07, 0.05]} radius={0.025} position={[0, 0, 0.01]}>
                    <meshStandardMaterial color="#111" roughness={0.5} />
                </RoundedBox>
                <RoundedBox args={[0.12, 0.04, 0.06]} radius={0.015} position={[0, 0, 0]}>
                    <meshBasicMaterial color="#000" />
                </RoundedBox>
            </group>
        </group>
    );
};

export const Scene = () => {
    return (
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ antialias: true }}>
            <fog attach="fog" args={['#181a1f', 10, 25]} />
            
            {/* MILITANT / STAGE LIGHTING SETUP */}
            {/* Low ambient fill to keep shadows dark */}
            <ambientLight intensity={0.2} color="#e2e8f0" />
            
            {/* Key Lighting - Stark white overhead spotlight */}
            <SpotLight 
                position={[0, 12, 12]} 
                angle={0.6} 
                penumbra={0.5} 
                intensity={120} 
                color="#ffffff" 
                castShadow
                distance={40}
            />
            {/* Cool side structural light */}
            <SpotLight 
                position={[-12, 5, -5]} 
                angle={0.7} 
                penumbra={0.8} 
                intensity={150} 
                color="#38bdf8" 
                distance={35}
            />
            {/* Warm dramatic rim light behind */}
            <SpotLight 
                position={[12, -5, -12]} 
                angle={0.7} 
                penumbra={0.3} 
                intensity={100} 
                color="#fcd34d" 
                distance={35}
            />

            <Environment preset="studio" />
            
            {/* Core assembly */}
            <group position={[0, 0, 0]}>
                <RecorderModel />
                
                {/* Deep dramatic stage shadow */}
                <ContactShadows 
                    position={[0, -3.8, 0]} 
                    opacity={1} 
                    scale={16} 
                    blur={1.5} 
                    resolution={1024}
                    far={4} 
                    color="#000000" 
                />
            </group>
            
            <OrbitControls 
                enablePan={false} 
                minDistance={5} 
                maxDistance={16} 
                makeDefault
                enableDamping
                dampingFactor={0.05}
                maxPolarAngle={Math.PI} // Allow full top-to-bottom rotation
                minPolarAngle={0} 
            />
        </Canvas>
    );
};
