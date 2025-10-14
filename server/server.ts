import "dotenv/config";
import express from "express";
import cors from "cors";

import tokenRouter from "./routes/token.js";
import playlistsGetRouter from "./routes/playlists-get.js";
import playlistsModifyRouter from "./routes/playlists-modify.js";
import playlistsAddRouter from "./routes/playlists-add.js";

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
