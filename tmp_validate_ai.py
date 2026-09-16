from pathlib import Path
from urllib.request import Request, urlopen
import json

props = Path('online-exam-system-backend/online-exam-system/src/main/resources/application.properties').read_text(encoding='utf-8')
values = {}
for line in props.splitlines():
    s = line.strip()
    if not s or s.startswith('#') or '=' not in s:
        continue
    k, v = s.split('=', 1)
    values[k.strip()] = v.strip()

print('--- Groq check ---')
groq_key = values.get('groq.api.key', '')
if groq_key:
    req = Request('https://api.groq.com/openai/v1/chat/completions', data=json.dumps({
        'model': 'llama-3.3-70b-versatile',
        'messages': [{'role': 'user', 'content': 'hi'}],
        'max_tokens': 10
    }).encode(), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {groq_key}'}, method='POST')
    try:
        with urlopen(req, timeout=20) as r:
            body = r.read().decode('utf-8', errors='ignore')
            print('status', r.status)
            print('body', body[:300])
    except Exception as e:
        print('error', type(e).__name__, e)
else:
    print('no groq key')

print('\n--- Gemini check ---')
gemini_key = values.get('gemini.api.key', '')
if gemini_key:
    url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent'
    req = Request(url + '?key=' + gemini_key, data=json.dumps({
        'contents': [{'parts': [{'text': 'hi'}]}]
    }).encode(), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urlopen(req, timeout=20) as r:
            body = r.read().decode('utf-8', errors='ignore')
            print('status', r.status)
            print('body', body[:300])
    except Exception as e:
        print('error', type(e).__name__, e)
else:
    print('no gemini key')

print('\n--- OpenAI check ---')
openai_key = values.get('openai.api.key', '')
print('openai key configured:', bool(openai_key))
print('openai key value present:', bool(openai_key and openai_key.strip()))
