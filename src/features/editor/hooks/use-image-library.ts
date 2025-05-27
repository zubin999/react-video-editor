import { useState, useCallback } from 'react';
import { IMAGES } from '../data/images';
import useMediaLibrary from './use-media-library';


const useImageLibrary = () => {
  const imageLibrary = useMediaLibrary({
    apiEndpoint: `${import.meta.env.VITE_API_BASE_URL}appapi/image-lib/index`,
    mediaArray: IMAGES,
    mediaType: '图片',
    requiresPlatform: false
  });

  return {
    ...imageLibrary,
    loadImages: imageLibrary.loadMedia
  };
};

export default useImageLibrary;