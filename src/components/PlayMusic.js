import React, { useState } from 'react';
export const music = new Audio();

export const songs = [
  {
    path: 'music/System Of A Down - Toxicity (Official HD Video).mp4',
    title: 'System Of A Down - Toxicity (Official HD Video)',
    artist: 'System Of A Down',
    cover: 'img/テストサムネ４.jpg',
  },
  {
    path: 'music/MONTAGEM CORAL [PHONK] (Slowed & Reverb).mp4',
    title: 'MONTAGEM CORAL [PHONK] (Slowed & Reverb)',
    artist: 'Hyper City',
    cover: 'img/テストサムネ７.jpg',
  },
  {
    path: 'music/PASTEL GHOST ~ ABYSS.mp4',
    title: 'PASTEL GHOST ~ ABYSS',
    artist: 'PASTEL GHOST',
    cover: 'img/テストサムネ６.jpg',
  },
  {
    path: 'music/Metallica_ Enter Sandman (Official Music Video).mp4',
    title: 'Metallica_ Enter Sandman (Official Music Video)',
    artist: 'Metallica',
    cover: 'img/テストサムネ８.jpg',
  },
  {
    path: 'music/【軽量版】［PV］Let Me Hear_Fear, and Loathing in Las Vegas.mp4',
    title: '［PV］Let Me Hear_Fear, and Loathing in Las Vegas',
    artist: 'Fear, and Loathing in Las Vegas',
    cover: 'img/テストサムネ２.jpg',
  },
  {
    path: 'music/Eternxlkz - SLAY! (Official Audio).mp4',
    title: 'Eternxlkz - SLAY! (Official Audio)',
    artist: 'Eternxlkz',
    cover: 'img/テストサムネ９.jpg',
  },
  {
    path: 'music/Kiss - I Was Made For Lovin You.mp4',
    title: 'Kiss - I Was Made For Lovin You',
    artist: 'Kiss',
    cover: 'img/テストサムネ５.jpg',
  },
  {
    path: 'music/Eternxlkz - BRODYAGA FUNK (Official Audio).mp4',
    title: 'Eternxlkz - BRODYAGA FUNK (Official Audio)',
    artist: 'Eternxlkz',
    cover: 'img/テストサムネ１０.jpg',
  },
  {
    path: 'music/Ariis - FUNK DO BOUNCE (SLOWED).mp4',
    title: 'Ariis - FUNK DO BOUNCE (SLOWED)',
    artist: 'Ariis',
    cover: 'img/テストサムネ１１.jpg',
  },
  {
    path: 'music/Eternxlkz - ENOUGH! (Official Audio).mp4',
    title: 'Eternxlkz - ENOUGH! (Official Audio)',
    artist: 'Eternxlkz',
    cover: 'img/テストサムネ１２.jpg',
  },
];

// export let currentSongIndex = 0;

// export function setCurrentSongIndex(newIndex) {
//   currentSongIndex = newIndex;
// }
// const [firstClick, setFirstClick] = useState(true);
let n = 0;
export function playSong(index) {
  if (!music.paused && n === 0) {
    n = 1;
    music.src = songs[index].path;
    music.play();
    return;
  } else if (n === 1) {
    n = 0;
    return;
  }
  music.src = songs[index].path;
  music.play();
  // music.play();
  // title.textContent = songs[index].title;
  // artist.textContent = songs[index].artist;
  // thumbnail.setAttribute('src', `${songs[index].cover}`);
}

// export { music, Songs, playSong };

export function loadSong(index) {
  music.src = songs[index].path;
  music.load();
}
