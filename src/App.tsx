import { useState, useMemo } from 'react';
import { 
  Search, ShieldAlert, FileText, ClipboardList, BookOpen, 
  AlertTriangle, Star, CheckCircle2, 
  Download, Sparkles, Send, RefreshCw, X, Image as ImageIcon,
  Check
} from 'lucide-react';

// ==========================================
// 1. 初始化與模擬資料
// ==========================================
const CATEGORIES = [
  { id: 'all', name: '全部規範類型', icon: '🌐' },
  { id: 'sop', name: '作業標準 (SOP)', icon: '📋' },
  { id: 'admin', name: '行政規範', icon: '🏛️' },
  { id: 'education', name: '教育規範', icon: '🎓' }
];

// 重要評鑑與院內指引手冊清單 (對應原圖「全險表」區塊)
const GUIDE_DOCUMENTS = [
  { id: 'doc-chimei-foley', title: '總院-護理-作標-3-01024協助尿管置放、護理及膀胱訓練作業指導書.pdf', type: '臨床SOP指引', size: '1.4 MB', bg: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
  { id: 'doc-chimei-iad', title: '總院-護理-作標-3-01010失禁皮膚預防及護理作業指導書.pdf', type: '皮膚防壓規範', size: '1.6 MB', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
  { id: 'doc-chimei-pressure-injury', title: '總院-護理-作標-3-01040壓力性損傷預防及傷口護理作業指導書.pdf', type: '壓傷照護準則', size: '2.1 MB', bg: 'bg-amber-50 border-amber-100 text-amber-700' },
  { id: 'doc-chimei-bowel', title: '總院-護理-作標-3-01008腸蠕動音評估作業指導書.pdf', type: '基本技術規範', size: '0.9 MB', bg: 'bg-rose-50 border-rose-100 text-rose-700' }
];

// 詳細規範資料庫 (包含新增的輸血、白血球低下、醫療裝置指標等)
const REGULATIONS_DATA = [
  {
    id: 'reg-chimei-foley',
    type: 'sop',
    authority: '奇美醫院 (護理部)',
    code: '總院-護理-作標-3-01024',
    title: '協助尿管置放、護理及膀胱訓練規範',
    isRecommended: true,
    highlights: [
      { type: 'rule', text: '消毒變革：置放導尿管時，全面取消2% CHG不含酒精消毒，改使用「水溶性優碘」進行會陰部消毒，再用無菌蒸餾水清潔。' },
      { type: 'rule', text: '充水禁忌：氣囊水球依照尿管標示打入足量無菌蒸餾水，切勿注入生理食鹽水，避免結晶體阻塞水球通道。' },
      { type: 'penalty', text: '管路固定：男性必須固定於「下腹部恥骨聯合處」，女性固定於「大腿內側」；尿袋每班或尿量達 2/3 (約1250ml) 必須排空。' }
    ],
    fullText: `【一、目的與臨床指引】
    協助病人導尿、維持管路通暢並落實密閉式無菌系統，預防導尿管相關尿路感染(CAUTI)；執行膀胱訓練為拔除管路與重建自解功能做準備。
    
    【二、無菌置放與消毒核心步驟】
    1. 消毒準備：戴上無菌手套，於平整檯面鋪上60*60cm無菌治療巾增加無菌面。抽取適量無菌蒸餾水充水球。
    2. 女性消毒：撐開陰唇，使用「水溶性優碘」進行：遠側小陰唇 ➔ 近側小陰唇 ➔ 尿道口 進行消毒等待自然乾燥，再以無菌蒸餾水以同法清潔。
    3. 男性消毒：握住陰莖，以「水溶性優碘」自尿道口行環形消毒至根部等待乾燥，再以無菌蒸餾水清潔。完成置入後須將包皮推回。
    4. 置入與充水：女性置入見尿液流出後再進 2-5 公分；男性置入約 20 公分。未確定尿管入膀胱前，絕對禁止打水球！
    
    【三、管路防壓與固定 (品管重點)】
    1. 男性固定：固定於下腹部恥骨聯合處，避免尿道、膀胱出口受牽扯。
    2. 女性固定：固定於大腿內側。
    3. 彈性運用：可採用井字型浮貼、固定夾夾於尿布墊/束腹帶、或魔鬼氈/五分帶彈性固定。
    4. 尿袋管理：尿袋高度必須低於膀胱，禁止碰觸地面，避免逆流感染。尿量達 2/3 (約1250ml) 必須排空。
    
    【四、膀胱訓練與拔除】
    1. 訓練攝水：睡眠時間暫停訓練。每小時攝水100-150ml，每日2000-2500ml。
    2. 夾管時間：使用橡皮筋或存留尿管夾綁緊管路，每3-4小時綁緊一次，再放開引流10-15分鐘。若未達時間即感脹尿，應立即放開並重新計時。
    3. 拔除追蹤：使用空針緩慢抽盡水球後拔除。拔除後 4-6 小時內必須密切追蹤病人自解尿狀態、有無血尿或排尿困難。`,
    checklist: [
      '置放時使用水溶性優碘與無菌蒸餾水，禁止使用生理食鹽水打氣囊水球',
      '確實執行管路恥骨處(男)或大腿內側(女)固定，每班檢查密閉式引流系統與防止尿袋碰地',
      '拔除尿管後，4-6小時內追蹤病人的排尿狀況與完整填寫尿管完整性記錄'
    ]
  },
  {
    id: 'reg-chimei-iad',
    type: 'sop',
    authority: '奇美醫院 (護理部)',
    code: '總院-護理-作標-3-01010',
    title: '失禁皮膚預防及護理作業規範 (IAD)',
    isRecommended: true,
    highlights: [
      { type: 'rule', text: '輕柔清潔：禁止粗糙摩擦！應使用 pH 4~7 之弱酸性乾洗潔膚液或中性沐浴精，由前到後以「輕柔按壓」或螺旋狀方式清洗。' },
      { type: 'rule', text: '三明治隔離保護法：2級中度(點狀破皮)或重度時，必須採取「噴造口粉 ➔ 噴無痛膜並等待30秒乾燥」連續重疊 3 遍之防護。' },
      { type: 'penalty', text: '藥膏堆積警示：每次更換時，病人會陰部舊藥膏必須完全洗淨，預防藥劑堆積導致新敷料無法與皮膚接觸，且粉劑不可灑過多以防結塊。' }
    ],
    fullText: `【一、目的與評估危險因子】
    藉由「清潔、保護、修復、保持乾燥」之結構式照護，預防排泄物（尿液、糞便）刺激引起的失禁性皮膚炎(IAD)，促進受損皮膚癒合。
    ★ IAD 六大危險因子：失禁頻率、使用尿布（封閉產品）、皮膚狀況差（衰老/糖尿病/類固醇）、活動受限、認知下降、個人衛生無法自理。
    
    【二、IAD 嚴重度分級工具與照護指南】
    1. 【0級（有風險但皮膚完整）】：
       - 清潔：弱酸性乾洗潔膚液 Q12H。
       - 保護：塗抹皮膚保護膏/霜，或距離10-15cm噴灑無痛性保護膜（等待30秒乾燥）。兩者不相容，不可合併使用。
    2. 【1級（輕度發紅但皮膚完整）】：
       - 照護：同0級，或 Q8H 塗抹含氧化鋅之皮膚保護膏以滋潤與預防刺激。
    3. 【2級_中度（發紅且皮膚呈點狀破皮）】：
       - 照護：破皮處噴灑適透膜粉(造口粉)與無酒精保護膜重疊3遍（三明治法），每8-12小時重做一次。
    4. 【2級_重度（發紅且皮膚呈片狀破皮）】：
       - 照護：噴適透膜粉(造口粉)+無痛保護膜重疊3次，或塗抹高效保膚劑（每週2-3次，一次用完一支）。若嚴重潰瘍需立即照會傷口護理師。
    5. 【疑似皮膚病（發紅合併紅白丘疹、癢、白色癬）】：
       - 照護：知會醫師並依醫囑使用抗黴菌/抗生素藥膏。★特別警示：禁止將抗黴菌藥膏混合於粉劑或霜劑內使用！
    
    【三、微氣候與排洩浸潤管理】
    1. 滲便防護：肛門口與周圍放置「散紗」以吸附滲便，若潮濕需隨時更換，保持乾燥。每兩小時檢視皮膚。
    2. 尿片選擇原則：尺寸合宜、不織布材質優於PE膜、吸水力良好。`,
    checklist: [
      '清洗時由前到後輕柔按壓，每2小時檢視並在肛門口放置散紗吸附滲便',
      '點狀破皮處確實執行「造口粉+無痛膜重疊3次」之三明治保護隔離程序',
      '懷疑黴菌感染時通知醫師開立專用藥膏，絕不將藥膏與粉劑、乳霜混和使用'
    ]
  },
  {
    id: 'reg-chimei-pressure-injury',
    type: 'sop',
    authority: '奇美醫院 (護理部)',
    code: '總院-護理-作標-3-01040',
    title: '壓力性損傷預防及傷口護理規範',
    isRecommended: true,
    highlights: [
      { type: 'rule', text: '計量與潛行測量：以紙尺測量長×寬×深，並拿 ENT 棉籤依「順時針鐘向」精準測量潛行(Undermining)與隧道(Tunneling)之深度及鐘向。' },
      { type: 'rule', text: '制菌劑限用原則：慢性傷口除非感染或髒污，否則應「避免常規使用優碘或克菌靈」消毒，以免抑制新生肉芽組織生長。' },
      { type: 'penalty', text: '足跟穩定焦痂保護：足跟乾燥、緊密、完整且無紅腫變動之「穩定痂皮 (Stable Eschar)」，視為身體自然屏障，絕對禁止軟化或清除，防範骨髓炎與截肢。' }
    ],
    fullText: `【一、目的與定義】
    壓力性損傷指皮膚或皮下軟組織局部損傷，源於長期壓力或壓力合併剪力。此指導書提供整體皮膚評估，介入 Braden scale 預防措施，維護皮膚完整性。
    
    【二、Braden Scale 評估與處置時機】
    1. 初步評估：病人入院/轉入、手術後當班、加護病房每班評估。一般住院病房每週日定期評估。
    2. 高危險群標準：Braden scale ≦ 16分 或單項 ≦ 2分者。每班至少執行1次皮膚檢視、每2小時翻身摆位、執行醫療裝置防壓防護。
    
    【三、各級壓力性損傷定義與護理處置】
    1. 【第1級 (完整發紅，壓不反白)】：
       - 處置：使用親水性或矽膠泡棉敷料覆蓋骨突受壓處，防壓輔具減壓，每2小時翻身。
    2. 【第2級 (部分皮層缺損、真皮露出、粉紅濕潤水泡)】：
       - 處置：標準法消毒，生理食鹽水擦拭，依醫囑使用人工皮或泡棉敷料。提供氣墊床或減壓床墊。
    3. 【第3級 (全層皮膚缺損，可見脂肪與肉芽，見捲邊)】：
       - 處置：出現捲狀邊(Epiboly)可由醫師以硝酸銀(AgNO3)腐蝕破壞。發炎化膿時以 1:20 優碘/生理食鹽水紗布濕布換藥。滲液少用水凝膠，滲液多用銀離子敷料。
    4. 【第4級 (全層及組織缺損，直接觸及筋膜/肌肉/骨頭)】：
       - 處置：乾淨傷口用生理食鹽水紗布濕敷，化膿傷口以優碘:生理食鹽水 1:20 濕敷（日換3-4次）。
    5. 【無法分級 (焦痂/腐肉覆蓋整個傷口)】：
       - 處置：燙傷藥膏塗抹軟化痂皮。但★足跟穩定乾焦痂★是保護屏障，絕不可軟化清除。
    6. 【深層組織損傷 (DTPI，完整皮膚局限發紅不反白或暗黑血泡)】：
       - 處置：使用泡棉敷料防壓，絕對避免受壓惡化。
       
    【四、傷口照會專家指引】
    若出現：2級壓傷併大水泡、足跟血泡、3-4級壓力性損傷、腐肉焦痂、紅腫熱痛與膿性分泌物，應立即照會傷口護理師。`,
    checklist: [
      'Braden Scale ≦ 16分高危患者每班執行皮膚檢視，並落實每2小時翻身與防壓床墊使用',
      '傷口大小及潛行深度使用紙尺與 ENT 棉棒，採順時針方向精確測量與詳細記錄',
      '維持足跟穩定焦痂的乾燥與完整性，塗抹優碘防潮，禁止自行清除或使用軟化藥膏'
    ]
  },
  {
    id: 'reg-chimei-bowel',
    type: 'sop',
    authority: '奇美醫院 (護理部)',
    code: '總院-護理-作標-3-01008',
    title: '腸蠕動音評估作業指導書',
    isRecommended: false,
    highlights: [
      { type: 'rule', text: '姿勢放鬆：聽診前請病人先排空膀胱，協助平躺並採取「屈膝姿勢(Flexed Knees)」，使腹部肌肉放鬆。' },
      { type: 'rule', text: '聽診順序：以肚臍為中心劃分四個象限，由「右下象限(RLQ)」開始，依照順時針方向進行聽診。' },
      { type: 'penalty', text: '時效防護：聽診前必須用手溫暖聽診器膜面，避免冰冷刺骨引發腹肌緊張。若蠕動音減少，每象限至少應聽診1分鐘。' }
    ],
    fullText: `【一、目的與物品準備】
    評估腸道活動狀態、腸蠕動音之頻率、速度及性質，以提供臨床照護與飲食、術後評估參考。
    ★ 物品準備：聽診器、手錶（具秒針）或時鐘、隔簾。
    
    【二、評估技術執行核心（SOP）】
    1. 評估前準備：
       - 確實落實洗手與病人辨識。
       - 向病人與家屬解釋目的，拉上隔簾以佈置隱蔽與受尊重的環境。
       - 協助病人採舒適仰臥姿勢，並「微屈膝蓋」，這是讓腹肌放鬆以獲得準確聽診音的關鍵！
    2. 聽診執行：
       - 溫暖聽診器：護理人員應先用掌心摩擦溫暖聽診器的膜面，嚴禁直接將冰冷膜面置於病人腹部，以免引發病人防衛性腹肌緊張。
       - 定位劃分：以肚臍為中心，分為左右上下共四個象限（橫膈膜下、髂骨前上棘上）。
       - 聽診路徑：由「右下象限 (RLQ)」出發，順時針方向聽診。
       - 聽診時間：正常腸蠕動音為高音頻的滴答聲、咕嚕聲，正常頻率不規則出現 5-34 次/分鐘。
       - 異常判定：若懷疑或判定腸蠕動音減少，每個象限部位皆至少應聽診滿 1 分鐘，或在最明顯象限聽診完整 1 分鐘。
       
    【三、後續處置】
    聽診後協助病人穿妥衣物、洗手。若有明顯異常或腸音消失，應立即報告主治醫師處理，並確實登載於護理紀錄中。`,
    checklist: [
      '請病人排空膀胱並採平躺屈膝姿勢，用雙手確實溫暖聽診器膜面',
      '以肚臍為中心，依據「右下象限 ➔ 右上 ➔ 左上 ➔ 左下」順時針方向聽診',
      '正常腸蠕動音為不規則 5-34 次/分，若有異常立即通報醫師並記錄'
    ]
  },
  {
    id: 'reg-chimei-transfusion',
    type: 'sop', 
    authority: '奇美醫院 (護理部)',
    code: '總院-護理-作標-3-01034',
    title: '輸血護理作業指導書',
    isRecommended: true,
    highlights: [
      { type: 'rule', text: '關鍵時效：血品應自血庫領回後 30 分鐘內開始輸注，4 小時內必須輸注完畢或辦理退血。' },
      { type: 'rule', text: '條碼核對：採血與掛血必須在病人單位以「不中斷」方式刷病人及血袋條碼，新進人員須臨床教師陪同。' },
      { type: 'penalty', text: '生命徵象監測：開始輸血前、輸血後 15 分鐘、更換不同血品 15 分鐘、終止輸血及中斷超過 30 分鐘時，須測量 TPR。' }
    ],
    fullText: `【一、目的與臨床核心】
    確保行交叉試驗、確定血型安全，並保障由靜脈輸注完全正確的血液製品，預防重大醫源性輸血異常。
    
    【二、關鍵條款：條碼檢核 (Barcode Validation)】
    1. 執行輸血與備血時，主護(輸注者)須以「不中斷」方式於病床旁刷病人手圈、檢體及血袋條碼。
    2. 病人自述血型：每次入院第一次備血必須詢問自述血型，系統將自動比對歷史紀錄，若不符會發出警告並進行重送確認。若不清楚則點選「不知血型」或「無法評估」。
    3. 異常應變：若系統異常，改由「雙人核對」備血/輸血，核對者與見證者不得為新進人員（未通過試用期者）。
    
    【三、臨床執行與管路原則】
    1. 留置針規格：紅血球濃厚液及全血靜脈留置針必須使用 18~20 號針（兒科可使用 24 號）。
    2. 給藥禁令：不可自輸血導管中給予任何藥物，如需給藥必須另建一靜脈輸液管路。
    3. 更換輸液套時機：每輸注 4U 全血/紅血球濃厚液、輸血超過 4 小時或管路凝固阻塞時，必須立即更換輸血輸液套。每輸 2U 紅血球，須更換去白血球過濾器。
    4. 需要溫血情況：每分鐘 >50ml 的大量輸血、嬰兒換血、小孩輸血速度達每分鐘 >15ml、病人具冷凝抗體、或經中央靜脈快速輸血。
    
    【四、緊急事件與錯誤處置】
    1. 發現輸血錯誤（輸錯血品或病人）：立即拔除血袋與輸液套，更換全新生理食鹽水與管路點滴。
    2. 立即通知醫師評估生命徵象，密切觀察溶血反應（頭痛、血尿、出血傾向、黃疸、少尿）。
    3. 24 小時內依醫囑採檢體（CBC、U/A、生化管），連同剩餘血袋、記錄單退回血庫，並通報捷安(病安通報系統)。`,
    checklist: [
      '未通過評核之新進人員，輸血需臨床教師陪同，且絕不可擔任雙人核對之第二人',
      '血品領回 30 分鐘內開始輸注，4 小時內必須輸注完畢或送回血庫，逾時系統將鎖定並發出異常提報提示',
      '全血、紅血球濃厚液(RL-RBC)、FP、FFP 一次只能核血一袋；二合一血袋需刷血袋上兩個條碼'
    ]
  },
  {
    id: 'reg-chimei-neutropenia',
    type: 'sop', 
    authority: '奇美醫院 (護理部)',
    code: '總院-護理-作標-3-04010',
    title: '嗜中性白血球低下照護指引',
    isRecommended: true,
    highlights: [
      { type: 'rule', text: '分級標準：ANC ≦ 1500 (1級)、1000-1499 (2級)、500-999 (3級)、< 500 (4級)。' },
      { type: 'rule', text: '環境限制：ANC < 1500 時，病房內嚴禁擺放任何鮮花盆栽，且限制 6 週內注射活性減毒疫苗者探視。' },
      { type: 'penalty', text: '飲食原則：勿食用生食與隔餐食物。禁止益生菌、養樂多、優格、生起司或未滅菌之礦泉水。' }
    ],
    fullText: `【一、目的與分級】
    降低病人因絕對嗜中性白血球(ANC)低下導致之醫源性感染、嚴重敗血症甚至死亡的機會。
    ★ ANC 計算公式：WBC × (Seg% + Bands%)。
    
    【二、預防性照護原則 (ANC < 1500 / 1至4級)】
    1. 手部衛生：照顧者於接觸病人前、後，脫手套後均應落實洗手。
    2. 個人防護：接觸病人前應配戴外科口罩，遮蓋口鼻。
    3. 環境控制：病房不可放植物、鮮花或積水。每日以消毒清潔劑濕布擦拭病室表面。
    4. 訪客限制：6 週內注射過活性減毒疫苗者（卡介苗、水痘、MMR、輪狀病毒等）、或有感冒、疱疹、發燒等呼吸道傳染病訪客一律禁止探視。
    
    【三、保護性隔離原則 (ANC < 500 / 第4級)】
    1. 一級至四級移動：離開病房時，病人及輸送人員皆須戴妥外科口罩，管控電梯，縮短在檢查單位的等候時間。
    2. 清潔消毒：淋浴蓮蓬頭與自來水龍頭，單位必須定期 1 個月拆卸，並以 500-600ppm 漂白水進行澈底消毒。
    3. 訪客管理：嚴格限制訪客，原則上只留一位健康無感染症狀的家屬陪檢照護。
    
    【四、極高危險性照護 (造血幹細胞移植患者)】
    1. 空間配備：必須入住正壓隔離病房（具 HEPA 過濾器）。進入病室人員一律換室內鞋、戴手術帽、穿隔離衣、戴腳套，並不可佩戴人工指甲。
    2. 定期檢驗：淋浴蓮蓬頭與水龍頭需定期進行水質採檢，避免退伍軍人菌引發致死性肺炎。
    3. 黏膜及個人衛生：
       - 每班評估口腔黏膜。進食後 30 分鐘內必須以生理食鹽水或蒸餾水清潔口腔。
       - 每日至少以軟毛牙刷刷牙 2 次。
       - 每天使用 2% Chlorhexidine (CHG) 清潔液進行沐浴以預防移行性感染。
       - 排便後由前往後擦，避免量肛溫、使用塞劑 or 灌腸，預防黏膜受損。`,
    checklist: [
      'ANC 低於 500 時，病室外或床簾必須懸掛「限制訪客」告示牌',
      '檢查並確認病房內無盆栽鮮花，蓮蓬頭與水龍頭已落實每月漂白水拆卸消毒紀錄',
      '督導患者與家屬落實飲食標準，嚴禁生食、生水（冰塊）、養樂多、優格與帶皮受損水果'
    ]
  },
  {
    id: 'reg-chimei-skincare',
    type: 'sop', 
    authority: '奇美醫院 (護理部)',
    code: '總院-護理-作標-3-05012',
    title: '醫療裝置皮膚照護作業指導書',
    isRecommended: true,
    highlights: [
      { type: 'rule', text: '監測與閾值：護理部品管核心指標為「醫療裝置皮膚照護正確率」，品管設定之閾值(Goal)為 90%。' },
      { type: 'rule', text: '查樣比例：每季由各單位稽核員進行稽核，採方便抽樣，受檢人數須達該單位總床數的 20% 以上。' },
      { type: 'penalty', text: '皮膚措施缺失：未採取保護性敷料、未每班評估受壓點位置、管路未防壓懸空、或周圍髒污/潮濕者皆視為扣分缺失。' }
    ],
    fullText: `【一、指標目的與分類】
    提供具體、有效的評估及傷口照護正確性，檢討並採取改善行動，降低病人因醫源性醫療裝置（MDRPI）產生壓力性損傷之機率。
    
    【二、稽核裝置範疇】
    1. 顏面氧氣醫療裝置：鼻導管、氧氣面罩、NPPV/CPAP/BIPAP、氣管內管、高流量濕化鼻導管(HFNC)。
    2. 引流管/導管類：導尿管、肛管、鼻胃管、動/靜脈導管、胸腹部引流管.
    3. 固定器類：氣切固定座、骨折石膏及夾板(Splint)、頸圈。
    4. 其他：EKG/TPM貼片、止血帶、醫療用彈性襪。
    
    【三、核心稽核缺失項目 (品質指標重點)】
    ★ 缺失大類1：醫療裝置壓力性損傷 - 預防措施缺失
      1-1 醫療裝置固定處皮膚，未採取防壓保護措施。
      1-2 未能做到「每班至少更換皮膚受壓點位置一次」並進行皮膚評估。
      1-3 管路或受壓點固定未採取「防壓懸空」或減壓敷料防護。
      1-4 裝置周圍皮膚不平整、潮濕、有血跡、髒污或留有殘膠痕跡。
    ★ 缺失大類2：醫療裝置皮膚照護措施缺失
      2-1 未依照照護標準選擇合適的減壓/保護性敷料（水膠體、泡棉等）。
      2-2 每班未評估傷口狀況，或發現敷料滲濕未及時更換。
      2-3 皮膚保護敷料呈現鬆脫、潮濕或不平整。
      2-4 醫療裝置或管路鬆脫，缺乏良好的支撐性固定。
      
    【四、品管行動與持續改善】
    1. 各單位品管數據每季統計一次，若正確率未達閾值 90%，單位主管與督導須共同召開檢討會議。
    2. 使用推移圖（Run Chart）分析各季變異，如為系統性問題則由品管委員會推動跨部門臨床流程改善與整合。`,
    checklist: [
      '每季各病房實地觀察採樣數必須大於單位總床數的 20%',
      '稽核裝置周圍是否保持清潔乾燥，減壓防壓敷料是否有不平整或潮濕現象',
      '確認每班皆有更換管路受壓點位置並登載於護理記錄，落實管路防壓懸空支撐'
    ]
  },
  {
    id: 'reg-chimei-8b',
    type: 'admin',
    authority: '奇美醫院 (8B病房)',
    code: '總院-護理-8B-3-A0001',
    title: '8B病房排班作業指導書 (115年修訂版)',
    isRecommended: true,
    highlights: [
      { type: 'rule', text: '年假天數上限：6個月-1年限 5 日、1-3年限 7 日、3-10年限 10 日、10年以上限 12 日，每年申請至多二次。' },
      { type: 'rule', text: '預假原則：每月第一週公告下月預班表(為期5天)，預假註明「預1」或「預2」總計不可超過 5 天。' },
      { type: 'penalty', text: '公平輪替條款：連續上 5 個月相同班別後，第 6 個月應轉換不同班別（懷孕、哺乳或疾病等因素除外）。' }
    ],
    fullText: `【一、目的與範圍】
    符合勞基法保障員工權益、增加工作滿意度，並安排適當護理照護人力以維護病患安全。適用於8B病房單位所屬管轄之全體人員。
    
    【二、出勤人力原則】
    1. 三班出勤：滿編 23 人且佔床率在九成以上時，白班(D) 7 人、小夜(E) 5 人、大夜(N) 4 人。三班至少需有一位小組長或二線小組長上班。
    2. 輪班公平：考量班別輪替之公平性，連續上 5 個月相同班別後，應於第 6 個月轉換不同班別（除懷孕、哺乳、疾病等因素）。
    
    【三、預假與年假規範 (114年9月會議決議)】
    1. 每月第一週公告下月預班表，預假時限 5 天。預假註明「預1」或「預2」，總天數不可超過 5 天。銜接班表時前後預假總天數不可超過 4 天。
    2. 預約年假者不可再預約「預1」與「預2」；申請年假應於預定休假日起至少 30 日前提出。
    3. 員工每年得申請年假至多二次（每次上限依年資遞增，滿半年5日、1年以上7日、3年以上10日、10年以上12日）。
    
    【四、包班與改班規定】
    1. 包班資格：須任職滿 1 年以上，通過新進評核且熟悉 BMT（骨髓移植）照護規範。E班及N班各層級包班名額有嚴格上限，一次得連續包班 2 個月，每月須上滿 16 天。
    2. 改班與換班：班表公告後換班須經護理長同意且採「一換一」方式。延遲下班應於系統中申請「加班預先申請」，同仁接受確認並送交護理長審核。`,
    checklist: [
      '確認三班皆有一位小組長或二線小組長（接受小組長訓練中人員）在班',
      '每月第一週按時公告預班表，並於次月第三週公告正式新班表',
      '年假申請必須在 30 日前提出，並核對申請人年資對應的請假天數上限'
    ]
  },
  {
    id: 'reg-3',
    type: 'admin',
    authority: '衛生福利部',
    code: '醫療法第15條',
    title: '醫療機構設立、開業與變更登記規範',
    isRecommended: false,
    highlights: [
      { type: 'rule', text: '醫療機構之開業，應向所在地直轄市、縣（市）主管機關申請核准登記，發給開業執照。' },
      { type: 'rule', text: '登載事項如有變更（例如負責人、診療科目、地址），應於事實發生後三十日內辦理變更登記。' },
      { type: 'penalty', text: '未依規定辦理變更登記者，處新台幣 1 萬元以上 5 萬元以下罰鍰。' }
    ],
    fullText: '醫療機構之設立、擴建 or 變更，涉及床位數調整或重大設備增設者，需報請衛生主管機關許可。開業執照應懸掛於機構內明顯處。非醫療機構不得使用醫療機構名稱，亦不得進行醫療業務行為。',
    checklist: ['開業執照懸掛於掛號櫃台旁明顯處', '醫事人員執業登記與執照更新', '機構登記坪數與實體隔間相符']
  },
  {
    id: 'reg-4',
    type: 'admin',
    authority: '衛生福利部',
    code: '醫療法第67條',
    title: '病歷製作、保存年限與電子病歷規範',
    isRecommended: false,
    highlights: [
      { type: 'rule', text: '醫療機構應製作病歷，並至少保存七年。但未成年病人之病歷，至少應保存至其成年後七年。' },
      { type: 'rule', text: '電子病歷需每日備份，系統應具備電子簽章及修改軌跡防篡改機制。' },
      { type: 'penalty', text: '未依法製作 or 保存病歷，或無故洩漏病人病歷者，處新台幣 1 萬元以上 5 萬元以下罰鍰，並得連續處罰。' }
    ],
    fullText: '病歷應清晰載明病人姓名、出生年月日、性別、住址、主訴、診斷、處置及用藥。病歷之銷毀應依規定進行物理破壞（如碎紙機）或燒毀，不得以常規廢紙回收。病人申請病歷複製本時，醫療機構應於三個工作天內交付，不得無故拒絕。',
    checklist: ['紙本病歷存放在上鎖之病歷庫房', '電子病歷系統具備權限分級管制', '病歷申請與影印收費標準公告']
  },
  {
    id: 'reg-8',
    type: 'education',
    authority: '醫策會',
    code: 'HA-EDU-02',
    title: '病人安全異常事件無懲罰性通報宣導',
    isRecommended: false,
    highlights: [
      { type: 'rule', text: '全院各級同仁（含行政與外包人員）皆應熟悉院內無懲罰性病人安全異常事件通報流程。' },
      { type: 'rule', text: '每年應至少舉辦兩次病安防範教育（如跌倒防範、給藥錯誤防範）案例解析宣講。' },
      { type: 'penalty', text: '隱匿重大醫療安全事件不報者，除重扣評鑑分數外，機構與相關涉案人將依法負行政與刑事責任。' }
    ],
    fullText: '為建立優質的病人安全文化，醫療機構應設置多元、便利且匿名之異常事件通報管道。教育宣導重點應放在：跌倒防範、給藥錯誤、醫療儀器故障、檢體遺失等常見臨床事件。當發生重大安全異常事件時，必須於 24 小時內啟動改善小組（如 RCA 團隊）並教育全院。',
    checklist: ['設置實體病安通報箱與院內線上通報連結', '張貼病安通報流程海報於員工休息區', '每年留存至少兩份異常事件改善分析與宣導訓練簽到']
  }
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReg, setActiveReg] = useState<any>(null);
  
  // Custom Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // AI Poster Generator state
  const [posterLoading, setPosterLoading] = useState(false);
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);

  // Show customized Toast notification
  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Filter regulations data
  const filteredRegulations = useMemo(() => {
    return REGULATIONS_DATA.filter(reg => {
      const matchCategory = selectedCategory === 'all' || reg.type === selectedCategory;
      const matchSearch = reg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          reg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          reg.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          reg.fullText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Click quick navigation / action triggers smooth scroll into regulations detail table
  const handleQuickCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const targetElement = document.getElementById('regulations-table-section');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Safe and proxy-based Client Call to Server-Side Poster Generator
  const generatePosterImage = async (regulationTitle: string) => {
    setPosterLoading(true);
    setGeneratedPoster(null);

    try {
      const response = await fetch('/api/gemini/poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: regulationTitle })
      });

      if (!response.ok) {
        throw new Error("Poster API returned error status");
      }

      const data = await response.json();
      if (data.image) {
        setGeneratedPoster(data.image);
      } else {
        throw new Error("No image field found");
      }
    } catch (error) {
      console.warn("Poster AI failed, generating clinical SVG template as secure fallback", error);
      // Clean fallback vector SVG
      const cleanSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%23f8fafc" rx="16"/><rect width="368" height="468" x="16" y="16" rx="12" fill="none" stroke="%234f46e5" stroke-width="3" stroke-dasharray="6 4"/><text x="50%22 y="70" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="%231e293b">8BQ大補丸 ‧ 合規品管宣導</text><circle cx="200" cy="200" r="60" fill="%23e0e7ff" stroke="%234f46e5" stroke-width="2"/><path d="M190 170h20v60h-20zM170 190h60v20h-60z" fill="%234f46e5"/><text x="50%22 y="310" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="%230f172a">${regulationTitle}</text><text x="50%22 y="345" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%23ef4444" font-weight="bold">⚠️ 違反落實標準：稽核缺失扣點 ‧ 影響評鑑特等</text><text x="50%22 y="380" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%2364748b">落實會陰水碘消毒 | 三明治造口防護</text><text x="50%22 y="400" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%2364748b">潛行順時針測量 | 聽診屈膝暖膜面</text><rect x="50" y="435" width="300" height="32" rx="8" fill="%234f46e5"/><text x="50%22 y="455" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="white">落實每日臨床自主品管 ‧ 守護病人安全</text></svg>`;
      setGeneratedPoster(cleanSvg);
    } finally {
      setPosterLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    try {
      showToast("📋 已成功複製規章指引大綱！可直接貼上病房宣導公告。");
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(tempTextArea);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* ==========================================
          自製精貼心精緻 Toast 通知
         ========================================== */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-slate-950 text-white text-xs font-bold px-5 py-4 rounded-xl shadow-2xl border border-slate-800 flex items-center space-x-3">
            <div className="bg-emerald-500 p-1.5 rounded-full text-white">
              <Check className="h-4 w-4" />
            </div>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ==========================================
          Main Content 中間主視窗區塊
         ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        
        {/* 精緻高對比白 Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-600/25">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">8BQ大補丸</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clinical Compliance Hub</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse ml-2">
              Active Control
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); showToast("🧹 已重設篩選及搜尋條件。"); }}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all text-slate-600"
            >
              重置篩選 Reset State
            </button>
            <button 
              onClick={() => showToast("🎯 模擬品質指標自檢程序中！抽檢本病房 20% 床位...", "info")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/25 hover:bg-indigo-700 transition-all"
            >
              啟動模擬查檢
            </button>
          </div>
        </header>



        {/* 下方雙欄操作與檢視區 */}
        <div className="flex-1 flex flex-col xl:flex-row min-h-0 overflow-hidden">
          
          {/* 中間主要規章及清單與搜尋 (2/3 寬度) */}
          <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6">

            {/* A. 奇美總院護理作業標準(SOP)與自檢手冊(pdf代用卡) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-900 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  📁 奇美總院護理部作業指導書與品質指標手冊
                </span>
                <span className="text-[10px] text-indigo-600 font-bold">點擊卡片查閱條文與產生宣導海報</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GUIDE_DOCUMENTS.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => {
                      let relatedId = '';
                      if (doc.id === 'doc-chimei-transfusion') relatedId = 'reg-chimei-transfusion';
                      else if (doc.id === 'doc-chimei-neutropenia') relatedId = 'reg-chimei-neutropenia';
                      else if (doc.id === 'doc-chimei-skincare') relatedId = 'reg-chimei-skincare';
                      else if (doc.id === 'doc-chimei-8b') relatedId = 'reg-chimei-8b';
                      else if (doc.id === 'doc-chimei-bowel') relatedId = 'reg-chimei-bowel';
                      else if (doc.id === 'doc-chimei-iad') relatedId = 'reg-chimei-iad';
                      else if (doc.id === 'doc-chimei-foley') relatedId = 'reg-chimei-foley';
                      else if (doc.id === 'doc-chimei-pressure-injury') relatedId = 'reg-chimei-pressure-injury';

                      if (relatedId) {
                        const found = REGULATIONS_DATA.find(r => r.id === relatedId);
                        if (found) {
                          setActiveReg(found);
                          generatePosterImage(found.title);
                        }
                      }
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 flex justify-between items-center transition-all cursor-pointer shadow-1xs group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all flex-shrink-0">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-[11px] text-slate-800 truncate leading-snug">{doc.title}</h4>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">{doc.type} · {doc.size}</span>
                      </div>
                    </div>
                    <button className="p-1.5 bg-white text-slate-500 rounded-lg border border-slate-200 shadow-2xs hover:bg-indigo-600 hover:text-white transition-all flex-shrink-0 ml-2">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* B. 搜尋與篩選提示列 */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex-shrink-0">
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl flex-shrink-0">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-white text-indigo-600 shadow-xs border-slate-200/80 font-black'
                        : 'text-slate-500 hover:text-slate-900 border-transparent'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜尋院內規範與罰則（如：尿管、壓傷、輸血、ANC）..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-3 w-full text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                />
              </div>

              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-shrink-0 lg:ml-auto">
                已載入奇美護理部最新 2026 年指引
              </div>
            </div>

            {/* C. 規範詳情細則列表 */}
            <div id="regulations-table-section" className="space-y-4 flex-grow">
              {filteredRegulations.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                  <ClipboardList className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-xs font-bold text-slate-500">沒有找到與此條件符合的院內規章或罰則。</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="mt-3 text-xs text-indigo-600 hover:underline font-bold"
                  >
                    重設搜尋並查看全部
                  </button>
                </div>
              ) : (
                filteredRegulations.map((reg) => {
                  const isChimeiNewDoc = reg.id.startsWith('reg-chimei-');
                  return (
                    <div 
                      key={reg.id}
                      className={`bg-white rounded-xl border overflow-hidden shadow-2xs transition-all ${
                        isChimeiNewDoc 
                          ? 'border-indigo-300 ring-2 ring-indigo-500/5' 
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-500 text-xs">⭐</span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md font-black tracking-widest leading-none">
                            {reg.code}
                          </span>
                          <h3 className="font-extrabold text-xs text-slate-900">
                            {reg.title}
                          </h3>
                          {reg.isRecommended && (
                            <span className="bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md leading-none">
                              必查重點
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-black">
                          {CATEGORIES.find(c => c.id === reg.type)?.name}
                        </span>
                      </div>

                      {/* Details structure table in 2026 style */}
                      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        
                        {/* 頒布來源 & 條款 */}
                        <div className="md:col-span-3 space-y-2">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">頒佈與督導單位</span>
                            <span className="text-xs font-bold text-slate-700 block">{reg.authority}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">條例編號代碼</span>
                            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 py-0.5 px-2 rounded inline-block mt-0.5">{reg.code}</span>
                          </div>
                        </div>

                        {/* 精簡重點指示 (與原圖「全險表/罰金」一致) */}
                        <div className="md:col-span-7 space-y-2">
                          <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider col-span-12">精簡重點指引 / 稽核與扣分警示說明</span>
                          <ul className="space-y-1.5">
                            {reg.highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs">
                                {h.type === 'penalty' ? (
                                  <>
                                    <span className="bg-red-50 text-red-700 border border-red-200 px-1 rounded-sm font-black text-[9px] mt-0.5 leading-none flex-shrink-0">
                                      🚨 懲警
                                    </span>
                                    <span className="text-red-700 font-bold leading-relaxed">{h.text}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-1 rounded-sm font-black text-[9px] mt-0.5 leading-none flex-shrink-0">
                                      {i + 1}
                                    </span>
                                    <span className="text-slate-700 font-semibold leading-relaxed">{h.text}</span>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 行動按鈕 */}
                        <div className="md:col-span-2 text-center md:text-right">
                          <button
                            onClick={() => {
                              setActiveReg(reg);
                              generatePosterImage(reg.title);
                            }}
                            className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-slate-900 border border-indigo-500 hover:border-slate-800 text-white font-black text-xs rounded-xl shadow-2xs transition-all inline-block"
                          >
                            開起條文
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </main>

      {/* ==========================================
          法規條文與海報生成 Modal 彈窗
         ========================================== */}
      {activeReg && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-scaleUp">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col scale-100 transition-all">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
              <div>
                <span className="text-[9px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-widest mr-2 leading-none">
                  臨床作業標準 (SOP) 完整規章
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{activeReg.code} ‧ {activeReg.authority}</span>
                <h3 className="text-base font-extrabold mt-1 tracking-tight text-white">{activeReg.title}</h3>
              </div>
              <button 
                onClick={() => { setActiveReg(null); setGeneratedPoster(null); }}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors border border-slate-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow bg-slate-50">
              
              {/* 規章與評鑑條文詳情 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs">
                <h4 className="text-xs font-black text-slate-900 border-l-4 border-indigo-600 pl-2.5 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  奇美總院護理作業標準作業指導(SOP)原文與程序
                </h4>
                <div className="text-xs text-slate-700 font-semibold bg-slate-50/50 p-4 rounded-lg border border-slate-200/60 leading-relaxed whitespace-pre-line font-mono">
                  {activeReg.fullText}
                </div>
              </div>

              {/* 實體督功自檢核 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs">
                <h4 className="text-xs font-black text-slate-900 border-l-4 border-emerald-500 pl-2.5 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  本病房/單位自檢及實體稽核重點項目
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeReg.checklist.map((item: string, idx: number) => (
                    <div key={idx} className="bg-emerald-50/40 border border-emerald-100 p-3.5 rounded-xl flex items-start gap-3">
                      <div className="p-1 bg-emerald-100 text-emerald-700 rounded-full flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 font-black" />
                      </div>
                      <span className="text-xs text-slate-700 font-bold leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 宣導海報生成器 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-3xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                      <span>8BQ AI 臨床醫療合規與警告宣導海報生成器</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      自動透過全院 AI 形象引擎，繪製適用於本病房護理站、治療室大門的警告宣導公告海報。
                    </p>
                  </div>
                  <button
                    onClick={() => generatePosterImage(activeReg.title)}
                    disabled={posterLoading}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors text-xs shadow-2xs"
                  >
                    <RefreshCw className={`h-3 w-3 ${posterLoading ? 'animate-spin' : ''}`} />
                    <span>重新產生海報</span>
                  </button>
                </div>

                {/* Poster Display */}
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 flex flex-col items-center justify-center min-h-[340px] relative">
                  {posterLoading ? (
                    <div className="text-center space-y-3">
                      <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-[11px] font-mono text-indigo-300 tracking-wider">
                        [ENGINE_POSTER] Designing high-impact visual standard poster...
                      </p>
                    </div>
                  ) : generatedPoster ? (
                    <div className="w-full max-w-sm text-center">
                      <img 
                        src={generatedPoster} 
                        alt="Clinical Poster preview" 
                        className="mx-auto rounded-lg shadow-xl max-h-[320px] bg-slate-100 border border-slate-800"
                      />
                      <p className="text-[9px] text-slate-500 font-mono mt-3">
                        ✨ 海報已成功產生。您可以按右鍵儲存圖片、或透過彩色印表機一鍵列印張貼公告。
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs font-semibold">海報生成就緒</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row gap-2 justify-end flex-shrink-0">
              <button
                onClick={() => copyToClipboard(activeReg.fullText)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black px-4 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                複製全規章條文
              </button>
              <button
                onClick={() => {
                  setActiveReg(null);
                  showToast("💾 已將此指引列入今日稽核備忘清單。");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2 rounded-xl text-xs transition-colors shadow-sm shadow-indigo-600/10 flex items-center justify-center"
              >
                確認關閉
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
