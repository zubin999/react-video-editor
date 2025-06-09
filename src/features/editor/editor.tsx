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
// import { getCompactFontData, loadFonts } from "./utils/fonts";
// import MenuList from "./menu-list";
import { MenuItem } from "./menu-item";
import { ControlItem } from "./control-item";
// import CropModal from "./crop-modal/crop-modal";
import useDataState from "./store/use-data-state";
// import { FONTS } from "./data/fonts";
import FloatingControl from "./control-item/floating-controls/floating-control";
// import {VIDEOS} from "./data/video";
// import useVideoLibrary from "./hooks/use-video-library";
import { httpReq } from "@/utils/sign";
import { dispatch } from "@designcombo/events";
import { generateId } from "@designcombo/timeline";
import { useSearchParams } from "react-router-dom";
import { videoService } from "./data/video-service";
import { IVideo } from "@designcombo/types";
// import { IVideo } from "@designcombo/types";
// import { VIDEOS } from "./data/video";
// 在您的editor.tsx文件中添加以下代码
// 假设您已有的imports...
// import { useVideoContext } from "./context/video-context";

  
// import { IVideo } from "@designcombo/types";
// import useImageLibrary from "./hooks/use-image-library";
// import useAudioLibrary from "./hooks/use-audio-library";

// const urlParams = new URLSearchParams(window.location.search);
// const vid = Number(urlParams.get("vid"));
// const sessionid = urlParams.get("sessionid");

// const platform = Number(urlParams.get('platform'))
// let VIDEO_PLATFORM, AUDIO_PLATFORM;
// if (platform === 1) {
// 	VIDEO_PLATFORM = 16;
// 	AUDIO_PLATFORM = 20;
// } else if (platform === 2) {
// 	VIDEO_PLATFORM = 8;
// 	AUDIO_PLATFORM = 8;
// }

const stateManager = new StateManager({
	size: {
		width: 1080,
		height: 1920,
	},
});

const Editor = () => {

	const [searchParams] = useSearchParams();
	const sessionid = searchParams.get('sessionid');
	const platform = searchParams.get('platform');
	const vid = Number(searchParams.get('vid'));
	let VIDEO_PLATFORM = 0;

	if (!sessionid || !platform) {
		return null;
	}

	if (platform === '1') {
		VIDEO_PLATFORM = 16;
		// AUDIO_PLATFORM = 20;
	}else if(platform == '2') {
		VIDEO_PLATFORM = 8;
		// AUDIO_PLATFORM = 8;
	}


	const timelinePanelRef = useRef < ImperativePanelHandle > (null);
	const { timeline, playerRef } = useStore();
	const [, setVideos] = useState<Partial<IVideo>[]>([])

	useTimelineEvents();

	const { setSessionid, setPlatform } = useDataState();
	// const videoLibrary = useVideoLibrary();
	// const { loadVideos } = videoLibrary;
	// const { loadImages } = useImageLibrary();
	// const { loadAudios } = useAudioLibrary();

	useEffect(() => {
		// setCompactFonts(getCompactFontData(FONTS));
		// setFonts(FONTS);
		setSessionid(sessionid);
		setPlatform(Number(VIDEO_PLATFORM));
		window.sessionStorage.setItem('sessionid', sessionid)
		window.sessionStorage.setItem('platform', String(VIDEO_PLATFORM))
	}, [sessionid, platform]);

	useEffect(() => {
		setVideos(videoService.getVideosSnapshot());

	}, [])

  // 获取视频上下文
//   const { videos, addVideo } = useVideoContext();
  
  // 您可以在这里添加视频
//   const handleAddVideoFromEditor = (newVideo) => {
//     addVideo(newVideo);
//   };

	useEffect(() => {
		if (vid > 0) {
			httpReq(new URLSearchParams(`id=${vid}`), `appapi/video-lib/info`)
				.then(res => {
					console.log({ res })
					const payload = {
						...res,
						id: generateId(),
						metadata: {
							previewUrl: res.preview
						}
					}
					dispatch(ADD_VIDEO, {
						payload,
						options: {
							resourceId: "main",
							scaleMode: "fit",
						}
					})
					videoService.addVideo(payload)
					// handleAddVideoFromEditor(payload)
				})
		}
	}, [])
	// 初始化视频库数据
	// useEffect(() => {
	// 	loadVideos({ page: 1, platform: VIDEO_PLATFORM, append: false });
	// }, [sessionid]);

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
								{/* <MenuList /> */}
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
								{/* <CropModal /> */}
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