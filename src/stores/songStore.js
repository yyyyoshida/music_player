// // import { currentSongIndex, setCurrentSongIndex } from "../components/PlayMusic";

// import { create } from 'zustand';
// import { music, songs, playSong } from '../components/PlayMusic';
// // import { currentSongIndex } from '../components/PlayMusic';

// export const useSongStore = create((set) => ({
//   currentSongIndex: 0,
//   setCurrentSongIndex: (index) => set({ currentSongIndex: index }),

//   nextSong: () =>
//     set((state) => ({
//       currentSongIndex: (state.currentSongIndex + 1) % songs.length,
//     })),

//   prevSong: () =>
//     set((state) => ({
//       currentSongIndex: (state.currentSongIndex - 1 + songs.length) % songs.length,
//     })),
// }));

// import { create } from 'zustand';
// import { songs } from '../components/PlayMusic';

// export const useSongStore = create((set, get) => ({
//   currentSongIndex: 0,

//   setCurrentSongIndex: (index) => set({ currentSongIndex: index }),

//   nextSong: () =>
//     set((state) => ({
//       currentSongIndex: (state.currentSongIndex + 1) % songs.length,
//     })),

//   prevSong: () =>
//     set((state) => ({
//       currentSongIndex: (state.currentSongIndex - 1 + songs.length) % songs.length,
//     })),

//   // ✅ getState() を追加
//   getState: () => get(),
// }));
