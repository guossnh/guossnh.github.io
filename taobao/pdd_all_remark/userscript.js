// ==UserScript==
// @name         拼多多后台批量备注
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  拼多多后台批量备注
// @author       guossnh@gmail.com
// @match        https://mms.pinduoduo.com/goods/goods_list*
// @match        https://mms.pinduoduo.com/orders/list*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pinduoduo.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建UI界面
    function createUI() {
        // 检查是否已存在UI，避免重复创建
        if (document.getElementById('batch-remark-button')) {
            return;
        }

        // 创建浮动按钮
        const floatButton = document.createElement('div');
        floatButton.id = 'batch-remark-button';
        floatButton.textContent = '批量备注';
        floatButton.style.cssText = 'position: fixed; bottom: 100px; right: 20px; background: #e02e24; color: white; padding: 10px 15px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.2); z-index: 9999; cursor: pointer; font-weight: bold;';

        // 创建容器（初始隐藏）
        const container = document.createElement('div');
        container.id = 'batch-remark-container';
        container.style.cssText = 'position: fixed; bottom: 150px; right: 20px; background: #fff; padding: 15px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.2); z-index: 9998; width: 250px; display: none;';

        // 标题
        const title = document.createElement('h3');
        title.textContent = '批量备注工具';
        title.style.cssText = 'margin-top: 0; color: #e02e24;';

        // 备注输入框
        const remarkLabel = document.createElement('label');
        remarkLabel.textContent = '备注内容：';
        remarkLabel.style.display = 'block';
        remarkLabel.style.marginTop = '10px';

        const remarkInput = document.createElement('input');
        remarkInput.type = 'text';
        remarkInput.id = 'batch-remark-input';
        remarkInput.style.cssText = 'width: 100%; padding: 5px; margin-top: 5px; box-sizing: border-box;';

        // 订单输入框
        const orderLabel = document.createElement('label');
        orderLabel.textContent = '批量订单号（每行一个）：';
        orderLabel.style.display = 'block';
        orderLabel.style.marginTop = '10px';

        const orderInput = document.createElement('textarea');
        orderInput.id = 'batch-order-input';
        orderInput.style.cssText = 'width: 100%; height: 100px; padding: 5px; margin-top: 5px; box-sizing: border-box;';

        // 延迟输入框
        const delayLabel = document.createElement('label');
        delayLabel.textContent = '操作延迟(ms)：';
        delayLabel.style.display = 'block';
        delayLabel.style.marginTop = '10px';

        const delayInput = document.createElement('input');
        delayInput.type = 'number';
        delayInput.id = 'batch-delay-input';
        delayInput.value = '1000';
        delayInput.style.cssText = 'width: 100%; padding: 5px; margin-top: 5px; box-sizing: border-box;';

        // 只保留一个按钮 - 批量订单备注
        const orderRemarkButton = document.createElement('button');
        orderRemarkButton.textContent = '批量订单备注';
        orderRemarkButton.style.cssText = 'width: 100%; padding: 8px; margin-top: 15px; background: #e02e24; color: white; border: none; border-radius: 4px; cursor: pointer;';
        orderRemarkButton.onclick = startOrderBatchRemark;

        // 状态显示
        const statusDiv = document.createElement('div');
        statusDiv.id = 'batch-status';
        statusDiv.style.cssText = 'margin-top: 10px; font-size: 12px; color: #666;';

        // 组装UI
        container.appendChild(title);
        container.appendChild(remarkLabel);
        container.appendChild(remarkInput);
        container.appendChild(orderLabel);
        container.appendChild(orderInput);
        container.appendChild(delayLabel);
        container.appendChild(delayInput);
        container.appendChild(orderRemarkButton);
        container.appendChild(statusDiv);

        // 添加按钮点击事件 - 切换面板显示/隐藏
        floatButton.addEventListener('click', function() {
            if (container.style.display === 'none') {
                container.style.display = 'block';
                floatButton.textContent = '关闭面板';
            } else {
                container.style.display = 'none';
                floatButton.textContent = '批量备注';
            }
        });

        // 添加到页面
        document.body.appendChild(floatButton);
        document.body.appendChild(container);
    }

    // 开始批量备注
    async function startBatchRemark() {
        const remarkText = document.getElementById('batch-remark-input').value.trim();
        const delay = parseInt(document.getElementById('batch-delay-input').value) || 1000;
        const statusDiv = document.getElementById('batch-status');

        if (!remarkText) {
            statusDiv.textContent = '请输入备注内容';
            statusDiv.style.color = 'red';
            return;
        }

        statusDiv.textContent = '正在获取商品列表...';
        statusDiv.style.color = '#666';

        // 获取所有商品行
        // 尝试多种可能的选择器，适应页面变化
        let productRows = document.querySelectorAll('.goods-list-table tr') ||
                         document.querySelectorAll('.goods-table-content tr') ||
                         document.querySelectorAll('[data-testid="goods-list-row"]') ||
                         document.querySelectorAll('.ant-table-row');

        if (!productRows || productRows.length === 0) {
            statusDiv.textContent = '未找到商品列表，请刷新页面重试';
            statusDiv.style.color = 'red';
            return;
        }

        statusDiv.textContent = `找到 ${productRows.length} 个商品，开始处理...`;

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < productRows.length; i++) {
            const row = productRows[i];
            statusDiv.textContent = `正在处理第 ${i+1}/${productRows.length} 个商品...`;

            try {
                // 尝试点击备注按钮
                // 尝试多种可能的选择器
                let remarkBtn = row.querySelector('.goods-remark') ||
                               row.querySelector('[data-testid="remark-button"]') ||
                               row.querySelector('.remark-btn') ||
                               Array.from(row.querySelectorAll('button')).find(btn =>
                                   btn.textContent.includes('备注') ||
                                   btn.getAttribute('title')?.includes('备注'));

                if (!remarkBtn) {
                    // 尝试在操作列中找到备注选项
                    const actionBtns = row.querySelectorAll('.action-btn, .operation-btn, .more-actions');
                    for (const btn of actionBtns) {
                        btn.click();
                        await sleep(300);

                        // 检查弹出的菜单中是否有备注选项
                        const menuItems = document.querySelectorAll('.ant-dropdown-menu-item, .menu-item');
                        remarkBtn = Array.from(menuItems).find(item =>
                            item.textContent.includes('备注') ||
                            item.getAttribute('title')?.includes('备注'));

                        if (remarkBtn) break;
                    }
                }

                if (!remarkBtn) {
                    console.log('未找到备注按钮:', row);
                    failCount++;
                    continue;
                }

                // 点击备注按钮
                remarkBtn.click();
                await sleep(delay);

                // 查找备注输入框和确认按钮
                // 尝试多种可能的选择器
                const remarkInputs = document.querySelectorAll('.ant-modal input, .remark-modal input, [data-testid="remark-input"]');
                const remarkInput = remarkInputs[remarkInputs.length - 1]; // 通常是最后一个打开的输入框

                if (!remarkInput) {
                    console.log('未找到备注输入框');
                    failCount++;
                    continue;
                }

                // 清空并输入备注
                remarkInput.value = '';
                remarkInput.dispatchEvent(new Event('input', { bubbles: true }));
                await sleep(300);

                remarkInput.value = remarkText;
                remarkInput.dispatchEvent(new Event('input', { bubbles: true }));
                await sleep(300);

                // 查找确认按钮
                const confirmBtns = document.querySelectorAll('.ant-modal .ant-btn-primary, .remark-modal .confirm-btn, [data-testid="confirm-button"]');
                const confirmBtn = confirmBtns[confirmBtns.length - 1]; // 通常是最后一个打开的模态框中的按钮

                if (!confirmBtn) {
                    console.log('未找到确认按钮');
                    failCount++;
                    continue;
                }

                confirmBtn.click();
                await sleep(delay);

                successCount++;
            } catch (error) {
                console.error('处理商品时出错:', error);
                failCount++;
            }
        }

        statusDiv.textContent = `处理完成！成功: ${successCount}, 失败: ${failCount}`;
        statusDiv.style.color = failCount > 0 ? 'orange' : 'green';
    }

    // 批量订单备注功能 - 简化直接使用API
    async function startOrderBatchRemark() {
        const remarkText = document.getElementById('batch-remark-input').value.trim();
        const orderText = document.getElementById('batch-order-input').value.trim();
        const delay = parseInt(document.getElementById('batch-delay-input').value) || 1000;
        const statusDiv = document.getElementById('batch-status');

        if (!remarkText) {
            statusDiv.textContent = '请输入备注内容';
            statusDiv.style.color = 'red';
            return;
        }

        if (!orderText) {
            statusDiv.textContent = '请输入订单号';
            statusDiv.style.color = 'red';
            return;
        }

        // 分割订单号，支持多种分隔符
        const orderIds = orderText.split(/[\n,，\s]+/).filter(id => id.trim() !== '');

        if (orderIds.length === 0) {
            statusDiv.textContent = '未找到有效的订单号';
            statusDiv.style.color = 'red';
            return;
        }

        statusDiv.textContent = `找到 ${orderIds.length} 个订单号，开始处理...`;

        let successCount = 0;
        let failCount = 0;

        // 直接处理每个订单ID
        for (let i = 0; i < orderIds.length; i++) {
            const orderId = orderIds[i].trim();
            statusDiv.textContent = `正在处理第 ${i+1}/${orderIds.length} 个订单: ${orderId}...`;

            try {
                // 直接调用API发送备注
                const result = await send_json_to_server_for_remark_promise(orderId, remarkText);
                if (result.success) {
                    successCount++;
                    console.log(`订单 ${orderId} 备注成功`);
                } else {
                    console.log(`订单 ${orderId} 备注失败:`, result);
                    failCount++;
                }

                // 添加延迟，避免请求过快
                await sleep(delay);
            } catch (error) {
                console.error(`处理订单时出错 ${orderId}:`, error);
                failCount++;
                await sleep(delay);
            }
        }

        statusDiv.textContent = `处理完成！成功: ${successCount}, 失败: ${failCount}`;
        statusDiv.style.color = failCount > 0 ? 'orange' : 'green';
    }

    // 将原有的AJAX调用转换为Promise形式，适应新的API接口
    function send_json_to_server_for_remark_promise(product_id, user_remark) {
        return new Promise((resolve, reject) => {
            // 检查备注内容是否为空
            if (!user_remark || user_remark.trim() === '') {
                console.error("备注内容不能为空");
                resolve({success: false, data: {errorCode: 5000308, errorMsg: "订单备注不能为空！"}});
                return;
            }

            // 检查jQuery是否可用
            if (typeof $ === 'undefined') {
                console.error("jQuery未加载，尝试使用原生fetch");
                // 使用原生fetch作为备选
                const jsondata = {
                    orderSn: product_id,
                    remark: user_remark.trim(),  // 修改参数名为remark
                    content: user_remark.trim(),  // 同时保留content参数
                    note: user_remark.trim(),     // 尝试note参数
                    tagType: 1,
                    source: 1
                };

                console.log("使用fetch发送备注请求:", jsondata);

                fetch("https://mms.pinduoduo.com/pizza/order/noteTag/add", {
                    method: "POST",
                    headers: {
                        "authority": "mms.pinduoduo.com",
                        "accept": "*/*",
                        "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                        "content-type": "application/json",
                        "origin": "https://mms.pinduoduo.com",
                        "referer": "https://mms.pinduoduo.com/orders/list",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin"
                    },
                    credentials: 'include', // 包含cookie
                    body: JSON.stringify(jsondata)
                })
                .then(response => response.json())
                .then(data => {
                    console.log("备注API返回数据(fetch):", data);
                    if (data.success === true || data.errorCode === 0 || data.code === 0) {
                        resolve({success: true, data: data});
                    } else {
                        console.error("备注失败(fetch):", data);
                        resolve({success: false, data: data});
                    }
                })
                .catch(error => {
                    console.error("备注API请求失败(fetch):", error);
                    reject(error);
                });

                return;
            }

            // 新的API请求数据格式
            var jsondata = {
                orderSn: product_id,
                remark: user_remark.trim(),  // 修改参数名为remark
                content: user_remark.trim(),  // 同时保留content参数
                note: user_remark.trim(),     // 尝试note参数
                tagType: 1,
                source: 1
            };

            console.log("准备发送备注请求:", jsondata);

            $.ajax({
                url: "https://mms.pinduoduo.com/pizza/order/noteTag/add",
                method: "POST",
                headers: {
                    "authority": "mms.pinduoduo.com",
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                    "content-type": "application/json",
                    "origin": "https://mms.pinduoduo.com",
                    "referer": "https://mms.pinduoduo.com/orders/list",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin"
                },
                xhrFields: {
                    withCredentials: true  // 确保发送cookie
                },
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(jsondata),
                success: function (data) {
                    console.log("备注API返回数据:", data);
                    // 检查返回的数据格式，适应可能的变化
                    if (data.success === true || data.errorCode === 0 || data.code === 0) {
                        resolve({success: true, data: data});
                    } else {
                        console.error("备注失败:", data);
                        resolve({success: false, data: data, message: data.errorMsg || data.msg || "未知错误"});
                    }
                },
                error: function (error) {
                    console.error("备注API请求失败:", error);
                    // 尝试解析响应文本
                    let responseText = "";
                    try {
                        responseText = error.responseText;
                        console.log("错误响应文本:", responseText);
                    } catch (e) {
                        console.error("无法获取错误响应文本");
                    }
                    reject({error: error, responseText: responseText});
                }
            });
        });
    }

    // 辅助函数：延迟
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 等待页面加载完成后初始化
    function init() {
        // 检查页面是否已加载完成
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(createUI, 1000); // 延迟1秒创建UI，确保页面元素都已加载
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                setTimeout(createUI, 1000);
            });
        }
    }

    // 启动脚本
    init();

    // 监听页面变化，在SPA应用中可能需要重新创建UI
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(createUI, 1500); // 页面变化后重新创建UI
        }
    }).observe(document, {subtree: true, childList: true});
})();
