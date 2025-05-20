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
import {VIDEOS} from "./data/video";
import useVideoLibrary from "./hooks/use-video-library"; // 导入新的 hook

const urlParams = new URLSearchParams(window.location.search);
const vid = urlParams.get("vid");
const siteid = urlParams.get("siteid");
const sessionid = urlParams.get("sessionid");
const platform = urlParams.get('platform')


const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});

const Editor = () => {

  if (!sessionid || !siteid || !platform) {
    return null;
  }

  const timelinePanelRef = useRef < ImperativePanelHandle > (null);
  const { timeline, playerRef } = useStore();

  useTimelineEvents();

  const { setCompactFonts, setFonts } = useDataState();
  const { loadVideos } = useVideoLibrary(); // 使用 hook

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  // 初始化视频库数据
  useEffect(() => {
    // const loadVideos = async () => { // 移除旧的函数
    //   const formData = new FormData();
    //   formData.append('siteid', siteid);
    //   formData.append('sessionid', sessionid);
    //   formData.append('platform', platform);
    //   formData.append('page', '1');
    //   formData.append('pcount', '20');
    //
    //   const res = await fetch(`http://app.local.v4.xinmem.com/appapi/video-lib/index`, {
    //     method: 'POST',
    //     body: formData,
    //   })
    //   const {data, error_code, error_msg} = await res.json();
    //   if (error_code === 0) {
    //     VIDEOS.length = 0;
    //     VIDEOS.push(...data);
    //   }else {
    //     console.log(error_msg)
    //     return null;
    //   }
    // }
    loadVideos({ page: 1, append: false }); // 使用 hook 加载第一页，不追加
  }, [loadVideos]) // 添加 loadVideos 作为依赖项



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
                <MenuItem />
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