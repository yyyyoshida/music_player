// spotifyConfig.js;
const CLIENT_ID = 'a97251d0ab5e40c7bc41a3997e166e2d';
const CLIENT_SECRET = '56318a7b9973426cbbfa2abcbf864ca0';
const REDIRECT_URI = 'http://localhost:3000/callback';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-read-recently-played',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

const LOGIN_URL = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(SCOPES)}&response_type=${RESPONSE_TYPE}&show_dialog=true`;

export default LOGIN_URL;
