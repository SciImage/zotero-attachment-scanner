Attachment Scanner（Zotero v.7.0+ 附件扫描器）
=====

[English](README.md) | **简体中文**

**Attachment Scanner** 是一款 **[Zotero](https://www.zotero.org/)** 插件，用于扫描附件，并为没有附件、附件缺失或附件重复的条目添加标签。其功能类似于 **[Zotero Storage Scanner](https://github.com/retorquere/zotero-storage-scanner)** 插件，但兼容 Zotero v.7.0。后续更新还引入了多项附件相关功能，包括实时监控、多余文件扫描、网页快照移除以及可自定义的栏位。

插件功能与特性
-----
- 扫描所有条目或已选条目的附件，并：
  - 为含有缺失附件的条目添加标签
  - 可选：为没有附件的条目添加标签
  - 可选：为含有多个同类附件的条目添加标签
  - 可选：为含有非文件类附件的条目添加标签
  - 可选：移除所有 “PubMed entry” 附件
  - 可选：移除已含 PDF/EPUB 附件的条目的网页快照
  - 可选：删除缺失的附件（*务必谨慎使用*）
  - 可选（默认隐藏，见技术说明）：为含存储/链接附件的条目添加标签。
- 扫描附件根目录中未链接到 Zotero 条目的文件
- 在条目列表中添加自定义栏位
  - 附件数目
  - 附件总大小
- 相同文件移除（默认隐藏，见技术说明）：删除指向同一文件的附件。

### 特性
- 标签可自定义：可使用任意标签；一键套用三组预定义标签。
- 标签更新：自定义内容会应用到所有已有标签，无需重新扫描。
- 进度跟踪：扫描进度会显示在窗口中。
- 任务可取消：扫描过程可随时取消。
- 实时监控：添加或删除附件时会自动更新标签。

> [!CAUTION]
> 尽管 **删除缺失附件** 功能不会删除任何文件，且损坏的附件可以从回收站恢复，但如果文件同步滞后于文库同步，可能会导致严重问题。</br>
> 该选项会在每次 Zotero 启动时重置。

安装
-----
### 全新安装
   1. 从 [最新发布版本](https://github.com/SciImage/zotero-attachment-scanner/releases/latest) 下载 .xpi 文件（Firefox 用户：右键并另存文件）。
   2. 打开 Zotero 插件界面（菜单 --> 工具 --> 插件）。
   3. 点击右上角的齿轮图标（⚙），选择 “Install Plugin From File…”。
   4. 选择下载好的 .xpi 文件。

### 更新
   1. 打开 Zotero 插件界面（菜单 --> 工具 --> 插件）。
   2. 点击右上角的齿轮图标（⚙），选择 “Check for updates”。

使用
-----
### 检查附件完整性
1. 在 “工具” 菜单中选择 “扫描所有附件” 开始扫描所有条目；或者
2. 选中若干条目，在右键菜单中选择 “扫描已选条目的附件” 开始扫描。
3. 在 “工具” 菜单中点击 “取消附件扫描” 可取消扫描。

### 检查附件根目录中的文件
1. 在 “工具” 菜单中选择 “扫描附件根目录中的多余文件”。仅当设置了附件根目录时，该菜单项才可用。
2. 在 “工具” 菜单中点击 “取消附件扫描” 可取消。
> [!NOTE]
> 该功能仅扫描并把文件列表复制到剪贴板，不会删除任何文件。*没有计划* 添加文件删除功能，因为这会造成不可逆的数据丢失。

### 添加栏位
1. 右键点击条目列表表头，在弹出菜单中选择 “附件大小” 或 “附件数目”。
<center><img src="/others/columns.png" alt="Add columns" width="50%"/></center>

### 设置
详见 [此处](https://github.com/SciImage/zotero-attachment-scanner/blob/main/others/preference_help.md)。
![Preference window](/others/preference.png?raw=true "Preference window")

技术说明
-----
1. Zotero 的附件分为常规文件附件和非文件附件。“PubMed entry” 附件属于非文件附件。
2. 每个文件附件都有一个 “content type”，类似于 [MIME 类型](https://en.wikipedia.org/wiki/Media_type)，主要由文件扩展名决定。“同类重复附件” 指多个具有相同 content type 的文件，例如两个 PDF 文件或三个 .xlsx 文件。但 PDF 文件和 .xlsx 文件不算重复，因为 content type 不同。
3. Zotero 存在一个 bug：右键菜单首次显示时图标不会出现。插件无法修复此问题。
4. Zotero 在 Mac 上存在一个 bug：主窗口关闭后重新打开时，部分主菜单项会消失或丢失图标。此问题已由本插件修复。
5. Zotero 有一个设置项：“在从网页创建条目时自动截取快照”。关闭它可以阻止创建网页快照。
6. 某些文库条目有多个附件指向同一文件。本插件包含一个删除这些重复附件的菜单命令。默认情况下该命令是隐藏的，因为如果安装了 **[ZotMoov](https://github.com/wileyyugioh/zotmoov)** 且开启了其 “Auto Delete External Linked Files” 功能，使用该命令会导致 **文件丢失**。要显示该菜单命令，请在 Zotero 的 [配置编辑器](https://www.zotero.org/support/preferences/hidden_preferences) 中将 `extensions.attachmentscanner.show_remove_same_file` 设为 `true`。强烈建议用户在使用完毕后将该选项改回 `false`。
> [!CAUTION]
> **相同文件移除** 功能绝不能与任何具备自动删除文件功能的插件同时使用。扫描期间，本插件只会将重复附件移入回收站，因此最初不会丢失任何文件。但清空回收站时，**ZotMoov** 会从磁盘删除该文件，从而导致意外的文件丢失。
7. 插件可以为含已导入 Zotero 存储的附件的条目添加标签（默认：`#stored`），为含链接附件的条目添加标签（默认：`#linked`）。该功能默认关闭并隐藏。要开启，请在 Zotero 的 [配置编辑器](https://www.zotero.org/support/preferences/hidden_preferences) 中将 `extensions.attachmentscanner.check_link_mode` 设为 `true`。修改 `extensions.attachmentscanner.tag_stored` 和 `extensions.attachmentscanner.tag_linked` 可使用自定义标签。
