import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolla verso l'alto ad ogni cambio di rotta
  }, [pathname]);

  return null; // Non renderizza nulla
};

export default ScrollToTop;