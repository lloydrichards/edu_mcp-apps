const countElement = document.querySelector("#count");
const decrementButton = document.querySelector("#decrement");
const incrementButton = document.querySelector("#increment");

if (!countElement || !decrementButton || !incrementButton) {
  throw new Error("Counter widget elements missing");
}

let count = 0;

const render = () => {
  countElement.textContent = String(count);
};

const updateCount = (delta: number) => {
  count += delta;
  render();
};

decrementButton.addEventListener("click", () => updateCount(-1));
incrementButton.addEventListener("click", () => updateCount(1));

render();
