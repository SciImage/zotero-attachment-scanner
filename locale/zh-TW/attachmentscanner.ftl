## Menu items
attachmentscanner-start-scan = 掃描所有附加檔
attachmentscanner-start-scan-selected = 掃描已選項目的附加檔
attachmentscanner-cancel-scan = 取消附加檔掃描
attachmentscanner-scan-orphans = 掃描附加檔來源目錄中的多餘文檔
attachmentscanner-remove-same-link = 刪除指向同一文檔的附加檔
attachmentscanner-attachment-number = 附加檔數目
attachmentscanner-attachment-size = 附加檔大小

## Message
attachmentscanner-scan-title = 掃描附加檔
attachmentscanner-scan-progreess = 正掃描 {$total} 個項目中的第 {$index} 個……
attachmentscanner-error-auto-delete = 結束檢查！因為已經安裝ZotMoov，且它的 "Automatically Delete External Linked Files in the ZotMoov Directory" 功能已打開。
attachmentscanner-warning-auto-delete = 如已安裝類似ZotMoov的可能自動刪除文檔的插件，這一操作可能導至附加檔文檔被刪，請確認是否繼續？

attachmentscanner-orphan-1 = 1 個多餘文檔
attachmentscanner-orphan-n = {$orphan} 個多餘文檔
attachmentscanner-junk-1 = 1 個無用系統文件
attachmentscanner-junk-n = {$junk} 個無用系統文件
attachmentscanner-empty-dir-1 = 1 個不含附加檔目錄
attachmentscanner-empty-dir-n = {$empty-dir} 個不含附加檔空目錄
attachmentscanner-separator = {"，"}
attachmentscanner-last-separator = {"和 "}
attachmentscanner-no-orphan = 附加檔來源目錄中沒有多餘文檔！
attachmentscanner-no-orphan-with-abs-1 = 附加檔來源目錄中沒有多餘文檔, 但其中 1 個文件沒有使用相對目錄位置。
attachmentscanner-no-orphan-with-abs-n = 附加檔來源目錄中沒有多餘文檔, 但其中 {$abs} 個文件沒有使用相對目錄位置。
attachmentscanner-abs-warning-1 = !!! 附加檔來源目錄中有 1 個文檔沒有使用相對目錄位置，它可能被誤認為多餘文檔.
attachmentscanner-abs-warning-n = !!! 附加檔來源目錄中有 {$abs} 個文檔沒有使用相對目錄位置，它們可能被誤認為多餘文檔.
attachmentscanner-orphan-found-1 = 在附加檔來源目錄中找到{$found}。
attachmentscanner-orphan-found-n = 在附加檔來源目錄中找到{$found}。
attachmentscanner-prmopt-copy-close = 複製並關閉

## Settings
attachmentscanner-prefs-title = 附加檔管理

## Settings - Options
attachmentscanner-section-scanning = 掃描選項
attachmentscanner-scan-nosource =
    .label = 為沒有文檔類附加檔的項目加上標籤
attachmentscanner-scan-nonfiles =
    .label = 檢查項目是否含有非文檔類附加檔
attachmentscanner-scan-duplicates =
    .label = 檢查項目是否含有多個同類附加檔
attachmentscanner-ignore-file-masks = 忽略文檔名含有這些字符串的附加檔
attachmentscanner-masks-hint =
    .placeholder = 可用多個RegEx: abc; [Dd]ef; /si/i
attachmentscanner-remove-pubmed-entry =
    .label = 刪除所有 "PubMed entry" 附加檔
attachmentscanner-remove-snapshot =
    .label = 項目含有PDF/EPUB附加檔時，刪除網頁快照
attachmentscanner-remove-broken =
    .label = 刪除缺失的附加檔 (務必小心使用; 附加檔變化引發的更新不會刪除附加檔)

attachmentscanner-section-more = 其它選項
attachmentscanner-monitor-change =
    .label = 附加檔變化時，自動更新条目的标签
attachmentscanner-monospace-font =
    .label = 在 “附加檔大小” 一欄中使用定寬字體
attachmentscanner-orphan-ignore =
    .label = 忽略
attachmentscanner-orphan-report =
    .label = 報告
attachmentscanner-orphan-delete =
    .label = 刪除
attachmentscanner-orphan-files = 掃描多餘文檔時找到的無用文檔 (<code>desktop.ini</code>、<code>thumbs.db</code>和<code>.ds_store</code>)

## Settings - Tags
attachmentscanner-section-tags = 含非常規附加檔的項目標籤
attachmentscanner-section-tags-desc = 以下標籤如被修改，在焦點離開本窗口後或開始掃描前，所有含該標籤的項目將被更新。
attachmentscanner-tag-nosource = 項目沒有附加檔:
attachmentscanner-tag-broken = 項目附加檔不存在:
attachmentscanner-tag-duplicate = 項目有多個同類附加檔:
attachmentscanner-tag-nonfile = 項目有非文檔類附加檔:
attachmentscanner-use-zss-tags = 使用 "Zotero Storage Scanner" 的標籤
attachmentscanner-use-simple-tags = 使用簡單標籤
attachmentscanner-use-emoji-tags = 使用 Emoji 標籤