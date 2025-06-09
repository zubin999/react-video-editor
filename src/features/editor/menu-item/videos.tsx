import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dispatch } from "@designcombo/events";
import { ADD_VIDEO } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { IVideo } from "@designcombo/types";
import React, { useEffect, useState } from "react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import VideoDialog from "@/components/video-dialog";
// import { useVideoContext } from "../context/video-context";
import { videoService } from "../data/video-service";


export const Videos = () => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();
  // const { videos, addVideo } = useVideoContext(); // Use the context instead of local state
  const [open, setOpen] = useState(false);
  const [videos, setVideos] = useState<Partial<IVideo>[]>([])

  useEffect(() => {
    setVideos(videoService.getVideosSnapshot())
    const subscription = videoService.getVideos().subscribe(updateVideos => {
      setVideos(updateVideos)
    })

    return () => subscription.unsubscribe();
  }, [])


  const handleAddVideo = (payload: any) => {
    console.log({payload});
    dispatch(ADD_VIDEO, {
      payload,
      options: {
        resourceId: "main",
        scaleMode: "fit",
      },
    });
  };

  const videoDialog = () => {
    console.log('video dialog');
    if (!open) {
      setOpen(true);
    }
  };

  const handleSelectVideo = (video: Partial<IVideo>) => {
    console.log({video});
    // Use the context's addVideo function
    // addVideo(video);
    videoService.addVideo(video)
  };

  return (
    <div className="flex flex-1 flex-col" style={{ height: "100%" }}>
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Videos
      </div>
      <ScrollArea>
        <div className="masonry-sm px-4 pb-2 flex flex-col" style={{
          columnCount: 1,
          gap: '1rem',
        }}>
          {videos.map((video, index) => {
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
        <div className="px-4">
        <Button
         style={{
          width: '100%',
          height: '120px'
        }}
         className="px-4"
         onClick={videoDialog}
        >
          <CirclePlus />
        </Button>
        </div>
      </ScrollArea>
      <VideoDialog 
        open={open} 
        onOpenChange={setOpen}
        onSelectVideo={handleSelectVideo}
      />
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
      width: "100%",
      height: "120px",
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
        className="flex w-full h-[120px] items-center justify-center overflow-hidden bg-background pb-2"
      >
        <img
          draggable={false}
          src={video.preview}
          className="h-auto w-full rounded-md object-cover"
          alt="image"
        />
      </div>
    </Draggable>
  );
};