import type { SpringOptions } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

interface TiltedCardProps {
  imageSrc: React.ComponentProps<"img">["src"];
  altText?: string;
  captionText?: string;
  containerHeight?: React.CSSProperties['height'];
  containerWidth?: React.CSSProperties['width'];
  imageHeight?: React.CSSProperties['height'];
  imageWidth?: React.CSSProperties['width'];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;
  followMouse?: boolean;
  imageFilter?: React.ReactNode;
  alwaysTrackMouse?: boolean;
  effectStyle?: "neon" | "floating" | "magnetic" | "parallax";
  shadowColor?: string;
  glowIntensity?: number;
}

const springValues: SpringOptions = {
  damping: 25,
  stiffness: 300,
  mass: 1.5,
};

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.05,
  rotateAmplitude = 15,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  followMouse = true,
  imageFilter = null,
  alwaysTrackMouse = true,
  effectStyle = "neon",
  shadowColor = "rgba(0,252,237,0.4)",
  glowIntensity = 1,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const glow = useSpring(0, springValues);
  const levitate = useSpring(0, {
    stiffness: 100,
    damping: 10,
    mass: 0.8,
  });
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  });

  const [lastY, setLastY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Configure visual effects based on style
  useEffect(() => {
    if (effectStyle === "floating") {
      // Start floating animation
      const floatInterval = setInterval(() => {
        levitate.set(Math.random() * 10 - 5);
      }, 2000);
      
      return () => clearInterval(floatInterval);
    }
  }, [effectStyle]);

  // Function to update card rotation based on mouse position
  function updateCardRotation(clientX: number, clientY: number) {
    if (!ref.current || !cardRef.current) return;

    const rect = ref.current.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    
    // Update mouse position for magnetic effect
    setMousePosition({ x: clientX, y: clientY });
    
    // Calculate center of the card
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    
    // Calculate mouse offset from card center
    const offsetX = clientX - cardCenterX;
    const offsetY = clientY - cardCenterY;
    
    // Calculate distance from card center (for magnetic effect)
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    const maxDistance = Math.max(window.innerWidth, window.innerHeight) / 2;
    const distanceFactor = Math.min(1, distance / maxDistance);

    let rotationX, rotationY;
    
    if (effectStyle === "magnetic" && distance < 400) {
      // Magnetic: stronger effect when closer to card
      const magneticFactor = Math.max(0, 1 - distance / 400);
      rotationX = (offsetY / 200) * -rotateAmplitude * (1 + magneticFactor * 2);
      rotationY = (offsetX / 200) * rotateAmplitude * (1 + magneticFactor * 2);
      glow.set(magneticFactor * glowIntensity);
    } else {
      // Default tracking behavior with distance falloff
      rotationX = (offsetY / window.innerHeight) * -rotateAmplitude * 2 * (1 - distanceFactor * 0.8);
      rotationY = (offsetX / window.innerWidth) * rotateAmplitude * 2 * (1 - distanceFactor * 0.8);
      glow.set(isHovered ? glowIntensity : 0.3);
    }

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    // Update tooltip position when hovering over card
    if (isHovered) {
      x.set(clientX - rect.left);
      y.set(clientY - rect.top);

      const velocityY = offsetY - lastY;
      rotateFigcaption.set(-velocityY * 0.6);
      setLastY(offsetY);
    }
  }

  function handleMouseEnter() {
    setIsHovered(true);
    scale.set(scaleOnHover);
    opacity.set(1);
    glow.set(glowIntensity);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    opacity.set(0);
    scale.set(1);
    
    if (effectStyle !== "magnetic") {
      glow.set(0.3);
    }
    
    // Don't reset rotation if we're always tracking the mouse
    if (!alwaysTrackMouse) {
      rotateX.set(0);
      rotateY.set(0);
    }
    
    rotateFigcaption.set(0);
  }

  // Effect to track mouse movement globally
  useEffect(() => {
    // Only track if followMouse is enabled and
    // either we're hovering or alwaysTrackMouse is enabled
    if (!followMouse) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      updateCardRotation(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [followMouse, isHovered, effectStyle]);

  // Generate dynamic shadow and glow styles
  const getShadowStyle = () => {
    if (effectStyle === "neon") {
      return {
        boxShadow: `0 10px 30px ${shadowColor}, 0 0 ${30 * glow.get()}px ${shadowColor}`,
        filter: `drop-shadow(0 0 ${8 * glow.get()}px ${shadowColor})`,
      };
    }
    return {
      boxShadow: `0 9px 38px ${shadowColor}`,
    };
  };

  return (
    <figure
      ref={ref}
      className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-sm block sm:hidden">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <motion.div
        ref={cardRef}
        className="relative [transform-style:preserve-3d]"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
          y: effectStyle === "floating" ? levitate : 0,
          transition: "box-shadow 0.3s ease",
          ...getShadowStyle(),
        }}
      >
        <div className="relative w-full h-full">
          <motion.img
            src={imageSrc}
            alt={altText}
            className="absolute top-0 left-0 object-cover rounded-[15px] will-change-transform [transform:translateZ(0)]"
            style={{
              width: imageWidth,
              height: imageHeight,
            }}
          />
          
          {/* Custom image filter */}
          {imageFilter && (
            <div className="absolute top-0 left-0 w-full h-full rounded-[15px] overflow-hidden">
              {imageFilter}
            </div>
          )}
          
          {/* Neon glow effect overlay */}
          {effectStyle === "neon" && (
            <motion.div 
              className="absolute inset-0 rounded-[15px] pointer-events-none mix-blend-overlay"
              style={{
                background: `radial-gradient(circle at center, ${shadowColor.replace('0.4', '0.3')} 0%, transparent 70%)`,
                opacity: glow
              }}
            />
          )}

          {/* Mouse pointer highlight for magnetic effect */}
          {effectStyle === "magnetic" && (
            <motion.div 
              className="absolute rounded-full w-16 h-16 pointer-events-none mix-blend-screen"
              style={{
                background: `radial-gradient(circle, ${shadowColor.replace('0.4', '0.7')} 0%, transparent 70%)`,
                left: isHovered ? mousePosition.x - cardRef.current?.getBoundingClientRect().left - 32 : "50%",
                top: isHovered ? mousePosition.y - cardRef.current?.getBoundingClientRect().top - 32 : "50%",
                opacity: glow,
                transition: "opacity 0.2s ease",
              }}
            />
          )}
        </div>

        {/* Parallax layers for depth effect */}
        {effectStyle === "parallax" && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              rotateX: rotateX.get() * 1.5,
              rotateY: rotateY.get() * 1.5,
              transformStyle: "preserve-3d",
            }}
          >
            <div 
              className="absolute top-0 left-0 w-full h-full rounded-[15px] mix-blend-overlay"
              style={{
                background: `radial-gradient(circle at center, ${shadowColor.replace('0.4', '0.2')} 0%, transparent 70%)`,
                transform: "translateZ(20px)",
              }}
            />
          </motion.div>
        )}

        {displayOverlayContent && overlayContent && (
          <motion.div
            className="absolute top-0 left-0 z-[2] will-change-transform [transform:translateZ(30px)]"
            style={{
              width: imageWidth,
              height: imageHeight,
            }}
          >
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {/* Subtle reflection effect */}
      <motion.div
        className="relative mt-2 rounded-[15px] opacity-30 blur-sm w-4/5 h-4 mx-auto"
        style={{
          background: `linear-gradient(to bottom, ${shadowColor}, transparent)`,
          scaleX: scale,
          scaleY: 0.2,
        }}
      />

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] opacity-0 z-[3] hidden sm:block"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption,
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}