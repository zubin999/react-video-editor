import { useState, useCallback } from 'react';
import { VIDEOS } from '../data/video'; // 假设 VIDEOS 是一个可变数组或者你需要其他方式来管理视频列表

interface LoadVideosOptions {
  page: number;
  append?: boolean; // 是否追加数据，默认为 true
}

const useVideoLibrary = () => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 修改 loadVideos 的依赖项
  const loadVideos = useCallback(async ({ page, append = true }: LoadVideosOptions) => {
    if (loading || (!hasMore && append)) return; // 如果正在加载或没有更多数据且是追加操作，则退出

    setLoading(true);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const siteid = urlParams.get("siteid");
      const sessionid = urlParams.get("sessionid");
      const platform = urlParams.get('platform');

      if (!siteid || !sessionid || !platform) {
        console.error("缺少必要参数");
        setLoading(false);
        setHasMore(false); // 如果缺少参数，认为没有更多数据
        return;
      }

      const formData = new FormData();
      formData.append('siteid', siteid);
      formData.append('sessionid', sessionid);
      formData.append('platform', platform);
      formData.append('page', page.toString());
      formData.append('pcount', '20');

      const res = await fetch(`http://app.local.v4.xinmem.com/appapi/video-lib/index`, {
        method: 'POST',
        body: formData,
      });

      const { data, error_code, error_msg } = await res.json();

      if (error_code === 0 && Array.isArray(data)) {
        if (data.length > 0) {
          if (append) {
            VIDEOS.push(...data); // 追加数据
          } else {
            VIDEOS.length = 0; // 清空现有数据
            VIDEOS.push(...data); // 设置新数据
          }
          setPage(page); // 更新当前页码
          setHasMore(true); // 假设还有更多数据，直到下次加载返回空数组
        } else {
          setHasMore(false); // 返回空数组表示没有更多数据了
        }
      } else {
        console.error(error_msg);
        setHasMore(false); // 加载失败也认为没有更多数据
      }
    } catch (error) {
      console.error("加载视频时出错:", error);
      setHasMore(false); // 加载出错也认为没有更多数据
    } finally {
      setLoading(false);
    }
  }, []); // 将依赖项修改为空数组

  // 提供一个加载下一页的便捷函数
  // 保持 loadNextPage 的依赖项不变，因为它需要 page 和 loadVideos
  const loadNextPage = useCallback(() => {
    if (!loading && hasMore) {
      loadVideos({ page: page + 1, append: true });
    }
  }, [loading, hasMore, page, loadVideos]);

  return {
    page,
    loading,
    hasMore,
    loadVideos, // 用于指定页码加载
    loadNextPage, // 用于加载下一页
  };
};

export default useVideoLibrary;