# Web安全攻防实战：SQL注入、XSS与反序列化漏洞

Web安全是渗透测试的重要组成部分。随着Web应用的普及，针对Web的攻击也越来越多。

本文将介绍SQL注入、XSS、反序列化等常见漏洞的原理和防御方法，帮助开发者写出更安全的代码。

## SQL注入：最经典的Web漏洞

SQL注入让攻击者能在数据库中执行任意SQL语句，是最经典的Web漏洞之一。

**漏洞原理**

当用户输入被直接拼接到SQL语句中时，攻击者可以通过精心构造的输入来改变SQL语句的语义。

```python
# 危险的代码
query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"

# 攻击者输入 username = ' OR '1'='1
# 实际执行的SQL: SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...'
# 这会返回所有用户
```

**防御方法**

最有效的是使用参数化查询：

```python
# 安全的代码
cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", 
               (username, password))
```

**SQL注入的类型**

1. Union注入：通过UNION SELECT查询其他表
2. 布尔盲注：根据页面返回判断查询结果
3. 时间盲注：根据响应时间差异判断
4. 报错注入：利用错误信息获取数据

**检测工具**

- SQLMap：自动化SQL注入检测
- Burp Suite：手动测试
- 目前大部分框架都内置了SQL注入防护

## XSS漏洞：跨站脚本攻击

XSS让攻击者的脚本在用户浏览器中执行，可以窃取Cookie、会话令牌等敏感信息。

**类型**

1. 反射型XSS：脚本通过URL参数注入
2. 存储型XSS：脚本存储在服务器上，影响所有访问者
3. DOM型XSS：在客户端JavaScript中产生

**防御方法**

输入过滤和输出编码：

```javascript
// 过滤用户输入
function sanitize(input) {
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 输出编码
element.textContent = userInput;
```

设置Content-Security-Policy：

```
Content-Security-Policy: default-src 'self'; script-src 'self'
```

HttpOnly标记防止Cookie被读取：

```javascript
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
```

**XSS的危害**

- 窃取用户Cookie和会话
- 伪装成用户执行操作
- 植入键盘记录器
- 进行钓鱼攻击

**防御建议**

1. 永远不要信任用户输入
2. 对输出进行编码
3. 使用CSP限制脚本来源
4. 敏感操作使用二次确认

## 反序列化漏洞：远程代码执行

Java、PHP等语言的反序列化功能如果处理不当，可能导致远程代码执行。

**Fastjson漏洞**

Fastjson是阿里巴巴的JSON解析库，曾因autoType功能导致多个严重漏洞。

```java
// 危险的代码
Object obj = JSON.parseObject(jsonString);
```

攻击者可以构造特殊的JSON，让Fastjson实例化任意类，执行恶意代码。

修复方法：
1. 升级到最新版本
2. 关闭autoType功能
3. 使用白名单限制可反序列化的类

**PHP反序列化**

PHP的unserialize函数在处理对象时会调用魔术方法：

```php
class Logger {
  public $logFile;
  
  function __destruct() {
    // 析构时写入日志
    file_put_contents($this->logFile, 'log entry');
  }
}

// 如果攻击者能控制$logFile，就能写入任意文件
```

**Java反序列化**

Java的ObjectInputStream.readObject()会执行对象的readObject方法。如果类链中存在危险的操作，就可能被利用。

常见利用链：
- Commons Collections
- Spring Framework
- JBoss

**防御建议**

1. 不要反序列化不可信的数据
2. 使用白名单限制可反序列化的类
3. 实现自定义的readObject方法进行验证
4. 使用替代方案，如JSON

## Webshell检测与防御

Webshell是攻击者上传到服务器的恶意脚本，用于获取服务器控制权。

**常见类型**

- PHP Webshell：最常见，一句话木马
- JSP Webshell：Java服务器使用
- ASP Webshell：Windows服务器

**检测方法**

1. 文件特征匹配：检测已知的恶意代码模式
2. 流量异常检测：Webshell通信通常有特殊模式
3. 文件行为分析：异常的文件操作

**防御措施**

1. 上传目录禁止执行脚本
2. 定期扫描网站目录
3. 使用WAF（Web应用防火墙）
4. 限制文件上传类型
5. 对上传的文件进行内容检查

**应急响应**

如果发现Webshell：
1. 立即隔离受影响的服务器
2. 分析攻击路径
3. 清除恶意文件
4. 修复漏洞
5. 加强监控

## Web安全最佳实践

总结一些Web安全的最佳实践：

**输入验证**

- 永远不要信任用户输入
- 使用白名单而不是黑名单
- 对输入进行长度和类型检查

**输出编码**

- 根据输出位置选择编码方式
- HTML编码、JavaScript编码、URL编码
- 使用框架提供的自动编码功能

**认证与授权**

- 使用强密码策略
- 实现多因素认证
- 遵循最小权限原则
- 使用安全的会话管理

**传输安全**

- 全站使用HTTPS
- 设置HSTS头
- 使用安全的Cookie属性

**错误处理**

- 不要向用户暴露详细的错误信息
- 记录错误日志供分析
- 使用统一的错误页面

**安全开发流程**

- 代码审计
- 安全测试
- 依赖项检查
- 安全培训

Web安全是一个持续的过程，需要开发、运维、安全团队的配合。

