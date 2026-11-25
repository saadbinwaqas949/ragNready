/** General infant guide. Replace with measured garment sizes when available. */
const rows = [
  ["0-3 Months", "50–60 cm", "3–6 kg"],
  ["3-6 Months", "60–67 cm", "6–8 kg"],
  ["6-9 Months", "67–72 cm", "8–9 kg"],
  ["9-12 Months", "72–78 cm", "9–10 kg"],
  ["12-18 Months", "78–83 cm", "10–12 kg"],
];

export function SizeTable() {
  return <table className="size-table"><thead><tr><th scope="col">Size</th><th scope="col">Height</th><th scope="col">Weight</th></tr></thead><tbody>{rows.map(([size, height, weight]) => <tr key={size}><th scope="row">{size}</th><td>{height}</td><td>{weight}</td></tr>)}</tbody></table>;
}
