#!/usr/bin/env python3
"""One-off FREE transcript service checks; no credentials, scraping bypass or media download.

Sources include documented public APIs, plus standalone public transcript pages.
Prints only result metadata and short, clearly labelled excerpts, never full transcripts.
"""
import argparse
import html
import json
import re
import subprocess
import sys
from collections import Counter
from urllib.parse import urlencode

VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")
METHODS = [
    "transcriptfetch-free-mcp",
    "apitoolcalls-free-mcp",
    "youtubetotranscription-json",
    "prepublish-transcript-page",
    "2outube-transcript-page",
    "withtranscript-cached-markdown",
]

def summarize_text(text: str) -> dict:
    t = re.sub(r"\s+", " ", html.unescape(text)).strip()
    if len(t) < 250:
        return {"length": len(t), "status": "short-or-empty"}
    tokens = re.findall(r"[가-힣]{2,}|[A-Za-z]{4,}", t)
    common = {w.lower() for w in ["그리고","그러나","하지만","우리가","이러한","그래서","이것을","합니다","것입니다","여러분","그런데","때문에","그렇게","있습니다","저희가","오늘은","이것은","그것은","이렇게","그것을","there","that","from","with","will","have","your","this","about","then","them","what","where"]}
    counts = Counter(w for w in tokens if w.lower() not in common)
    # Dispersed clips are partial evidence only, not a reliable detailed summary.
    clips=[]
    for ratio in (0.05, 0.20, 0.40, 0.60, 0.80, 0.95):
        i=int(len(t)*ratio)
        left=max(0,t.rfind(" ", 0, i))
        clips.append(t[left:left+90])
    return {"length":len(t),"wordish_tokens":len(tokens),"frequent_terms":[w for w,_ in counts.most_common(12)],"distributed_short_excerpts":clips,
            "status":"content-candidate-only","warning":"Excerpts alone do not prove the text is the requested video's transcript."}

def request_json(url:str, payload:dict|None=None) -> dict:
    import requests
    headers={"Accept":"application/json, text/event-stream", "User-Agent":"OpenSourceLabOneOff/1.0 (public video only)"}
    if payload is not None:
        resp=requests.post(url,json=payload,headers=headers,timeout=22)
    else:
        resp=requests.get(url,headers=headers,timeout=22)
    ctype=resp.headers.get("content-type","")
    out={"http":resp.status_code,"content_type":ctype,"bytes":len(resp.content)}
    if len(resp.content)>1_500_000: raise ValueError("Oversized response; not retained")
    resp.raise_for_status()
    if "json" in ctype:
        return out,resp.json()
    return out,resp.text

def extract_mcp(data:dict) -> tuple[str,dict]:
    if not isinstance(data,dict):
        return "",{"reason":"not JSON object"}
    if data.get("error"):
        return "",{"reason":str(data["error"])[:220]}
    result=data.get("result") or {}
    if result.get("isError"):
        return "",{"reason":str(result.get("content"))[:240]}
    rich=result.get("structuredContent") or {}
    title=rich.get("title") if isinstance(rich,dict) else None
    if isinstance(rich,dict):
        seg=rich.get("segments") or rich.get("transcript")
        if isinstance(seg,list):
            text=" ".join(item.get("text","") for item in seg if isinstance(item,dict))
            if len(text)>250:
                return text,{"title":title,"segments":len(seg),"provenance":"MCP structured transcript"}
        for k in ("text","transcript","full_text"):
            if isinstance(rich.get(k),str) and len(rich[k])>250:
                return rich[k],{"title":title,"provenance":"MCP structured text"}
    content=result.get("content") or []
    if isinstance(content,list):
        for item in content:
            if not isinstance(item,dict): continue
            txt=item.get("text")
            if not isinstance(txt,str):continue
            try:
                js=json.loads(txt)
                if isinstance(js,dict):
                    for k in ("transcript","text","full_text"):
                        if isinstance(js.get(k),str) and len(js[k])>250:
                            return js[k],{"title":js.get("title"),"provenance":"MCP JSON transcript"}
            except (ValueError,TypeError): pass
            if len(txt)>500 and not re.search(r"quota exceeded|rate limit|login required|buy credits|subscribe|No transcript|no captions|not available|failed to fetch|error:|quota exhausted",txt,re.I):
                return txt,{"title":title,"provenance":"MCP text content (unverified)"}
            return "",{"reason":txt[:220]}
    return "",{"reason":"No MCP content"}

def probe(method:str,video_id:str) -> dict:
    url=f"https://www.youtube.com/watch?v={video_id}"
    if method == "transcriptfetch-free-mcp":
        endpoint="https://transcriptfetch.com/mcp/try"
        payload={"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_transcript","arguments":{"video":video_id}}}
        meta,body=request_json(endpoint,payload)
        text, detail=extract_mcp(body)
        return {"source":"TranscriptFetch free trial (10 calls/day shared per IP)",**meta,**detail,
                "transcript_result":summarize_text(text) if text else None,
                "status":"candidate-transcript" if len(text)>250 else "no-transcript"}
    if method == "apitoolcalls-free-mcp":
        endpoint="https://apitoolcalls.com/mcp"
        payload={"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_transcript","arguments":{"url":video_id,"lang":"ko"}}}
        meta,body=request_json(endpoint,payload)
        # Some MCP servers reply with event-stream rather than application/json.
        if isinstance(body,str) and body.lstrip().startswith("event:"):
            events=[line[5:].strip() for line in body.splitlines() if line.startswith("data:")]
            body=json.loads(events[-1]) if events else {}
        text,detail=extract_mcp(body)
        return {"source":"API Tool Calls free MCP (20 calls/day shared per IP)",**meta,**detail,
                "transcript_result":summarize_text(text) if text else None,
                "status":"candidate-transcript" if len(text)>250 else "no-transcript"}
    if method == "youtubetotranscription-json":
        endpoint="https://youtubetotranscription.com/api/transcript?"+urlencode({"v":video_id})
        meta,body=request_json(endpoint)
        if not isinstance(body,dict):
            return {"status":"not-json",**meta,"reason":str(body)[:120]}
        candidates=[]
        for key in ("transcript","text","fullText","full_text","content"):
            val=body.get(key)
            if isinstance(val,str): candidates.append(val)
        for key in ("segments","captions","lines"):
            items=body.get(key)
            if isinstance(items,list):
                candidates.append(" ".join(i.get("text","") for i in items if isinstance(i,dict)))
        if isinstance(body.get("data"),dict):
            for key in ("transcript","text","full_text"):
                val=body["data"].get(key)
                if isinstance(val,str):candidates.append(val)
            items=body["data"].get("segments")
            if isinstance(items,list):candidates.append(" ".join(i.get("text","") for i in items if isinstance(i,dict)))
        text=max(candidates,key=len,default="")
        return {"status":"candidate-transcript" if len(text)>250 else "no-transcript",**meta,
                "json_keys":list(body)[:15], "reason":str(body.get("error") or "")[:150],
                "transcript_result":summarize_text(text) if text else None}
    if method in {"prepublish-transcript-page","2outube-transcript-page","withtranscript-cached-markdown"}:
        endpoint={
          "prepublish-transcript-page":f"https://prepublish.ai/youtube-transcript/{video_id}",
          "2outube-transcript-page":f"https://2outube.com/watch?v={video_id}",
          "withtranscript-cached-markdown":f"https://www.withtranscript.ai/video/{video_id}/transcript.md",
        }[method]
        meta,body=request_json(endpoint)
        s=str(body)
        # HTML pages cannot be validated as full transcripts via coarse page-text matching.
        video_referenced=video_id in s
        return {"status":"page-reachable-unverified" if meta["http"]==200 else "page-failed",
                **meta,"has_video_id":video_referenced,
                "note":"Page availability is NOT transcript access; never treat marketing/demo copy as video speech.",
                "beginning":re.sub(r"\s+"," ",s[:250])[:120]}
    raise ValueError("unknown method")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--video-id",required=True)
    ap.add_argument("--single",choices=METHODS)
    args=ap.parse_args()
    if not VIDEO_ID_RE.fullmatch(args.video_id):
        raise SystemExit("invalid single public video ID")
    if args.single:
        try:out=probe(args.single,args.video_id)
        except Exception as e:out={"status":"request-failed","exception":type(e).__name__,"reason":str(e)[:250]}
        print("PROBE_RESULT "+json.dumps({"method":args.single,**out},ensure_ascii=False,sort_keys=True))
        return
    for m in METHODS:
        try:
            p=subprocess.run([sys.executable,__file__,"--video-id",args.video_id,"--single",m],
                capture_output=True,text=True,timeout=35)
            lines=[s for s in p.stdout.splitlines() if s.startswith("PROBE_RESULT ")]
            output=json.loads(lines[-1][len("PROBE_RESULT "):]) if lines else {"method":m,"status":"child-exit","code":p.returncode}
        except subprocess.TimeoutExpired:output={"method":m,"status":"timeout"}
        print("METHOD_RESULT "+json.dumps(output,ensure_ascii=False,sort_keys=True),flush=True)
    print("No full transcript, media, or credentials were saved by this test.",flush=True)

if __name__=="__main__":main()
