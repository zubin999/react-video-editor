"use client";
import Timeline from "./timeline";
import useStore from "./store/use-store";
import Navbar from "./navbar";
import useTimelineEvents from "./hooks/use-timeline-events";
import Scene from "./scene";
import StateManager, { ADD_VIDEO } from "@designcombo/state";
import { useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { getCompactFontData, loadFonts } from "./utils/fonts";
import MenuList from "./menu-list";
import { MenuItem } from "./menu-item";
import { ControlItem } from "./control-item";
import CropModal from "./crop-modal/crop-modal";
import useDataState from "./store/use-data-state";
import { FONTS } from "./data/fonts";
import FloatingControl from "./control-item/floating-controls/floating-control";
// import {VIDEOS} from "./data/video";
import useVideoLibrary from "./hooks/use-video-library";
// import useImageLibrary from "./hooks/use-image-library";
// import useAudioLibrary from "./hooks/use-audio-library";

const urlParams = new URLSearchParams(window.location.search);
const vid = urlParams.get("vid");
const sessionid = urlParams.get("sessionid");

const platform = Number(urlParams.get('platform'))
let VIDEO_PLATFORM, AUDIO_PLATFORM;
if (platform === 1) {
  VIDEO_PLATFORM = 16;
  AUDIO_PLATFORM = 20;
}else if(platform === 2) {
  VIDEO_PLATFORM = 8;
  AUDIO_PLATFORM = 8;
}

const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});

const Editor = () => {

  if (!sessionid || !platform) {
    return null;
  }

  const timelinePanelRef = useRef < ImperativePanelHandle > (null);
  const { timeline, playerRef } = useStore();

  useTimelineEvents();

  const { setCompactFonts, setFonts, setSessionid, setPlatform } = useDataState();
  const videoLibrary = useVideoLibrary();
  const { loadVideos } = videoLibrary;
  // const { loadImages } = useImageLibrary();
  // const { loadAudios } = useAudioLibrary();

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
    setSessionid(sessionid);
    setPlatform(Number(platform));
  }, [sessionid, platform]);

  // 初始化视频库数据
  useEffect(() => {
    loadVideos({ page: 1, platform: VIDEO_PLATFORM, append: false });
  }, [sessionid]);

  // 初始化图片库数据
  // useEffect(() => {
  //   loadImages({ page: 1, append: false });
  // }, [loadImages]);

  // 初始化音频库数据
  // useEffect(() => {
  //   loadAudios({ page: 1, platform: AUDIO_PLATFORM, append: false });
  // }, [loadAudios]);

  useEffect(() => {
    const screenHeight = window.innerHeight;
    const desiredHeight = 300;
    const percentage = (desiredHeight / screenHeight) * 100;
    timelinePanelRef.current?.resize(percentage);
  }, []);

  const handleTimelineResize = () => {
    const timelineContainer = document.getElementById("timeline-container");
    if (!timelineContainer) return;

    timeline?.resize(
      {
        height: timelineContainer.clientHeight - 90,
        width: timelineContainer.clientWidth - 40,
      },
      {
        force: true,
      },
    );
  };

  useEffect(() => {
    const onResize = () => handleTimelineResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [timeline]);

  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar
        user={null}
        stateManager={stateManager}
      />
      <div className="flex flex-1">
        <ResizablePanelGroup style={{ flex: 1 }} direction="vertical">
          <ResizablePanel className="relative" defaultSize={70}>
            <FloatingControl />
            <div className="flex h-full flex-1">
              <div className="bg-sidebar flex flex-none border-r border-border/80">
                <MenuList />
                <MenuItem videoLibrary={videoLibrary}/>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <CropModal />
                <Scene stateManager={stateManager} />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            className="min-h-[50px]"
            ref={timelinePanelRef}
            defaultSize={30}
            onResize={handleTimelineResize}
          >
            {playerRef && <Timeline stateManager={stateManager} />}
          </ResizablePanel>
        </ResizablePanelGroup>
        <ControlItem />
      </div>
    </div>
  );
};

export default Editor;