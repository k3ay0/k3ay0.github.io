# Windows开发环境配置实战：WSL、PowerShell与终端工具

在Windows环境下做开发，终端配置是绕不开的话题。WSL让我们能在Windows上使用Linux环境，PowerShell是Windows原生的脚本工具，而Wezterm等现代终端则提供了更好的使用体验。

本文记录了这些工具的配置方法和常见问题的解决方案，希望能帮到同样在Windows下开发的朋友。

## WSL环境配置与常见问题

WSL是Windows Subsystem for Linux的缩写，让我们能在Windows上运行Linux程序。配置过程中经常会遇到一些坑。

**sudo命令失效的修复**

有次不小心改了/etc目录的权限，结果sudo完全不能用了。这是个很尴尬的情况，因为修复sudo本身就需要sudo权限。

解决方法是用root权限恢复。如果你能进入root shell，执行：

```bash
chmod 0440 /etc/sudoers
```

如果连root都不能用，需要从恢复模式启动或者用Live CD修复。

重要提示：修改sudoers文件一定要用visudo命令。它会在保存前检查语法，避免你把配置写坏导致所有人都无法使用sudo。

**DNS解析失败**

WSL偶尔会出现DNS解析失败的问题，表现为ping IP地址能通，但域名解析不了。

最常见的原因是/etc/resolv.conf的配置有问题。WSL默认会自动生成这个文件，但有时候会生成错误的内容。

修复方法：
```bash
# 手动指定DNS服务器
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# 或者重启systemd-resolved服务
sudo systemctl restart systemd-resolved
```

如果问题反复出现，可以在/etc/wsl.conf中配置自动生成规则：
```ini
[network]
generateResolvConf = false
```

**文件权限问题**

Windows和Linux的文件权限模型不同。在WSL中访问Windows文件时，权限映射可能不符合预期。

建议把项目文件放在Linux文件系统中，而不是/mnt/c/这样的Windows挂载点。性能和权限都会更好。

## PowerShell环境变量与配置

PowerShell是Windows下的强大脚本语言，但环境变量的设置方式和Linux有区别，新手容易搞混。

**临时环境变量**

```powershell
# 设置当前会话的环境变量
$env:DATABASE_URL = "postgresql://localhost/mydb"

# 查看环境变量
echo $env:DATABASE_URL
```

**永久环境变量**

```powershell
# 设置用户级环境变量
[Environment]::SetEnvironmentVariable("DATABASE_URL", "postgresql://localhost/mydb", "User")

# 设置系统级环境变量（需要管理员权限）
[Environment]::SetEnvironmentVariable("DATABASE_URL", "postgresql://localhost/mydb", "Machine")
```

**PATH变量的修改**

PATH是最常用的环境变量，修改时要特别小心：

```powershell
# 查看当前PATH
$env:PATH -split ';'

# 添加新路径（注意不要覆盖原有值）
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$currentPath;C:
ew\path", "User")
```

**PowerShell配置文件**

PowerShell的配置文件类似于Linux的.bashrc，可以在启动时自动执行：

```powershell
# 查看配置文件路径
echo $PROFILE

# 编辑配置文件
notepad $PROFILE
```

常用配置：
```powershell
# 设置默认编辑器
$env:EDITOR = "code"

# 设置别名
Set-Alias -Name grep -Value Select-String

# 自定义提示符
function prompt {
    "PS $($executionContext.SessionState.Path.CurrentLocation)> "
}
```

## Wezterm终端配置

Wezterm是一个跨平台的终端模拟器，用Lua配置，灵活性很高。相比Windows Terminal，Wezterm的性能更好，功能也更丰富。

**基本配置**

```lua
-- ~/.wezterm.lua
local wezterm = require 'wezterm'
local config = wezterm.config_builder()

config.font = wezterm.font('JetBrains Mono', { weight = 'Medium' })
config.font_size = 12.0
config.color_scheme = 'Catppuccin Mocha'

config.window_padding = {
  left = 10,
  right = 10,
  top = 10,
  bottom = 10,
}

config.window_background_opacity = 0.95

return config
```

**SSH快捷连接**

```lua
config.ssh_domains = {
  {
    name = 'my-server',
    remote_address = '192.168.1.100',
    username = 'deploy',
  },
}
```

然后在Wezterm中可以用Ctrl+Shift+O快速连接。

**GPU加速**

Wezterm默认启用GPU加速，但如果遇到渲染问题，可以尝试关闭：

```lua
config.front_end = 'Software'
```

**多窗口和标签页**

Wezterm的多窗口管理很灵活：

- Ctrl+Shift+N：新建窗口
- Ctrl+Shift+T：新建标签页
- Ctrl+Shift+Arrow：切换标签页
- Alt+数字：切换到指定标签页

## 其他实用配置

除了上面三个主要工具，还有一些实用的配置技巧。

**Windows Terminal配置**

Windows Terminal的配置文件在settings.json中：

```json
{
  "profiles": {
    "defaults": {
      "font": {
        "face": "Cascadia Code",
        "size": 12
      },
      "colorScheme": "One Half Dark"
    },
    "list": [
      {
        "name": "Ubuntu",
        "source": "Windows.Terminal.Wsl"
      }
    ]
  }
}
```

**Git for Windows配置**

```bash
# 设置换行符处理
git config --global core.autocrlf true

# 设置默认编辑器
git config --global core.editor code --wait

# 启用长路径支持
git config --global core.longpaths true
```

**VS Code集成**

在VS Code中使用WSL作为开发环境：

1. 安装WSL扩展
2. Ctrl+Shift+P，输入"WSL: Connect to WSL"
3. 在WSL环境中打开项目

这样既能享受VS Code的便利，又能使用Linux环境。

## 常见问题与解决方案

整理了一些在配置过程中可能遇到的问题。

**问题1：WSL中无法访问Windows网络**

原因：防火墙设置或网络配置问题。

解决：检查Windows防火墙设置，确保WSL的网络访问权限。

**问题2：PowerShell执行策略限制**

错误信息：无法加载文件，因为在此系统上禁止运行脚本。

解决：
```powershell
# 查看当前执行策略
Get-ExecutionPolicy

# 设置为允许本地脚本
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**问题3：Wezterm字体显示异常**

原因：字体文件缺失或配置错误。

解决：确认字体已正确安装，在Wezterm配置中指定完整字体名称。

**问题4：WSL中USB设备访问**

WSL默认不能直接访问USB设备，需要使用usbipd-win。

```bash
# Windows端
usbipd list
usbipd bind --busid 1-1
usbipd attach --wsl --busid 1-1

# WSL端
lsusb
```

**问题5：文件系统性能问题**

如果在/mnt/c/下操作文件很慢，考虑把项目移到Linux文件系统中。

```bash
# 创建项目目录
mkdir -p ~/projects

# 在Linux文件系统中操作
cd ~/projects
```

这样性能会好很多。

## 总结

Windows下的开发环境配置看起来是小事，但直接影响开发效率。一个好的终端环境能让你工作更顺心。

几个核心建议：

1. **用WSL作为主力开发环境**：Linux的工具链更成熟
2. **选择适合自己的终端**：Wezterm、Windows Terminal都很好
3. **配置要版本控制**：dotfiles管理是个好习惯
4. **遇到问题先查文档**：大部分问题都有现成的解决方案
5. **保持配置的简洁**：不要为了配置而配置

配置环境是个持续优化的过程，不必追求一步到位。随着使用深入，你会发现自己需要什么，然后逐步完善。

