import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { httpReq } from "@/utils/sign";

// Define proper types for menu items
interface MenuItem {
  value: string;
  label: string;
  children?: MenuItem[];
}

interface VideoItem {
  id: string;
  name: string;
  preview?: string;
  url?: string;
}

interface PaginationData {
  current_page: number;
  total_pages: number;
  total: number;
}

interface VideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVideo?: (video: VideoItem) => void;
}

const VideoDialog: React.FC<VideoDialogProps> = ({ 
  open, 
  onOpenChange,
  onSelectVideo
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    total_pages: 1,
    total: 0
  });

  // Fetch menu items when dialog opens
  useEffect(() => {
    if (open) {
      fetchMenuItems();
    }
  }, [open]);

  // Fetch videos when active category or page changes
  useEffect(() => {
    fetchVideos(activeCategory);
  }, [activeCategory, pagination.current_page]);

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      const data = await httpReq(params, `appapi/video-lib/getMenu`);
      
      if (data && Array.isArray(data)) {
        setMenuItems(data);
        // Set the first menu item as active by default
        // if (data.length > 0 && !activeCategory) {
        //   setActiveCategory(data[0].value);
        // }
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVideos = async (categoryId: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams(`page=${pagination.current_page}`);
      if (categoryId) {
        params.append('category_id', categoryId);
      }
      
      const {list, pagination: page} = await httpReq(params, `appapi/video-lib/index`);
      
      if (list) {
        // Handle both array response and paginated response formats
        if (Array.isArray(list)) {
          setVideos(list);
          setPagination({
            ...page
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoSelect = (video: VideoItem) => {
    if (onSelectVideo) {
      onSelectVideo(video);
    }
    // onOpenChange(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.total_pages) {
      setPagination({
        ...pagination,
        current_page: newPage
      })
    }
  };

  // Recursive component to render menu items with nested children
  const renderMenuItem = (item: MenuItem, depth = 0) => {
    return (
      <div key={item.value} className="space-y-1">
        <button
          onClick={() => {
            setActiveCategory(item.value);
            setPagination({
                current_page: 1,
                total_pages: 0,
                total: 0
            }); // Reset to first page when changing category
          }}
          className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
            activeCategory === item.value
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
          style={{ paddingLeft: `${depth * 8 + 12}px` }}
        >
          {item.label}
        </button>
        {item.children && item.children.length > 0 && (
          <div className="pl-2">
            {item.children.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="flex h-[600px] flex-col">
          <div className="flex flex-1 overflow-hidden">
            {/* 左侧菜单 */}
            <div className="w-48 border-r border-border bg-muted/50">
              <div className="p-4 font-medium">视频库</div>
              <ScrollArea className="h-[calc(100%-56px)]">
                <div className="space-y-1 p-2">
                  {isLoading && menuItems.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">加载中...</div>
                  ) : (
                    menuItems.map(item => renderMenuItem(item))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* 右侧视频内容 */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-medium">视频列表</h3>
              </div>
              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground">
                    加载中...
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 p-4">
                    {videos && videos.length > 0 ? (
                      videos.map((video) => (
                        <div 
                          key={video.id} 
                          className="rounded-md overflow-hidden border border-border hover:border-primary cursor-pointer transition-colors"
                          onClick={() => handleVideoSelect(video)}
                        >
                          <div className="aspect-video bg-muted relative">
                            {video.preview && (
                              <img 
                                src={video.preview} 
                                alt={video.name} 
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="text-white"
                              >
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                              </svg>
                            </div>
                          </div>
                          <div className="p-2">
                            <p className="text-sm truncate">{video.name}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 flex items-center justify-center h-40 text-muted-foreground">
                        暂无视频
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
              
              {/* 分页控件 */}
              <div className="p-4 border-t border-border flex justify-end items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    第 {pagination.current_page} 页，共 {pagination.total_pages} 页
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.current_page === 1}
                      className={`p-2 rounded-md ${
                        pagination.current_page === 1
                          ? "text-muted-foreground cursor-not-allowed"
                          : "hover:bg-muted"
                      }`}
                      aria-label="First page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="11 17 6 12 11 7"></polyline>
                        <polyline points="18 17 13 12 18 7"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className={`p-2 rounded-md ${
                        pagination.current_page === 1
                          ? "text-muted-foreground cursor-not-allowed"
                          : "hover:bg-muted"
                      }`}
                      aria-label="Previous page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.total_pages}
                      className={`p-2 rounded-md ${
                        pagination.current_page === pagination.total_pages
                          ? "text-muted-foreground cursor-not-allowed"
                          : "hover:bg-muted"
                      }`}
                      aria-label="Next page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.total_pages)}
                      disabled={pagination.current_page === pagination.total_pages}
                      className={`p-2 rounded-md ${
                        pagination.current_page === pagination.total_pages
                          ? "text-muted-foreground cursor-not-allowed"
                          : "hover:bg-muted"
                      }`}
                      aria-label="Last page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="13 17 18 12 13 7"></polyline>
                        <polyline points="6 17 11 12 6 7"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoDialog;