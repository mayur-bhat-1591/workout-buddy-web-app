export const startVideoRecording = async (): Promise<MediaRecorder | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: false
    });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8'
    });

    return mediaRecorder;
  } catch (error) {
    console.error('Error starting video recording:', error);
    throw new Error('Could not access camera');
  }
};

export const stopVideoRecording = (mediaRecorder: MediaRecorder): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    mediaRecorder.onerror = (event) => {
      reject(new Error('Recording failed'));
    };

    mediaRecorder.stop();
    
    // Stop all tracks to release camera
    if (mediaRecorder.stream) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  });
};

export const createVideoPreview = (videoBlob: Blob): string => {
  return URL.createObjectURL(videoBlob);
};

export const cleanupVideoUrl = (videoUrl: string): void => {
  URL.revokeObjectURL(videoUrl);
};

export const validateVideoFile = (file: File): boolean => {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const getVideoDuration = (videoFile: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    video.addEventListener('loadedmetadata', () => {
      resolve(video.duration);
    });
    
    video.addEventListener('error', () => {
      reject(new Error('Could not load video metadata'));
    });
    
    video.src = URL.createObjectURL(videoFile);
  });
};