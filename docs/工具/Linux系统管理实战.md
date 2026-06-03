# Linux系统管理实战：sudo、systemd与系统配置

Linux系统管理涉及系统配置、权限管理、服务管理等多个方面。看似简单，但细节很多。

本文将整理常见的系统管理问题和解决方案，帮助你更好地管理Linux系统。

## sudo权限管理

sudo是Linux下最重要的权限管理工具，配置不当会导致严重问题。

**sudoers文件**

sudoers文件定义了谁能用sudo，以及能执行什么命令。

```bash
# 编辑sudoers文件（推荐方式）
visudo

# 文件格式
用户名 主机=(用户) 命令
deploy ALL=(ALL) NOPASSWD: ALL
```

**常见问题**

问题1：sudo命令失效
```bash
# 错误信息
sudo: /etc/sudoers is world writable
sudo: no password was supplied

# 解决方法（需要root权限）
chmod 0440 /etc/sudoers
```

问题2：用户不在sudoers文件中
```bash
# 错误信息
user is not in the sudoers file. This incident will be reported.

# 解决方法
usermod -aG sudo username
# 或者编辑sudoers文件
echo "username ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers.d/username
```

问题3：需要输入密码但没有提示
```bash
# 检查sudo配置
sudo -l

# 确保有正确的权限
username ALL=(ALL) ALL  # 需要密码
username ALL=(ALL) NOPASSWD: ALL  # 不需要密码
```

**最佳实践**

1. 尽量使用visudo编辑
2. 使用/etc/sudoers.d/目录管理
3. 限制sudo的命令范围
4. 记录所有sudo操作

## systemd服务管理

systemd是现代Linux的初始化系统，管理服务的基本工具。

**基本命令**

```bash
# 服务管理
systemctl start service_name    # 启动
systemctl stop service_name     # 停止
systemctl restart service_name  # 重启
systemctl status service_name   # 状态
systemctl enable service_name   # 开机自启
systemctl disable service_name  # 取消自启

# 查看日志
journalctl -u service_name -f  # 实时查看
journalctl -u service_name --since today  # 今天的日志
```

**自定义服务**

创建自定义服务：

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
systemctl daemon-reload
systemctl enable myapp
systemctl start myapp
```

**常见问题**

问题1：服务启动失败
```bash
# 查看详细日志
journalctl -u service_name -n 100

# 检查配置文件语法
systemd-analyze verify /etc/systemd/system/myapp.service
```

问题2：服务无法开机自启
```bash
# 检查服务状态
systemctl is-enabled service_name

# 启用自启
systemctl enable service_name
```

## sysctl内核参数配置

sysctl用于修改内核参数，常见用途包括网络优化、安全加固等。

**基本用法**

```bash
# 查看所有参数
sysctl -a

# 查看特定参数
sysctl net.ipv4.ip_forward

# 临时修改
sudo sysctl -w net.ipv4.ip_forward=1

# 永久修改
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**常用参数**

```bash
# 网络相关
net.ipv4.ip_forward = 1  # 开启IP转发
net.ipv4.tcp_syncookies = 1  # 防SYN洪水攻击
net.core.somaxconn = 65535  # 最大连接数

# 文件系统
fs.file-max = 2097152  # 最大文件描述符
fs.inotify.max_user_watches = 524288

# 内存
vm.swappiness = 10  # 减少swap使用
vm.overcommit_memory = 1  # Redis需要
```

**安全加固**

```bash
# 禁用IP转发（除非需要）
net.ipv4.ip_forward = 0

# 禁用ICMP重定向
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0

# 启用反向路径过滤
net.ipv4.conf.all.rp_filter = 1
```

**配置文件**

主要配置文件：
- /etc/sysctl.conf：主配置文件
- /etc/sysctl.d/*.conf：额外配置文件

建议使用sysctl.d目录管理配置，方便维护。

## 文件系统与存储管理

文件系统管理是系统管理的重要组成部分。

**磁盘分区**

```bash
# 查看磁盘信息
lsblk
fdisk -l

# 分区
fdisk /dev/sdb

# 格式化
mkfs.ext4 /dev/sdb1

# 挂载
mount /dev/sdb1 /mnt/data

# 自动挂载
echo "/dev/sdb1 /mnt/data ext4 defaults 0 2" >> /etc/fstab
```

**LVM管理**

LVM提供了灵活的存储管理：

```bash
# 创建物理卷
pvcreate /dev/sdb

# 创建卷组
vgcreate myvg /dev/sdb

# 创建逻辑卷
lvcreate -L 10G -n mylv myvg

# 扩展逻辑卷
lvextend -L +5G /dev/myvg/mylv
resize2fs /dev/myvg/mylv
```

**文件权限**

```bash
# 修改权限
chmod 755 file
chmod u+x script.sh

# 修改所有者
chown user:group file

# 特殊权限
chmod u+s program  # SUID
chmod g+s directory  # SGID
chmod +t directory  # Sticky bit
```

**磁盘监控**

```bash
# 查看磁盘使用
df -h
du -sh /var/log

# 查看磁盘IO
iostat -x 1

# 查找大文件
find / -type f -size +100M -exec ls -lh {} \;
```

## 系统监控与日志

系统监控和日志分析是运维的重要工作。

**系统监控工具**

```bash
# top/htop - 进程监控
top
htop

# vmstat - 虚拟内存统计
vmstat 1

# iostat - IO统计
iostat -x 1

# netstat - 网络统计
netstat -tuln
ss -tuln
```

**日志管理**

```bash
# 系统日志
journalctl -f  # 实时查看
journalctl --since today  # 今天的日志
journalctl -u nginx  # 特定服务

# 日志文件
tail -f /var/log/syslog
tail -f /var/log/auth.log

# 日志轮转
cat /etc/logrotate.d/nginx
```

**性能分析**

```bash
# 系统负载
uptime
cat /proc/loadavg

# 内存使用
free -h
cat /proc/meminfo

# CPU信息
lscpu
cat /proc/cpuinfo
```

**告警配置**

可以使用简单的脚本进行告警：

```bash
#!/bin/bash
# 磁盘使用告警
USAGE=$(df -h / | awk 'NR==2{print $5}' | tr -d '%')
if [ $USAGE -gt 80 ]; then
    echo "磁盘使用率过高: $USAGE%" | mail -s "告警" admin@example.com
fi
```

