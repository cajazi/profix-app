$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\HomePC\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"

Write-Host "Building web assets..." -ForegroundColor Green
npm run build

Write-Host "Syncing to Android..." -ForegroundColor Green
npx cap sync android

Write-Host "Building APK..." -ForegroundColor Green
cd android
.\gradlew assembleDebug
cd ..

Write-Host "Waiting for device..." -ForegroundColor Yellow
$timeout = 30
$elapsed = 0
while ($elapsed -lt $timeout) {
    $devices = adb devices | Select-String "device$"
    if ($devices) {
        Write-Host "Device found! Installing..." -ForegroundColor Green
        adb install -r android\app\build\outputs\apk\debug\app-debug.apk
        Write-Host "Done! Open ProFix on your phone." -ForegroundColor Green
        break
    }
    Write-Host "Plug in your phone and tap Allow USB debugging... ($elapsed/$timeout)" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    $elapsed += 2
}
if ($elapsed -ge $timeout) {
    Write-Host "Device not found. APK is at: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Red
    Write-Host "Install manually via: adb install -r android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Red
}
