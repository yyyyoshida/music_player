const CLIENT_ID = process.env.REACT_APP_SPOTIFY_API_CLIENT_ID;

const REDIRECT_URI = "http://localhost:3000/";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "code";

const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-recently-played",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

const LOGIN_URL = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(SCOPES)}&response_type=${RESPONSE_TYPE}&show_dialog=true`;

export default LOGIN_URL;
