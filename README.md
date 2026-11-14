# Unified CV Master Studio 📄✨

**MD SHOYEB RABBI - Executive Master Technical CV & Career Studio**

An executive, ATS-optimized master CV builder, interactive style combiner, live editor, and multi-format exporter designed to be 100% portable, offline-capable, and immediately deployable to **GitHub Pages**, **Vercel**, or **Netlify**.

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🌐 How to Deploy to GitHub Pages (গিটহাবে কীভাবে লাইভ করবেন)

এই প্রোজেক্টটি সম্পূর্ণভাবে গিটহাব পেজেস (GitHub Pages) এবং Vercel/Netlify-এর জন্য অপ্টিমাইজ করা হয়েছে। কোনো ব্যাকএন্ড সার্ভার বা গোপন API কী ছাড়াই ক্লায়েন্ট-সাইডে সম্পূর্ণ অ্যাপ কাজ করে।

### ধাপ ১: গিট রিপোজিটরি তৈরি ও পুশ করুন
আপনার কম্পিউটারের টার্মিনাল বা VS Code-এ নিচের কমান্ডগুলো চালান:

```bash
# গিট ইনিশিয়ালাইজ করুন
git init

# সব ফাইল যুক্ত করুন
git add .

# কমিট করুন
git commit -m "feat: complete unified CV master studio ready for deployment"

# মেইন ব্রাঞ্চ সেট করুন
git branch -M main

# আপনার গিটহাব রিপোজিটরির লিঙ্ক যুক্ত করুন (আপনার ইউজারনেম ও রেপো নাম দিয়ে প্রতিস্থাপন করুন)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# পুশ করুন
git push -u origin main
```

### ধাপ ২: GitHub Pages চালু করুন (স্বয়ংক্রিয়)
এই প্রোজেক্টে `.github/workflows/deploy.yml` আগে থেকেই কনফিগার করা আছে। তাই পুশ করার পর:

1. আপনার গিটহাব রিপোজিটরিতে যান।
2. **Settings** ট্যাবে ক্লিক করুন।
3. বাম পাশের মেনু থেকে **Pages**-এ ক্লিক করুন।
4. **Build and deployment** সেকশনের নিচে **Source** ড্রপডাউন থেকে **GitHub Actions** সিলেক্ট করুন।
5. ব্যস! মাত্র ১-২ মিনিটের মধ্যে আপনার ওয়েবসাইট লাইভ হয়ে যাবে:
   `https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/`

---

## ⚡ কেন এই প্রোজেক্টে গিটহাবে কোনো সমস্যা হবে না?

1. **Relative Asset Path (`base: './'`)**:
   `vite.config.ts`-এ `base: './'` যুক্ত করা আছে। এর ফলে গিটহাব পেজেস সাব-পাথে হোস্ট হলেও কোনো ব্ল্যাঙ্ক স্ক্রিন বা 404 অ্যাসেট এরর হবে না।
2. **Zero Server Dependency**:
   সব ফিচার (ATS স্কোরিং, JD কিউয়ার্ড অ্যানালাইজার, জিমেইল সিগনেচার, এক্সেল/ওয়ার্ড/পিডিএফ এক্সপোর্ট, লোকাল স্টোরেজ অটো-সেভ) ব্রাউজারের ভেতর নিরাপদে চলে।
3. **Automated GitHub Actions Pipeline**:
   `.github/workflows/deploy.yml` ফাইলের মাধ্যমে প্রতিবার `git push` করলেই স্বয়ংক্রিয়ভাবে বিল্ড হয়ে পেজেস আপডেট হয়ে যাবে।
4. **Multi-Format Export**:
   - PDF (ভেক্টর পেজ-বাই-পেজ প্রিন্ট এবং ডিরেক্ট হাই-রেজুলিউশন PDF)
   - Word (.doc & .docx)
   - 5-Sheet Excel Workbook (.xlsx)
   - CSV
   - Markdown (.md)
   - Plain Text (.txt)
   - Standalone HTML (.html)
   - JSON Backup & Restore

---

## 🛠️ Build for Production
```bash
npm run build
```
The compiled production bundle will be created in the `dist/` directory.
