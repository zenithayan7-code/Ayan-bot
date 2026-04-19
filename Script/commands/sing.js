const axios = require("axios");
const fs = require('fs-extra');

module.exports.config = {
    name: "sing",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayan",
    description: "YouTube Music",
    commandCategory: "media",
    usages: "[song name]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const songName = args.join(" ");
    if (!songName) return api.sendMessage("গানের নাম দিন ভাই!", event.threadID, event.messageID);

    try {
        api.sendMessage(`🔍 "${songName}" গানটি খুঁজে পাঠাচ্ছি...`, event.threadID, event.messageID);

        // সরাসরি ডাইরেক্ট এপিআই লিঙ্ক
        const res = await axios.get(`https://api.vyturex.com/yt-dl?url=https://www.youtube.com/watch?v=search?query=${encodeURIComponent(songName)}`);
        
        const audioUrl = res.data.audioUrl;
        const title = res.data.title || "Your Song";

        const path = __dirname + `/cache/ayan_song.mp3`;
        
        const data = (await axios.get(audioUrl, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(path, Buffer.from(data, "utf-8"));

        return api.sendMessage({
            body: `✅ ${title}`,
            attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);

    } catch (e) {
        return api.sendMessage("❌ এখনো সমস্যা হচ্ছে! ছোট কোনো গানের নাম লিখে ট্রাই করেন তো ভাই।", event.threadID, event.messageID);
    }
}
