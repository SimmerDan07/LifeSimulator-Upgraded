@echo off
setlocal EnableExtensions
title Life Simulator - Build APK
rem Builds the Android version of Life Simulator (Upgraded) into an .apk you can install on a phone or tablet.
rem Needs Android Studio (free): https://developer.android.com/studio - install it and open it once so it
rem finishes its setup (it downloads the Android SDK). Nothing else is needed.

cd /d "%~dp0android"
if not exist "gradlew.bat" (
    echo Can't find the "android" folder next to this file.
    echo Keep "Build APK.bat", "android" and "node_modules" together in the same folder.
    pause & exit /b 1
)

rem ---- Java: use the copy that comes with Android Studio
set "JBR="
for %%D in ("%ProgramFiles%\Android\Android Studio\jbr" "%LOCALAPPDATA%\Programs\Android Studio\jbr" "%ProgramFiles(x86)%\Android\Android Studio\jbr" "%LOCALAPPDATA%\Android\Android Studio\jbr") do (
    if not defined JBR if exist "%%~D\bin\java.exe" set "JBR=%%~D"
)
if defined JBR set "JAVA_HOME=%JBR%"
if not defined JAVA_HOME (
    echo Android Studio was not found.
    echo Install it from https://developer.android.com/studio , open it once, then run this again.
    pause & exit /b 1
)

rem ---- Android SDK (Android Studio puts it in %LOCALAPPDATA%\Android\Sdk)
if not defined ANDROID_HOME if defined ANDROID_SDK_ROOT set "ANDROID_HOME=%ANDROID_SDK_ROOT%"
if not defined ANDROID_HOME set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not exist "%ANDROID_HOME%\platforms" (
    echo The Android SDK was not found at "%ANDROID_HOME%".
    echo Open Android Studio once and let it finish the setup wizard ^(Standard^), then run this again.
    pause & exit /b 1
)
set "SDKDIR=%ANDROID_HOME:\=/%"
> local.properties echo sdk.dir=%SDKDIR%

rem ---- version, for the file name
set "VER="
if exist "app\version.txt" set /p VER=<"app\version.txt"
if not defined VER set "VER=latest"
set "OUT=%~dp0LifeSimulator-v%VER%.apk"

echo.
echo Building Life Simulator v%VER% for Android...
echo The first build downloads build tools ^(about 1 GB^) and can take 5-15 minutes. Later builds are quick.
echo.
call gradlew.bat assembleRelease --no-daemon
if errorlevel 1 (
    echo.
    echo The build failed. Scroll up for the first error.
    echo Tip: if it mentions a path that is too long, move this folder somewhere short like C:\LifeSim and try again.
    pause & exit /b 1
)
copy /y "app\build\outputs\apk\release\app-release.apk" "%OUT%" >nul
echo.
echo Done: %OUT%
echo Copy it to your phone or tablet and open it to install ^(allow "Install unknown apps" when asked^).
explorer /select,"%OUT%"
pause
