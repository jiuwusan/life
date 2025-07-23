import uiautomator2 as u2

def run():
    # 连接设备（可以是USB或WiFi IP）
    # d = u2.connect() # USB连接
    d = u2.connect("10.101.1.118")  # WiFi连接

    # 获取 UI 层级的 XML 字符串
    xml = d.dump_hierarchy()

    # 保存到文件
    with open("ui.xml", "w", encoding="utf-8") as f:
        f.write(xml)


# === 程序入口 ===
if __name__ == "__main__":
    run()