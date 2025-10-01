/**
 * 浏览器 Console YAML 生成器
 * 用于自动生成符合 data_structure.md 规范的 YAML 配置
 * 
 * 使用方法:
 *   1. 在浏览器 console 中粘贴此脚本并运行
 *   2. 调用: generateYAML(Location) 或 generateYAML(window, 'Window')
 *   3. 复制输出的 YAML 文本
 */

(function() {
  'use strict';

  // ============================================================================
  // 工具函数
  // ============================================================================

  /**
   * 获取对象的所有属性描述符（包括原型链）
   */
  function getAllPropertyDescriptors(obj) {
    const descriptors = {};
    let current = obj;
    
    while (current && current !== Object.prototype) {
      const ownDescriptors = Object.getOwnPropertyDescriptors(current);
      for (const [name, descriptor] of Object.entries(ownDescriptors)) {
        if (!descriptors[name]) {
          descriptors[name] = { ...descriptor, _owner: current };
        }
      }
      current = Object.getPrototypeOf(current);
    }
    
    return descriptors;
  }

  /**
   * 判断值的类型
   */
  function getValueType(value) {
    if (value === null) return 'Null';
    if (value === undefined) return 'Undefined';
    
    const type = typeof value;
    if (type === 'boolean') return 'Boolean';
    if (type === 'number') return 'Number';
    if (type === 'string') return 'String';
    if (type === 'symbol') return 'Symbol';
    if (type === 'bigint') return 'BigInt';
    if (type === 'function') return 'Function';
    if (Array.isArray(value)) return 'Array';
    if (value instanceof Promise) return 'Promise';
    
    return 'Object';
  }

  /**
   * 格式化值用于 YAML 输出
   */
  function formatValue(value) {
    const type = getValueType(value);
    
    if (type === 'String') return `"${value.replace(/"/g, '\\"')}"`;
    if (type === 'Number' || type === 'Boolean') return String(value);
    if (type === 'Null') return 'null';
    if (type === 'Undefined') return 'undefined';
    
    return `"${String(value)}"`;
  }

  /**
   * 判断属性是否应该被忽略
   */
  function shouldIgnoreProperty(name, descriptor, target) {
    // 忽略 constructor
    if (name === 'constructor') return true;
    
    // 忽略内置 Symbol 属性（可选）
    if (typeof name === 'symbol') {
      // 可以选择性地包含某些 Symbol，比如 Symbol.toStringTag
      const symbolName = name.toString();
      if (!symbolName.includes('toStringTag') && !symbolName.includes('iterator')) {
        return true;
      }
    }
    
    // 忽略某些通用属性
    const ignoreList = ['__proto__', '__defineGetter__', '__defineSetter__', 
                        '__lookupGetter__', '__lookupSetter__', 'hasOwnProperty',
                        'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString',
                        'valueOf'];
    
    if (ignoreList.includes(name)) return true;
    
    return false;
  }

  /**
   * 生成属性描述符的 YAML
   */
  function formatDescriptor(descriptor, indent = '    ') {
    const { writable, enumerable, configurable } = descriptor;
    return `${indent}descriptor: {writable: ${writable !== false}, enumerable: ${enumerable !== false}, configurable: ${configurable !== false}}`;
  }

  /**
   * 判断属性是否为访问器
   */
  function isAccessor(descriptor) {
    return descriptor.get !== undefined || descriptor.set !== undefined;
  }

  /**
   * 生成 C++ 回调函数名
   */
  function generateCallbackName(className, propertyName, type = 'Getter') {
    const capitalizedProp = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
    return `${className}${capitalizedProp}${type}`;
  }

  // ============================================================================
  // YAML 生成器
  // ============================================================================

  /**
   * 分析类或对象并生成 YAML
   * @param {Function|Object} target - 要分析的类（构造函数）或对象实例
   * @param {string} className - 类名（如果传入的是对象实例，需要指定）
   * @param {Object} options - 配置选项
   */
  function generateYAML(target, className = null, options = {}) {
    const config = {
      includeInherited: options.includeInherited !== false,
      includeNonEnumerable: options.includeNonEnumerable !== false,
      generateCallbacks: options.generateCallbacks !== false,
      ...options
    };

    // 确定类名
    if (!className) {
      if (typeof target === 'function') {
        className = target.name || 'UnknownClass';
      } else if (target.constructor) {
        className = target.constructor.name || 'UnknownClass';
      } else {
        className = 'UnknownClass';
      }
    }

    // 确定是类还是实例
    const isClass = typeof target === 'function';
    const constructor = isClass ? target : target.constructor;
    const prototype = isClass ? target.prototype : Object.getPrototypeOf(target);
    const instance = isClass ? null : target;

    const yaml = [];
    
    // ========== 头部 ==========
    yaml.push('# ============================================================================');
    yaml.push(`# ${className} Class Definition`);
    yaml.push('# 自动生成于: ' + new Date().toISOString());
    yaml.push('# ============================================================================');
    yaml.push('');
    yaml.push(`className: ${className}`);
    yaml.push(`kind: FunctionTemplate`);
    yaml.push(`description: "TODO: 添加类描述"`);
    yaml.push(`spec: "TODO: 添加规范链接"`);
    yaml.push('');

    // ========== 继承 ==========
    const parentClass = prototype && Object.getPrototypeOf(prototype);
    if (parentClass && parentClass.constructor && parentClass.constructor.name && 
        parentClass.constructor.name !== 'Object') {
      yaml.push(`extends: ${parentClass.constructor.name}`);
    } else {
      yaml.push(`extends: null`);
    }
    yaml.push(`mixins: []`);
    yaml.push('');

    // ========== 构造函数 ==========
    yaml.push(`constructor:`);
    if (isClass) {
      try {
        new constructor();
        yaml.push(`  callback: ${className}Constructor`);
        yaml.push(`  parameters: []`);
      } catch (e) {
        if (e.message.includes('Illegal') || e.message.includes('constructor')) {
          yaml.push(`  throw: "Illegal constructor"`);
        } else {
          yaml.push(`  # 构造函数抛出错误: ${e.message}`);
          yaml.push(`  throw: "Illegal constructor"`);
        }
      }
    } else {
      yaml.push(`  throw: "Illegal constructor"`);
    }
    yaml.push('');

    // ========== 内部配置 ==========
    yaml.push(`internal:`);
    yaml.push(`  fieldCount: 1`);
    
    // 尝试获取 Symbol.toStringTag
    try {
      const toStringTag = prototype?.[Symbol.toStringTag] || 
                          instance?.[Symbol.toStringTag];
      if (toStringTag && typeof toStringTag === 'string') {
        yaml.push(`  toStringTag: ${toStringTag}`);
      } else {
        yaml.push(`  toStringTag: ${className}`);
      }
    } catch (e) {
      yaml.push(`  toStringTag: ${className}`);
    }
    yaml.push('');

    // ========== 收集属性和方法 ==========
    const instanceProperties = [];
    const prototypeProperties = [];
    const prototypeMethods = [];
    const staticProperties = [];
    const staticMethods = [];

    // 分析原型属性和方法
    if (prototype) {
      const protoDescriptors = Object.getOwnPropertyDescriptors(prototype);
      
      for (const [name, descriptor] of Object.entries(protoDescriptors)) {
        if (shouldIgnoreProperty(name, descriptor, prototype)) continue;
        
        if (typeof descriptor.value === 'function') {
          // 原型方法
          prototypeMethods.push({
            name,
            descriptor,
            length: descriptor.value.length
          });
        } else if (isAccessor(descriptor)) {
          // 原型访问器属性
          prototypeProperties.push({
            name,
            descriptor,
            isAccessor: true
          });
        } else {
          // 原型数据属性
          prototypeProperties.push({
            name,
            descriptor,
            isAccessor: false,
            value: descriptor.value
          });
        }
      }
    }

    // 分析实例属性（如果有实例）
    if (instance) {
      const instanceDescriptors = Object.getOwnPropertyDescriptors(instance);
      
      for (const [name, descriptor] of Object.entries(instanceDescriptors)) {
        if (shouldIgnoreProperty(name, descriptor, instance)) continue;
        
        if (isAccessor(descriptor)) {
          instanceProperties.push({
            name,
            descriptor,
            isAccessor: true
          });
        } else {
          instanceProperties.push({
            name,
            descriptor,
            isAccessor: false,
            value: descriptor.value
          });
        }
      }
    }

    // 分析静态属性和方法
    if (isClass) {
      const staticDescriptors = Object.getOwnPropertyDescriptors(constructor);
      
      for (const [name, descriptor] of Object.entries(staticDescriptors)) {
        if (shouldIgnoreProperty(name, descriptor, constructor)) continue;
        
        // 忽略一些内置属性
        if (['length', 'name', 'prototype', 'arguments', 'caller'].includes(name)) {
          continue;
        }
        
        if (typeof descriptor.value === 'function') {
          staticMethods.push({
            name,
            descriptor,
            length: descriptor.value.length
          });
        } else if (isAccessor(descriptor)) {
          staticProperties.push({
            name,
            descriptor,
            isAccessor: true
          });
        } else {
          staticProperties.push({
            name,
            descriptor,
            isAccessor: false,
            value: descriptor.value
          });
        }
      }
    }

    // ========== 生成实例属性 YAML ==========
    if (instanceProperties.length > 0) {
      yaml.push(`instanceProperties:`);
      
      for (const prop of instanceProperties) {
        yaml.push(`  - name: ${prop.name}`);
        
        if (prop.isAccessor) {
          // 访问器属性 - 只有 getter/setter，没有 value
          yaml.push(`    kind: Accessor`);
          yaml.push(formatDescriptor(prop.descriptor, '    '));
          yaml.push(`    getter:`);
          yaml.push(`      callback: ${generateCallbackName(className, prop.name, 'Getter')}`);
          yaml.push(`      returnType: Any  # TODO: 指定正确的返回类型`);
          
          if (prop.descriptor.set) {
            yaml.push(`    setter:`);
            yaml.push(`      callback: ${generateCallbackName(className, prop.name, 'Setter')}`);
          }
        } else {
          // 数据属性 - 只有 value，没有 getter/setter
          yaml.push(`    kind: Data`);
          yaml.push(formatDescriptor(prop.descriptor, '    '));
          const valueType = getValueType(prop.value);
          yaml.push(`    value:`);
          yaml.push(`      type: ${valueType}`);
          yaml.push(`      data: ${formatValue(prop.value)}`);
        }
        
        yaml.push(`    description: "TODO: 添加属性描述"`);
        yaml.push(``);
      }
    }

    // ========== 生成原型属性 YAML ==========
    if (prototypeProperties.length > 0) {
      yaml.push(`prototypeProperties:`);
      
      for (const prop of prototypeProperties) {
        yaml.push(`  - name: ${prop.name}`);
        
        if (prop.isAccessor) {
          // 访问器属性 - 只有 getter/setter，没有 value
          yaml.push(`    kind: Accessor`);
          yaml.push(formatDescriptor(prop.descriptor, '    '));
          yaml.push(`    getter:`);
          yaml.push(`      callback: ${generateCallbackName(className, prop.name, 'Getter')}`);
          yaml.push(`      returnType: Any  # TODO: 指定正确的返回类型`);
          
          if (prop.descriptor.set) {
            yaml.push(`    setter:`);
            yaml.push(`      callback: ${generateCallbackName(className, prop.name, 'Setter')}`);
          }
        } else {
          // 数据属性 - 只有 value，没有 getter/setter
          yaml.push(`    kind: Data`);
          yaml.push(formatDescriptor(prop.descriptor, '    '));
          const valueType = getValueType(prop.value);
          yaml.push(`    value:`);
          yaml.push(`      type: ${valueType}`);
          yaml.push(`      data: ${formatValue(prop.value)}`);
        }
        
        yaml.push(`    description: "TODO: 添加属性描述"`);
        yaml.push(``);
      }
    }

    // ========== 生成原型方法 YAML ==========
    if (prototypeMethods.length > 0) {
      yaml.push(`prototypeMethods:`);
      
      for (const method of prototypeMethods) {
        yaml.push(`  - name: ${method.name}`);
        yaml.push(`    callback: ${generateCallbackName(className, method.name, '')}`);
        
        if (method.length > 0) {
          yaml.push(`    parameters:`);
          for (let i = 0; i < method.length; i++) {
            yaml.push(`      - name: arg${i}`);
            yaml.push(`        type: Any  # TODO: 指定正确的参数类型`);
          }
        } else {
          yaml.push(`    parameters: []`);
        }
        
        yaml.push(`    returnType: Any  # TODO: 指定正确的返回类型`);
        yaml.push(`    length: ${method.length}`);
        yaml.push(formatDescriptor(method.descriptor, '    '));
        yaml.push(`    description: "TODO: 添加方法描述"`);
        yaml.push(``);
      }
    }

    // ========== 生成静态属性 YAML ==========
    if (staticProperties.length > 0) {
      yaml.push(`staticProperties:`);
      
      for (const prop of staticProperties) {
        yaml.push(`  - name: ${prop.name}`);
        
        if (prop.isAccessor) {
          // 访问器属性 - 只有 getter/setter，没有 value
          yaml.push(`    kind: Accessor`);
          yaml.push(formatDescriptor(prop.descriptor, '    '));
          yaml.push(`    getter:`);
          yaml.push(`      callback: ${className}${prop.name}Getter`);
          yaml.push(`      returnType: Any  # TODO: 指定正确的返回类型`);
          
          if (prop.descriptor.set) {
            yaml.push(`    setter:`);
            yaml.push(`      callback: ${className}${prop.name}Setter`);
          }
        } else {
          // 数据属性 - 只有 value，没有 getter/setter
          yaml.push(`    kind: Data`);
          yaml.push(formatDescriptor(prop.descriptor, '    '));
          const valueType = getValueType(prop.value);
          yaml.push(`    value:`);
          yaml.push(`      type: ${valueType}`);
          yaml.push(`      data: ${formatValue(prop.value)}`);
        }
        
        yaml.push(`    description: "TODO: 添加属性描述"`);
        yaml.push(``);
      }
    }

    // ========== 生成静态方法 YAML ==========
    if (staticMethods.length > 0) {
      yaml.push(`staticMethods:`);
      
      for (const method of staticMethods) {
        yaml.push(`  - name: ${method.name}`);
        yaml.push(`    callback: ${className}${method.name}`);
        
        if (method.length > 0) {
          yaml.push(`    parameters:`);
          for (let i = 0; i < method.length; i++) {
            yaml.push(`      - name: arg${i}`);
            yaml.push(`        type: Any  # TODO: 指定正确的参数类型`);
          }
        } else {
          yaml.push(`    parameters: []`);
        }
        
        yaml.push(`    returnType: Any  # TODO: 指定正确的返回类型`);
        yaml.push(`    length: ${method.length}`);
        yaml.push(formatDescriptor(method.descriptor, '    '));
        yaml.push(`    description: "TODO: 添加方法描述"`);
        yaml.push(``);
      }
    }

    // ========== 尾部配置 ==========
    yaml.push(`options:`);
    yaml.push(`  freezePrototype: true`);
    yaml.push(`  freezeInstance: false`);
    yaml.push(`  enabled: true`);

    const yamlText = yaml.join('\n');
    console.log(yamlText);
    console.log('\n');
    console.log('========================================');
    console.log('✅ YAML 生成完成！');
    console.log(`📊 统计:`);
    console.log(`   - 实例属性: ${instanceProperties.length}`);
    console.log(`   - 原型属性: ${prototypeProperties.length}`);
    console.log(`   - 原型方法: ${prototypeMethods.length}`);
    console.log(`   - 静态属性: ${staticProperties.length}`);
    console.log(`   - 静态方法: ${staticMethods.length}`);
    console.log('========================================');
    
    return yamlText;
  }

  /**
   * 快速生成多个类的 YAML
   */
  function generateMultipleYAML(targets, options = {}) {
    const results = [];
    
    for (const target of targets) {
      const className = typeof target === 'function' ? target.name : 
                        (typeof target === 'string' ? target : null);
      
      console.log(`\n\n${'='.repeat(80)}`);
      console.log(`正在生成: ${className || 'Unknown'}`);
      console.log('='.repeat(80));
      
      try {
        const yaml = generateYAML(
          typeof target === 'string' ? window[target] : target,
          className,
          options
        );
        results.push({ className, yaml, success: true });
      } catch (e) {
        console.error(`❌ 生成失败: ${className}`, e);
        results.push({ className, error: e.message, success: false });
      }
    }
    
    return results;
  }

  /**
   * 导出下载 YAML 文件
   */
  function downloadYAML(yamlText, filename = 'class_definition.yaml') {
    const blob = new Blob([yamlText], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`✅ 已下载: ${filename}`);
  }

  // ============================================================================
  // 导出到全局
  // ============================================================================

  window.generateYAML = generateYAML;
  window.generateMultipleYAML = generateMultipleYAML;
  window.downloadYAML = downloadYAML;

  console.log('✅ YAML 生成器已加载！');
  console.log('');
  console.log('📖 使用方法:');
  console.log('  1. 单个类: generateYAML(Location)');
  console.log('  2. 实例:   generateYAML(window, "Window")');
  console.log('  3. 批量:   generateMultipleYAML([Location, URL, Headers])');
  console.log('  4. 下载:   downloadYAML(generateYAML(Location), "location.yaml")');
  console.log('');
  console.log('💡 示例:');
  console.log('  generateYAML(Location);');
  console.log('  generateYAML(window.location, "Location");');
  console.log('  generateYAML(URL);');
  console.log('  generateMultipleYAML(["Location", "URL", "Navigator"]);');
  console.log('');

})();


