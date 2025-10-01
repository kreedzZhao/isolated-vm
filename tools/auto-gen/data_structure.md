
---

## 📐 核心数据结构

### 1. 类定义（Class Definition）

**文件名格式**: `{class_name_lowercase}.yaml`（例如: `location.yaml`）

```yaml
# ============================================================================
# 必需字段
# ============================================================================

className: String               # JavaScript 类名，必需，唯一标识符
                               # 示例: "Location", "Window", "Navigator"

kind: Enum                     # 模板类型，必需
                               # 可选值:
                               #   - FunctionTemplate  # 可构造的类
                               #   - ObjectTemplate    # 单例对象或接口

# ============================================================================
# 可选字段 - 继承与组合
# ============================================================================

extends: String | null         # 父类名，可选，默认 null（继承自 Object）
                               # 示例: "EventTarget"

mixins: Array<String>          # 混入接口列表，可选，默认 []
                               # 示例: ["ParentNode", "NonDocumentTypeChildNode"]

# ============================================================================
# 可选字段 - 构造函数
# ============================================================================

constructor:                   # 构造函数配置，可选
  callback: String             # C++ 回调函数名
                               # 示例: "LocationConstructor"
  
  throw: String                # 或者抛出异常（二选一）
                               # 示例: "Illegal constructor"
  
  parameters: Array<Parameter> # 构造函数参数，可选
    - name: String             # 参数名
      type: ValueType          # 参数类型
      optional: Boolean        # 是否可选，默认 false
      default: Any             # 默认值（仅当 optional=true）

# ============================================================================
# 可选字段 - 内部配置
# ============================================================================

internal:                      # 内部字段配置，可选
  fieldCount: Integer          # V8 内部字段数量，默认 0
                               # 通常设为 1 用于存储 C++ 实例指针
  
  toStringTag: String          # Symbol.toStringTag 的值，可选
                               # 示例: "Location"
  
  className: String            # FunctionTemplate.SetClassName，可选
                               # 默认使用 className 字段的值

# ============================================================================
# 可选字段 - 属性定义
# ============================================================================

instanceProperties: Array<Property>  # 实例属性（挂载到 InstanceTemplate）
prototypeProperties: Array<Property> # 原型属性（挂载到 PrototypeTemplate）
prototypeMethods: Array<Method>      # 原型方法（挂载到 PrototypeTemplate）
staticProperties: Array<Property>    # 静态属性（挂载到 FunctionTemplate）
staticMethods: Array<Method>         # 静态方法（挂载到 FunctionTemplate）

# ============================================================================
# 可选字段 - 索引/命名属性拦截器（高级特性）
# ============================================================================

indexedPropertyHandler:        # 索引属性拦截器，用于类数组对象
  getter: String               # 回调名: (index: number) => any
  setter: String               # 回调名: (index: number, value: any) => void
  query: String                # 回调名: (index: number) => PropertyDescriptor
  deleter: String              # 回调名: (index: number) => boolean
  enumerator: String           # 回调名: () => number[]

namedPropertyHandler:          # 命名属性拦截器
  getter: String               # 回调名: (name: string) => any
  setter: String
  query: String
  deleter: String
  enumerator: String           # 回调名: () => string[]

# ============================================================================
# 可选字段 - 特殊配置
# ============================================================================

options:                       # 构建选项，可选
  freezePrototype: Boolean     # 是否冻结原型，默认 true
  freezeInstance: Boolean      # 是否冻结实例，默认 false
  enabled: Boolean             # 是否启用该类，默认 true
  condition: String            # 条件编译标志，可选
                               # 示例: "ENABLE_DOM_LEVEL_3"

# ============================================================================
# 可选字段 - 元信息
# ============================================================================

description: String            # 类的描述说明，可选
spec: String                   # 规范链接，可选
                               # 示例: "https://html.spec.whatwg.org/..."
webidl: Array<String>          # WebIDL 特性标记，可选
                               # 示例: ["Global", "Exposed=Window"]
```

---

### 2. 属性定义（Property Definition）

用于 `instanceProperties`, `prototypeProperties`, `staticProperties`

```yaml
# ============================================================================
# 必需字段
# ============================================================================

name: String                   # 属性名，必需
                               # 示例: "href", "location", "length"

kind: Enum                     # 属性类型，必需
                               # 可选值:
                               #   - Data          # 数据属性（常量值）
                               #   - Accessor      # 访问器属性（getter/setter）
                               #   - Constant      # 只读常量
                               #   - LazyAccessor  # 延迟初始化访问器

# ============================================================================
# 可选字段 - 属性描述符
# ============================================================================

descriptor:                    # ECMAScript 属性描述符，可选
  writable: Boolean            # 可写，默认 true
  enumerable: Boolean          # 可枚举，默认 true
  configurable: Boolean        # 可配置，默认 true

# ============================================================================
# kind=Data 或 kind=Constant 时的字段
# ============================================================================

value:                         # 常量值，必需（当 kind=Data|Constant）
  type: ValueType              # 值类型，必需
  data: Any                    # 值数据，必需
                               # 示例:
                               #   {type: Number, data: 100}
                               #   {type: String, data: "hello"}
                               #   {type: Boolean, data: true}
                               #   {type: Null, data: null}

# ============================================================================
# kind=Accessor 或 kind=LazyAccessor 时的字段
# ============================================================================

getter:                        # Getter 配置，必需（当 kind=Accessor|LazyAccessor）
  callback: String             # C++ 回调函数名，必需
                               # 示例: "LocationHrefGetter"
  
  returnType: ValueType        # 返回值类型，可选
  returnTypeName: String       # 返回对象的类名（当 returnType=Object）
                               # 示例: returnType=Object, returnTypeName="Location"

setter:                        # Setter 配置，可选（省略表示只读）
  callback: String             # C++ 回调函数名
                               # 示例: "LocationHrefSetter"

# 或者简化语法（只指定回调名）
getter: String                 # 简写形式，等价于 getter.callback
setter: String                 # 简写形式，等价于 setter.callback

# ============================================================================
# 可选字段 - 特殊属性
# ============================================================================

isSymbol: Boolean              # 是否是 Symbol 属性，默认 false
symbolName: String             # Symbol 名称（当 isSymbol=true）
                               # 示例: "toStringTag", "iterator"

webidl: String | Array<String> # WebIDL 特性标记，可选
                               # 示例: "[Unforgeable]", "[SameObject]"

description: String            # 属性描述，可选
enabled: Boolean               # 是否启用，默认 true
condition: String              # 条件编译标志，可选
```

---

### 3. 方法定义（Method Definition）

用于 `prototypeMethods`, `staticMethods`

```yaml
# ============================================================================
# 必需字段
# ============================================================================

name: String                   # 方法名，必需
                               # 示例: "reload", "toString", "addEventListener"

callback: String               # C++ 回调函数名，必需
                               # 示例: "LocationReload"

# ============================================================================
# 可选字段 - 方法签名
# ============================================================================

parameters: Array<Parameter>   # 参数列表，可选，默认 []
  - name: String               # 参数名，必需
    type: ValueType            # 参数类型，必需
    optional: Boolean          # 是否可选，默认 false
    default: Any               # 默认值（当 optional=true）
    variadic: Boolean          # 是否为可变参数（...args），默认 false
    
returnType: ValueType          # 返回值类型，可选，默认 Undefined
returnTypeName: String         # 返回对象的类名（当 returnType=Object）

length: Integer                # Function.length 属性值，可选
                               # 默认为必需参数的数量

# ============================================================================
# 可选字段 - 属性描述符
# ============================================================================

descriptor:                    # 方法的属性描述符，可选
  writable: Boolean            # 默认 true
  enumerable: Boolean          # 默认 true
  configurable: Boolean        # 默认 true

# ============================================================================
# 可选字段 - 元信息
# ============================================================================

webidl: String | Array<String> # WebIDL 特性标记
description: String            # 方法描述
enabled: Boolean               # 是否启用，默认 true
condition: String              # 条件编译标志
```

---

### 4. 值类型（ValueType）枚举

```yaml
# 基本类型
ValueType:
  - Undefined
  - Null
  - Boolean
  - Number
  - String
  - Symbol
  - BigInt
  
  # 对象类型
  - Object        # 通用对象
  - Array         # 数组
  - Function      # 函数
  - Promise       # Promise
  
  # 特殊
  - Any           # 任意类型
```

---

### 5. 环境配置（Environment Configuration）

**文件**: `browser_environment.yaml`

```yaml
# ============================================================================
# 版本信息
# ============================================================================

version: String                # 元数据格式版本，必需
                               # 示例: "1.0"

spec: String                   # 规范名称，可选
                               # 示例: "HTML Living Standard"

# ============================================================================
# 全局对象配置
# ============================================================================

global:                        # 全局对象配置，必需
  baseClass: String            # 全局对象的基类，必需
                               # 通常为 "Window"
  
  # 全局单例对象（自动创建并挂载到 global）
  singletons: Array<Singleton>
    - propertyName: String     # 全局属性名，必需
      className: String        # 实例的类名，必需
      lazy: Boolean            # 是否延迟创建，默认 false
      condition: String        # 条件编译标志，可选
      descriptor:              # 属性描述符，可选
        writable: Boolean
        enumerable: Boolean
        configurable: Boolean
  
  # 全局构造函数（暴露类构造器）
  constructors: Array<String>  # 类名列表
                               # 示例: ["Location", "URL", "Headers"]
  
  # 全局常量
  constants: Array<Property>   # 使用 Property 定义格式
  
  # 自定义全局属性
  customProperties: Array<Property>

# ============================================================================
# 类定义清单
# ============================================================================

classes: Array<ClassSource>    # 类定义文件列表，必需
  - source: String             # YAML 文件路径（相对于 metadata 目录）
                               # 示例: "dom/location.yaml"
    condition: String          # 条件编译标志，可选
    enabled: Boolean           # 是否启用，默认 true

# ============================================================================
# 模块配置
# ============================================================================

modules: Map<String, Module>   # 功能模块分组，可选
  ModuleName:
    enabled: Boolean           # 是否启用该模块，默认 true
    classes: Array<String>     # 模块包含的类名列表
    description: String        # 模块描述，可选

# ============================================================================
# 构建选项
# ============================================================================

options:                       # 全局构建选项，可选
  strictMode: Boolean          # 严格模式，默认 true
  freezeAllPrototypes: Boolean # 冻结所有原型，默认 true
  debug: Boolean               # 调试模式，默认 false
  
  compatibility:               # 兼容性配置
    allowNonStandard: Boolean  # 允许非标准属性，默认 false
    emulateQuirks: Boolean     # 模拟浏览器怪癖，默认 false
```

---

## 📖 完整示例

### 示例 1: Location 类定义

```yaml
# dom/location.yaml
className: Location
kind: FunctionTemplate
description: "表示文档的 URL"
spec: "https://html.spec.whatwg.org/multipage/nav-history-apis.html#location"

extends: null
mixins: []

constructor:
  throw: "Illegal constructor"

internal:
  fieldCount: 1
  toStringTag: Location

instanceProperties:
  - name: href
    kind: Accessor
    descriptor: {writable: true, enumerable: true, configurable: true}
    getter:
      callback: LocationHrefGetter
      returnType: String
    setter:
      callback: LocationHrefSetter
    webidl: "[Unforgeable]"
    description: "完整的 URL 字符串"
  
  - name: origin
    kind: Accessor
    descriptor: {writable: false, enumerable: true, configurable: true}
    getter:
      callback: LocationOriginGetter
      returnType: String
    webidl: "[Unforgeable]"
    description: "URL 的源（只读）"

prototypeMethods:
  - name: reload
    callback: LocationReload
    parameters:
      - name: forcedReload
        type: Boolean
        optional: true
        default: false
    returnType: Undefined
    length: 0
    description: "重新加载当前文档"
  
  - name: assign
    callback: LocationAssign
    parameters:
      - name: url
        type: String
    returnType: Undefined
    length: 1
  
  - name: toString
    callback: LocationToString
    returnType: String
    length: 0

options:
  freezePrototype: true
  freezeInstance: false
```

---

### 示例 2: Window 全局对象

```yaml
# dom/window.yaml
className: Window
kind: FunctionTemplate
description: "全局 Window 对象"
spec: "https://html.spec.whatwg.org/multipage/window-object.html"

extends: EventTarget
webidl: ["Global=Window", "Exposed=Window"]

constructor:
  throw: "Illegal constructor"

internal:
  fieldCount: 1
  toStringTag: Window

instanceProperties:
  # 自引用
  - name: window
    kind: Accessor
    descriptor: {writable: false, enumerable: true, configurable: false}
    getter: WindowSelfGetter
    webidl: "[Replaceable]"
  
  - name: self
    kind: Accessor
    getter: WindowSelfGetter
    webidl: "[Replaceable]"
  
  # 单例对象（延迟创建）
  - name: location
    kind: LazyAccessor
    descriptor: {writable: false, enumerable: true, configurable: false}
    getter:
      callback: WindowLocationGetter
      returnType: Object
      returnTypeName: Location
    setter: WindowLocationSetter
    webidl: "[Unforgeable]"
  
  # 自定义属性
  - name: kreedz
    kind: Data
    value: {type: Number, data: 100}
    descriptor: {writable: true, enumerable: false, configurable: true}

prototypeMethods:
  - name: alert
    callback: WindowAlert
    parameters:
      - name: message
        type: String
        optional: true
        default: ""
    length: 0
  
  - name: setTimeout
    callback: WindowSetTimeout
    parameters:
      - name: handler
        type: Function
      - name: timeout
        type: Number
        optional: true
        default: 0
      - name: arguments
        type: Any
        variadic: true
    returnType: Number
    length: 1
```

---

### 示例 3: 环境配置

```yaml
# browser_environment.yaml
version: "1.0"
spec: "HTML Living Standard"

global:
  baseClass: Window
  
  singletons:
    - propertyName: location
      className: Location
      lazy: true
      descriptor: {writable: false, enumerable: true, configurable: false}
    
    - propertyName: navigator
      className: Navigator
      lazy: true
    
    - propertyName: document
      className: Document
      lazy: true
      condition: ENABLE_DOM
  
  constructors:
    - Location
    - URL
    - URLSearchParams
  
  customProperties:
    - name: kreedz
      kind: Data
      value: {type: Number, data: 100}
      descriptor: {enumerable: false}

classes:
  - source: common/event_target.yaml
  - source: dom/window.yaml
  - source: dom/location.yaml
  - source: dom/navigator.yaml
  - source: dom/document.yaml
    condition: ENABLE_DOM

modules:
  DOM:
    enabled: true
    classes: [Document, Element, Node]
    description: "核心 DOM API"
  
  Fetch:
    enabled: true
    classes: [Headers, Request, Response]
    description: "Fetch API"

options:
  strictMode: true
  freezeAllPrototypes: true
  debug: false
  compatibility:
    allowNonStandard: true
```

---

## 📝 YAML 语法技巧

### 锚点和别名（避免重复）

```yaml
# common/descriptors.yaml
descriptors:
  readwrite: &readwrite
    writable: true
    enumerable: true
    configurable: true
  
  readonly: &readonly
    writable: false
    enumerable: true
    configurable: true
  
  hidden: &hidden
    writable: true
    enumerable: false
    configurable: true

---
# 在其他文件中引用
instanceProperties:
  - name: href
    descriptor: *readwrite  # 引用锚点
    # ...
```

### 简化语法

```yaml
# 完整语法
getter:
  callback: LocationHrefGetter
  returnType: String

# 简化语法（当只需指定 callback 时）
getter: LocationHrefGetter

# 内联对象
descriptor: {writable: true, enumerable: true, configurable: true}

# 方法列表简化
prototypeMethods:
  - {name: reload, callback: LocationReload, length: 0}
  - {name: assign, callback: LocationAssign, length: 1}
```

---

## ✅ 验证规则

1. **必需字段验证**
   - `className` 必须存在且唯一
   - `kind` 必须是有效枚举值
   - 每个属性/方法必须有 `name` 和对应的回调

2. **类型约束**
   - `kind=Data` 必须有 `value` 字段
   - `kind=Accessor` 必须有 `getter` 字段
   - `parameters[].type` 必须是有效的 `ValueType`

3. **引用完整性**
   - `extends` 引用的父类必须存在
   - `mixins` 中的接口必须已定义
   - `returnTypeName` 引用的类必须存在

4. **逻辑一致性**
   - `optional=true` 的参数必须在必需参数之后
   - `variadic=true` 的参数必须是最后一个
   - `descriptor.writable=false` 的访问器不应有 setter

---

## 🔧 使用建议

1. **文件组织**: 按功能模块分目录存放 YAML 文件
2. **命名规范**: 文件名使用小写+下划线，类名使用 PascalCase
3. **注释**: 使用 `#` 添加注释说明复杂逻辑
4. **版本控制**: YAML 文件纳入 Git，便于追踪变更
5. **自动化**: 使用脚本验证 YAML 格式正确性

---

**规范版本**: 1.0  
**最后更新**: 2025-09-30