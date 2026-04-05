param(
  [int]$Port = 8000,
  [string]$Root = (Split-Path -Parent $MyInvocation.MyCommand.Path),
  [string]$StartPage = "/src/index.html"
)

$ErrorActionPreference = "Stop"

function Get-ContentType([string]$path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css"  { "text/css; charset=utf-8" }
    ".js"   { "application/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".png"  { "image/png" }
    ".jpg"  { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".svg"  { "image/svg+xml" }
    ".gif"  { "image/gif" }
    ".ico"  { "image/x-icon" }
    ".txt"  { "text/plain; charset=utf-8" }
    default { "application/octet-stream" }
  }
}

function Write-HttpResponse {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType = "text/plain; charset=utf-8"
  )

  $headerText = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerText)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

$rootPath = [System.IO.Path]::GetFullPath($Root)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)

try {
  $listener.Start()
  Write-Host "Serving $rootPath"
  Write-Host "Open http://localhost:$Port$StartPage"
  Write-Host "Press Ctrl+C to stop."

  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $client.ReceiveTimeout = 5000
      $client.SendTimeout = 5000
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)

      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        continue
      }

      while ($true) {
        $line = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($line)) { break }
      }

      if ($requestLine -notmatch "^(GET|HEAD)\s+(\S+)\s+HTTP/1\.[01]$") {
        Write-HttpResponse -Stream $stream -StatusCode 405 -StatusText "Method Not Allowed" -Body ([System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed"))
        continue
      }

      $method = $matches[1]
      $requestTarget = $matches[2]
      $pathOnly = $requestTarget.Split("?")[0]
      $relativePath = [System.Uri]::UnescapeDataString($pathOnly.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = $StartPage.TrimStart('/')
      }

      $relativePath = $relativePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
      $candidatePath = [System.IO.Path]::GetFullPath((Join-Path $rootPath $relativePath))

      if (-not $candidatePath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        Write-HttpResponse -Stream $stream -StatusCode 403 -StatusText "Forbidden" -Body ([System.Text.Encoding]::UTF8.GetBytes("Forbidden"))
        continue
      }

      if (Test-Path $candidatePath -PathType Container) {
        $candidatePath = Join-Path $candidatePath "index.html"
      }

      if (-not (Test-Path $candidatePath -PathType Leaf)) {
        Write-HttpResponse -Stream $stream -StatusCode 404 -StatusText "Not Found" -Body ([System.Text.Encoding]::UTF8.GetBytes("Not Found"))
        continue
      }

      $bytes = if ($method -eq "HEAD") { [byte[]]::new(0) } else { [System.IO.File]::ReadAllBytes($candidatePath) }
      Write-HttpResponse -Stream $stream -StatusCode 200 -StatusText "OK" -Body $bytes -ContentType (Get-ContentType $candidatePath)
    }
    catch {
      if ($stream) {
        Write-HttpResponse -Stream $stream -StatusCode 500 -StatusText "Server Error" -Body ([System.Text.Encoding]::UTF8.GetBytes("Server Error"))
      }
    }
    finally {
      if ($reader) { $reader.Dispose() }
      if ($stream) { $stream.Dispose() }
      $client.Close()
      $reader = $null
      $stream = $null
    }
  }
}
finally {
  $listener.Stop()
}
