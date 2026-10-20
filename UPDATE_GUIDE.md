# 莫比价 · 每月价格更新说明

这份说明写给每月自动运行的更新任务（也写给以后接手的人）。网页是纯静态的，GitHub Pages 直接发布 `main` 分支根目录。

## 文件结构

| 文件 | 内容 |
| --- | --- |
| `index.html` | 页面、样式和全部逻辑。**每月更新时只改其中三个 `?v=` 版本号**，其他不动 |
| `data/meta.js` | `META.updated`（价格整理日期，YYYY-MM-DD）、`META.sale`（页脚的促销提示）、`META.saleTip`（小莫的促销提示，可含 `<b>`） |
| `data/pcs.js` | 电脑：`P` 数组（每台一条），`MARKET`（市场价 `[价格, "说明"]`），`SRC`（来源文章） |
| `data/peripherals.js` | 外设：`Q` 数组（键盘 kb / 鼠标 mouse / 耳机 audio），`HIST`（电脑和外设共用的历史低价表） |

## 字段含义（只更新这些）

- `price`：**现价**，只采用品牌官网或知名大平台的**自营、有货**价格（EUR，含税）。可用来源：品牌官网（苹果、罗技、雷蛇、森海塞尔、Acer 等）、Amazon.it 自营、MediaWorld、Unieuro、Euronics、PcComponentes 自营、LDLC、Yeppon。**不要**用第三方小卖家价格、限时闪购或优惠文章里的"史低价"当现价。同一款在多个可靠来源都有货时，取其中最低的。
- `pn`：现价来源的名字（如 "罗技官网"、"Unieuro"、"PcComponentes 自营"）；`buy`：该来源的商品页网址。
- `st`：`"ok"` 有货；`"oos"` 只查到可靠来源的标价但缺货；`"ref"` 没在任何可靠来源核实到（此时 `price` 是参考价，`buy` 为空）。每次更新都尽量把 `ref` 和 `oos` 核实成 `ok`；某款长期 `ref`/`oos`，可以换成同定位、同价位、能核实的型号（要同时补齐配置、优缺点、图片、`src`）。
- 电脑的市场价在 `MARKET[id] = [价格, "说明"]`；外设的市场价是条目里的 `market` 和 `mnote`。市场价 = 原价 / 建议零售价 / 官方价 / 其他卖家价，必须 ≥ 现价，查不到就保持原值或设为 `null`。
- `HIST[id] = [历史最低价, "来源站名", "来源网址", ""]`：只有在意大利优惠资讯网站（Tom's Hardware Italia、Punto Informatico、TuttoTech、HTML.it、SmartWorld 等）真的报道过 "minimo storico" 时才写；发现更低的新纪录就替换。没有可靠来源就不要新增。
- 推荐入手价由页面自动计算，不用手填。
- 不要改 `id`、`img`、`s`（评分）、`pros`/`cons`、配置文字，除非型号已停售需要替换。

## 每月步骤

1. 对每个条目，用名字或 `q` 字段搜索意大利商店当前价格（Amazon.it、PcComponentes.it、Yeppon、Unieuro、MediaWorld、LDLC Italia、Apple 官网等）。只用能打开的商品页或可信的价格报道，不要猜。
2. 更新 `price`、`pn`、市场价，以及能查到的新历史低价。
3. 某款已经买不到、或价格明显不合理（比市场价高很多且没有其他卖家），在条目里保持原价，并在提交说明里列出来，由人决定是否换型号。
4. 改 `data/meta.js`：`updated` 改成今天日期；`sale` / `saleTip` 写下一个月内意大利的主要促销（黑色星期五、网络星期一、Prime Day、圣诞/新年折扣、1 月 Saldi 等），没有就写一句"价格会变，下单前以商店页面为准"之类的通用提示。
5. 把 `index.html` 里三个 `data/*.js?v=YYYY-MM-DD` 改成今天日期（让浏览器拿到新数据）。
6. 检查（三个文件按顺序在同一个环境里运行，后面的会用到前面定义的函数）：`node -e "const vm=require('vm'),fs=require('fs'),c=vm.createContext({});for(const f of ['meta','pcs','peripherals'])vm.runInContext(fs.readFileSync('data/'+f+'.js','utf8'),c);console.log(vm.runInContext('META.updated+\" \"+P.length+\" \"+Q.length',c))"` 能打印出日期和条目数（目前 42 台电脑、31 个外设）；如有 Playwright，打开 `index.html` 确认没有 JS 报错、42 台电脑和外设都显示。
7. 提交到 `main`，提交说明写清：改了多少个价格、哪些创了新低、哪些买不到或需要人工看。

## 注意

- 价格一律用欧元，保留两位小数以内的原样数字（如 `1199` 或`1192.10`）。
- 页面要在 iPhone 上稳定打开：不要往页面里加大量毛玻璃（backdrop-filter）、3D 变换或一次性加载的大图。
