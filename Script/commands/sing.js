const axios = require("axios");
const fs = require('fs-extra');

module.exports.config = {
    name: "sing",
    version: "1.0.0",
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
        api.sendMessage(`🔍 "${keyWord}" গানটি খুঁজছি...`, event.threadID, event.messageID);

        // সরাসরি কাজ করবে এমন একটি পাবলিক API
        const res = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(keyWord)}`);
        
        // যদি উপরেরটা কাজ না করে, তবে এই নিচের লিঙ্কটি ব্যবহার হবে
        const searchURL = `https://api.popcat.xyz/lyrics?song=${encodeURIComponent(keyWord)}`;
        const searchRes = await axios.get(searchURL);
        
        const title = searchRes.data.title || keyWord;
        const artist = searchRes.data.artist || "Unknown";
        
        // অডিও ডাউনলোডের জন্য ব্যাকআপ API
        const downloadUrl = `https://api.djasubandri.repl.co/yt/play?query=${encodeURIComponent(keyWord)}`;
        
        const path = __dirname + `/cache/sing_${event.senderID}.mp3`;
        
        const data = (await axios.get(downloadUrl, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(path, Buffer.from(data, "utf-8"));

        return api.sendMessage({
            body: `✅ আপনার গান রেডি!\n🎵 নাম: ${title}\n👤 শিল্পী: ${artist}`,
            attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);

    } catch (e) {
        return api.sendMessage("দুঃখিত অয়ন ভাই, ইউটিউব সার্ভারে সমস্যা হচ্ছে। লিরিক্স ভিডিও ট্রাই করুন।", event.threadID, event.messageID);
    }
}
