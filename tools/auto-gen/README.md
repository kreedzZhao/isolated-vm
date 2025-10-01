# Browser API YAML Generator

自动从浏览器 API 生成符合 `data_structure.md` 规范的 YAML 配置文件。

## 🚀 快速开始

### 1. 加载脚本

在浏览器 Console 中执行以下任一方法：

**方法一：直接复制粘贴**
```javascript
// 复制 yaml-generator.js 的全部内容并粘贴到 console
```

**方法二：通过 URL 加载**
```javascript
fetch('https://your-server.com/yaml-generator.js')
  .then(r => r.text())
  .then(eval);
```

**方法三：书签方式**
```javascript
javascript:(function(){fetch('https://your-server.com/yaml-generator.js').then(r=>r.text()).then(eval);})();
```

### 2. 使用示例

#### 示例 1: 生成 Location 类的 YAML
```javascript
generateYAML(Location);
```

#### 示例 2: 生成 Window 对象的 YAML
```javascript
generateYAML(window, 'Window');
```

#### 示例 3: 生成 URL 类的 YAML
```javascript
generateYAML(URL);
```

#### 示例 4: 批量生成多个类
```javascript
generateMultipleYAML([Location, URL, Headers, Response]);
```

#### 示例 5: 通过类名批量生成
```javascript
generateMultipleYAML(['Location', 'Navigator', 'Document']);
```

#### 示例 6: 生成并下载
```javascript
const yaml = generateYAML(Location);
downloadYAML(yaml, 'location.yaml');
```

## 📋 API 说明

### `generateYAML(target, className, options)`

生成单个类或对象的 YAML 配置。

**参数:**
- `target` (Function|Object): 要分析的类（构造函数）或对象实例
- `className` (String, 可选): 类名，如果传入对象实例需要指定
- `options` (Object, 可选): 配置选项
  - `includeInherited` (Boolean): 是否包含继承的属性，默认 `true`
  - `includeNonEnumerable` (Boolean): 是否包含不可枚举属性，默认 `true`
  - `generateCallbacks` (Boolean): 是否生成回调函数名，默认 `true`

**返回值:**
- (String): YAML 格式的配置文本

**示例:**
```javascript
// 基础用法
generateYAML(Location);

// 分析实例
generateYAML(window.location, 'Location');

// 自定义选项
generateYAML(Location, null, {
  includeNonEnumerable: false
});
```

### `generateMultipleYAML(targets, options)`

批量生成多个类的 YAML 配置。

**参数:**
- `targets` (Array): 类或类名数组
- `options` (Object, 可选): 同 `generateYAML`

**返回值:**
- (Array): 包含每个类的生成结果

**示例:**
```javascript
generateMultipleYAML([
  Location,
  URL,
  Headers
]);

// 或使用类名
generateMultipleYAML(['Location', 'URL', 'Headers']);
```

### `downloadYAML(yamlText, filename)`

下载 YAML 文本为文件。

**参数:**
- `yamlText` (String): YAML 文本内容
- `filename` (String, 可选): 文件名，默认 `'class_definition.yaml'`

**示例:**
```javascript
const yaml = generateYAML(Location);
downloadYAML(yaml, 'location.yaml');
```

## 🎯 实际使用场景

### 场景 1: 分析 DOM API

```javascript
// 生成常用 DOM 类
generateMultipleYAML([
  'Element',
  'Document',
  'HTMLElement',
  'Node'
]);
```

### 场景 2: 分析 Fetch API

```javascript
generateMultipleYAML([
  'Headers',
  'Request',
  'Response',
  'FormData'
]);
```

### 场景 3: 分析 URL 相关 API

```javascript
generateMultipleYAML([
  Location,
  URL,
  URLSearchParams
]);
```

### 场景 4: 分析 Storage API

```javascript
generateYAML(localStorage, 'Storage');
generateYAML(sessionStorage, 'Storage');
```

### 场景 5: 批量导出

```javascript
// 生成所有常用 API 并逐个下载
const apis = [
  { target: Location, filename: 'location.yaml' },
  { target: URL, filename: 'url.yaml' },
  { target: Headers, filename: 'headers.yaml' },
  { target: Navigator, filename: 'navigator.yaml' }
];

apis.forEach(({ target, filename }) => {
  const yaml = generateYAML(target);
  downloadYAML(yaml, filename);
});
```

## 🔧 高级用法

### 自定义属性过滤

如果需要自定义哪些属性应该被忽略，可以修改脚本中的 `shouldIgnoreProperty` 函数：

```javascript
function shouldIgnoreProperty(name, descriptor, target) {
  // 添加自定义逻辑
  if (name.startsWith('_internal')) return true;
  
  // ... 其他逻辑
}
```

### 批处理并保存结果

```javascript
// 批量生成并保存到对象
const results = {};
const apis = ['Location', 'URL', 'Navigator', 'Document'];

apis.forEach(name => {
  try {
    results[name] = generateYAML(window[name], name);
    console.log(`✅ ${name} 完成`);
  } catch (e) {
    console.error(`❌ ${name} 失败:`, e);
  }
});

// 查看所有结果
console.log(results);

// 逐个下载
Object.entries(results).forEach(([name, yaml]) => {
  downloadYAML(yaml, `${name.toLowerCase()}.yaml`);
});
```

## 📝 后续处理

生成的 YAML 文件包含大量 `TODO` 注释，需要手动完善：

1. **类型标注**: 将 `type: Any` 改为具体类型 (`String`, `Number`, `Object` 等)
2. **返回类型**: 为方法和访问器指定正确的 `returnType` 和 `returnTypeName`
3. **参数名**: 将 `arg0`, `arg1` 改为有意义的参数名
4. **描述信息**: 填写 `description` 字段
5. **规范链接**: 填写 `spec` 字段
6. **WebIDL 属性**: 添加 `webidl` 标记（如 `[Unforgeable]`, `[SameObject]` 等）
7. **默认值**: 为可选参数添加合适的 `default` 值

## 🐛 已知限制

1. **方法参数**: 只能检测参数数量（`length`），无法自动获取参数名和类型
2. **返回值类型**: 无法自动推断，需要手动指定
3. **Symbol 属性**: 部分 Symbol 属性可能被忽略
4. **Getter/Setter**: 无法区分是否有副作用或异步操作
5. **继承链**: 只显示直接父类，不展示完整继承链
6. **构造函数参数**: 无法自动分析构造函数的参数

## 💡 技巧

1. **先在小范围测试**: 先对一个简单的类测试，确保输出符合预期
2. **对比规范**: 生成后对照 WHATWG/W3C 规范进行校对
3. **使用 TypeScript 定义**: 如果有 TypeScript 类型定义，可以参考其类型信息
4. **分析真实实例**: 对于单例对象（如 `navigator`），直接分析实例更准确
5. **版本差异**: 不同浏览器的 API 实现可能有差异，建议在多个浏览器中测试

## 🌐 推荐测试环境

- **Chrome/Edge**: 最新版本，API 支持最全
- **Firefox**: 某些 API 实现可能不同
- **Safari**: 注意 WebKit 特有的 API

## 📚 相关资源

- [data_structure.md](./data_structure.md) - YAML 数据结构规范
- [MDN Web Docs](https://developer.mozilla.org/) - API 参考文档
- [WHATWG Specs](https://spec.whatwg.org/) - Web 标准规范
- [WebIDL](https://webidl.spec.whatwg.org/) - WebIDL 规范
