import { useState, useCallback } from 'react';
import {httpReq} from '@/utils/sign'

interface LoadMediaOptions {
  page: number;
  platform?: number; // 修改为可选参数
  append?: boolean; // 是否追加数据，默认为 true
}


interface MediaLibraryConfig {
  apiEndpoint: string; // API 端点
  mediaArray: any[]; // 媒体数组引用
  mediaType: string; // 媒体类型，用于日志
  requiresPlatform?: boolean; // 新增：是否需要 platform 参数
}

const useMediaLibrary = (config: MediaLibraryConfig) => {
  const { apiEndpoint, mediaArray, mediaType, requiresPlatform = false } = config;
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [platform, setPlatform] = useState(0); // 新增：platform 状态
  
  const loadMedia = useCallback(async ({ page, platform, append = true }: LoadMediaOptions) => {

    if (loading || (!hasMore && append)) return;

    // 检查 platform 参数是否必需但未提供
    if (requiresPlatform && platform === undefined) {
      console.error(`${mediaType}库加载需要 platform 参数`);
      return;
    }
    setPlatform(platform); // 更新 platform 状态

    setLoading(true);

    try {
      // const urlParams = new URLSearchParams(window.location.search);
      // const sessionid = sid;

      const urlParams = new URLSearchParams(window.location.search);
      const sessionid = urlParams.get("sessionid");

      if (!sessionid) {
        console.error("缺少必要参数");
        setLoading(false);
        setHasMore(false);
        return;
      }

      const formData = new FormData();
      formData.append('sessionid', sessionid);

      // 只有当 platform 参数存在时才添加到请求中
      if (platform !== undefined) {
        formData.append('platform', platform.toString());
      }

      formData.append('page', page.toString());
      formData.append('pcount', '20');

      const data = await httpReq(formData, apiEndpoint);

      if (Array.isArray(data)) {
        if (data.length > 0) {
          if (append) {
            mediaArray.push(...data);
          } else {
            mediaArray.length = 0;
            mediaArray.push(...data);
          }
          setPage(page);
          setHasMore(true);
        } else {
          console.log("data.length is 0")
          setHasMore(false);
        }
      } else {
        console.log("data is not array")
        setHasMore(false);
      }
    } catch (error) {
      console.error(`加载${mediaType}时出错:`, error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  const loadNextPage = useCallback(() => {
    if (!loading && hasMore) {
      loadMedia({ page: page + 1, platform: platform, append: true });
    }
  }, [loading, hasMore, page, loadMedia, platform]);

  return {
    page,
    loading,
    hasMore,
    loadMedia,
    loadNextPage,
  };
};

export default useMediaLibrary;