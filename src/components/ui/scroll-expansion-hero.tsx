'use client';

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  TouchEvent,
  WheelEvent,
} from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc?: string;
  backgroundNode?: ReactNode;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
  leftContent?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  backgroundNode,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
  leftContent,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollDelta = e.deltaY * 0.002; // Increased sensitivity for faster expansion
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        // Increase sensitivity for mobile, especially when scrolling back
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005; // Higher sensitivity for scrolling back
        const scrollDelta = deltaY * scrollFactor;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }

        setTouchStartY(touchY);
      }
    };

    const handleTouchEnd = (): void => {
      setTouchStartY(0);
    };

    const handleScroll = (): void => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel as unknown as EventListener, {
      passive: false,
    });
    window.addEventListener('scroll', handleScroll as EventListener);
    window.addEventListener(
      'touchstart',
      handleTouchStart as unknown as EventListener,
      { passive: false }
    );
    window.addEventListener(
      'touchmove',
      handleTouchMove as unknown as EventListener,
      { passive: false }
    );
    window.addEventListener('touchend', handleTouchEnd as EventListener);

    return () => {
      window.removeEventListener(
        'wheel',
        handleWheel as unknown as EventListener
      );
      window.removeEventListener('scroll', handleScroll as EventListener);
      window.removeEventListener(
        'touchstart',
        handleTouchStart as unknown as EventListener
      );
      window.removeEventListener(
        'touchmove',
        handleTouchMove as unknown as EventListener
      );
      window.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY]);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const targetWidth = isMobileState ? screenSize.width : screenSize.width / 2;
  const targetHeight = screenSize.height;

  const mediaWidth = 400 + scrollProgress * (targetWidth - 400);
  const mediaHeight = 500 + scrollProgress * (targetHeight - 500);
  const textTranslateX = scrollProgress * (isMobileState ? 150 : 120);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div
      ref={sectionRef}
      className='transition-colors duration-700 ease-in-out overflow-x-hidden bg-[#041c32]'
    >
      <section className='relative flex flex-col items-center justify-start min-h-[100dvh]'>
        <div className='relative w-full flex flex-col items-center min-h-[100dvh]'>
          <motion.div
            className='absolute inset-0 z-0 h-full'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            {backgroundNode ? (
              <div className="absolute inset-0 w-full h-full">
                {backgroundNode}
              </div>
            ) : (
              bgImageSrc && (
                <>
                  <Image
                    src={bgImageSrc!}
                    alt='Background'
                    width={1920}
                    height={1080}
                    className='w-screen h-screen'
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    priority
                  />
                  <div className='absolute inset-0 bg-[#0d548d]/40' />
                </>
              )
            )}
          </motion.div>

          <div className='container mx-auto relative z-10'>
            <div className='flex flex-col md:flex-row items-center justify-between w-full h-[100dvh] relative overflow-hidden'>
              {/* Left Content Area (Visible when expanded) */}
              <motion.div
                className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 md:px-12 lg:px-20 relative z-20"
                initial={{ opacity: 0, x: -40 }}
                animate={{
                  opacity: isMobileState ? 1 : (scrollProgress > 0.8 ? 1 : 0),
                  x: isMobileState ? 0 : (scrollProgress > 0.8 ? 0 : -40)
                }}
                transition={{ 
                  type: 'spring',
                  stiffness: 90,
                  damping: 20
                }}
              >
                {leftContent}
              </motion.div>

              {/* Central/Right Expanding Media */}
              <div
                className='absolute z-10 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-none'
                style={{
                  left: isMobileState ? '50%' : `${50 + scrollProgress * 25}%`,
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: isMobileState ? '95vw' : '100vw',
                  maxHeight: isMobileState ? '85vh' : '100vh',
                  boxShadow: scrollProgress > 0.9 ? 'none' : '0px 0px 50px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className="relative w-full h-full overflow-hidden">
                  {mediaType === 'video' ? (
                    mediaSrc.includes('youtube.com') ? (
                      <div className='relative w-full h-full pointer-events-none'>
                        <iframe
                          width='100%'
                          height='100%'
                          src={
                            mediaSrc.includes('embed')
                              ? mediaSrc +
                              (mediaSrc.includes('?') ? '&' : '?') +
                              'autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1'
                              : mediaSrc.replace('watch?v=', 'embed/') +
                              '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=' +
                              mediaSrc.split('v=')[1]
                          }
                          className='w-full h-full'
                          frameBorder='0'
                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className='relative w-full h-full pointer-events-none'>
                        <video
                          src={mediaSrc}
                          poster={posterSrc}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload='auto'
                          className='w-full h-full object-cover'
                          controls={false}
                          disablePictureInPicture
                          disableRemotePlayback
                        />
                      </div>
                    )
                  ) : (
                    <div className='relative w-full h-full'>
                      <Image
                        src={mediaSrc}
                        alt={title || 'Media content'}
                        width={1920}
                        height={1080}
                        className='w-full h-full object-cover'
                        priority
                      />
                    </div>
                  )}

                  {/* Gradient Mask for Media Integration (Left side mask) */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#041c32] via-transparent to-transparent opacity-0 transition-opacity duration-500"
                    style={{ opacity: isMobileState ? 0 : scrollProgress > 0.8 ? 1 : 0 }}
                  />

                  {/* Subtle Dark Blue Overlay */}
                  <motion.div
                    className='absolute inset-0 bg-blue-900/10 pointer-events-none'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: scrollProgress > 0.5 ? 0.2 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Vertical Scroll Indicator & Subtitle */}
                <motion.div
                  className='flex flex-col items-center text-center relative z-10 mt-4 transition-none'
                  animate={{ opacity: scrollProgress > 0.3 ? 0 : 1 }}
                >
                  {date && (
                    <p
                      className='text-2xl text-blue-200'
                      style={{ transform: `translateX(-${textTranslateX}vw)` }}
                    >
                      {date}
                    </p>
                  )}
                  {scrollToExpand && (
                    <div
                      className='flex flex-col items-center gap-2 mt-2'
                      style={{ transform: `translateX(${textTranslateX}vw)` }}
                    >
                      <p className='text-blue-100/60 font-medium text-xs uppercase tracking-widest'>
                        {scrollToExpand}
                      </p>
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 1.5,
                          type: 'spring',
                          stiffness: 60,
                          damping: 10
                        }}
                        className="w-[1.5px] h-10 bg-gradient-to-b from-blue-400/50 to-transparent rounded-full"
                      />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Centered Dramatic Expansion Title */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className={`flex items-center justify-center text-center gap-4 w-full flex-col`}>
                  <motion.h2
                    className='font-black text-white transition-none font-montserrat uppercase tracking-tighter'
                    style={{
                      fontSize: 'clamp(2.5rem, 8vw, 10rem)',
                      transform: `translateX(-${textTranslateX}vw)`,
                      textShadow: scrollProgress > 0.8 ? '0 4px 20px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    {firstWord}
                  </motion.h2>
                  <motion.h2
                    className='font-black text-center text-white transition-none font-montserrat uppercase tracking-tighter'
                    style={{
                      fontSize: 'clamp(2.5rem, 8vw, 10rem)',
                      transform: `translateX(${textTranslateX}vw)`,
                      textShadow: scrollProgress > 0.8 ? '0 4px 20px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    {restOfTitle}
                  </motion.h2>
                </div>
              </div>
            </div>

            <motion.section
              className='flex flex-col w-full px-8 py-10 md:px-16 lg:py-20'
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
