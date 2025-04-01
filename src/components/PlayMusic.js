import React, { useState } from 'react';
export const music = new Audio();

export const songs = [
  {
    path: 'music/Mr.Kitty-AfterDark_part1_2.m4a',
    title: 'Mr.Kitty - After Dark',
    artist: 'Mr.Kitty',
    // cover: 'img/テストサムネ１３.jpg',
  },
  {
    path: 'music/Daisukefullver.m4a',
    title: 'Daisuke full ver. (歌詞・和訳付き).m4a',
    artist: '上澤',
    cover: 'img/maxresdefault.jpg',
  },
  {
    path: 'music/System of a Down - Toxicity (Remastered 2021).m4a',
    title: 'System Of A Down - Toxicity (Official HD Video)',
    artist: 'System Of A Down',
    cover: 'img/テストサムネ４.jpg',
  },
  {
    path: 'music/MONTAGEM CORAL [PHONK] (Slowed & Reverb).m4a',
    title: 'MONTAGEM CORAL [PHONK] (Slowed & Reverb)',
    artist: 'Hyper City',
    cover: 'img/テストサムネ７.jpg',
  },
  {
    path: 'music/PASTEL GHOST ~ ABYSS.m4a',
    title: 'PASTEL GHOST ~ ABYSS',
    artist: 'PASTEL GHOST',
    cover: 'img/テストサムネ６.jpg',
  },
  {
    path: 'music/Metallica_ Enter Sandman (Official Music Video)_part1_3.m4a',
    title: 'Metallica_ Enter Sandman (Official Music Video)',
    artist: 'Metallica',
    cover: 'img/テストサムネ８.jpg',
  },
  {
    path: 'music/［PV］Let Me Hear_Fear, and Loathing in Las Vegas.m4a',
    title: '［PV］Let Me Hear_Fear, and Loathing in Las Vegas',
    artist: 'Fear, and Loathing in Las Vegas',
    cover: 'img/テストサムネ２.jpg',
  },
  {
    path: 'music/Eternxlkz - SLAY! (Official Audio).m4a',
    title: 'Eternxlkz - SLAY! (Official Audio)',
    artist: 'Eternxlkz',
    cover: 'img/テストサムネ９.jpg',
  },
  {
    path: 'music/Kiss - I Was Made For Lovin You.m4a',
    title: 'Kiss - I Was Made For Lovin You',
    artist: 'Kiss',
    cover: 'img/テストサムネ５.jpg',
  },
  {
    path: 'music/Eternxlkz - BRODYAGA FUNK (Official Audio).m4a',
    title: 'Eternxlkz - BRODYAGA FUNK (Official Audio)',
    artist: 'Eternxlkz',
    cover: 'img/テストサムネ１０.jpg',
  },
  {
    path: 'music/Ariis - FUNK DO BOUNCE (SLOWED).m4a',
    title: 'Ariis - FUNK DO BOUNCE (SLOWED)',
    artist: 'Ariis',
    cover: 'img/テストサムネ１１.jpg',
  },
  {
    path: 'music/Eternxlkz - ENOUGH! (Official Audio).m4a',
    title: 'Eternxlkz - ENOUGH! (Official Audio)',
    artist: 'Eternxlkz',
    cover: 'img/テストサムネ１２.jpg',
  },
];

export function playSong(index) {
  music.src = songs[index].path;
  music.play();
}

export function loadSong(index) {
  music.src = songs[index].path;
  music.load();
}
