import { IVideo } from "@designcombo/types";
import { VIDEOS } from "../data/video";
import { BehaviorSubject, Observable } from "rxjs";

/**
 * 视频数据服务
 * 用于集中管理视频数据，提供获取、更新和订阅功能
 */
class VideoService {
  // 使用 BehaviorSubject 存储视频数据，以便可以订阅变化
  private videosSubject = new BehaviorSubject<Partial<IVideo>[]>(VIDEOS);

  /**
   * 获取视频数据的可观察对象
   */
  public getVideos(): Observable<Partial<IVideo>[]> {
    return this.videosSubject.asObservable();
  }

  /**
   * 获取当前视频数据的快照
   */
  public getVideosSnapshot(): Partial<IVideo>[] {
    return this.videosSubject.getValue();
  }

  /**
   * 获取指定ID的视频
   * @param id 视频ID
   */
  public getVideoById(id: string): Partial<IVideo> | undefined {
    return this.getVideosSnapshot().find(video => video.id === id);
  }

  /**
   * 更新视频数据
   * @param videos 新的视频数据
   */
  public updateVideos(videos: Partial<IVideo>[]): void {
    this.videosSubject.next(videos);
  }

  /**
   * 添加新视频
   * @param video 要添加的视频
   */
  public addVideo(video: Partial<IVideo>): void {
    const currentVideos = this.getVideosSnapshot();
    this.videosSubject.next([...currentVideos, video]);
  }

  /**
   * 更新指定视频
   * @param id 视频ID
   * @param videoData 更新的视频数据
   */
  public updateVideo(id: string, videoData: Partial<IVideo>): void {
    const currentVideos = this.getVideosSnapshot();
    const updatedVideos = currentVideos.map(video => 
      video.id === id ? { ...video, ...videoData } : video
    );
    this.videosSubject.next(updatedVideos);
  }

  /**
   * 删除指定视频
   * @param id 要删除的视频ID
   */
  public deleteVideo(id: string): void {
    const currentVideos = this.getVideosSnapshot();
    const filteredVideos = currentVideos.filter(video => video.id !== id);
    this.videosSubject.next(filteredVideos);
  }
}

// 创建单例实例
export const videoService = new VideoService();