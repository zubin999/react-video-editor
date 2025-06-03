import { IDataState } from "../interfaces/editor";
import { create } from "zustand";

const useDataState = create<IDataState>((set) => ({
  fonts: [],
  compactFonts: [],
  sessionid: "",
  platform: 0,
  setFonts: (fonts) => set({ fonts }),
  setCompactFonts: (compactFonts) => set({ compactFonts }),
  setSessionid: (sessionid) => set({sessionid}),
  setPlatform: (platform) => set({platform}),
}));

export default useDataState;
