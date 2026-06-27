param(
  [ValidateSet("apk", "aab")]
  [string]$Type = "apk"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$AndroidDir = Join-Path $ProjectRoot "android"
$OutputDir = Join-Path $ProjectRoot "release-outputs"
$KeystoreProps = Join-Path $ProjectRoot "keystores\release-signing.properties"
$JavaHome = "C:\Program Files\Android\Android Studio\jbr"
$AndroidSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$GradleHome = Join-Path $ProjectRoot ".gradle-release"

function Get-DotEnvValue {
  param([string]$Key)

  $EnvPath = Join-Path $ProjectRoot ".env"
  if (!(Test-Path $EnvPath)) {
    return $null
  }

  foreach ($Line in Get-Content $EnvPath) {
    $Trimmed = $Line.Trim()
    if (!$Trimmed -or $Trimmed.StartsWith("#")) {
      continue
    }

    $SeparatorIndex = $Trimmed.IndexOf("=")
    if ($SeparatorIndex -lt 0) {
      continue
    }

    $Name = $Trimmed.Substring(0, $SeparatorIndex).Trim()
    if ($Name -eq $Key) {
      return $Trimmed.Substring($SeparatorIndex + 1).Trim()
    }
  }

  return $null
}

function Export-AndroidLauncherIcons {
  $IconPath = Join-Path $ProjectRoot "assets\icon.png"
  $ResDir = Join-Path $AndroidDir "app\src\main\res"

  if (!(Test-Path $IconPath) -or !(Test-Path $ResDir)) {
    return
  }

  Add-Type -AssemblyName System.Drawing

  $densities = @(
    @{ Name = "mipmap-mdpi"; Scale = 1 },
    @{ Name = "mipmap-hdpi"; Scale = 1.5 },
    @{ Name = "mipmap-xhdpi"; Scale = 2 },
    @{ Name = "mipmap-xxhdpi"; Scale = 3 },
    @{ Name = "mipmap-xxxhdpi"; Scale = 4 }
  )

  $source = [System.Drawing.Image]::FromFile($IconPath)
  try {
    foreach ($density in $densities) {
      $dir = Join-Path $ResDir $density.Name
      New-Item -ItemType Directory -Force -Path $dir | Out-Null

      foreach ($oldFile in @("ic_launcher.webp", "ic_launcher_round.webp", "ic_launcher_foreground.webp")) {
        $oldPath = Join-Path $dir $oldFile
        if (Test-Path $oldPath) {
          Remove-Item -Force -LiteralPath $oldPath
        }
      }

      $legacySize = [int](48 * $density.Scale)
      $foregroundSize = [int](108 * $density.Scale)

      Save-ResizedPng $source (Join-Path $dir "ic_launcher.png") $legacySize
      Save-ResizedPng $source (Join-Path $dir "ic_launcher_round.png") $legacySize
      Save-ResizedPng $source (Join-Path $dir "ic_launcher_foreground.png") $foregroundSize
    }
  } finally {
    $source.Dispose()
  }
}

function Save-ResizedPng {
  param(
    [System.Drawing.Image]$Source,
    [string]$Path,
    [int]$Size
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.Clear([System.Drawing.Color]::White)
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage($Source, 0, 0, $Size, $Size)
    } finally {
      $graphics.Dispose()
    }

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $bitmap.Dispose()
  }
}

if (!(Test-Path $AndroidDir)) {
  throw "android folder is missing. Run npm run prebuild:android:dev first."
}

if (!(Test-Path $KeystoreProps)) {
  throw "Release signing file is missing: $KeystoreProps"
}

Export-AndroidLauncherIcons

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path $GradleHome | Out-Null

$env:NODE_ENV = "production"
$env:JAVA_HOME = $JavaHome
$env:ANDROID_HOME = $AndroidSdk
$env:ANDROID_SDK_ROOT = $AndroidSdk
$env:GRADLE_USER_HOME = $GradleHome
Remove-Item Env:\EXPO_LOCAL_DEV_CLIENT -ErrorAction SilentlyContinue

$AdMobAndroidAppId = Get-DotEnvValue "EXPO_PUBLIC_ADMOB_ANDROID_APP_ID"
if ($AdMobAndroidAppId) {
  $ManifestPath = Join-Path $AndroidDir "app\src\main\AndroidManifest.xml"
  $Manifest = Get-Content $ManifestPath -Raw
  $Pattern = '(<meta-data android:name="com\.google\.android\.gms\.ads\.APPLICATION_ID" android:value=")[^"]+(")'
  if (!([regex]::IsMatch($Manifest, $Pattern))) {
    throw "Could not find AdMob Android app id in AndroidManifest.xml."
  }
  $UpdatedManifest = [regex]::Replace($Manifest, $Pattern, "`${1}$AdMobAndroidAppId`${2}")
  Set-Content -Encoding UTF8 $ManifestPath $UpdatedManifest
}

@(
  "app\build\generated\assets\createBundleReleaseJsAndAssets",
  "app\build\generated\sourcemaps\react\release",
  "app\build\intermediates\assets\release",
  "app\build\intermediates\sourcemaps\react\release"
) | ForEach-Object {
  $ReleaseBundleOutput = Join-Path $AndroidDir $_
  if (Test-Path $ReleaseBundleOutput) {
    Remove-Item -Recurse -Force -LiteralPath $ReleaseBundleOutput
  }
}

Push-Location $AndroidDir
try {
  if ($Type -eq "apk") {
    .\gradlew.bat :app:assembleRelease --no-daemon --console plain
    if ($LASTEXITCODE -ne 0) { throw "Gradle assembleRelease failed." }

    $Source = Join-Path $AndroidDir "app\build\outputs\apk\release\app-release.apk"
    $Target = Join-Path $OutputDir "random-lotto-release.apk"
  } else {
    .\gradlew.bat :app:bundleRelease --no-daemon --console plain
    if ($LASTEXITCODE -ne 0) { throw "Gradle bundleRelease failed." }

    $Source = Join-Path $AndroidDir "app\build\outputs\bundle\release\app-release.aab"
    $Target = Join-Path $OutputDir "random-lotto-release.aab"
  }

  if (!(Test-Path $Source)) {
    throw "Expected build output was not created: $Source"
  }

  Copy-Item -Force $Source $Target
  Write-Host "Created: $Target"
} finally {
  Pop-Location
}
