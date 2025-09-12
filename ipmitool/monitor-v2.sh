#!/bin/bash

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
FAN_SPEEDS["FAN1"]="0x30"   # 48%
FAN_SPEEDS["FANA"]="0x3C"   # 60%

# 默认值（50%）
DEFAULT_PERCENT="0x32"

# 上报函数
report_data() {
    local json=$1
    curl -s -X POST "http://life-api:9000/tracker/report" \
         -H "Content-Type: application/json" \
         -d "$json" >/dev/null 2>&1 || echo "[ERROR] 上报失败"
}

while true; do
    sleep 30
    echo "========== $(date) =========="

    SENSOR_DATA_STR=""

    # 一次性获取结果
    SENSOR_OUTPUT=$(ipmitool -I lanplus -H $IPMI_HOST -U $IPMI_USER -P $IPMI_PASS sensor)

    # 遍历所有行
    while read -r line; do
        NAME=$(echo "$line" | awk -F'|' '{print $1}' | xargs)
        VALUE=$(echo "$line" | awk -F'|' '{print $2}' | xargs)

        # -------- 1. 全量数据上报 --------
        SENSOR_DATA_STR+="{\"owner\":\"$OWNER_NAME\",\"name\":\"$NAME\",\"type\":\"SENSOR\",\"remark\":\"IPMI\",\"value\":\"${VALUE}\"},"

        # -------- 2. FAN 特殊逻辑 --------
        if [[ "$NAME" =~ ^FAN ]]; then
            if [[ "$VALUE" != "na" && -n "$VALUE" ]]; then
                FAN_RPM=${VALUE%.*}
                echo "$NAME: $FAN_RPM RPM"

                if [[ "$FAN_RPM" -lt "$MIN_RPM" ]]; then
                    SET_PERCENT=${FAN_SPEEDS[$NAME]:-$DEFAULT_PERCENT}

                    if [[ "$NAME" =~ ^FAN[0-9]+$ ]]; then
                        echo "[WARN] $NAME 转速低于 $MIN_RPM RPM，设置数值风扇转速为 $SET_PERCENT"
                        ipmitool -I lanplus -H $IPMI_HOST -U $IPMI_USER -P $IPMI_PASS raw 0x30 0x70 0x66 0x01 0x00 $SET_PERCENT
                    elif [[ "$NAME" =~ ^FAN[A-Z]+$ ]]; then
                        echo "[WARN] $NAME 转速低于 $MIN_RPM RPM，设置字母风扇转速为 $SET_PERCENT"
                        ipmitool -I lanplus -H $IPMI_HOST -U $IPMI_USER -P $IPMI_PASS raw 0x30 0x70 0x66 0x01 0x01 $SET_PERCENT
                    fi
                fi
            else
                echo "$NAME: N/A"
            fi
        fi
    done <<< "$SENSOR_OUTPUT"

    # 去掉最后一个逗号 
    SENSOR_DATA_STR=${SENSOR_DATA_STR%,}

    # 拼 JSON 并上报
    if [[ -n "$SENSOR_DATA_STR" ]]; then
        SENSOR_DATA_JSON="[${SENSOR_DATA_STR}]"
        echo "上报全量数据: $SENSOR_DATA_JSON"
        report_data "$SENSOR_DATA_JSON"
    else
        echo "[INFO] 没有采集到任何传感器数据"
    fi

    sleep 30
done
