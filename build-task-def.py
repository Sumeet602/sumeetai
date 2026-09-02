import json
import os

base_dir = r"d:\Multi Agent Ai Project\sumeetai"

def parse_env(filepath):
    envs = []
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if '=' in line:
                        key, val = line.split('=', 1)
                        # Remove quotes if they exist
                        val = val.strip(' "\'')
                        envs.append({"name": key.strip(), "value": val})
    return envs

auth_env = parse_env(os.path.join(base_dir, 'backend', 'services', 'auth', '.env'))
chat_env = parse_env(os.path.join(base_dir, 'backend', 'services', 'chat', '.env'))
agent_env = parse_env(os.path.join(base_dir, 'backend', 'services', 'agent', '.env'))
billing_env = parse_env(os.path.join(base_dir, 'backend', 'services', 'billing', '.env'))
gateway_env = parse_env(os.path.join(base_dir, 'backend', 'gateway', '.env'))

# Force certain env vars to use localhost since they run in one task
def force_localhost(envs, service_name):
    for e in envs:
        if e['name'] == 'MONGO_URI':
            e['value'] = f"mongodb://localhost:27017/{service_name}"
        if e['name'] == 'REDIS_URL':
            e['value'] = "redis://localhost:6379"
    return envs

auth_env = force_localhost(auth_env, 'auth')
chat_env = force_localhost(chat_env, 'chat')
agent_env = force_localhost(agent_env, 'agent')
billing_env = force_localhost(billing_env, 'billing')

gateway_env = [
    {"name": "AUTH_SERVICE", "value": "http://localhost:8001"},
    {"name": "CHAT_SERVICE", "value": "http://localhost:8002"},
    {"name": "AGENT_SERVICE", "value": "http://localhost:8003"},
    {"name": "BILLING_SERVICE", "value": "http://localhost:8004"}
]

task_def = {
    "family": "sumeetai-task",
    "networkMode": "awsvpc",
    "executionRoleArn": "arn:aws:iam::030388905866:role/ecsTaskExecutionRole",
    "taskRoleArn": "arn:aws:iam::030388905866:role/ecsTaskExecutionRole",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "1024",
    "memory": "3072",
    "containerDefinitions": [
        {
            "name": "gateway",
            "image": "030388905866.dkr.ecr.eu-north-1.amazonaws.com/gateway:latest",
            "essential": True,
            "portMappings": [{"containerPort": 8000, "protocol": "tcp"}],
            "environment": gateway_env,
            "dependsOn": [{"containerName": "auth", "condition": "START"}],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/sumeetai-task",
                    "awslogs-region": "eu-north-1",
                    "awslogs-stream-prefix": "gateway"
                }
            }
        },
        {
            "name": "auth",
            "image": "030388905866.dkr.ecr.eu-north-1.amazonaws.com/auth-service:latest",
            "essential": True,
            "portMappings": [{"containerPort": 8001, "protocol": "tcp"}],
            "environment": auth_env,
            "dependsOn": [{"containerName": "mongodb", "condition": "START"}, {"containerName": "redis", "condition": "START"}],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/sumeetai-task",
                    "awslogs-region": "eu-north-1",
                    "awslogs-stream-prefix": "auth"
                }
            }
        },
        {
            "name": "chat",
            "image": "030388905866.dkr.ecr.eu-north-1.amazonaws.com/chat-service:latest",
            "essential": True,
            "portMappings": [{"containerPort": 8002, "protocol": "tcp"}],
            "environment": chat_env,
            "dependsOn": [{"containerName": "mongodb", "condition": "START"}, {"containerName": "redis", "condition": "START"}],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/sumeetai-task",
                    "awslogs-region": "eu-north-1",
                    "awslogs-stream-prefix": "chat"
                }
            }
        },
        {
            "name": "agent",
            "image": "030388905866.dkr.ecr.eu-north-1.amazonaws.com/agent-service:latest",
            "essential": True,
            "portMappings": [{"containerPort": 8003, "protocol": "tcp"}],
            "environment": agent_env,
            "dependsOn": [{"containerName": "mongodb", "condition": "START"}, {"containerName": "redis", "condition": "START"}],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/sumeetai-task",
                    "awslogs-region": "eu-north-1",
                    "awslogs-stream-prefix": "agent"
                }
            }
        },
        {
            "name": "billing",
            "image": "030388905866.dkr.ecr.eu-north-1.amazonaws.com/billing-service:latest",
            "essential": True,
            "portMappings": [{"containerPort": 8004, "protocol": "tcp"}],
            "environment": billing_env,
            "dependsOn": [{"containerName": "mongodb", "condition": "START"}, {"containerName": "redis", "condition": "START"}],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/sumeetai-task",
                    "awslogs-region": "eu-north-1",
                    "awslogs-stream-prefix": "billing"
                }
            }
        },
        {
            "name": "redis",
            "image": "redis:alpine",
            "essential": True,
            "portMappings": [{"containerPort": 6379, "protocol": "tcp"}],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/sumeetai-task",
                    "awslogs-region": "eu-north-1",
                    "awslogs-stream-prefix": "redis"
                }
            }
        },
        {
            "name": "mongodb",
            "image": "mongo:latest",
            "essential": True,
            "portMappings": [{"containerPort": 27017, "protocol": "tcp"}],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/sumeetai-task",
                    "awslogs-region": "eu-north-1",
                    "awslogs-stream-prefix": "mongodb"
                }
            }
        }
    ]
}

with open(os.path.join(base_dir, 'task-def-2.json'), 'w') as f:
    json.dump(task_def, f, indent=4)
print("task-def-2.json created.")
