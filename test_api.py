#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests
import json

url = "https://safe-ops-studio-workers.yosep102033.workers.dev/api/laws/suggest"

data = {
    "summary": "3층 건물 외벽 작업 중 안전대 미착용으로 추락",
    "incident_type": "추락",
    "causative_object": "안전대",
    "work_process": "외벽 작업",
    "limit": 3
}

response = requests.post(url, json=data, headers={"Content-Type": "application/json; charset=utf-8"})

result = response.json()
print(json.dumps(result, ensure_ascii=False, indent=2))
