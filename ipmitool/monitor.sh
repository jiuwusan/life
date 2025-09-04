#!/bin/bash

# IPMI 登录信息
IPMI_HOST="10.86.0.209"
IPMI_USER="ADMIN"
IPMI_PASS="11111111"

# 风扇最低转速阈值
MIN_RPM=1000

# 不同风扇的目标转速百分比
declare -A FAN_SPEEDS
FAN_SPEEDS["FAN1"]="0x30"   # 48%
FAN_SPEEDS["FANA"]="0x3C"   # 60%

# 默认值（50%）
DEFAULT_PERCENT="0x32"

while true; do
    echo "========== $(date) =========="

    ipmitool -I lanplus -H $IPMI_HOST -U $IPMI_USER -P $IPMI_PASS sensor | grep -i fan | while read -r line; do
        FAN_NAME=$(echo "$line" | awk -F'|' '{print $1}' | xargs)
        FAN_RPM=$(echo "$line" | awk -F'|' '{print $2}' | xargs)

        # 过滤无效数据
        if [[ "$FAN_RPM" == "na" || -z "$FAN_RPM" ]]; then
            echo "$FAN_NAME: N/A"
            continue
        fi

        FAN_RPM=${FAN_RPM%.*}  # 去掉小数部分
        echo "$FAN_NAME: $FAN_RPM RPM"

        # 判断是否低于阈值
        if [[ "$FAN_RPM" -lt "$MIN_RPM" ]]; then
            SET_PERCENT=${FAN_SPEEDS[$FAN_NAME]:-$DEFAULT_PERCENT}

            if [[ "$FAN_NAME" =~ ^FAN[0-9]+$ ]]; then
                # 数字风扇
                echo "[WARN] $FAN_NAME 转速低于 $MIN_RPM RPM，设置数值风扇转速为 $SET_PERCENT"
                ipmitool -I lanplus -H $IPMI_HOST -U $IPMI_USER -P $IPMI_PASS raw 0x30 0x70 0x66 0x01 0x00 $SET_PERCENT
            elif [[ "$FAN_NAME" =~ ^FAN[A-Z]+$ ]]; then
                # 字母风扇
                echo "[WARN] $FAN_NAME 转速低于 $MIN_RPM RPM，设置字母风扇转速为 $SET_PERCENT"
                ipmitool -I lanplus -H $IPMI_HOST -U $IPMI_USER -P $IPMI_PASS raw 0x30 0x70 0x66 0x01 0x01 $SET_PERCENT
            else
                echo "[INFO] $FAN_NAME 未匹配数字/字母规则，跳过。"
            fi
        fi
    done

    sleep 15
done
