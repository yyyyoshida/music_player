require("dotenv").config();

const express = require("express");
const cors = require("cors");

const tokenRouter = require("./routes/token");
const playlistsGetRouter = require("./routes/playlists-get");
const playlistsModifyRouter = require("./routes/playlists-modify");
const playlistsAddRouter = require("./routes/playlists-add");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("ローカルサーバー立ち上がってるお(・ω・)ノ！！");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

app.use("/api", tokenRouter);
app.use("/api", playlistsGetRouter);
app.use("/api", playlistsModifyRouter);
app.use("/api", playlistsAddRouter);
