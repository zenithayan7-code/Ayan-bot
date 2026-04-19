const axios = require("axios");
const fs = require('fs-extra');

module.exports.config = {
    name: "sing",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ayan",
    description: "ইউটিউব থেকে গান ডাউনলোড",
    commandCategory: "media",
    usages: "[গানের নাম]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const keyWord = args.join(" ");
    if (!keyWord) return api.sendMessage("গানের নাম দিন অয়ন ভাই!", event.threadID, event.messageID);

    try {
        api.sendMessage(`🔍 অয়ন ভাই, "${keyWord}" গানটি খুঁজছি...`, event.threadID, event.messageID);

        // এটি একটি সুপার ফাস্ট এবং ওয়ার্কিং API
        const res = await axios.get(`https://api.vyturex.com/yt-search?query=${encodeURIComponent(keyWord)}`);
        const video = res.data[0];

        if (!video) return api.sendMessage("গানটি পাওয়া যায়নি!", event.threadID, event.messageID);

        const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
        
        // ডাউনলোড লিঙ্ক পাওয়ার জন্য অন্য একটি ব্যাকআপ API
        const downloadRes = await axios.get(`https://api.vyturex.com/yt-dl?url=${videoUrl}`);
        const audioUrl = downloadRes.data.audioUrl;

        const path = __dirname + `/cache/${event.senderID}_song.mp3`;
        
        const audioData = (await axios.get(audioUrl, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(path, Buffer.from(audioData, "utf-8"));

        return api.sendMessage({
            body: `🎶 আপনার গান রেডি অয়ন ভাই!\n\n🎵 নাম: ${video.title}\n⏰ সময়: ${video.duration}`,
            attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);

    } catch (e) {
        return api.sendMessage("এরর: ইউটিউব সার্ভারে জ্যাম লেগেছে অথবা গানটি অনেক বড়। অন্য গান ট্রাই করুন!", event.threadID, event.messageID);
    }
}
