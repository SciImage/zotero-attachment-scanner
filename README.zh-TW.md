Attachment Scanner（Zotero v.7.0+ 附加檔掃描器）
=====

[English](README.md) | **繁體中文** | [简体中文](README.zh-CN.md)

**Attachment Scanner** 是一套 **[Zotero](https://www.zotero.org/)** 外掛程式，用於掃描附加檔，並為缺少附加檔、附加檔遺失或附加檔重複的文獻項目加上標籤。其功能類似 **[Zotero Storage Scanner](https://github.com/retorquere/zotero-storage-scanner)** ，但支援 Zotero v7.0。後續版本亦陸續加入多項附加檔管理功能，例如即時監控、多餘檔案掃描、網頁快照移除，以及可自訂欄位等功能。

功能與特色
-----
- 掃描所有項目或選取項目的附加檔，並：
  - 為含有遺失附加檔的項目加上標籤
  - 可選：為沒有附加檔的項目加上標籤
  - 可選：為含有多個同類型附加檔的項目加上標籤
  - 可選：為含有非檔案類附加檔的項目加上標籤
  - 可選：移除所有「PubMed entry」附加檔
  - 可選：移除已含 PDF／EPUB 附加檔項目的網頁快照
  - 可選：刪除遺失的附加檔（請務必謹慎使用）
  - 可選（預設隱藏，請參閱技術說明）：為含有儲存附加檔／連結附加檔的項目加上標籤
- 掃描附加檔根目錄中未連結至 Zotero 項目的檔案
- 項目清單新增自訂欄位：
  - 附加檔數量
  - 附加檔總大小
- 相同檔案移除（預設隱藏，請參閱技術說明）：刪除指向同一檔案的重複附加檔。

### 特色
  - 標籤可自訂：可使用任意標籤，並提供三組預設標籤可一鍵套用。
  - 標籤即時更新：修改設定後，所有既有標籤會自動更新，無須重新掃描。
  - 進度顯示：掃描進度會顯示於視窗中。
  - 可取消作業：掃描可隨時中止。
  - 即時監控：新增或刪除附加檔時，標籤會自動更新。


> [!CAUTION]
> 雖然 **刪除遺失附加檔** 功能不會刪除任何實體檔案，而損毀的附加檔亦可從資源回收桶還原，但若檔案同步落後於資料庫同步，仍可能造成嚴重問題。</br>
> 此選項會在每次啟動 Zotero 時自動重設。

安裝
-----
### 首次安裝
  1. 從 [最新版本](https://github.com/SciImage/zotero-attachment-scanner/releases/latest) 下載 .xpi 檔案（Firefox 使用者請按右鍵並選擇「另存連結為」）。
  2. 開啟 Zotero 外掛管理頁面（選單 → 工具 → 外掛程式）。
  3. 點擊右上角齒輪圖示（⚙），選擇「Install Plugin From File…」。
  4. 選取下載的 `.xpi` 檔案。

### 更新
  1. 開啟 Zotero 外掛管理頁面（選單 → 工具 → 外掛程式）。
  2. 點擊右上角齒輪圖示（⚙），選擇「Check for Updates」。

## 使用方式

### 檢查附加檔完整性

1. 在「工具」選單中選擇「掃描所有附加檔」，以掃描整個資料庫；或
2. 選取一個或多個項目，在右鍵選單中選擇「掃描已選項目的附加檔」。
3. 如需中止掃描，可於「工具」選單中選擇「取消附加檔掃描」。

### 檢查附加檔根目錄中的檔案

1. 在「工具」選單中選擇「掃描附加檔來源目錄中的多餘文檔」。此功能僅在已設定附加檔根目錄時可用。
2. 如需中止掃描，可於「工具」選單中選擇「取消附加檔掃描」。

> [!NOTE]
> 本功能僅掃描檔案並將結果清單複製至剪貼簿，不會刪除任何檔案。由於可能造成不可逆的資料遺失，我 *沒有計劃* 增添檔案刪除功能。

### 新增欄位
1. 在項目清單標題列按右鍵，勾選「附加檔大小」或「附加檔數目」。
<center><img src="/others/columns.zh-TW.png" alt="新增欄位" width="30%"/></center>

### 設定
請參閱：[此处](https://github.com/SciImage/zotero-attachment-scanner/blob/main/others/preference_help.zh-TW.md)。
![Preference window](/others/preference.zh-TW.png?raw=true "設定")

## 技術說明
1. Zotero 的附加檔分為「檔案附加檔」與「非檔案附加檔」兩類。「PubMed entry」屬於非檔案附加檔。
2. 每個檔案附加檔皆具有一個 「內容類型」，概念類似於 MIME Type [MIME 類型](https://en.wikipedia.org/wiki/Media_type)，主要由副檔名決定。「同類型重複附加檔」是指多個附加檔具有相同的 Content Type，例如兩個 PDF 或三個 `.xlsx` 檔案。但 PDF 與 `.xlsx` 檔案不視為重複，因為其 Content Type 不同。
3. Zotero 本身有一項已知問題：右鍵選單首次顯示時，圖示可能不會出現。此外掛無法修正此問題。
4. Zotero 在 macOS 上有一項已知問題：當主視窗關閉後重新開啟時，部分主選單項目可能消失或遺失圖示。本外掛已修正此問題。
5. Zotero 提供一項設定：「從網頁建立項目時自動擷取快照」。停用後，即可避免建立網頁快照。
6. 部分文獻項目可能包含多個指向同一檔案的附加檔。本外掛提供一項指令可移除這些重複附加檔。此功能預設為隱藏，因為若同時安裝 **[ZotMoov](https://github.com/wileyyugioh/zotmoov)** 並啟用其 **Auto Delete External Linked Files** 功能，可能導致 **檔案遺失**。若要顯示此功能，請於 Zotero 的[設定編輯器](https://www.zotero.org/support/preferences/hidden_preferences) 中將 `extensions.attachmentscanner.show_remove_same_file`設為`true`。強烈建議於使用完畢後恢復為 `false`。
> [!CAUTION]
> **移除相同檔案** 功能絕對不可與任何具備自動刪除檔案功能的外掛同時使用。掃描期間，本外掛僅會將重複附加檔移至資源回收桶，因此一開始不會造成檔案遺失。然而，當資源回收桶被清空時，**ZotMoov** 可能會從磁碟中刪除實際檔案，導致資料永久遺失。

7. 本外掛可為含有已匯入 Zotero 儲存空間之附加檔的項目加上標籤（預設：`#stored`），亦可為含有連結附加檔的項目加上標籤（預設：`#linked`）。 此功能預設為關閉且隱藏。若要啟用，請於 Zotero [設定編輯器](https://www.zotero.org/support/preferences/hidden_preferences) 中將 `extensions.attachmentscanner.check_link_mode` 設為 `true`。亦可透過修改 `extensions.attachmentscanner.tag_stored` 和 `extensions.attachmentscanner.tag_linked` 來自訂標籤名稱。
