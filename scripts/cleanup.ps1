# cleanup.ps1
# Hentikan semua proses Python pipeline yang tertinggal di background.
# Jalankan sebelum memulai mqtt_subscriber agar tidak ada konflik client ID di broker.

$targets = @("mqtt_subscriber", "mock_publisher", "ai_pipeline.mqtt")

$procs = Get-CimInstance Win32_Process -Filter "Name = 'python.exe'" |
    Where-Object { 
        $cl = $_.CommandLine
        if ($cl) {
            foreach ($t in $targets) {
                if ($cl.IndexOf($t) -ge 0) { return $true }
            }
        }
        return $false
    }

if (-not $procs) {
    Write-Host "[OK] Tidak ada proses pipeline yang aktif."
    exit 0
}

foreach ($p in $procs) {
    try {
        Stop-Process -Id $p.ProcessId -Force
        Write-Host "[STOP] Menghentikan PID $($p.ProcessId)"
    } catch {
        Write-Host "[SKIP] PID $($p.ProcessId) sudah selesai."
    }
}

Write-Host "[DONE] Cleanup selesai. Aman untuk jalankan subscriber baru."
