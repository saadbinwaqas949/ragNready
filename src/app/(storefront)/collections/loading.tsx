export default function CollectionLoading() {
  return <main className="section page-full" aria-label="Loading products" aria-busy="true"><div className="skeleton skeleton-title" /><div className="product-grid" data-count="4">{Array.from({ length: 4 }, (_, index) => <div key={index}><div className="skeleton skeleton-media" /><div className="skeleton skeleton-line" /></div>)}</div></main>;
}
