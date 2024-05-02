import { codeToHtml } from "https://esm.sh/shiki@1.4.0";

document.querySelectorAll(".code").forEach((el) => {
  el.textContent = el.textContent.replace(
    "API_URL",
    `https://${location.hostname}`
  );
  codeToHtml(el.innerHTML, {
    lang: "js",
    theme: "github-dark",
  }).then((highlightedCode) => {
    const codeBlock = document.createElement("div");
    codeBlock.classList.add("code");
    codeBlock.innerHTML = highlightedCode;
    codeBlock.querySelector("pre").classList.add("p-4", "rounded-7");
    el.parentElement.replaceChild(codeBlock, el);
  });
});
