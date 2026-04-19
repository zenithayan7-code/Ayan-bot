const axios = require("axios");
const fs = require('fs');

module.exports.config = {
    name: "sing",
    version: "2.5.0",
    aliases: ["music", "play"],
    credits: "Ayan & Gemini",
    countDown: 5,
    hasPermssion: 0,
    description: "ইউটিউব থেকে গান ডাউনলোড করুন",
    category: "media",
    commandCategory: "media",
    usePrefix: true,
    prefix: true,
    usages: "{pn} [গানের নাম]"
};

module.exports.run = async ({ api, args, event }) => {
    let keyWord = args.join(" ");
    if (!keyWord) return api.sendMessage("গানের নাম তো লিখলেন না ভাই!", event.threadID, event.messageID);

    try {
        api.sendMessage(`🔍 "${keyWord}" গানটি খুঁজছি, একটু অপেক্ষা করুন...`, event.threadID, event.messageID);
        
        // গানের সার্চ করার জন্য API
        const res = await axios.get(`https://api-improve-production.up.railway.app/yt/search?name=${encodeURIComponent(keyWord)}`);
        const result = res.data.slice(0, 6);

        if (result.length == 0) return api.sendMessage("দুঃখিত ভাই, গানটি খুঁজে পেলাম না।", event.threadID, event.messageID);

        let msg = "তানভীর ইভানের ফ্যান অয়ন ভাইয়ের জন্য গানের লিস্ট:\n\n";
        let thumbnails = [];
        
        for (let i = 0; i < result.length; i++) {
            msg += `${i + 1}. ${result[i].title}\n⏰ সময়: ${result[i].duration}\n\n`;
        }

        api.sendMessage({ body: msg + "কত নম্বর গানটি শুনতে চান? রিপ্লাই দিন।" }, event.threadID, (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                result
            });
        }, event.messageID);

    } catch (err) {
        api.sendMessage("সার্চ করার সময় একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।", event.threadID);
    }
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
    const { result, author } = handleReply;
    if (event.senderID != author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice > result.length || choice <= 0) return api.sendMessage("সঠিক নম্বর দিন ভাই (১-৬)।", event.threadID, event.messageID);

    try {
        const video = result[choice - 1];
        const videoUrl = video.url;
        
        api.unsendMessage(handleReply.messageID);
        api.sendMessage(`⏳ "${video.title}" ডাউনলোড হচ্ছে...`, event.threadID, event.messageID);

        // অডিও ডাউনলোড করার নতুন শক্তিশালী API
        const downloadRes = await axios.get(`https://api-improve-production.up.railway.app/yt/download?url=${encodeURIComponent(videoUrl)}&format=mp3`);
        const downloadLink = downloadRes.data.downloadLink;

        const path = __dirname + `/cache/${Date.now()}.mp3`;
        const getAudio = (await axios.get(downloadLink, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(path, Buffer.from(getAudio, "utf-8"));

        api.sendMessage({
            body: `আপনার জন্য গানটি রেডি অয়ন ভাই! 🎶\n\nশিরোনাম: ${video.title}`,
            attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);

    } catch (error) {
        api.sendMessage("গানের ফাইলটি ২৫ এমবি-র বেশি হওয়ায় পাঠানো যাচ্ছে না। লিরিক্স বা অডিও ভার্সন ট্রাই করুন।", event.threadID, event.messageID);
    }
};
