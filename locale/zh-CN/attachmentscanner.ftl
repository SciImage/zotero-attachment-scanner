## Menu items
attachmentscanner-start-scan = 扫描所有附件
attachmentscanner-start-scan-selected = 扫描已选条目的附件
attachmentscanner-cancel-scan = 取消附件扫描
attachmentscanner-scan-orphans = 扫描附件根目录中的多余文件
attachmentscanner-remove-same-link = 移除指向同一文件的附件
attachmentscanner-attachment-number = 附件数目
attachmentscanner-attachment-size = 附件大小（极慢）

## Message
attachmentscanner-scan-title = 扫描附件
attachmentscanner-scan-progreess = 正扫描 {$total} 个条目中的第 {$index} 个……
attachmentscanner-error-auto-delete = 结束检查！因为已经安装ZotMoov，且它的 "Automatically Delete External Linked Files in the ZotMoov Directory" 功能已打开。
attachmentscanner-warning-auto-delete = 如已安装类似ZotMoov的可能自动移除文件的插件，这一操作可能导至附性文件被删，请确认是否继续？

attachmentscanner-orphan-1 = 1 个多余文件
attachmentscanner-orphan-n = {$orphan} 个多余文件
attachmentscanner-junk-1 = 1 个无用系统文件
attachmentscanner-junk-n = {$junk} 个无用系统文件
attachmentscanner-empty-dir-1 = 1 个不含附件目录
attachmentscanner-empty-dir-n = {$empty-dir} 个不含附件目录
attachmentscanner-separator = {"，"}
attachmentscanner-last-separator = {"和 "}
attachmentscanner-no-orphan = 附件根目录中没有多余文件！
attachmentscanner-orphan-found-1 = 在附件根目录中找到{$found}。
attachmentscanner-orphan-found-n = 在附件根目录中找到{$found}。
attachmentscanner-prmopt-copy-close = 复制并关闭

## Settings
attachmentscanner-prefs-title = 附件管理

## Settings - Options
attachmentscanner-section-scanning = 扫描选项
attachmentscanner-scan-nosource =
    .label = 为没有文件类附件的条目加上标签
attachmentscanner-scan-nonfiles =
    .label = 检查条目是否含有非文件类附件
attachmentscanner-scan-duplicates =
    .label = 检查条目是否含有多个同类附件
attachmentscanner-ignore-file-masks = 忽略文件名含有这些字串的附件
attachmentscanner-masks-hint =
    .placeholder = 可用多个RegEx: abc; [Dd]ef; /si/i
attachmentscanner-remove-pubmed-entry =
    .label = 移除所有 "PubMed entry" 附件
attachmentscanner-remove-snapshot =
    .label = 项目含有PDF/EPUB附加档时，删除网页快照
attachmentscanner-remove-broken =
    .label = 删除缺失的附加档 (务必小心使用; 附件变化引发的更新不会删除附加档)

attachmentscanner-section-more = 其它选项
attachmentscanner-monitor-change =
    .label = 附件变化时，自动更新条目的标签
attachmentscanner-monospace-font =
    .label = 在 “附件大小” 一栏中使用定宽字体
attachmentscanner-orphan-ignore =
    .label = 忽略
attachmentscanner-orphan-report =
    .label = 报告
attachmentscanner-orphan-delete =
    .label = 删除
attachmentscanner-orphan-files = 扫描多余文件时找到的无用文件 (<code>desktop.ini</code>、<code>thumbs.db</code>和<code>.ds_store</code>)

## Settings - Tags
attachmentscanner-section-tags = 含非常规附件的条目标签
attachmentscanner-section-tags-desc = 以下标签如被修改，在焦点离开本视窗后或开始扫描前，所有含该标签的条目将被更新。
attachmentscanner-tag-nosource = 条目没有附件:
attachmentscanner-tag-broken = 条目附件不存在:
attachmentscanner-tag-duplicate = 条目有多个同类附件:
attachmentscanner-tag-nonfile = 条目有非文件类附件:
attachmentscanner-use-zss-tags = 使用 "Zotero Storage Scanner" 的标签
attachmentscanner-use-simple-tags = 使用简单标签
attachmentscanner-use-emoji-tags = 使用 Emoji 标签