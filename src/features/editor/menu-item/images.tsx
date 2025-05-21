import { ScrollArea } from "@/components/ui/scroll-area";
import { IMAGES } from "../data/images";
import { dispatch } from "@designcombo/events";
import { generateId } from "@designcombo/timeline";
import Draggable from "@/components/shared/draggable";
import { IImage } from "@designcombo/types";
import React from "react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import { ADD_ITEMS } from "@designcombo/state";
import useImageLibrary from "../hooks/use-image-library";

export const Images = () => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();
  const { loading, hasMore, loadNextPage } = useImageLibrary();

  const handleAddImage = (payload: Partial<IImage>) => {
    const id = generateId();
    dispatch(ADD_ITEMS, {
      payload: {
        trackItems: [
          {
            id,
            type: "image",
            display: {
              from: 0,
              to: 5000,
            },
            details: {
              src: payload.details?.src,
            },
            metadata: {},
          },
        ],
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col" style={{ height: "100%" }}>
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Photos
      </div>
      <ScrollArea onScrollEnd={loadNextPage}>
        <div className="masonry-sm px-4">
          {IMAGES.map((image, index) => {
            return (
              <ImageItem
                key={index}
                image={image}
                shouldDisplayPreview={!isDraggingOverTimeline}
                handleAddImage={handleAddImage}
              />
            );
          })}
        </div>
        {loading && (
          <div className="flex justify-center py-4">
            <span className="text-sm text-muted-foreground">加载中...</span>
          </div>
        )}
        {!hasMore && IMAGES.length > 0 && (
          <div className="flex justify-center py-4">
            <span className="text-sm text-muted-foreground">没有更多图片了</span>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

const ImageItem = ({
  handleAddImage,
  image,
  shouldDisplayPreview,
}: {
  handleAddImage: (payload: Partial<IImage>) => void;
  image: Partial<IImage>;
  shouldDisplayPreview: boolean;
}) => {
  const style = React.useMemo(
    () => ({
      backgroundImage: `url(${image.preview})`,
      backgroundSize: "cover",
      width: "80px",
      height: "80px",
    }),
    [image.preview],
  );

  return (
    <Draggable
      data={image}
      renderCustomPreview={<div style={style} />}
      shouldDisplayPreview={shouldDisplayPreview}
    >
      <div
        onClick={() =>
          handleAddImage({
            id: generateId(),
            details: {
              src: image.details!.src,
            },
          } as IImage)
        }
        className="flex w-full items-center justify-center overflow-hidden bg-background pb-2"
      >
        <img
          draggable={false}
          src={image.preview}
          className="h-full w-full rounded-md object-cover"
          alt="image"
        />
      </div>
    </Draggable>
  );
};
