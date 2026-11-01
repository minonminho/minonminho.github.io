#!/usr/bin/env python3
"""Community-led AI paper discovery. Produces candidates only, never an unreviewed article."""
from __future__ import annotations
import argparse
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "content/research/discovery/latest.json"
AGENT = "DailyResearchDiscovery/1.0 (public scholarly reading)"

def get(url: str):
    request = urllib.request.Request(url, headers={"User-Agent": AGENT, "Accept": "application/json, application/atom+xml, text/xml"})
    with urllib.request.urlopen(request, timeout=16) as response:
        return response.read().decode("utf-8", errors="replace")

def arxiv_id(text: str):
    match = re.search(r"(?:arxiv\.org/(?:abs|pdf|html)/|arxiv:)(\d{4}\.\d{4,5})", str(text), re.I)
    return match.group(1) if match else None

def discover_hf(days: int):
    rows = json.loads(get("https://huggingface.co/api/daily_papers?limit=100"))
    found = []
    for row in rows:
        paper = row.get("paper", row)
        pid = str(paper.get("id", row.get("id", ""))).replace("arxiv:", "").split("v")[0]
        if not re.fullmatch(r"\d{4}\.\d{4,5}", pid):
            continue
        title = paper.get("title", "")
        count = row.get("upvotes", paper.get("upvotes", 0))
        found.append({"id": pid, "title": title, "source": "huggingface", "engagement": max(0,int(count or 0)), "url": "https://huggingface.co/papers/"+pid})
    return found

def discover_hn(days: int):
    since = int((datetime.now(timezone.utc) - timedelta(days=days)).timestamp())
    found = []
    for term in ("arxiv.org", "AI research paper"):
        params = urllib.parse.urlencode({"query": term, "tags": "story", "numericFilters": f"created_at_i>{since}", "hitsPerPage": 100})
        payload = json.loads(get("https://hn.algolia.com/api/v1/search_by_date?"+params))
        for item in payload.get("hits", []):
            pid = arxiv_id(item.get("url") or "") or arxiv_id(item.get("story_text") or "")
            if not pid:
                continue
            found.append({"id": pid, "title": item.get("title") or "", "source": "hackernews", "engagement": max(0,int(item.get("points") or 0)), "url": "https://news.ycombinator.com/item?id="+str(item["objectID"])})
    return found

def discover_reddit(days: int):
    # Reddit may disallow anonymous requests. Failure leaves other sources available.
    found=[]
    for subreddit in ("MachineLearning", "LocalLLaMA"):
        xml = ET.fromstring(get("https://www.reddit.com/r/"+subreddit+"/new/.rss"))
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        for entry in xml.findall("atom:entry", ns):
            text = " ".join([entry.findtext("atom:title", default="", namespaces=ns), entry.findtext("atom:content", default="", namespaces=ns)])
            pid = arxiv_id(text)
            if not pid: continue
            link = entry.find("atom:link", ns)
            found.append({"id":pid,"title":entry.findtext("atom:title", default="", namespaces=ns),"source":"reddit-"+subreddit.lower(),"engagement":1,"url":link.attrib.get("href","") if link is not None else ""})
    return found

def build():
    observations=[]
    status={}
    for name,fn in (("huggingface",discover_hf),("hackernews",discover_hn),("reddit",discover_reddit)):
        try:
            result=fn(7)
            observations.extend(result)
            status[name]={"state":"ok","items":len(result)}
        except Exception as error:
            status[name]={"state":"unavailable","error":str(error)[:180]}
    groups={}
    for item in observations:
        paper=groups.setdefault(item["id"],{"arxivId":item["id"],"title":item["title"],"signals":[]})
        if not paper["title"] and item["title"]: paper["title"]=item["title"]
        if not any(s["url"]==item["url"] for s in paper["signals"]):
            paper["signals"].append({k:item[k] for k in ("source","engagement","url")})
    for paper in groups.values():
        community_count=len(set(signal["source"] for signal in paper["signals"]))
        # Visibility-only heuristic, not academic merit. Cross-source attention gets preference.
        popularity=sum(min(s["engagement"],250)**0.5 for s in paper["signals"])
        paper["attentionScore"]=round(community_count*15+popularity,2)
        paper["communityCount"]=community_count
        paper["originalPaper"]="https://arxiv.org/abs/"+paper["arxivId"]
    return {"generatedAt":datetime.now(timezone.utc).isoformat(),"method":"community signals only; editorial verification required","sources":status,"candidates":sorted(groups.values(),key=lambda p:p["attentionScore"],reverse=True)[:30]}

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--stdout",action="store_true")
    args=parser.parse_args()
    snapshot=build()
    if not snapshot["candidates"]:
        raise SystemExit("No candidates from public sources. Existing discovery snapshot was preserved.")
    if args.stdout: print(json.dumps(snapshot,ensure_ascii=False,indent=2))
    else:
        OUT.parent.mkdir(parents=True,exist_ok=True)
        OUT.write_text(json.dumps(snapshot,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(f"Discovered {len(snapshot['candidates'])} candidates; sources: {snapshot['sources']}")
