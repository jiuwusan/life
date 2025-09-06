FROM alpine/git

COPY docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p /data

WORKDIR /data

ENTRYPOINT ["docker-entrypoint.sh"]

# 维持不退出
# CMD ["tail", "-f", "/dev/null"]
CMD ["sleep", "infinity"]