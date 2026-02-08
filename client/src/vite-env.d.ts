/// <reference types="vite/client" />

// Allow importing video files
declare module '*.mp4' {
    const src: string;
    export default src;
}
