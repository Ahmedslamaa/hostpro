/**
 * Animation variants and utilities
 * Using CSS transitions and animations for smooth, performant motion
 */

/**
 * Page transition animations
 */
export const pageTransitions = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  },
};

/**
 * Fade animations
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: { duration: 0.3 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3 },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.3 },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
  transition: { duration: 0.3 },
};

/**
 * Scale animations
 */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
};

export const scaleInCenter = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.3 },
};

/**
 * Slide animations
 */
export const slideInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const slideInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.4 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
  transition: { duration: 0.4 },
};

/**
 * Rotate animations
 */
export const rotateIn = {
  initial: { opacity: 0, rotate: -10 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: -10 },
  transition: { duration: 0.3 },
};

/**
 * Bounce animations
 */
export const bounce = {
  animate: {
    y: [0, -10, 0],
  },
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

/**
 * Pulse animations
 */
export const pulse = {
  animate: {
    opacity: [1, 0.5, 1],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

/**
 * Shake animations
 */
export const shake = {
  animate: {
    x: [-2, 2, -2, 2, 0],
  },
  transition: {
    duration: 0.4,
  },
};

/**
 * Stagger container for list animations
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger item for list animations
 */
export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * CSS animation classes for use without Framer Motion
 * These are defined in tailwind.config.js and globals.css
 */
export const cssAnimations = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up",
  slideDown: "animate-slide-down",
  scaleIn: "animate-scale-in",
  pulse: "animate-pulse",
};

/**
 * Easing functions
 */
export const easing = {
  easeOut: [0.25, 0.46, 0.45, 0.94],
  easeIn: [0.42, 0, 1, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  sharp: [0.4, 0, 0.6, 1],
  smooth: [0.4, 0, 0.2, 1],
  snappy: [0.34, 1.56, 0.64, 1],
};

/**
 * Transition durations (in seconds)
 */
export const durations = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.35,
  slower: 0.5,
  slowest: 0.7,
};

/**
 * Spring presets for natural motion
 */
export const spring = {
  gentle: {
    type: "spring",
    stiffness: 100,
    damping: 15,
  },
  normal: {
    type: "spring",
    stiffness: 120,
    damping: 12,
  },
  bouncy: {
    type: "spring",
    stiffness: 180,
    damping: 12,
  },
  stiff: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
};
