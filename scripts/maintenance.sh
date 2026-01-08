#!/bin/bash

# 服务器维护脚本
# 用途：自动更新代码、重启服务、清理日志

set -e

PROJECT_DIR="${PROJECT_DIR:-$HOME/ServerArchive}"
LOG_DIR="${LOG_DIR:-/var/log/serverarchive}"
LOG_RETENTION_DAYS="${LOG_RETENTION_DAYS:-7}"

# 创建日志目录
mkdir -p "$LOG_DIR"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/maintenance.log"
}

# 判断使用哪个 docker compose 命令
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# 更新代码并重启
update_and_restart() {
    log "开始更新代码..."
    cd "$PROJECT_DIR"
    
    # 保存本地修改
    git stash 2>/dev/null || true
    
    # 拉取最新代码
    if git pull origin master; then
        log "代码更新成功"
        
        # 重新构建并启动
        log "重新构建并启动服务..."
        $DOCKER_COMPOSE up -d --build
        
        # 运行迁移（如果有新的）
        log "检查数据库迁移..."
        $DOCKER_COMPOSE --profile migrate up migrate 2>/dev/null || true
        
        log "服务重启完成"
    else
        log "代码更新失败，跳过重启"
    fi
}

# 仅重启服务（不更新代码）
restart_only() {
    log "重启服务..."
    cd "$PROJECT_DIR"
    $DOCKER_COMPOSE restart
    log "服务重启完成"
}

# 清理 Docker 日志
clean_docker_logs() {
    log "清理 Docker 容器日志..."
    
    # 清理超过指定天数的日志
    find /var/lib/docker/containers/ -name "*.log" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
    
    # 截断当前日志文件（保留最近的内容）
    for container_id in $(docker ps -q); do
        log_file=$(docker inspect --format='{{.LogPath}}' "$container_id" 2>/dev/null)
        if [ -f "$log_file" ]; then
            # 保留最后 10000 行
            tail -n 10000 "$log_file" > "${log_file}.tmp" 2>/dev/null && mv "${log_file}.tmp" "$log_file" || true
        fi
    done
    
    log "Docker 日志清理完成"
}

# 清理维护日志
clean_maintenance_logs() {
    log "清理维护日志..."
    find "$LOG_DIR" -name "*.log" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
    
    # 保留 maintenance.log 最后 1000 行
    if [ -f "$LOG_DIR/maintenance.log" ]; then
        tail -n 1000 "$LOG_DIR/maintenance.log" > "$LOG_DIR/maintenance.log.tmp"
        mv "$LOG_DIR/maintenance.log.tmp" "$LOG_DIR/maintenance.log"
    fi
    log "维护日志清理完成"
}

# 清理未使用的 Docker 资源
clean_docker_resources() {
    log "清理未使用的 Docker 资源..."
    docker system prune -f --volumes 2>/dev/null || true
    docker image prune -f 2>/dev/null || true
    log "Docker 资源清理完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    cd "$PROJECT_DIR"
    
    # 检查容器状态
    if ! $DOCKER_COMPOSE ps | grep -q "Up"; then
        log "警告：服务未运行，尝试启动..."
        $DOCKER_COMPOSE up -d
    fi
    
    # 检查健康检查接口（不需要鉴权）
    if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
        log "健康检查通过"
    else
        log "警告：API 无响应，尝试重启..."
        $DOCKER_COMPOSE restart
    fi
}

# 显示帮助
show_help() {
    echo "用法: $0 <命令>"
    echo ""
    echo "命令:"
    echo "  update      更新代码并重启服务"
    echo "  restart     仅重启服务"
    echo "  clean       清理日志和 Docker 资源"
    echo "  health      健康检查"
    echo "  all         执行所有维护任务（更新+清理+健康检查）"
    echo "  setup-cron  设置定时任务"
    echo ""
}

# 设置 crontab
setup_cron() {
    log "设置定时任务..."
    
    SCRIPT_PATH="$PROJECT_DIR/scripts/maintenance.sh"
    
    # 创建 crontab 内容
    CRON_CONTENT="
# Server Archive 自动维护任务
# 每天凌晨 4 点自动更新代码并重启
0 4 * * * $SCRIPT_PATH update >> $LOG_DIR/cron.log 2>&1

# 每天凌晨 5 点清理日志和 Docker 资源
0 5 * * * $SCRIPT_PATH clean >> $LOG_DIR/cron.log 2>&1

# 每 10 分钟健康检查
*/10 * * * * $SCRIPT_PATH health >> $LOG_DIR/cron.log 2>&1
"
    
    # 备份现有 crontab
    crontab -l > /tmp/current_crontab 2>/dev/null || true
    
    # 移除旧的 Server Archive 任务
    grep -v "Server Archive" /tmp/current_crontab | grep -v "maintenance.sh" > /tmp/new_crontab 2>/dev/null || true
    
    # 添加新任务
    echo "$CRON_CONTENT" >> /tmp/new_crontab
    
    # 安装新 crontab
    crontab /tmp/new_crontab
    
    log "定时任务设置完成"
    echo ""
    echo "已设置以下定时任务："
    echo "  - 每天 04:00 自动更新代码并重启"
    echo "  - 每天 05:00 清理日志和 Docker 资源"
    echo "  - 每 10 分钟执行健康检查"
    echo ""
    echo "查看当前定时任务: crontab -l"
    echo "查看维护日志: tail -f $LOG_DIR/maintenance.log"
}

# 主流程
case "${1:-}" in
    update)
        update_and_restart
        ;;
    restart)
        restart_only
        ;;
    clean)
        clean_docker_logs
        clean_maintenance_logs
        clean_docker_resources
        ;;
    health)
        health_check
        ;;
    all)
        update_and_restart
        clean_docker_logs
        clean_maintenance_logs
        clean_docker_resources
        health_check
        ;;
    setup-cron)
        setup_cron
        ;;
    *)
        show_help
        exit 1
        ;;
esac
