import { VIDEOS } from '../data/video';
import useMediaLibrary from './use-media-library';

const useVideoLibrary = () => {
  const videoLibrary = useMediaLibrary({
    apiEndpoint: 'http://app.local.v4.xinmem.com/appapi/video-lib/index',
    mediaArray: VIDEOS,
    mediaType: '视频',
    requiresPlatform: true
  });

  return {
    ...videoLibrary,
    loadVideos: videoLibrary.loadMedia
  };
};

export default useVideoLibrary;