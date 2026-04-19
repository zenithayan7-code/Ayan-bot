const axios = require("axios");
const fs = require('fs-extra');

module.exports.config = {
    name: "sing",
    version: "1.5.0",
    hasPermssion: 0,
    credits: "Ayan",
    description: "ইউটিউব মিউজিক ডাউনলোডার",
    commandCategory: "media",
    usages: "[গানের নাম]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const songName = args.join(" ");
    if (!songName) return api.sendMessage("গানের নাম দিন অয়ন ভাই!", event.threadID, event.messageID);

    try {
        api.sendMessage(`⏳ অয়ন ভাই, "${songName}" গানটি খুঁজে বের করে পাঠাচ্ছি...`, event.threadID, event.messageID);

        // এই API-টি বর্তমানে সচল এবং ফাস্ট
        const res = await axios.get(`https://api.shiron.site/yt/play?name=${encodeURIComponent(songName)}`);
        
        const { title, downloadLink } = res.data;
        const path = __dirname + `/cache/${Date.now()}.mp3`;

        const audioResponse = await axios.get(downloadLink, { responseType: "arraybuffer" });
        fs.writeFileSync(path, Buffer.from(audioResponse.data));

        if (fs.statSync(path).size > 26214400) {
            fs.unlinkSync(path);
            return api.sendMessage("❌ গানটি ২৫ এমবি-র বেশি, তাই পাঠানো গেল না। ছোট কোনো গান ট্রাই করুন!", event.threadID, event.messageID);
        }

        return api.sendMessage({
            body: `✅ আপনার গান রেডি!\n🎵 শিরোনাম: ${title}`,
            attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);

    } catch (e) {
        console.log(e);
        return api.sendMessage("❌ এখনো হচ্ছে না! ইউটিউব সার্ভারে সমস্যা। আপনি কি /video কমান্ড দিয়ে গানটি দেখতে চান?", event.threadID, event.messageID);
    }
}
