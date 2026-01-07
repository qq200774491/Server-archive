#!/bin/bash

# 服务器自动部署脚本
# 用途：在服务器上一键部署 Server Archive 系统

set -e  # 遇到错误立即退出

echo "========================================="
echo "  Server Archive 自动部署脚本"
echo "========================================="
echo ""

# 配置变量
REPO_URL="https://codeup.aliyun.com/6545e63d5aabb5a01d762ef9/Warcraft3NewEngine.git"
PROJECT_DIR="$HOME/ServerArchive"
COMPOSE_FILE="docker-compose.yml"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印函数
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 检查 Docker 是否安装
check_docker() {
    print_info "检查 Docker 是否安装..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装！"
        echo "请先安装 Docker: https://docs.docker.com/engine/install/"
        exit 1
    fi
    print_success "Docker 已安装"
}

# 检查 Docker Compose 是否安装
check_docker_compose() {
    print_info "检查 Docker Compose 是否安装..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装！"
        echo "请先安装 Docker Compose"
        exit 1
    fi
    print_success "Docker Compose 已安装"
}

# 检查 Git 是否安装
check_git() {
    print_info "检查 Git 是否安装..."
    if ! command -v git &> /dev/null; then
        print_error "Git 未安装！"
        echo "请先安装 Git"
        exit 1
    fi
    print_success "Git 已安装"
}

# 克隆或更新代码
clone_or_update() {
    if [ -d "$PROJECT_DIR" ]; then
        print_info "项目目录已存在，拉取最新代码..."
        cd "$PROJECT_DIR"
        git pull
        print_success "代码已更新"
    else
        print_info "克隆项目代码..."
        git clone "$REPO_URL" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
        print_success "代码已克隆"
    fi
}

# 配置环境变量
setup_env() {
    print_info "配置环境变量..."

    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "环境变量文件已创建，请根据需要修改 .env 文件"

        # 询问是否修改配置
        read -p "是否需要修改数据库密码？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "请输入数据库密码: " DB_PASSWORD
            sed -i "s/postgres:postgres@/postgres:$DB_PASSWORD@/g" .env
            sed -i "s/POSTGRES_PASSWORD=postgres/POSTGRES_PASSWORD=$DB_PASSWORD/g" $COMPOSE_FILE
            print_success "数据库密码已更新"
        fi

        read -p "请输入服务器公网 IP 或域名（例如：192.168.1.100 或 example.com）: " SERVER_HOST
        if [ ! -z "$SERVER_HOST" ]; then
            sed -i "s|http://localhost:3000|http://$SERVER_HOST:3000|g" .env
            print_success "服务器地址已更新为: http://$SERVER_HOST:3000"
        fi
    else
        print_success "环境变量文件已存在"
    fi
}

# 停止并删除旧容器
stop_old_containers() {
    print_info "停止旧容器..."
    docker-compose down 2>/dev/null || true
    print_success "旧容器已停止"
}

# 构建并启动服务
start_services() {
    print_info "构建并启动服务..."
    docker-compose up -d --build
    print_success "服务已启动"
}

# 运行数据库迁移
run_migration() {
    print_info "等待数据库启动..."
    sleep 10

    print_info "运行数据库迁移..."
    docker-compose --profile migrate up migrate
    print_success "数据库迁移完成"
}

# 显示服务状态
show_status() {
    echo ""
    echo "========================================="
    echo "  部署完成！"
    echo "========================================="
    echo ""
    docker-compose ps
    echo ""
    print_success "前端访问地址: http://localhost:3000"
    print_success "API 访问地址: http://localhost:3000/api"
    echo ""
    echo "常用命令："
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
    echo "  查看状态: docker-compose ps"
    echo ""
}

# 主流程
main() {
    check_docker
    check_docker_compose
    check_git
    clone_or_update
    setup_env
    stop_old_containers
    start_services
    run_migration
    show_status
}

# 执行主流程
main
