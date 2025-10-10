#!/bin/sh
# qBittorrent 下载完成后推送钉钉消息（Markdown 格式）

DINGTALK_WEBHOOK="https://oapi.dingtalk.com/robot/send?access_token=f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997"

send_dingtalk() {
    TITLE="$1"
    TEXT="$2"

    PAYLOAD=$(cat <<EOF
{
  "msgtype": "markdown",
  "markdown": {
    "title": "$TITLE",
    "text": "$TEXT"
  }
}
EOF
)
    echo $PAYLOAD
    RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$DINGTALK_WEBHOOK")
    if echo "$RESPONSE" | grep -q '"errmsg":"ok"'; then
        echo "通知发送成功"
        return 0
    else
        echo "通知发送失败"
        return 1
    fi
}

ACTION="$1"
HASH="$2"
NAME="$3"
CATEGORY="$4"
SAVE_PATH="$5"
SIZE="$6"

# 将种子大小（字节）转换为 GB，保留两位小数
SIZE_GB=$(awk "BEGIN {printf \"%.2f\", $SIZE / (1024 * 1024 * 1024)}")
# 防止钉钉风控，随机休眠 1-10 秒
sleep $(( $(date +%s%N) % 11 ))

CONTENT=$(cat <<EOF
#### qBittorrent ${ACTION}
**${NAME}**
> ${HASH}
- 路径：${SAVE_PATH}
- 存储：${SIZE_GB} GB
- 分类：${CATEGORY}
- 时间：$(date '+%Y-%m-%d %H:%M:%S')
EOF
)

send_dingtalk "qBittorrent ${ACTION}" "${CONTENT}"

exit 0
