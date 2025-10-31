#!/bin/bash

# 钉钉消息
DINGTALK_WEBHOOK="https://oapi.dingtalk.com/robot/send?access_token=f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997"

# 日志目录和文件设置
LOG_DIR="/var/log/ipmi"
LOG_FILE="$LOG_DIR/ipmi-monitor.log"

# 确保日志目录存在
mkdir -p "$LOG_DIR"

# 定义一个日志函数，将输出写入文件并添加时间戳
log_message() {
    echo "$1"
    # echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
}

# IPMI 登录信息
IPMI_HOST="10.86.0.209"
IPMI_USER="ADMIN"
IPMI_PASS="11111111"

# 机器名称
OWNER_NAME="X11SFF-H"

# 风扇最低转速阈值
MIN_RPM=1000

# 不同风扇的目标转速百分比
declare -A FAN_SPEEDS
FAN_SPEEDS["FAN1"]="0x32"   # 48%
FAN_SPEEDS["FANA"]="0x45"   # 60%

# 默认值（50%）
DEFAULT_PERCENT="0x32"

# 发送消息通知
send_dingtalk() {
    CONTENT=$(cat <<EOF
#### 风扇状态变更
- 设备：${OWNER_NAME}
- 名称：$1
- 转速：$2 RPM
- 时间：$(date '+%Y-%m-%d %H:%M:%S')
EOF
)
    PAYLOAD=$(cat <<EOF
{
  "msgtype": "markdown",
  "markdown": {
    "title": "风扇状态变更",
    "text": "$CONTENT"
  }
}
EOF
)

    log_message $(curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$DINGTALK_WEBHOOK")
}


while true; do
    sleep 15
    log_message "start ipmi monitor"

    # 一次性获取结果
    SENSOR_OUTPUT=$(ipmitool -I lanplus -H $IPMI_HOST -U $IPMI_USER -P $IPMI_PASS sensor)

    # 遍历所有行
    while read -r line; do
        NAME=$(echo "$line" | awk -F'|' '{print $1}' | xargs)
        VALUE=$(echo "$line" | awk -F'|' '{print $2}' | xargs)

        # -------- 2. FAN 特殊逻辑 --------
        if [[ "$NAME" =~ ^FAN ]]; then
            if [[ "$VALUE" != "na" && -n "$VALUE" ]]; then
                FAN_RPM=${VALUE%.*}
                log_message "$NAME: $FAN_RPM RPM"
                if [[ "$FAN_RPM" -lt "$MIN_RPM" ]]; then
                    # 调整风扇转速
                    SET_PERCENT=${FAN_SPEEDS[$NAME]:-$DEFAULT_PERCENT}
                    if [[ "$NAME" =~ ^FAN[0-9]+$ ]]; then
                        log_message "[WARN] $NAME 转速低于 $MIN_RPM RPM，设置数值风扇转速为 $SET_PERCENT"
                        ipmitool -I lanplus -H $IPMI_HOST -U $IPMI_USER -P $IPMI_PASS raw 0x30 0x70 0x66 0x01 0x00 $SET_PERCENT
                    elif [[ "$NAME" =~ ^FAN[A-Z]+$ ]]; then
                        log_message "[WARN] $NAME 转速低于 $MIN_RPM RPM，设置字母风扇转速为 $SET_PERCENT"
                        ipmitool -I lanplus -H $IPMI_HOST -U $IPMI_USER -P $IPMI_PASS raw 0x30 0x70 0x66 0x01 0x01 $SET_PERCENT
                    fi
                    # 发送钉钉消息
                    send_dingtalk $NAME $FAN_RPM
                fi
            else
                log_message "$NAME: N/A"
            fi
        fi
    done <<< "$SENSOR_OUTPUT"

    sleep 15
done
