$comment = $args[0]
if (-not $comment) { $comment = "文档内容更新" }
git add -A
git commit -m $comment
git push
