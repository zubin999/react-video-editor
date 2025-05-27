import { AUDIOS } from '../data/audio';
import useMediaLibrary from './use-media-library';

const useAudioLibrary = () => {
  const audioLibrary = useMediaLibrary({
    apiEndpoint: `${import.meta.env.VITE_API_BASE_URL}appapi/audio-lib/index`,
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