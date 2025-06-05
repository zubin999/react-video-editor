import { httpReq } from "@/utils/sign";
import { IDesign } from "@designcombo/types";
import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";

interface Output {
  url: string;
  type: string;
}

interface DownloadState {
  projectId: string;
  exporting: boolean;
  exportType: "json" | "mp4";
  progress: number;
  output?: Output;
  payload?: IDesign;
  displayProgressModal: boolean;
  sessionid?: string;
  platform?: number;
  actions: {
    setProjectId: (projectId: string) => void;
    setExporting: (exporting: boolean) => void;
    setExportType: (exportType: "json" | "mp4") => void;
    setProgress: (progress: number) => void;
    setState: (state: Partial<DownloadState>) => void;
    setOutput: (output: Output) => void;
    startExport: () => void;
    setDisplayProgressModal: (displayProgressModal: boolean) => void;
    setSessionid: (sessionid: string) => void;
    setPlatform: (platform: number) => void;
  };
}

export const useDownloadState = create<DownloadState>((set, get) => ({
  projectId: "",
  exporting: false,
  exportType: "mp4",
  progress: 0,
  displayProgressModal: false,
  sessionid: "",
  platform: 0,
  actions: {
    setProjectId: (projectId) => set({ projectId }),
    setExporting: (exporting) => set({ exporting }),
    setExportType: (exportType) => set({ exportType }),
    setProgress: (progress) => set({ progress }),
    setState: (state) => set({ ...state }),
    setOutput: (output) => set({ output }),
    setDisplayProgressModal: (displayProgressModal) =>
      set({ displayProgressModal }),
    setSessionid: (sessionid) => set({ sessionid }),
    setPlatform: (platform) => set({ platform }),
    startExport: async () => {
      try {
        // Set exporting to true at the start
        set({ exporting: true, displayProgressModal: true });

        // Assume payload to be stored in the state for POST request
        const { payload, platform, sessionid } = get();


        if (!payload) throw new Error("Payload is not defined");
        if (!platform) throw new Error("Platform is not defined");
        if (!sessionid) throw new Error("Sessionid is not defined");

        const exportParams = {
          sessionid,
          platform,
          ...payload,
        }

        toast({
          title: "正在导出...",
          description: "请耐心等待...",
          duration: 2500
        })

        // Step 1: POST request to start rendering
        const response = await fetch(`${import.meta.env.VITE_EXPORT_SERVER_URL}vms/export`, {
          method: "POST",
          headers: {
            // "Content-Type": "application/x-www-form-urlencoded",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(exportParams),
        });

        if (!response.ok) throw new Error("Failed to submit export request.");

        const jobInfo = await response.json();
        console.log({jobInfo})
        // const videoId = jobInfo.video.id;
        if (jobInfo.code != 0) {
          throw new Error(jobInfo.msg)
        }
        

        const formBody = [`sessionid=${sessionid}`, `platform=${platform}`];
        let saveParams: string = "";
        if (jobInfo?.data?.basic) {
          const details = jobInfo?.data?.basic;
          for (const property in details) {
            const encodedKey = encodeURIComponent(property);
            const encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
          }
          saveParams = formBody.join("&");
        }

        // Step 2 & 3: Polling for status updates
        try {
          await httpReq(new URLSearchParams(saveParams), `${import.meta.env.VITE_API_BASE_URL}appapi/video-lib/save`)
        } catch (error) {
          throw new Error(error)
        }
        
        toast({
          title: "导出成功",
          description: "请在视频库查看导出的视频",
          duration: 3500
        })
          // const { status, progress, url } = statusInfo.video;

          // set({ progress });

          // if (status === "COMPLETED") {
          //   set({ exporting: false, output: { url, type: get().exportType } });
          // } else if (status === "PENDING") {
          //   setTimeout(checkStatus, 2500);
          // }

      } catch (error) {
        console.error(error);
        set({ exporting: false });
      }
    },
  },
}));
