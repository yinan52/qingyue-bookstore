/* ==========================================================================
   data.js —— 全站图书数据源（模拟后端数据库）
   说明：本项目为纯前端项目，图书数据以 JS 对象数组形式内置，
   配合 localStorage 实现“存储 → 读取 → 修改 → 删除”的完整数据流程。
   ========================================================================== */

/** 图书分类字典 */
const BOOK_CATEGORIES = [
  { id: "all", name: "全部" },
  { id: "computer", name: "计算机技术" },
  { id: "literature", name: "文学小说" },
  { id: "history", name: "历史人文" },
  { id: "economy", name: "经济管理" },
  { id: "art", name: "艺术设计" },
  { id: "science", name: "科普科学" }
];

/** 图书数据数组：字段覆盖 id/书名/作者/价格/封面/分类/标签/评分/销量/库存等 */
const BOOKS = [
  {
    id: 1,
    title: "JavaScript高级程序设计（第4版）",
    author: "马特·弗里斯比",
    publisher: "人民邮电出版社",
    pubDate: "2020-09",
    pages: 936,
    price: 129.0,
    originalPrice: 129.0,
    cover: "assets/images/goods/book-01.svg",
    category: "computer",
    categoryName: "计算机技术",
    tags: ["前端经典", "红宝书", "深入原理"],
    rating: 9.8,
    sales: 86213,
    stock: 120,
    isHot: true,
    isNew: false,
    desc: "JavaScript 领域无可争议的经典之作，被誉为“红宝书”。全书系统讲解 ECMAScript、DOM、BOM 等核心知识，深入剖析事件、异步编程、网络请求与前端工程化实践，是前端开发者案头必备的进阶读物。"
  },
  {
    id: 2,
    title: "CSS揭秘",
    author: "Lea Verou",
    publisher: "人民邮电出版社",
    pubDate: "2016-04",
    pages: 408,
    price: 99.0,
    originalPrice: 99.0,
    cover: "assets/images/goods/book-02.svg",
    category: "computer",
    categoryName: "计算机技术",
    tags: ["CSS3", "奇思妙想", "实战技巧"],
    rating: 9.6,
    sales: 30156,
    stock: 86,
    isHot: true,
    isNew: false,
    desc: "CSS 大咖 Lea Verou 的匠心之作，围绕 47 个典型场景，用“问题—解决方案—讨论”的模式展现 CSS3 的无限可能，涵盖渐变、阴影、动画、响应式等高级技巧，让样式编写充满创造力。"
  },
  {
    id: 3,
    title: "深入浅出Vue.js",
    author: "刘博文",
    publisher: "人民邮电出版社",
    pubDate: "2019-03",
    pages: 528,
    price: 89.0,
    originalPrice: 109.0,
    cover: "assets/images/goods/book-03.svg",
    category: "computer",
    categoryName: "计算机技术",
    tags: ["Vue3", "响应式原理", "框架源码"],
    rating: 9.4,
    sales: 20548,
    stock: 64,
    isHot: false,
    isNew: true,
    desc: "从源码层面剖析 Vue.js 的核心实现，覆盖响应式原理、虚拟 DOM、diff 算法、模板编译等关键机制，帮助开发者真正“知其然更知其所以然”，是进阶 Vue 框架的必读书目。"
  },
  {
    id: 4,
    title: "算法导论（原书第3版）",
    author: "Thomas H. Cormen",
    publisher: "机械工业出版社",
    pubDate: "2012-12",
    pages: 780,
    price: 128.0,
    originalPrice: 128.0,
    cover: "assets/images/goods/book-04.svg",
    category: "computer",
    categoryName: "计算机技术",
    tags: ["算法经典", "CLRS", "数据结构"],
    rating: 9.5,
    sales: 45890,
    stock: 45,
    isHot: false,
    isNew: false,
    desc: "算法领域的百科全书，由四位顶尖学者合著。系统阐述排序、搜索、图论、动态规划等核心算法与数据结构，数学严谨、讲解透彻，是计算机专业学生与从业者的案头必备。"
  },
  {
    id: 5,
    title: "三体（全三册）",
    author: "刘慈欣",
    publisher: "重庆出版社",
    pubDate: "2010-11",
    pages: 1284,
    price: 93.0,
    originalPrice: 118.0,
    cover: "assets/images/goods/book-05.svg",
    category: "literature",
    categoryName: "文学小说",
    tags: ["科幻史诗", "雨果奖", "中国科幻"],
    rating: 9.7,
    sales: 120453,
    stock: 200,
    isHot: true,
    isNew: false,
    desc: "亚洲首部雨果奖获奖作品，中国科幻文学的里程碑。从红岸基地到黑暗森林，从三体文明到人类存亡，刘慈欣以恢弘的想象与冷峻的理性，构建了一部跨越四个世纪的宇宙史诗。"
  },
  {
    id: 6,
    title: "活着",
    author: "余华",
    publisher: "作家出版社",
    pubDate: "2012-08",
    pages: 191,
    price: 28.0,
    originalPrice: 35.0,
    cover: "assets/images/goods/book-06.svg",
    category: "literature",
    categoryName: "文学小说",
    tags: ["当代文学", "经典", "命运"],
    rating: 9.6,
    sales: 154320,
    stock: 300,
    isHot: true,
    isNew: false,
    desc: "余华代表作，讲述主人公福贵历经内战、大跃进、文革等时代浪潮，在接连失去亲人后依然坚韧活着的一生。以朴素笔触写尽人间悲欢，被称为“中国人的生命之书”。"
  },
  {
    id: 7,
    title: "百年孤独",
    author: "加西亚·马尔克斯",
    publisher: "南海出版公司",
    pubDate: "2011-06",
    pages: 360,
    price: 39.5,
    originalPrice: 39.5,
    cover: "assets/images/goods/book-07.svg",
    category: "literature",
    categoryName: "文学小说",
    tags: ["魔幻现实主义", "诺贝尔文学奖", "世界名著"],
    rating: 9.3,
    sales: 89012,
    stock: 150,
    isHot: false,
    isNew: false,
    desc: "魔幻现实主义文学的代表作，布恩迪亚家族七代人的传奇故事，折射出拉丁美洲一个世纪的风云变幻。马尔克斯以绚烂的想象与深刻的哲思，构筑了“马孔多”这一不朽的文学地标。"
  },
  {
    id: 8,
    title: "人类简史：从动物到上帝",
    author: "尤瓦尔·赫拉利",
    publisher: "中信出版社",
    pubDate: "2014-11",
    pages: 440,
    price: 68.0,
    originalPrice: 68.0,
    cover: "assets/images/goods/book-08.svg",
    category: "history",
    categoryName: "历史人文",
    tags: ["全球畅销", "宏观历史", "思维颠覆"],
    rating: 9.4,
    sales: 98321,
    stock: 180,
    isHot: true,
    isNew: false,
    desc: "从认知革命、农业革命到科学革命，赫拉利以宏大的叙事框架重新讲述人类历史。融合生物学、历史学与哲学，追问“智人何以成为地球的主宰”，一经出版便风靡全球。"
  },
  {
    id: 9,
    title: "明朝那些事儿（全集）",
    author: "当年明月",
    publisher: "北京联合出版公司",
    pubDate: "2011-12",
    pages: 2484,
    price: 118.0,
    originalPrice: 148.0,
    cover: "assets/images/goods/book-09.svg",
    category: "history",
    categoryName: "历史人文",
    tags: ["通俗历史", "幽默", "畅销"],
    rating: 9.2,
    sales: 132580,
    stock: 220,
    isHot: false,
    isNew: false,
    desc: "以轻松幽默的笔法讲述明朝近三百年历史，从朱元璋到崇祯，从朝堂斗争到边关烽火，人物鲜活、故事跌宕，让历史不再枯燥，成为现象级的通俗历史读物。"
  },
  {
    id: 10,
    title: "经济学原理（第8版）",
    author: "N.格里高利·曼昆",
    publisher: "北京大学出版社",
    pubDate: "2020-05",
    pages: 526,
    price: 98.0,
    originalPrice: 98.0,
    cover: "assets/images/goods/book-10.svg",
    category: "economy",
    categoryName: "经济管理",
    tags: ["经济学入门", "曼昆", "教材经典"],
    rating: 9.5,
    sales: 56780,
    stock: 98,
    isHot: false,
    isNew: true,
    desc: "全球最流行的经济学入门教材，以“十大原理”为主线，用生活中随处可见的例子解释供求、市场、宏观政策等核心概念，语言生动、体系完整，让经济学变得亲切易懂。"
  },
  {
    id: 11,
    title: "金字塔原理",
    author: "芭芭拉·明托",
    publisher: "南海出版公司",
    pubDate: "2019-04",
    pages: 302,
    price: 58.0,
    originalPrice: 58.0,
    cover: "assets/images/goods/book-11.svg",
    category: "economy",
    categoryName: "经济管理",
    tags: ["逻辑思维", "表达沟通", "职场必读"],
    rating: 9.1,
    sales: 45678,
    stock: 130,
    isHot: false,
    isNew: false,
    desc: "麦肯锡 40 年经典培训教材，教你用“结论先行、以上统下、归类分组、逻辑递进”的金字塔结构思考和表达，全面提升写作、汇报与解决问题的逻辑能力。"
  },
  {
    id: 12,
    title: "设计中的设计",
    author: "原研哉",
    publisher: "广西师范大学出版社",
    pubDate: "2010-09",
    pages: 288,
    price: 98.0,
    originalPrice: 98.0,
    cover: "assets/images/goods/book-12.svg",
    category: "art",
    categoryName: "艺术设计",
    tags: ["设计美学", "无印良品", "经典"],
    rating: 9.0,
    sales: 29876,
    stock: 75,
    isHot: false,
    isNew: false,
    desc: "日本设计大师原研哉的代表作，重新思考“设计到底是什么”。从无印良品的极简美学出发，探讨日常之物与设计的关系，是设计师与美学爱好者的必读经典。"
  },
  {
    id: 13,
    title: "月亮与六便士",
    author: "毛姆",
    publisher: "上海译文出版社",
    pubDate: "2006-08",
    pages: 292,
    price: 32.0,
    originalPrice: 32.0,
    cover: "assets/images/goods/book-13.svg",
    category: "literature",
    categoryName: "文学小说",
    tags: ["理想与现实", "世界名著", "艺术人生"],
    rating: 9.2,
    sales: 67890,
    stock: 160,
    isHot: false,
    isNew: false,
    desc: "以画家高更为原型，讲述证券经纪人思特里克兰德抛弃安稳生活，远赴塔希提追求绘画理想的故事。“满地都是六便士，他却抬头看见了月亮”，关于理想与现实的永恒叩问。"
  },
  {
    id: 14,
    title: "置身事内：中国政府与经济发展",
    author: "兰小欢",
    publisher: "上海人民出版社",
    pubDate: "2021-08",
    pages: 340,
    price: 65.0,
    originalPrice: 65.0,
    cover: "assets/images/goods/book-14.svg",
    category: "economy",
    categoryName: "经济管理",
    tags: ["中国经济", "读懂政策", "年度好书"],
    rating: 9.4,
    sales: 51234,
    stock: 110,
    isHot: false,
    isNew: true,
    desc: "复旦大学兰小欢教授力作，从“土地财政”“分税制”等切入口，把中国政府与经济发展的关系讲得透彻明白。读懂中国经济的现实与逻辑，从这本书开始。"
  },
  {
    id: 15,
    title: "编码：隐匿在计算机软硬件背后的语言",
    author: "Charles Petzold",
    publisher: "电子工业出版社",
    pubDate: "2012-10",
    pages: 420,
    price: 69.0,
    originalPrice: 69.0,
    cover: "assets/images/goods/book-15.svg",
    category: "computer",
    categoryName: "计算机技术",
    tags: ["计算机入门", "底层原理", "经典科普"],
    rating: 9.5,
    sales: 33456,
    stock: 88,
    isHot: false,
    isNew: false,
    desc: "从手电筒的开关讲到 CPU 的构成，用讲故事的方式揭示计算机的底层秘密。无需任何专业背景，也能读懂二进制、逻辑门、存储器与处理器的工作原理，被誉为最棒的计算机科普书。"
  },
  {
    id: 16,
    title: "小王子",
    author: "圣埃克苏佩里",
    publisher: "人民文学出版社",
    pubDate: "2003-08",
    pages: 112,
    price: 22.0,
    originalPrice: 22.0,
    cover: "assets/images/goods/book-16.svg",
    category: "literature",
    categoryName: "文学小说",
    tags: ["童话", "治愈", "哲学"],
    rating: 9.5,
    sales: 145670,
    stock: 260,
    isHot: true,
    isNew: false,
    desc: "一部写给大人看的童话。飞行员与小王子在沙漠中的相遇，玫瑰、狐狸与 B612 星球，用最纯净的语言道出爱、责任与孤独的真谛，被译成 300 多种语言，畅销全球。"
  },
  /* ============ 新增图书（17~24，扩充品类覆盖） ============ */
  {
    id: 17,
    title: "Python编程：从入门到实践",
    author: "埃里克·马瑟斯",
    publisher: "人民邮电出版社",
    pubDate: "2020-10",
    pages: 460,
    price: 89.0,
    originalPrice: 89.0,
    cover: "assets/images/goods/book-17.svg",
    category: "computer",
    categoryName: "计算机技术",
    tags: ["Python入门", "实战项目", "零基础"],
    rating: 9.5,
    sales: 76543,
    stock: 150,
    isHot: true,
    isNew: true,
    desc: "全球畅销的 Python 入门经典。从变量、列表、函数讲到 Web 应用与数据可视化实战项目，边学边做，零基础也能快速上手写出属于自己的程序。"
  },
  {
    id: 18,
    title: "深入理解计算机系统（第3版）",
    author: "Randal E. Bryant",
    publisher: "机械工业出版社",
    pubDate: "2016-11",
    pages: 732,
    price: 139.0,
    originalPrice: 139.0,
    cover: "assets/images/goods/book-18.svg",
    category: "computer",
    categoryName: "计算机技术",
    tags: ["CSAPP", "系统基础", "经典教材"],
    rating: 9.6,
    sales: 28765,
    stock: 72,
    isHot: false,
    isNew: true,
    desc: "CMU 经典教材 CSAPP。从程序员视角理解计算机系统：信息表示、汇编、处理器、存储层次、链接与虚拟内存，是进阶系统开发的必读之作。"
  },
  {
    id: 19,
    title: "白夜行",
    author: "东野圭吾",
    publisher: "南海出版公司",
    pubDate: "2013-01",
    pages: 538,
    price: 39.5,
    originalPrice: 45.0,
    cover: "assets/images/goods/book-19.svg",
    category: "literature",
    categoryName: "文学小说",
    tags: ["推理悬疑", "东野圭吾", "长篇巨著"],
    rating: 9.4,
    sales: 112340,
    stock: 210,
    isHot: true,
    isNew: false,
    desc: "东野圭吾推理巅峰之作。一桩废弃大楼里的命案，牵出跨越十九年的宿命纠缠。“只希望能手牵手在太阳下散步”，绝望与坚守交织，令人唏嘘。"
  },
  {
    id: 20,
    title: "平凡的世界（全三册）",
    author: "路遥",
    publisher: "北京十月文艺出版社",
    pubDate: "2017-03",
    pages: 1614,
    price: 108.0,
    originalPrice: 108.0,
    cover: "assets/images/goods/book-20.svg",
    category: "literature",
    categoryName: "文学小说",
    tags: ["茅盾文学奖", "现实主义", "奋斗人生"],
    rating: 9.7,
    sales: 98760,
    stock: 180,
    isHot: true,
    isNew: false,
    desc: "茅盾文学奖皇冠上的明珠。以孙少安、孙少平兄弟为中心，展现 1975 至 1985 年间中国城乡的社会变迁与普通人在大时代里的奋斗与尊严。"
  },
  {
    id: 21,
    title: "万历十五年",
    author: "黄仁宇",
    publisher: "中华书局",
    pubDate: "2014-02",
    pages: 320,
    price: 42.0,
    originalPrice: 42.0,
    cover: "assets/images/goods/book-21.svg",
    category: "history",
    categoryName: "历史人文",
    tags: ["大历史观", "明史", "经典"],
    rating: 9.3,
    sales: 65430,
    stock: 140,
    isHot: false,
    isNew: false,
    desc: "黄仁宇“大历史观”代表作。以公元 1587 年这一“平淡之年”为切入口，从万历、张居正到海瑞、戚继光，剖开明王朝由盛转衰的深层逻辑。"
  },
  {
    id: 22,
    title: "穷查理宝典",
    author: "彼得·考夫曼",
    publisher: "中信出版社",
    pubDate: "2016-07",
    pages: 552,
    price: 88.0,
    originalPrice: 99.0,
    cover: "assets/images/goods/book-22.svg",
    category: "economy",
    categoryName: "经济管理",
    tags: ["投资思维", "多元思维模型", "查理·芒格"],
    rating: 9.2,
    sales: 41230,
    stock: 96,
    isHot: false,
    isNew: true,
    desc: "查理·芒格智慧箴言录。汇集芒格的演讲与思考，讲述如何运用“多元思维模型”理性决策、投资与生活，是投资者与思考者的案头经典。"
  },
  {
    id: 23,
    title: "写给大家看的设计书（第4版）",
    author: "Robin Williams",
    publisher: "人民邮电出版社",
    pubDate: "2016-10",
    pages: 256,
    price: 49.0,
    originalPrice: 49.0,
    cover: "assets/images/goods/book-23.svg",
    category: "art",
    categoryName: "艺术设计",
    tags: ["设计入门", "四大原则", "非设计师"],
    rating: 9.1,
    sales: 23456,
    stock: 80,
    isHot: false,
    isNew: false,
    desc: "设计入门神书。用亲密性、对齐、重复、对比四大原则，让零基础读者也能做出专业级排版，被全球数百万设计师与非设计师奉为启蒙经典。"
  },
  {
    id: 24,
    title: "时间简史（插图本）",
    author: "史蒂芬·霍金",
    publisher: "湖南科学技术出版社",
    pubDate: "2014-06",
    pages: 256,
    price: 45.0,
    originalPrice: 45.0,
    cover: "assets/images/goods/book-24.svg",
    category: "science",
    categoryName: "科普科学",
    tags: ["宇宙学", "黑洞", "科普经典"],
    rating: 9.4,
    sales: 54320,
    stock: 130,
    isHot: false,
    isNew: false,
    desc: "霍金科普巨著。从大爆炸到黑洞，从时间本质到宇宙命运，用通俗语言带领读者进行一场跨越时空的思想之旅，是了解宇宙的最佳入门书。"
  }
];

/** 网站轮播数据 */
const BANNERS = [
  {
    id: 1,
    img: "assets/images/banner/banner-01.jpg",
    title: "开学季 · 技术图书大促",
    subtitle: "全场技术好书 5 折起，满 99 减 30",
    link: "books.html?category=computer"
  },
  {
    id: 2,
    img: "assets/images/banner/banner-02.jpg",
    title: "经典文学 5 折专区",
    subtitle: "读一本好书，遇见更好的自己",
    link: "books.html?category=literature"
  },
  {
    id: 3,
    img: "assets/images/banner/banner-03.jpg",
    title: "新人注册领 50 元礼券",
    subtitle: "注册即送，全场通用，先到先得",
    link: "register.html"
  }
];

/** 评论区示例数据 */
const COMMENTS = [
  {
    id: 1,
    user: "沐雨橙风",
    avatar: "assets/images/avatar/avatar-01.svg",
    time: "2026-08-21",
    rating: 5,
    content: "包装完好，纸质细腻，排版清晰。课程老师推荐的书，配合在线课程学习，收获非常大，强烈推荐！",
    likes: 128,
    replies: [
      { user: "南巷旧人", content: "同款，这本书真的经典，看了两遍了！", time: "2026-08-22" }
    ]
  },
  {
    id: 2,
    user: "山月不知心底事",
    avatar: "assets/images/avatar/avatar-02.svg",
    time: "2026-08-15",
    rating: 4,
    content: "内容非常扎实，深度足够，不过需要一定的编程基础，建议先入门再读。物流很快，第二天就到了。",
    likes: 76,
    replies: []
  },
  {
    id: 3,
    user: "拾光少年",
    avatar: "assets/images/avatar/avatar-03.svg",
    time: "2026-08-02",
    rating: 5,
    content: "印刷质量很好，是正版。里面的示例代码可以扫描二维码在线运行，非常适合自学。五星好评！",
    likes: 54,
    replies: []
  }
];

/** 全局配置 */
const APP_CONFIG = {
  siteName: "青阅书城",
  siteSlogan: "读万卷书，行万里路",
  pageSize: 8,          // 列表页每页条数
  api: {
    hitokoto: "https://v1.hitokoto.cn/",          // 一言 API（Axios 演示）
    ipify: "https://api.ipify.org?format=json"     // 公网 IP API（Axios 演示）
  }
};

/* ==========================================================================
   以下为本次升级新增的模拟数据：优惠券 / 编辑推荐书单 / 示例订单
   ========================================================================== */

/** 优惠券数组：type=full(满减) / discount(折扣，amount 为封顶减免额) */
const COUPONS = [
  {
    id: 'c1',
    name: '满100减10',
    type: 'full',
    threshold: 100,       // 满减门槛
    discount: 0,          // 满减券不使用该字段
    amount: 10,           // 减免金额
    expireDate: '2026-12-31',
    desc: '全场图书满 100 元可用'
  },
  {
    id: 'c2',
    name: '满200减30',
    type: 'full',
    threshold: 200,
    discount: 0,
    amount: 30,
    expireDate: '2026-12-31',
    desc: '全场图书满 200 元可用'
  },
  {
    id: 'c3',
    name: '满300减50',
    type: 'full',
    threshold: 300,
    discount: 0,
    amount: 50,
    expireDate: '2026-12-31',
    desc: '全场图书满 300 元可用'
  },
  {
    id: 'c4',
    name: '全场9折券',
    type: 'discount',
    threshold: 0,         // 无门槛
    discount: 0.9,        // 9 折
    amount: 30,           // 最多减免 30 元
    expireDate: '2026-12-31',
    desc: '全场 9 折，最高抵扣 30 元'
  }
];

/**
 * 计算指定优惠券在某总额下的优惠金额
 * @param {string} couponId - 优惠券 id（传 'none' 或空表示不使用）
 * @param {number} totalPrice - 商品总额
 * @returns {number} 优惠金额（不超过 0）
 */
function calcCouponDiscount(couponId, totalPrice) {
  if (!couponId || couponId === 'none') return 0;
  const coupon = COUPONS.find((c) => c.id === couponId);
  if (!coupon) return 0;
  // 满减券：未达门槛不可用
  if (coupon.type === 'full') {
    if (totalPrice < coupon.threshold) return 0;
    return coupon.amount;
  }
  // 折扣券：原价 ×(1-折扣)，且不超过封顶金额
  if (coupon.type === 'discount') {
    const off = Math.round(totalPrice * (1 - coupon.discount) * 100) / 100;
    return Math.min(off, coupon.amount);
  }
  return 0;
}

/** 编辑推荐书单：首页“编辑推荐”模块 */
const EDITOR_PICKS = [
  {
    id: 'p1',
    title: '前端进阶必读书单',
    desc: '从入门到源码，这套书单帮你打通前端知识体系，大厂面试不再慌。',
    bookIds: [1, 2, 3, 15, 17],
    cover: 'assets/images/goods/book-01.svg'
  },
  {
    id: 'p2',
    title: '一个人的文学夜晚',
    desc: '适合在深夜安静阅读的文学经典，在故事里遇见另一种人生。',
    bookIds: [5, 6, 16, 19, 20],
    cover: 'assets/images/goods/book-05.svg'
  },
  {
    id: 'p3',
    title: '提升思维格局',
    desc: '历史、经济与认知科学的交叉读物，帮你建立更清晰的决策框架。',
    bookIds: [8, 11, 21, 22, 24],
    cover: 'assets/images/goods/book-08.svg'
  }
];

/**
 * 示例订单数据（用于订单详情与物流时间线演示）
 * status: pending(待付款) / shipped(已发货) / transporting(运输中) / delivered(已签收)
 */
const ORDERS = [
  {
    id: 9001,
    no: 'QY20260828001',
    items: [
      { bookId: 1, qty: 1, price: 129.0 },
      { bookId: 17, qty: 1, price: 89.0 }
    ],
    totalPrice: 218.0,
    couponDiscount: 30,
    status: 'delivered',
    createTime: '2026-08-28 10:24',
    address: '江西省南昌市红谷滩区南昌大学前湖校区 13 栋宿舍 402'
  },
  {
    id: 9002,
    no: 'QY20260905002',
    items: [
      { bookId: 5, qty: 1, price: 93.0 },
      { bookId: 6, qty: 2, price: 28.0 }
    ],
    totalPrice: 149.0,
    couponDiscount: 10,
    status: 'transporting',
    createTime: '2026-09-05 19:02',
    address: '江西省南昌市红谷滩区南昌大学前湖校区 13 栋宿舍 402'
  },
  {
    id: 9003,
    no: 'QY20260908003',
    items: [
      { bookId: 22, qty: 1, price: 88.0 }
    ],
    totalPrice: 88.0,
    couponDiscount: 0,
    status: 'shipped',
    createTime: '2026-09-08 21:47',
    address: '江西省南昌市红谷滩区南昌大学前湖校区 13 栋宿舍 402'
  },
  {
    id: 9004,
    no: 'QY20260909004',
    items: [
      { bookId: 24, qty: 1, price: 45.0 },
      { bookId: 23, qty: 1, price: 49.0 }
    ],
    totalPrice: 94.0,
    couponDiscount: 0,
    status: 'pending',
    createTime: '2026-09-09 09:15',
    address: '江西省南昌市红谷滩区南昌大学前湖校区 13 栋宿舍 402'
  }
];

/** 订单状态中文映射 */
const ORDER_STATUS_MAP = {
  pending: '待付款',
  shipped: '已发货',
  transporting: '运输中',
  delivered: '已签收'
};
