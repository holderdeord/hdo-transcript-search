from polyglot.text import Text
import json
import sys

txt = Text(sys.stdin.read())
txt.language = "no"

result = []

types = {
  'I-PER': "person",
  'I-ORG': "organisation",
  'I-LOC': "location"
}

for chunk in txt.entities:
  result.append({
    "type": types[chunk.tag],
    "text": str.join(' ', chunk),
    "words": list(chunk)
  })

print json.dumps(result)
