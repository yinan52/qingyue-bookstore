/* ==========================================================================
   dom.js —— DOM 操作封装文件
   说明：统一封装 DOM 选择、元素创建、事件委托等通用逻辑，
   减少重复代码，提高可维护性。所有页面均可调用。
   ========================================================================== */

/**
 * 简化版 DOM 选择函数
 * @param {string} selector - CSS 选择器
 * @param {Element} [scope=document] - 查询范围
 * @returns {Element|null} 匹配的第一个元素
 */
function getElement(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * 批量获取 DOM 元素
 * @param {string} selector - CSS 选择器
 * @param {Element} [scope=document] - 查询范围
 * @returns {NodeList} 匹配的元素集合
 */
function getElements(selector, scope = document) {
  return scope.querySelectorAll(selector);
}

/**
 * 动态创建 DOM 元素并设置属性 / 文本 / 子元素
 * @param {string} tag - 标签名
 * @param {Object} [props] - 配置项 { attrs: {}, text: '', html: '', class: '', children: [] }
 * @returns {Element} 创建好的元素
 */
function createElement(tag, props = {}) {
  const el = document.createElement(tag);
  if (props.id) el.id = props.id;
  if (props.class) el.className = props.class;
  if (props.attrs) {
    for (const [key, value] of Object.entries(props.attrs)) {
      el.setAttribute(key, value);
    }
  }
  if (props.text !== undefined) el.textContent = props.text;
  if (props.html !== undefined) el.innerHTML = props.html;
  if (props.children) {
    props.children.forEach((child) => {
      el.appendChild(child instanceof Element ? child : createElement('span', { text: child }));
    });
  }
  return el;
}

/**
 * 事件委托：为父元素下所有匹配子元素批量绑定事件
 * @param {Element} parent - 父容器元素
 * @param {string} childSelector - 子元素选择器
 * @param {string} event - 事件类型（如 'click'）
 * @param {Function} callback - 回调函数（接收 event 与触发元素）
 */
function delegateEvent(parent, childSelector, event, callback) {
  if (!parent) return;
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(childSelector);
    if (target && parent.contains(target)) {
      callback(e, target);
    }
  });
}

/**
 * 批量创建列表项（性能优化：使用 DocumentFragment 减少重排）
 * @param {Array} list - 数据数组
 * @param {Function} renderItem - 单项渲染函数，返回 DOM 元素
 * @param {Element} container - 挂载容器
 */
function renderList(list, renderItem, container) {
  const fragment = document.createDocumentFragment();
  list.forEach((item) => {
    fragment.appendChild(renderItem(item));
  });
  container.appendChild(fragment);
}
