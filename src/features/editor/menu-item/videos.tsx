import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VIDEOS } from "../data/video";
import { dispatch } from "@designcombo/events";
import { ADD_VIDEO } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { IVideo } from "@designcombo/types";
import React, { useState } from "react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import useVideoLibrary from "../hooks/use-video-library"; // 导入新的 hook

export const Videos = () => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();
  // const [page, setPage] = useState(1); // 移除本地状态
  // const [loading, setLoading] = useState(false); // 移除本地状态
  // const [hasMore, setHasMore] = useState(true); // 移除本地状态

  const { loading, hasMore, loadNextPage } = useVideoLibrary(); // 使用 hook

  const handleAddVideo = (payload: Partial<IVideo>) => {
    // payload.details.src = "https://cdn.designcombo.dev/videos/timer-20s.mp4";
    dispatch(ADD_VIDEO, {
      payload,
      options: {
        resourceId: "main",
        scaleMode: "fit",
      },
    });
  };

  // const loadMoreVideos = async () => { // 移除旧的函数
  //   if (loading || !hasMore) return;
  //   setLoading(true);
  //   try {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     const siteid = urlParams.get("siteid");
  //     const sessionid = urlParams.get("sessionid");
  //     const platform = urlParams.get('platform');
  //     if (!siteid || !sessionid || !platform) {
  //       console.error("缺少必要参数");
  //       return;
  //     }
  //     const nextPage = page + 1;
  //     const formData = new FormData();
  //     formData.append('siteid', siteid);
  //     formData.append('sessionid', sessionid);
  //     formData.append('platform', platform);
  //     formData.append('page', nextPage.toString());
  //     formData.append('pcount', '20');
  //     const res = await fetch(`http://app.local.v4.xinmem.com/appapi/video-lib/index`, {
  //       method: 'POST',
  //       body: formData,
  //     });
  //     const {data, error_code, error_msg} = await res.json();
  //     if (error_code === 0 && Array.isArray(data)) {
  //       if (data.length > 0) {
  //         VIDEOS.push(...data);
  //         setPage(nextPage);
  //       } else {
  //         setHasMore(false);
  //       }
  //     } else {
  //       console.error(error_msg);
  //       setHasMore(false);
  //     }
  //   } catch (error) {
  //     console.error("加载更多视频时出错:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="flex flex-1 flex-col" style={{ height: "100%" }}>
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Videos
      </div>
      <ScrollArea onScrollEnd={loadNextPage}> {/* 使用 hook 提供的加载下一页函数 */}
        <div className="masonry-sm px-4">
          {VIDEOS.map((video, index) => {
            return (
              <VideoItem
                key={index}
                video={video}
                shouldDisplayPreview={!isDraggingOverTimeline}
                handleAddImage={handleAddVideo}
              />
            );
          })}
        </div>
        {loading && (
          <div className="flex justify-center py-4">
            <span className="text-sm text-muted-foreground">加载中...</span>
          </div>
        )}
        {!hasMore && !loading && VIDEOS.length > 0 && ( // 添加没有更多数据的提示
           <div className="flex justify-center py-4">
            <span className="text-sm text-muted-foreground">没有更多视频了</span>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

const VideoItem = ({
  handleAddImage,
  video,
  shouldDisplayPreview,
}: {
  handleAddImage: (payload: Partial<IVideo>) => void;
  video: Partial<IVideo>;
  shouldDisplayPreview: boolean;
}) => {
  const style = React.useMemo(
    () => ({
      backgroundImage: `url(${video.preview})`,
      backgroundSize: "cover",
      width: "80px",
      height: "80px",
    }),
    [video.preview],
  );

  return (
    <Draggable
      data={{
        ...video,
        metadata: {
          previewUrl: video.preview,
        },
      }}
      renderCustomPreview={<div style={style} className="draggable" />}
      shouldDisplayPreview={shouldDisplayPreview}
    >
      <div
        onClick={() =>
          handleAddImage({
            id: generateId(),
            details: {
              src: video.details!.src,
            },
            metadata: {
              previewUrl: video.preview,
            },
          } as any)
        }
        className="flex w-full items-center justify-center overflow-hidden bg-background pb-2"
      >
        <img
          draggable={false}
          src={video.preview}
          className="h-full w-full rounded-md object-cover"
          alt="image"
        />
      </div>
    </Draggable>
  );
};
