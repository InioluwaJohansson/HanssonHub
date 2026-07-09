import React from 'react';
import Hls from 'hls.js';

export interface HlsVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src?: string;
}

export const HlsVideo = React.forwardRef<HTMLVideoElement, HlsVideoProps>(
  ({ src, ...props }, ref) => {
    const localRef = React.useRef<HTMLVideoElement | null>(null);

    React.useEffect(() => {
      const video = localRef.current;
      if (!video) return;

      let hls: Hls | null = null;

      if (src) {
        const isHls = src.includes('.m3u8') || src.includes('.m3u') || src.includes('m3u8') || src.startsWith('blob:');
        
        if (isHls && Hls.isSupported()) {
          hls = new Hls({
            maxMaxBufferLength: 10,
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (props.autoPlay) {
              video.play().catch(err => {
                console.log('Autoplay prevented or failed:', err);
              });
            }
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls?.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls?.recoverMediaError();
                  break;
                default:
                  hls?.destroy();
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
      }

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }, [src, props.autoPlay]);

    return (
      <video
        ref={(el) => {
          localRef.current = el;
          if (ref) {
            if (typeof ref === 'function') {
              ref(el);
            } else {
              (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el;
            }
          }
        }}
        {...props}
      />
    );
  }
);

HlsVideo.displayName = 'HlsVideo';
