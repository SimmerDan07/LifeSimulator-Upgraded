@echo off
setlocal EnableExtensions
title Life Simulator - Build APK
rem Builds the Android version of Life Simulator (Upgraded) into an .apk you can install on a phone or tablet.
rem Needs Android Studio (free): https://developer.android.com/studio - install it and open it once so it
rem finishes its setup (it downloads the Android SDK).
rem Java: this build needs Java 21 to 24 (Java 25 is too new for it). The script finds one on its own, and if
rem there is none it downloads a private copy of Java 21 into the "tools" folder next to this file.

set "HERE=%~dp0"
cd /d "%HERE%android"
if not exist "gradlew.bat" (
    echo Can't find the "android" folder next to this file.
    echo Keep "Build APK.bat", "android" and "node_modules" together in the same folder.
    pause
    exit /b 1
)

rem ---- Java 21-24: Android Studio's own copy first, then any other installed JDK, then a private download
set "JAVA_OK="
set "JAVA_MAJOR="
call :tryjava "%ProgramFiles%\Android\Android Studio\jbr"
call :tryjava "%LOCALAPPDATA%\Programs\Android Studio\jbr"
call :tryjava "%ProgramFiles(x86)%\Android\Android Studio\jbr"
call :tryjava "%LOCALAPPDATA%\Android\Android Studio\jbr"
for /d %%D in ("%ProgramFiles%\Android\Android Studio*") do call :tryjava "%%~D\jbr"
for /d %%D in ("%LOCALAPPDATA%\Programs\Android Studio*") do call :tryjava "%%~D\jbr"
if defined JAVA_HOME call :tryjava "%JAVA_HOME%"
for /d %%D in ("%HERE%tools\jdk-21*") do call :tryjava "%%~D"
for /d %%D in ("%ProgramFiles%\Java\jdk-2*") do call :tryjava "%%~D"
for /d %%D in ("%ProgramFiles%\Eclipse Adoptium\jdk-2*") do call :tryjava "%%~D"
for /d %%D in ("%ProgramFiles%\Microsoft\jdk-2*") do call :tryjava "%%~D"
for /d %%D in ("%ProgramFiles%\Zulu\zulu-2*") do call :tryjava "%%~D"
for /d %%D in ("%ProgramFiles%\BellSoft\LibericaJDK-2*") do call :tryjava "%%~D"
for /d %%D in ("%ProgramFiles%\Amazon Corretto\jdk2*") do call :tryjava "%%~D"
if not defined JAVA_OK call :getjdk
if not defined JAVA_OK goto nojava
set "JAVA_HOME=%JAVA_OK%"
set "PATH=%JAVA_OK%\bin;%PATH%"
set "JAVA_TOOL_OPTIONS="
echo Using Java %JAVA_MAJOR%: "%JAVA_OK%"

rem ---- Android SDK (Android Studio puts it in %LOCALAPPDATA%\Android\Sdk)
if not defined ANDROID_HOME if defined ANDROID_SDK_ROOT set "ANDROID_HOME=%ANDROID_SDK_ROOT%"
if not defined ANDROID_HOME set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not exist "%ANDROID_HOME%\platforms" goto nosdk
set "SDKDIR=%ANDROID_HOME:\=/%"
> local.properties echo sdk.dir=%SDKDIR%

rem ---- version, for the file name
set "VER="
if exist "app\version.txt" set /p VER=<"app\version.txt"
if not defined VER set "VER=latest"
set "OUT=%HERE%LifeSimulator-v%VER%.apk"

echo.
echo Building Life Simulator v%VER% for Android...
echo The first build downloads build tools (about 1 GB) and can take 5-15 minutes. Later builds are quick.
echo.
call gradlew.bat --stop >nul 2>&1
call gradlew.bat assembleRelease --no-daemon "-Dorg.gradle.java.home=%JAVA_OK%"
if errorlevel 1 goto failed
copy /y "app\build\outputs\apk\release\app-release.apk" "%OUT%" >nul
echo.
echo Done: %OUT%
echo Copy it to your phone or tablet and open it to install (allow "Install unknown apps" when asked).
explorer /select,"%OUT%"
pause
exit /b 0

:failed
echo.
echo The build failed. Scroll up for the first error.
echo Tip: if it mentions a path that is too long, move this folder somewhere short like C:\LifeSim and try again.
pause
exit /b 1

:nojava
echo.
echo Couldn't find or download Java 21.
echo Install "Microsoft Build of OpenJDK 21" from https://learn.microsoft.com/java/openjdk/download
echo (Java 25 is too new for this build), then run this again.
pause
exit /b 1

:nosdk
echo.
echo The Android SDK was not found at "%ANDROID_HOME%".
echo Open Android Studio once and let it finish the setup wizard (Standard), then run this again.
pause
exit /b 1

rem ---- :tryjava <folder> - use it if it holds Java 21-24
:tryjava
if defined JAVA_OK goto :eof
if not exist "%~1\bin\java.exe" goto :eof
set "JV="
for /f "tokens=3" %%v in ('""%~1\bin\java.exe" -version 2^>^&1 ^| findstr /i /c:"version""') do (
    set "JV=%%~v"
    goto tj_parse
)
:tj_parse
if not defined JV goto :eof
set "JM="
for /f "delims=.-+" %%m in ("%JV%") do set "JM=%%m"
if not defined JM goto :eof
if %JM% LSS 21 goto :eof
if %JM% GTR 24 goto tj_new
set "JAVA_OK=%~1"
set "JAVA_MAJOR=%JM%"
goto :eof
:tj_new
echo Skipping Java %JM% in "%~1" - too new for this build.
goto :eof

rem ---- :getjdk - download a private Java 21 (Microsoft Build of OpenJDK) into tools\
:getjdk
echo.
echo No Java 21 was found on this PC. Downloading a private copy for this folder
echo (about 190 MB, one time only; it doesn't change anything else on your PC)...
if not exist "%HERE%tools" mkdir "%HERE%tools"
curl.exe -L --fail --progress-bar -o "%HERE%tools\jdk21.zip" "https://aka.ms/download-jdk/microsoft-jdk-21-windows-x64.zip"
if errorlevel 1 goto :eof
tar -xf "%HERE%tools\jdk21.zip" -C "%HERE%tools"
if errorlevel 1 goto :eof
del "%HERE%tools\jdk21.zip" >nul 2>&1
for /d %%D in ("%HERE%tools\jdk-21*") do call :tryjava "%%~D"
goto :eof
