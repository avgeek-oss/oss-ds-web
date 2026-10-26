import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

globalThis.ReactDOM = { ...ReactDOM, ...ReactDOMClient };
