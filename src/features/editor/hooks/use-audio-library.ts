import { AUDIOS } from '../data/audio';
import useMediaLibrary from './use-media-library';

const useAudioLibrary = () => {
  const audioLibrary = useMediaLibrary({
    apiEndpoint: 'http://app.local.v4.xinmem.com/appapi/audio-lib/index',
    mediaArray: AUDIOS,
    mediaType: '音频',
    requiresPlatform: true,
  });

  return {
    ...audioLibrary,
    loadAudios: audioLibrary.loadMedia
  };
};

export default useAudioLibrary;