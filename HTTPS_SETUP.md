# 强制HTTPS和安全策略

## GitHub Pages HTTPS 设置

你的GitHub Pages网站默认支持HTTPS，但需要确保以下几点：

### 1. 仓库设置检查
1. 进入 GitHub 仓库设置 (Settings)
2. 找到 "Pages" 部分
3. 确保 "Enforce HTTPS" 选项已勾选
4. 如果使用了自定义域名，确保CNAME记录正确

### 2. 链接使用相对路径
- 站内链接使用相对路径（如 `/child-app/` 而不是 `http://guossnh.com/child-app/`）
- 外部链接确保使用HTTPS

### 3. 混合内容检查
- 避免加载HTTP资源
- 所有CSS、JS、图片都应使用HTTPS链接

### 3. 自定义域名HTTPS
如果你使用 `guossnh.com` 自定义域名：
1. 确保DNS的CNAME记录指向 `guossnh.github.io`
2. GitHub会自动为你的域名提供SSL证书
3. 这个过程可能需要几分钟到几小时

### 4. 验证HTTPS
访问以下地址测试：
- https://guossnh.github.io (GitHub Pages默认地址)
- https://guossnh.com (你的自定义域名)

### 5. 常见问题解决
如果仍然显示不安全：
1. 清除浏览器缓存
2. 检查是否有HTTP资源被加载
3. 等待SSL证书完全生效（新域名可能需要时间）
4. 检查CNAME文件是否正确