import { useState, useEffect } from 'react';

interface BreakpointMap {
  xs: boolean; // < 576px
  sm: boolean; // >= 576px
  md: boolean; // >= 768px
  lg: boolean; // >= 992px
  xl: boolean; // >= 1200px
  xxl: boolean; // >= 1600px
}

const breakpoints = {
  xs: 576,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<BreakpointMap>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    xxl: false,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      
      setScreenSize({
        xs: width < breakpoints.xs,
        sm: width >= breakpoints.sm && width < breakpoints.md,
        md: width >= breakpoints.md && width < breakpoints.lg,
        lg: width >= breakpoints.lg && width < breakpoints.xl,
        xl: width >= breakpoints.xl && width < breakpoints.xxl,
        xxl: width >= breakpoints.xxl,
      });
    };

    // 初始化
    updateScreenSize();

    // 监听窗口大小变化
    window.addEventListener('resize', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  // 便捷方法
  const isMobile = screenSize.xs;
  const isTablet = screenSize.sm || screenSize.md;
  const isDesktop = screenSize.lg || screenSize.xl || screenSize.xxl;
  const isSmallScreen = screenSize.xs || screenSize.sm;

  return {
    ...screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
  };
};