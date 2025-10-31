chmod a+x /usr/local/bin/ipmi_monitor.sh

vi /etc/systemd/system/ipmi-monitor.service

systemctl daemon-reload

systemctl start ipmi-monitor.service

systemctl stop ipmi-monitor.service

systemctl enable ipmi-monitor.service