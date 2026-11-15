# GitHub Pages-এ এই project live করার নির্দেশিকা

এই project-এ GitHub Actions workflow আগে থেকেই আছে। `main` বা `master` branch-এ push হলে GitHub নিজে dependency install করে build করে GitHub Pages-এ deploy করবে। এই নির্দেশিকাটি Windows-এর VS Code Terminal, PowerShell বা CMD-এর জন্য।

## ১. পুরো project folder প্রস্তুত করুন

শুধু একটি `.tsx`, `.html` বা অন্য কোনো code file upload করবেন না। পুরো project folder ব্যবহার করতে হবে—বিশেষ করে `src`, `public`, `package.json`, `package-lock.json`, `vite.config.ts` এবং `.github/workflows/deploy.yml`।

`node_modules`, `dist` ও `dev-dist` upload করার দরকার নেই। `.gitignore` এগুলো বাদ দেয়; GitHub Actions build-এর সময় নতুন `dist` তৈরি করবে।

এই project-এ `firebase-applet-config.json` app-এর build-এর জন্য প্রয়োজন, তাই সেটি project folder-এ রাখুন। এটি Firebase-এর browser/client configuration—কোনো service-account private key বা password নয়। `.env` বা অন্য কোনো secret থাকলে GitHub-এ যোগ করবেন না।

## ২. Local build পরীক্ষা করুন (ঐচ্ছিক, তবে সুপারিশকৃত)

VS Code-এ project folder খুলে **Terminal → New Terminal** নির্বাচন করুন। Terminal যেন project-এর root folder-এ থাকে—সেখানে `package.json` দেখা যাবে। এরপর চালান:

```powershell
npm install --legacy-peer-deps
npm run lint
npm run build
```

সব ঠিক থাকলে `npm run build` শেষে `dist` folder তৈরি হবে। `dist` নিজে upload করবেন না; Actions এটি আবার তৈরি করবে।

## ৩. GitHub-এ খালি repository তৈরি করুন

1. GitHub-এ sign in করে **New repository** তৈরি করুন।
2. Repository-র নাম দিন, যেমন `cv-studio`।
3. Repository public/private নির্বাচন করুন। Public করলে source code ও তাতে থাকা public CV তথ্য যে কেউ দেখতে পারবে—সেটি আগে যাচাই করুন।
4. GitHub-কে README, `.gitignore` বা license দিয়ে repository initialize করতে বলবেন না; একেবারে empty repository তৈরি করুন।

## ৪. Project push করুন

VS Code Terminal-এ project root-এ থেকে নিচের command-গুলো একে একে চালান। `YOUR_GITHUB_USERNAME` ও `YOUR_REPOSITORY_NAME` নিজের তথ্য দিয়ে বদলাবেন।

```powershell
git init
git branch -M main
git add .
git status --short
```

`git status --short`-এর তালিকা দেখে নিন। `.env`, password, private key বা অপ্রয়োজনীয় ব্যক্তিগত ফাইল থাকলে commit করবেন না। `node_modules`, `dist` ও `dev-dist` তালিকায় থাকার কথা নয়। প্রয়োজনীয় source/config ফাইল ঠিক থাকলে চালান:

```powershell
git commit -m "Deploy CV Studio to GitHub Pages"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

GitHub sign-in চাইলে নিজের GitHub account দিয়ে অনুমোদন করুন। Repository-তে আগে থেকেই `origin` remote থাকলে `git remote add origin` চালানোর আগে `git remote -v` দিয়ে সেটি পরীক্ষা করুন।

## ৫. GitHub Pages চালু করুন

1. GitHub repository-তে **Settings → Pages** খুলুন।
2. **Build and deployment → Source** থেকে **GitHub Actions** নির্বাচন করুন।
3. **Actions** tab খুলে `Deploy to GitHub Pages` workflow-র run দেখুন।
4. Workflow সফল হলে Pages-এর URL হবে:

   `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/`

   Repository-র নাম `YOUR_GITHUB_USERNAME.github.io` হলে URL হবে `https://YOUR_GITHUB_USERNAME.github.io/`।

প্রথম deployment-এ কয়েক মিনিট লাগতে পারে। এরপর `main` branch-এ নতুন commit push করলেই site আবার build ও deploy হবে।

## Firebase ও custom domain সম্পর্কে

- GitHub Pages-এ static app publish করতে Firestore rules বা database data পরিবর্তন করার দরকার নেই। এই project-এর deploy workflow শুধু website build ও publish করে।
- Firebase Authentication-এ owner login ব্যবহার করলে GitHub Pages-এর host (`YOUR_GITHUB_USERNAME.github.io`) Firebase Authentication-এর **Authorized domains**-এ যোগ করার প্রয়োজন হতে পারে। Login-এ domain-related error হলেই এটি যাচাই করুন; Firestore rules পরিবর্তন করবেন না।
- আগে থেকে ব্যবহার করা custom domain-এ এই deployment স্বয়ংক্রিয়ভাবে যাবে না। GitHub Pages-এ custom domain যোগ করতে DNS পরিবর্তন লাগে। বর্তমান live site অক্ষত রাখতে domain/DNS পরিবর্তনের আগে নিশ্চিত হোন যে সেটিই এই project-এর জন্য চান।

## সমস্যা হলে

- **Actions workflow ব্যর্থ:** Repository-র **Actions** tab খুলে ব্যর্থ step-এর error দেখুন। `npm ci` lockfile-এর সঙ্গে `package.json` মিলিয়ে install করে; `package-lock.json` commit হয়েছে কি না পরীক্ষা করুন।
- **Pages URL-এ site না খুললে:** Pages source `GitHub Actions` কি না এবং workflow সফল কি না যাচাই করুন।
- **Firebase owner login ব্যর্থ হলে:** error-এ domain উল্লেখ আছে কি না দেখুন; থাকলে Firebase Authentication-এর Authorized domains যাচাই করুন। Database rules অকারণে পরিবর্তন করবেন না।
- **আগে থেকেই অন্য Git repository ব্যবহার করলে:** `git init` আবার চালানোর আগে `git status` ও `git remote -v` দিয়ে বর্তমান repository/remote যাচাই করুন।
