import { parse, tokenize, exec } from "https://raw.githubusercontent.com/naoki-tomita/saya/master/index.ts";
import React, { useEffect, useState } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

declare global {
  const document: any;
}

function debounce<T extends Array<any>>(fn: (...args: T) => void, interval: number) {
  let timer: number;
  return (...args: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => (fn(...args)), interval);
  }
}

const root = createRoot(document.body);

function _execCode(code: string, setResult: (result: string) => void, setError: (error: string) => void) {
  try {
    const tokens = tokenize(code);
    const ast = parse(tokens);
    exec(ast, {});
    setError("");
  } catch (e) {
    setError(e.stack);
  }
}

const execCode = debounce(_execCode, 300);

const log = console.log;

const App = () => {
  const [code, setCode] = useState(`
const x = 128 + 64;
let i = 99 + 1 - 2 * 5;
const y = x + 5;
const hoge = "fuga hoge" + " " + "foo bar";

func someFunc(arg1, arg2) {
  const x = arg1 + arg2;
  return x;
}

println(hoge, "1", 10, y, x, someFunc(42, 42));
  `.trim());

  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    execCode(code, () => {}, setError);
  }, [code]);
  useEffect(() => {
    console.log = (...args: any[]) => {
      setResult(r => `${r}\n${args.join(" ")}`.trim());
    }
  }, [])
  return (
    <div>
      <div>
        <textarea rows={16} cols={80} value={code} onChange={e => setCode((e.target as any).value)}></textarea>
      </div>
      <div style={{color: "red"}}>
        <pre>{error}</pre>
      </div>
      <div>
        <pre style={{ width: "100%", background: "#444", color: "#eee", maxHeight: "8em", overflow: "auto", lineHeight: "1", padding: "4px 8px", borderRadius: "8px" }}>{result}</pre>
      </div>
    </div>
  );
}

root.render(<App />);