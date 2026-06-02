@echo off
set comment=%~1
if "%comment%"=="" set comment=文档内容更新
git add -A
git commit -m "%comment%"
git push
