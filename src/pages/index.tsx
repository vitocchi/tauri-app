import { useState } from "react";
import moment from "moment";
import { invoke } from "@tauri-apps/api/tauri";
import Image from "next/image";
import reactLogo from "../assets/react.svg";
import tauriLogo from "../assets/tauri.svg";
import nextLogo from "../assets/next.svg";

const _fib = (n: number): number => {
  if (n <2) {
    return n;
  }
  else {
    return _fib(n-1) + _fib(n-2)
  }
}

const calcFib = (n:number): number => {
  const f = _fib(n)
  console.log(`_fib(${n}), ${f}`);
  return f;
}

function App() {
  const [tauriResult, setTauriResult] = useState("");
  const [tauriAllResult, setTauriAllResult] = useState("");
  const [reactResult, setReactResult] = useState("");
  const [reactAllResult, setReactAllResult] = useState("");
  const [number, setNumber] = useState<number>(0);


  async function benchFib(n: number, fn:(n: number) => Promise<any>) {
    const start = moment();
    const result = await fn(n);
    const end = moment();
    const time = end.diff(start);
    return `number: ${n}, time:${time}[ms], result: ${result}`;
  }

  async function invokeTauri() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    console.log('invoke tauri')
    const fn = async (n:number): Promise<number> => {
      return parseInt(await invoke("fib", { number: n }));
    }
    setTauriResult(await benchFib(number, fn));
  }

  async function invokeTauriAll() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    console.log('invoke tauri all')
    const fn = async (n:number): Promise<any> => {
      const r = await invoke("fib_all", { number: n });
      console.log(r);
      return r;
    }
    setTauriAllResult(await benchFib(number, fn));
  }

  async function invokeReact() {
    console.log('invoke react')
    const fn = async(n: number): Promise<number> => {
      return calcFib(n)
    }
    setReactResult(await benchFib(number, fn));
    
  }

  async function invokeReactAll() {
    console.log('invoke react all')
    const fn = async(n: number): Promise<number[]> => {
      const array = Array.from({length: n}, (_, i) => i + 1).reverse();
      return array.map((n) => calcFib(n));
    }
    setReactAllResult(await benchFib(number, fn));
  }

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <span className="logos">
          <a href="https://nextjs.org" target="_blank">
            <Image
              width={144}
              height={144}
              src={nextLogo}
              className="logo next"
              alt="Next logo"
            />
          </a>
        </span>
        <span className="logos">
          <a href="https://tauri.app" target="_blank">
            <Image
              width={144}
              height={144}
              src={tauriLogo}
              className="logo tauri"
              alt="Tauri logo"
            />
          </a>
        </span>
        <span className="logos">
          <a href="https://reactjs.org" target="_blank">
            <Image
              width={144}
              height={144}
              src={reactLogo}
              className="logo react"
              alt="React logo"
            />
          </a>
        </span>
      </div>

      <p>Click on the Tauri, Next, and React logos to learn more.</p>

      <div className="row">
        <div>
          <input
            id="number-input"
            type="number"
            onChange={(e) => setNumber(parseInt(e.currentTarget.value, 10))}
            placeholder="Enter a name..."
          />
          <div>
          <button type="button" onClick={() => invokeTauri()}>
            Invoke Fib({number}) on tauri
          </button>
          <p>{tauriResult}</p>
          </div>

          <div>
          <button type="button" onClick={() => invokeTauriAll()}>
            Invoke Fib({number}) on tauri async
          </button>
          <p>{tauriAllResult}</p>
          </div>

          <div>
          <button type="button" onClick={() => invokeReact()}>
            Invoke Fib({number}) on react
          </button>
          <p>{reactResult}</p>
          </div>

          <div>
          <button type="button" onClick={() => invokeReactAll()}>
            Invoke Fib({number}) on react async
          </button>
          <p>{reactAllResult}</p>
          </div>
        </div>
      </div>


    </div>
  );
}

export default App;
