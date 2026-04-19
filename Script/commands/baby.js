const axios = require("axios");

const apiList = "https://raw.githubusercontent.com/shahadat-sahu/SAHU-API/refs/heads/main/SAHU-API.json";
const getMainAPI = async () => (await axios.get(apiList)).data.simsimi;

module.exports.config = {
 name: "baby",
 version: "1.0.3",
 hasPermssion: 1,
 credits: "AYAN",
 description: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion ☢️",
 commandCategory: "Chat",
 usages: "[message/query]",
 cooldowns: 0,
 prefix: true
};

module.exports.run = async function ({ api, event, args, Users }) {
 try {  const threadInfo = await api.getThreadInfo(event.threadID);
 const botAdminID = "61573291456091"; 
 if (!threadInfo.adminIDs.some(item => item.id == event.senderID) && event.senderID != botAdminID) return;
      
      
 const uid = event.senderID;
 const senderName = await Users.getNameUser(uid);
 const rawQuery = args.join(" ");
 const query = rawQuery.toLowerCase();
 const simsim = await getMainAPI();

 if (!query) {
 const ran = ["Bolo baby", "hum"];
 const r = ran[Math.floor(Math.random() * ran.length)];
 return api.sendMessage(r, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 });
 }

 const command = args[0].toLowerCase();

 if (["remove", "rm"].includes(command)) {
 const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
 if (parts.length < 2) return api.sendMessage("Use: remove [Question] - [Reply]", event.threadID, event.messageID);
 const [ask, ans] = parts.map(p => p.trim());
 const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 if (command === "list") {
 const res = await axios.get(`${simsim}/list`);
 if (res.data.code === 200) {
 return api.sendMessage(
 `♾ Total Questions Learned: ${res.data.totalQuestions}\n★ Total Replies Stored: ${res.data.totalReplies}\nDeveloper: ${res.data.author}`,
 event.threadID, event.messageID
 );
 } else return api.sendMessage(`Error: ${res.data.message}`, event.threadID, event.messageID);
 }

 if (command === "edit") {
 const parts = rawQuery.replace(/^edit\s*/i, "").split(" - ");
 if (parts.length < 3) return api.sendMessage("Use: edit [Q] - [Old] - [New]", event.threadID, event.messageID);
 const [ask, oldReply, newReply] = parts.map(p => p.trim());
 const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 if (command === "teach") {
 const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
 if (parts.length < 2) return api.sendMessage("Use: teach [Q] - [Reply]", event.threadID, event.messageID);
 const [ask, ans] = parts.map(p => p.trim());
 const groupID = event.threadID;
 let groupName = event.threadName ? event.threadName : "";
 try {
 if (!groupName && groupID != uid) {
 const threadInfo = await api.getThreadInfo(groupID);
 if (threadInfo?.threadName) groupName = threadInfo.threadName;
 }
 } catch {}

 let teachUrl = `${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}&groupID=${encodeURIComponent(groupID)}`;
 if (groupName) teachUrl += `&groupName=${encodeURIComponent(groupName)}`;
 const res = await axios.get(teachUrl);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
 const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const rep of replies) {
 await new Promise(resolve => {
 api.sendMessage(rep, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 });
 }

 } catch (err) {
 return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
 }
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
 try {  const threadInfo = await api.getThreadInfo(event.threadID);
 const botAdminID = "61573291456091"; 
 if (!threadInfo.adminIDs.some(item => item.id == event.senderID) && event.senderID != botAdminID) return;
      
      
 const senderName = await Users.getNameUser(event.senderID);
 const replyText = event.body ? event.body.toLowerCase() : "";
 if (!replyText) return;
 const simsim = await getMainAPI();
 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`);
 const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const rep of replies) {
 await new Promise(resolve => {
 api.sendMessage(rep, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 });
 }

 } catch (err) {
 return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
 }
};
module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const botAdminID = "61573291456091"; 
    
    if (!threadInfo.adminIDs.some(item => item.id == event.senderID) && event.senderID != botAdminID) return;

    const raw = event.body ? event.body.toLowerCase() : "";

    // শুধু আপনার জন্য স্পেশাল রিপ্লাই
    if (event.senderID == botAdminID && (raw === "baby" || raw === "bot" || raw === "bby" || raw === "jan" || raw === "জান" || raw === "বট" || raw === "বেবি")) {
      return api.sendMessage("জি বস আয়ান, বলেন কী হুকুম? আপনার জন্য আমি সবসময় হাজির! ❤️", event.threadID, event.messageID);
    }

    // মেম্বারদের জন্য আপনার সেই আগের বড় লিস্ট
    const greetings = [
        "ল্পে তোমার নানি সেরা-🙊🙆‍♂️🤗",
        "কি বেপার আপনি শ্বশুর বাড়িতে যাচ্ছেন না কেন-🤔🥱🌻",
        "দিনশেষে পরের 𝐁𝐎𝐖 সুন্দর-☹️🤧",
        "-তাবিজ কইরা হইলেও ফ্রেম এক্কান করমুই তাতে যা হই হোক-🤧🥱🌻",
        "-ছোটবেলা ভাবতাম বিয়ে করলে অটোমেটিক বাচ্চা হয়-🥱-ওমা এখন দেখি কাহিনী অন্যরকম-😦🙂🌻",
        "প্রেম করতে চাইলে বস আয়ান ইনবক্সে চলে যা 😏🐸 https://www.facebook.com/profile.php?id=61573291456091",
        "-আজ একটা বিন নেই বলে ফেসবুকের নাগিন-🤧-গুলোরে আমার বস সাহু ধরতে পারছে না-🐸🥲",
        "-চুমু থাকতে তোরা বিড়ি খাস কেন বুঝা আমারে-😑😒🐸⚒️",
        "—যে ছেড়ে গেছে-😔-তাকে ভুলে যাও-🙂-আমার বস আয়ান এর সাথে প্রেম করে তাকে দেখিয়ে দাও-🙈🐸🤗",
        "—হাজারো লুচ্চা লুচ্চির ভিরে-🙊🥵আমার বস আয়ান এক নিস্পাপ ভালো মানুষ-🥱🤗🙆‍♂️",
        "-রূপের অহংকার করো না-🙂❤️চকচকে সূর্যটাও দিনশেষে অন্ধকারে পরিণত হয়-🤗💜",
        "সুন্দর মাইয়া মানেই-🥱আমার বস আয়ানে'র বউ-😽🫶আর বাকি গুলো আমার বেয়াইন-🙈🐸🤗",
        "এত অহংকার করে লাভ নেই-🌸মৃত্যুটা নিশ্চিত শুধু সময়টা অ'নিশ্চিত-🖤🙂",
        "-দিন দিন কিছু মানুষের কাছে অপ্রিয় হয়ে যাইতেছি-🙂😿🌸",
        "ভালোবাসার নামক আবলামি করতে চাইলে বস আয়ানের ইনবক্সে গুতা দিন🤣😼",
        "মেয়ে হলে বস আয়ান ইনবক্সে চলে যা 🤭🤣 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : https://www.facebook.com/profile.php?id=61573291456091",
        "হুদাই আমারে শয়তানে লারে-😝😑☹️",
        "-𝗜 𝗟𝗢𝗩𝗘 𝗬𝗢𝗨-😽-আহারে ভাবছো তোমারে প্রোপজ করছি-🥴-থাপ্পর দিয়া কিডনী লক করে দিব-😒-ভুল পড়া বের করে দিবো-🤭🐸",
        "-আমি একটা দুধের শিশু-😇-🫵𝗬𝗢𝗨🐸💦",
        "-কতদিন হয়ে গেলো বিছনায় মুতি না-😿-মিস ইউ নেংটা কাল-🥺🤧",
        "-বালিকা━👸-𝐃𝐨 𝐲𝐨𝐮-🫵-বিয়া-𝐦𝐞-😽-আমি তোমাকে-😻-আম্মু হইতে সাহায্য করব-🙈🥱",
        "-এই আন্টির মেয়ে-🫢🙈-𝐔𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐡-😽🫶-আসলেই তো স্বাদ-🥵💦-এতো স্বাদ কেন-🤔-সেই স্বাদ-😋",
        "-ইস কেউ যদি বলতো-🙂-আমার শুধু তোমাকেই লাগবে-💜🌸",
        "-একদিন সে ঠিকই ফিরে তাকাবে-😇-আর মুচকি হেসে বলবে ওর মতো আর কেউ ভালবাসেনি-🙂😅",
        "-হুদাই গ্রুপে আছি-🥺🐸-কেও ইনবক্সে নক দিয়ে বলে না জান তোমারে আমি অনেক ভালোবাসি-🥺🤧",
        "-দেশের সব কিছুই চুরি হচ্ছে-🙄-শুধু আমার বস আয়ান এর মনটা ছাড়া-🥴😑😏",
        "-🫵তোমারে প্রচুর ভাল্লাগে-😽-সময় মতো প্রপোজ করমু বুঝছো-🔨😼-ছিট খালি রাইখো- 🥱🐸🥵",
        "-আজ থেকে আর কাউকে পাত্তা দিমু না -!😏-কারণ আমি ফর্সা হওয়ার ক্রিম কিনছি -!🙂🐸"
    ];

    // মেম্বাররা ডাকলে র্যান্ডম রিপ্লাই
    if (raw === "baby" || raw === "bot" || raw === "bby" || raw === "jan" || raw === "জান" || raw === "বট" || raw === "বেবি") {
      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
      return api.sendMessage(randomReply, event.threadID, event.messageID);
    }
  } catch (err) {
    console.log(err);
  }
};
