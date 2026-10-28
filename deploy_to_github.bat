@echo off
echo ========================================================
echo  Deploying HomeMate to GitHub (Prafull044/HomeMate)
echo ========================================================
echo.

echo 1. Initializing Git...
git init

echo.
echo 2. Staging files...
git add .

echo.
echo 3. Creating commit...
git commit -m "Configure HomeMate for Railway deployment"

echo.
echo 4. Setting branch to main...
git branch -M main

echo.
echo 5. Setting remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/Prafull044/HomeMate.git

echo.
echo 6. Pushing to GitHub...
git push -u origin main

echo.
echo ========================================================
echo  Done! Your code is now on GitHub:
echo  https://github.com/Prafull044/HomeMate
echo ========================================================
pause
