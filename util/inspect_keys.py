with open(r"e:\UsersData\doria\OneDrive\klawiatury\gmmk3 100 ansi\gmmk-companion\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

keys = ['backupDesc', 'backupTitle', 'btnBootloader', 'btnClearLog', 'btnDownloadBackup', 'btnFlashBackup', 'btnResetEeprom', 'btnResetTest', 'catCustom', 'consoleTitle', 'dropzoneText', 'dropzoneTextTitle', 'lightingLivePreviewTitle', 'restoreDesc', 'restoreTitle', 'tabWinLock', 'testedKeys']

for k in keys:
    for idx, l in enumerate(lines):
        if f'data-i18n="{k}"' in l:
            print(f"Key '{k}' at line {idx+1}: {l.strip()}")
